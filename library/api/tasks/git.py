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
def update_conda_build_config(ctx: 'PackageBuildCtx', cfg: 'PackageBuildCfg'):  # noqa: F821
    if ctx.not_all_architectures_present:
        return ctx

    # distro doesn't matter here, so skip it by setting to `None`
    package_versions = {None: {cfg.package_name: cfg.version}}
    mgr = utils.IntegrationGitRepoManager(cfg.github_token)
    mgr.update_conda_build_config('main', cfg.epoch_name, cfg.gate, package_versions)

    return ctx


@shared_task(name='git.open_pull_request',
             autoretry_for=[utils.AdvisoryLockNotReadyException],
             max_retries=12, retry_backoff=conf.settings.TASK_TIMES['03_MIN'],
             retry_backoff_max=conf.settings.TASK_TIMES['02_HR'])
def open_pull_request(ctx: 'HandlePRsCtx'):  # noqa: F821
    if not ctx.ready_to_open_pr():
        return ctx

    branch = str(uuid.uuid4())
    # staged
    mgr = utils.IntegrationGitRepoManager(ctx.github_token)
    mgr.update_integration(branch, ctx.epoch_name, 'staged', ctx.package_versions)

    # TODO: released
    # release_package_versions = utils.filter_release_package_versions(ctx.package_versions)
    # if len(release_package_versions) > 0:
    #     mgr.update_integration(branch, ctx.epoch_name, 'released', release_package_versions)

    pr_url = mgr.open_pr(branch, '%s staged' % (ctx.epoch_name, ))
    ctx.pr_url = pr_url

    return ctx


@shared_task(name='git.merge_integration_pr',
             autoretry_for=[utils.AdvisoryLockNotReadyException],
             max_retries=12, retry_backoff=conf.settings.TASK_TIMES['03_MIN'],
             retry_backoff_max=conf.settings.TASK_TIMES['02_HR'])
def merge_integration_pr(ctx: 'DistroBuildCtx', cfg: 'DistroBuildCfg'):  # noqa: F821
    if ctx.not_all_architectures_present:
        return ctx

    mgr = utils.IntegrationGitRepoManager(cfg.github_token)
    mgr.merge_integration_pr(cfg.pr_number)

    return ctx
