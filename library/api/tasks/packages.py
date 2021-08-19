# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

import pathlib
import shutil
import tempfile
import urllib.error

from celery import shared_task
import conda_build.api
from django import conf

from .. import utils


@shared_task(name='packages.fetch_package_from_github',
             autoretry_for=[urllib.error.HTTPError, urllib.error.URLError, utils.GitHubNotReadyException],
             max_retries=12, retry_backoff=conf.settings.TASK_TIMES['03_MIN'],
             retry_backoff_max=conf.settings.TASK_TIMES['90_MIN'])
def fetch_package_from_github(ctx, github_token, repository, run_id, channel, package_name, artifact_name):
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_pathlib = pathlib.Path(tmpdir)

        mgr = utils.GitHubArtifactManager(github_token, repository, run_id, artifact_name, tmp_pathlib)
        tmp_filepaths = mgr.sync()

        for filepath in tmp_filepaths:
            utils.unzip(filepath)

        tested_pkgs_fp = pathlib.Path(channel)
        utils.bootstrap_pkgs_dir(tested_pkgs_fp)

        filematcher = '**/*%s*.tar.bz2' % (package_name,)
        for from_path in tmp_pathlib.glob(filematcher):
            to_path = tested_pkgs_fp / from_path.parent.name / from_path.name
            shutil.copy(from_path, to_path)

    return ctx


@shared_task(name='packages.reindex_conda_channel')
def reindex_conda_channel(ctx, channel, channel_name):
    conda_config = conda_build.api.Config(verbose=False)
    conda_build.api.update_index(
        channel,
        config=conda_config,
        threads=1,
        channel_name=channel_name,
    )

    ctx['uploaded'] = True

    return ctx


@shared_task(name='packages.copy_conda_packages')
def copy_conda_packages(ctx, from_channel, to_channel):
    pass


@shared_task(name='packages.find_packages_to_copy')
def find_packages_to_copy(ctx, pr_url):
    pass
