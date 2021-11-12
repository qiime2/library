# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

import base64
import collections
import contextlib
import copy
import json
import os
from packaging import version
import pathlib
import shutil
import urllib.request
import urllib.error
import zipfile

from django import conf
from django.db import connection
from fastcore.utils import HTTP404NotFoundError
from ghapi.all import GhApi
import yaml


class GitHubNotReadyException(Exception):
    pass


class AdvisoryLockNotReadyException(Exception):
    pass


class GitHubArtifactManager:
    def __init__(self, github_token, repository, run_id, artifact_name, tmpdir):
        self.github_token = github_token
        self.github_repository = repository
        self.run_id = run_id
        self.artifact_name = artifact_name
        self.root_pathlib = tmpdir
        self.base_url = 'https://api.github.com'

        self.validate_config()

    def validate_config(self):
        if self.github_token == '':
            raise Exception('Missing Github Token')

        if self.github_repository == '':
            raise Exception('Missing Github Repository')
        parts = self.github_repository.split('/')
        if len(parts) != 2:
            raise Exception('Invalid Github Repository Format: %s' % (self.github_repository,))
        org, repo = parts
        if org == '':
            raise Exception('Missing Github Org/Name')
        if repo == '':
            raise Exception('Missing Github Repo')

        if self.run_id == '':
            raise Exception('Missing Github Actions Run ID')

        if self.artifact_name == '':
            raise Exception('Missing Artifact Name')

    def build_request(self, url, headers=None):
        request = urllib.request.Request(url)
        request.add_header('authorization',
                           'Bearer %s' % (self.github_token, ))
        if headers is not None:
            for k, v in headers.items():
                request.add_header(k, v)
        return request

    def fetch_json_data(self, url):
        headers = {'content-type': 'application/json'}
        request = self.build_request(url, headers)
        response = urllib.request.urlopen(request)
        data = response.read()
        decoded = data.decode('utf-8')
        return json.loads(decoded)

    def fetch_binary_file(self, url, download_pathlib):
        if download_pathlib.exists():
            raise Exception('Attempting to overwrite file that already exists: %s' % (download_pathlib,))

        try:
            request = self.build_request(url)
            with urllib.request.urlopen(request) as resp, \
                    download_pathlib.open('wb') as save_fh:
                shutil.copyfileobj(resp, save_fh)
        except Exception:
            raise urllib.error.HTTPError

    def fetch_artifact(self, record):
        download_path = self.root_pathlib / record['name']
        self.fetch_binary_file(record['archive_download_url'], download_path)
        return download_path

    def fetch_artifact_records(self):
        url = '%s/repos/%s/actions/runs/%s/artifacts' \
            % (self.base_url, self.github_repository, self.run_id)
        records = self.fetch_json_data(url)
        return records

    def filter_and_validate_artifact_records(self, records):
        filtered_records = list()
        for record in records['artifacts']:
            if record['name'] == self.artifact_name:
                if record['size_in_bytes'] <= 100000000:
                    filtered_records.append(record)
                else:
                    raise Exception('Artifact size too large: %d' % (record['size_in_bytes'],))

        if len(filtered_records) != 1:
            raise GitHubNotReadyException('Incorrect number of filtered records: %r' %
                                          (filtered_records, ))

        return filtered_records

    def download_artifacts(self, records):
        return [self.fetch_artifact(record) for record in records]

    def validate_local_filepaths(self, filepaths):
        # TODO: implement this
        return filepaths

    def sync(self):
        records = self.fetch_artifact_records()
        filtered_records = self.filter_and_validate_artifact_records(records)
        local_filepaths = self.download_artifacts(filtered_records)
        validated_filepaths = self.validate_local_filepaths(local_filepaths)
        return validated_filepaths


def unzip(fp_pathlib):
    new_name = '%s_unzipped' % fp_pathlib.name
    with zipfile.ZipFile(fp_pathlib, 'r') as zip_fh:
        zip_fh.extractall(str(fp_pathlib.parent / new_name))


