# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

from celery import chain, group, shared_task
from celery.utils.log import get_task_logger
from django import conf

from .db import (
    create_package_build_record_and_update_package,
    mark_uploaded,
    verify_all_architectures_present,
    update_package_build_record_integration_pr_url,
    find_packages_ready_for_integration,
)
from .git import (
    update_conda_build_config,
    open_pull_request,
)
from .packages import (
    fetch_package_from_github,
    reindex_conda_channel,
)
from library.packages.models import Epoch


logger = get_task_logger(__name__)


# NOTES:
# 1. All periodic tasks should be registered in
#    `config.settings.shared.generate_beat_schedule`
# 2. All tasks should take a context variable as the first argument, this should
#    be a dict to play nicely with other tasks.
# 3. All tasks should be prefixed with a queue (e.g. `git`, `db`, etc). This
#    will allow for appropriate worker delegation.
# 4. All tasks that interact directly with the database must run in `db` queue.
# 5. All tasks that interact with packages.qiime2.org must run in the `packages` queue.
# 6. If a task generates a lot of noisy results that aren't important, make sure to
#    add it to `db.clean_up_reindex_tasks`.


@shared_task(name='pipeline.handle_prs')
def handle_prs():
    chains = []
    for build_target in ['dev', 'release']:
        for release in Epoch.objects.releases_by_build_target(build_target):
            ctx = dict()
            chain_link = chain(
                find_packages_ready_for_integration.s(ctx, release),
                open_pull_request.s(conf.settings.GITHUB_TOKEN, release),
                update_package_build_record_integration_pr_url.s(),
            )
            chains.append(chain_link)
    return group(*chains).apply_async()


@shared_task(name='pipeline.reindex_conda_channels')
def reindex_conda_channels():
    tasks = []
    for build_target in ['dev', 'release']:
        for release in Epoch.objects.releases_by_build_target(build_target):
            for gate in ['tested', 'staged']:
                ctx = dict()
                path = str(conf.settings.BASE_CONDA_PATH / release / gate)
                channel_name = '%s-%s' % (release, gate)
                task = reindex_conda_channel.s(ctx, path, channel_name)
                tasks.append(task)
    return group(*tasks).apply_async()


@shared_task(name='pipeline.handle_new_builds')
def handle_new_builds(initial_vals):
    package_id = initial_vals['package_id']
    run_id = initial_vals['run_id']
    version = initial_vals['version']
    package_name = initial_vals['package_name']
    repository = initial_vals['repository']
    artifact_name = initial_vals['artifact_name']
    github_token = initial_vals['github_token']
    build_target = initial_vals['build_target']
    build_targets = initial_vals['build_targets']
    dev_mode = initial_vals['dev_mode']
    gate = 'tested'

    chains = []
    for release in build_targets:
        channel = str(conf.settings.BASE_CONDA_PATH / release / gate)
        channel_name = '%s-tested' % (release,)
        # `ctx` is implicitly passed as the first arg to each sub-task in the chain,
        # this is where any chain-specific dynamic state should live (ids, urls, etc)
        ctx = dict()

        chain_link = chain(
            # explicitly pass ctx into the first subtask in the chain
            create_package_build_record_and_update_package.s(
                ctx, package_id, run_id, version, package_name, repository,
                artifact_name, release, build_target,
            ),
            # ctx is implicitly applied as first arg for every other subtask in the chain
            fetch_package_from_github.s(
                github_token, repository, run_id, channel, package_name, artifact_name,
            ),
            reindex_conda_channel.s(channel, channel_name),
            mark_uploaded.s(artifact_name, gate),
            verify_all_architectures_present.s(gate),
            update_conda_build_config.s(
                github_token, release, package_name, version, dev_mode
            ),
        )
        chains.append(chain_link)

    return group(*chains).apply_async(countdown=conf.settings.TASK_TIMES['10_MIN'])
