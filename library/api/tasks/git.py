# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

import uuid

from celery import shared_task
from django import conf

from .. import utils


@shared_task(name='git.update_conda_build_config',
             autoretry_for=[utils.AdvisoryLockNotReadyException],
             max_retries=12, retry_backoff=conf.settings.TASK_TIMES['03_MIN'],
             retry_backoff_max=conf.settings.TASK_TIMES['02_HR'])
def update_conda_build_config(ctx, github_token, release, package_name, version):
    if ctx['not_all_architectures_present']:
        return ctx

    # distro doesn't matter here, so skip it by setting to `None`
    package_versions = {None: {package_name: version}}
    mgr = utils.IntegrationGitRepoManager(github_token)
    mgr.update_conda_build_config('main', release, 'tested', package_versions)

    return ctx


@shared_task(name='git.open_pull_request',
             autoretry_for=[utils.AdvisoryLockNotReadyException],
             max_retries=12, retry_backoff=conf.settings.TASK_TIMES['03_MIN'],
             retry_backoff_max=conf.settings.TASK_TIMES['02_HR'])
def open_pull_request(ctx, github_token, release):
    if len(ctx['package_versions']) < 1:
        return ctx

    branch = str(uuid.uuid4())
    package_versions = ctx['package_versions']
    # staged
    mgr = utils.IntegrationGitRepoManager(github_token)
    mgr.update_integration(branch, release, 'staged', package_versions)

    # released
    release_package_versions = utils.filter_release_package_versions(package_versions)
    if len(release_package_versions) > 0:
        mgr.update_integration(branch, release, 'released', release_package_versions)

    pr_url = mgr.open_pr(branch, '%s %s' % (release, gate))
    ctx['pr_url'] = pr_url

    return ctx


@shared_task(name='git.merge_integration_pr',
             autoretry_for=[utils.AdvisoryLockNotReadyException],
             max_retries=12, retry_backoff=conf.settings.TASK_TIMES['03_MIN'],
             retry_backoff_max=conf.settings.TASK_TIMES['02_HR'])
def merge_integration_pr(ctx, github_token, pr_number):
    mgr = utils.IntegrationGitRepoManager(github_token)
    mgr.merge_integration_pr(pr_number)

    return ctx