def bootstrap_pkgs_dir(fp):
    if isinstance(fp, str):
        fp = pathlib.Path(fp)
    for arch in ('linux-64', 'osx-64'):
        (fp / arch).mkdir(parents=True, exist_ok=True)


@contextlib.contextmanager
def advisory_lock(lock_id):
    lock_id = int(lock_id)
    cursor = connection.cursor()

    try:
        cursor.execute('SELECT pg_try_advisory_lock(%s);', (lock_id,))
        acquired = cursor.fetchall()[0][0]
        yield acquired
    finally:
        cursor.execute('SELECT pg_advisory_unlock(%s);', (lock_id,))
        cursor.close()


class IntegrationGitRepoManager:
    def __init__(self, github_token):
        if github_token == '':
            raise Exception('Missing Github Token')

        self.github_token = github_token

        self.owner = conf.settings.INTEGRATION_REPO['owner']
        self.repo = conf.settings.INTEGRATION_REPO['repo']
        self.main_branch = conf.settings.INTEGRATION_REPO['branch']
        self.ghapi = None

    def construct_interface(self):
        if self.ghapi is None:
            self.ghapi = GhApi(token=self.github_token)

    def path_builder(self, epoch, gate, fn, distro=None):
        if distro is None:
            parts = [epoch, gate, fn]
        else:
            parts = [epoch, gate, distro, fn]
        return os.path.join(*parts)

    def update_conda_build_config(self, branch, epoch, gate, package_versions):
        if branch == '':
            raise Exception('Missing branch')

        if epoch == '':
            raise Exception('Missing epoch name')

        if gate not in (conf.settings.GATE_TESTED, conf.settings.GATE_STAGED):
            raise Exception('Incorrect gate: %s' % (gate,))

        if len(package_versions) < 1:
            raise Exception('Missing package versions')

        with advisory_lock(42) as lock:
            if lock:
                # Wait until we get a lock before setting up ghapi
                self.construct_interface()
                for distro, package_versions in package_versions.items():
                    path = self.path_builder(epoch=epoch,
                                             gate=gate,
                                             fn='conda_build_config.yaml',
                                             distro=distro)
                    msg = 'updating %s\n\n' % (path,)
                    cbc, sha = self.fetch_yaml_from_github(path)
                    for package_name, ver in package_versions.items():
                        # cbc.yml _needs_ snake case names
                        package_name = package_name.replace('-', '_')

                        if package_name in cbc:
                            last_versions = cbc[package_name]
                            if len(last_versions) != 1:
                                raise Exception('Incorrect number of versions')
                            if compare_package_versions(ver, last_versions[0]):
                                raise Exception('Package version confusion')
                        # cbc.yml _needs_ stringified version identifiers,
                        # also, cbc.yml expects an array for each package
                        cbc[package_name] = [str(ver)]
                        msg += '- %s ==%s\n' % (package_name, ver)
                    self.add_branch_if_missing(branch)
                    self.commit_to_github(cbc, sha, path, msg, branch)
            else:
                raise AdvisoryLockNotReadyException

    def fetch_yaml_from_github(self, path):
        try:
            payload = self.ghapi.repos.get_content(
                owner=self.owner,
                repo=self.repo,
                path=path,
                # always use latest main as a basis
                ref=self.main_branch,
            )

            content = base64.b64decode(payload['content'])
            parsed = yaml.load(content, Loader=yaml.FullLoader)

            results = (parsed, payload['sha'])
        except HTTP404NotFoundError:
            results = (dict(), None)

        return results

    def add_branch_if_missing(self, branch):
        try:
            self.ghapi.repos.get_branch(
                owner=self.owner,
                repo=self.repo,
                branch=branch,
            )
        except HTTP404NotFoundError:
            payload = self.ghapi.git.get_ref(
                owner=self.owner,
                repo=self.repo,
                ref='heads/%s' % (self.main_branch,),
            )
            self.ghapi.git.create_ref(
                owner=self.owner,
                repo=self.repo,
                ref='refs/heads/%s' % (branch,),
                sha=payload['object']['sha'],
            )

    def commit_to_github(self, yaml_content, sha, path, msg, branch):
        updated = yaml.dump(yaml_content)
        content = base64.b64encode(updated.encode('utf-8')).decode('utf-8')

        self.ghapi.repos.create_or_update_file_contents(
            owner=self.owner,
            repo=self.repo,
            path=path,
            message=msg,
            content=content,
            sha=sha,
            branch=branch
        )

    def update_distro_metapackage_recipe(self, epoch, gate, distro, packages, branch):
        path = self.path_builder(epoch=epoch, gate=gate, fn='data.yaml', distro=distro)
        msg = 'updating %s\n\n' % (path,)
        data, sha = self.fetch_yaml_from_github(path)
        if 'run' not in data:
            raise Exception('Something went wrong fetching YAML from GH')
        run_reqs = copy.deepcopy(data['run'])
        run_reqs = set(run_reqs)
        for package in packages:
            if package not in data['run']:
                run_reqs.add(package)
                msg += '- %s\n' % (package,)
        data['run'] = sorted(run_reqs)
        self.commit_to_github(data, sha, path, msg, branch)

    def update_integration(self, branch, epoch, gate, package_versions):
        self.construct_interface()
        self.update_conda_build_config(branch, epoch, gate, package_versions)

        for distro, pkg_vers in package_versions.items():
            if distro is None:
                raise Exception('Missing distro name')
            packages = set(pkg_vers.keys())
            self.update_distro_metapackage_recipe(epoch, gate, distro, packages, branch)

    def open_pr(self, branch, pr_msg):
        self.construct_interface()
        payload = self.ghapi.pulls.create(
            owner=self.owner,
            repo=self.repo,
            title=pr_msg,
            head=branch,
            base=self.main_branch,
            maintainer_can_modify=True,
            draft=False,
        )

        return payload['html_url']

    def merge_integration_pr(self, pr_number):
        self.construct_interface()

        try:
            self.ghapi.pulls.check_if_merged(
                owner=self.owner,
                repo=self.repo,
                pull_number=pr_number,
            )
        # 404 when PR not merged (this is weird, right?)
        except HTTP404NotFoundError:
            payload = self.ghapi.pulls.merge(
                owner=self.owner,
                repo=self.repo,
                pull_number=pr_number,
                commit_title='merging pr %d' % (pr_number,),
                merge_method='merge',
            )

            if not payload['merged']:
                raise Exception('Something went wrong merging PR')


def compare_package_versions(a, b):
    pkg_ver_a = version.Version(str(a))
    pkg_ver_b = version.Version(str(b))
    return pkg_ver_a < pkg_ver_b


def is_release_package(ver_str):
    pkg_ver = version.Version(ver_str)
    # https://packaging.pypa.io/en/latest/version.html#packaging.version.Version.is_prerelease
    # A boolean value indicating whether this Version instance represents a
    # prerelease and/or development release.
    return not pkg_ver.is_prerelease


def find_packages_ready_for_integration(package_build_records):
    package_versions = collections.defaultdict(dict)
    package_build_pks = set()

    for distro, records in package_build_records.items():
        for record in records:
            package_name = record['package__name']
            version = record['version']
            pk = str(record['id'])
            if package_name in package_versions[distro]:
                # in case multiple versions exist at this point, only consider the _newest_ one
                if compare_package_versions(package_versions[distro][package_name], version):
                    package_versions[distro][package_name] = version
                    package_build_pks.add(pk)
            else:
                package_versions[distro][package_name] = version
                package_build_pks.add(pk)

    return dict(package_versions), package_build_pks


def filter_release_package_versions(package_versions):
    filtered = collections.defaultdict(dict)
    for distro, versions in package_versions.items():
        for pkg_name, pkg_version in versions.items():
            if is_release_package(pkg_version):
                filtered[distro][pkg_name] = pkg_version

    return dict(filtered)
