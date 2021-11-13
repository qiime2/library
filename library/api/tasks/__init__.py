# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

from dataclasses import dataclass, field
from typing import List, Dict, Optional

from celery import chain, group, shared_task
from celery.utils.log import get_task_logger
from django import conf

from . import db, git, packages
from library.packages.models import Epoch


logger = get_task_logger(__name__)


# NOTES:
# 1. All periodic tasks should be registered in
#    `config.settings.shared.generate_beat_schedule`
# 2. All tasks should take a context variable as the first argument.
# 3. All tasks should be prefixed with a queue (e.g. `git`, `db`, etc). This
#    will allow for appropriate worker delegation.
# 4. All tasks that interact directly with the database must run in `db` queue.
# 5. All tasks that interact with packages.qiime2.org must run in the `packages` queue.
# 6. If a task generates a lot of noisy results that aren't important, make sure to
#    add it to `db.clean_up_reindex_tasks`.

@dataclass(frozen=True)
class BuildCfg:
    # treat this class like an ABC, please.
    github_token: str
    run_id: str
    artifact_name: str
    package_name: str


@dataclass(frozen=True)
class PackageBuildCfg(BuildCfg):
    version: str
    repository: str
    build_target: str
    package_token: str
    epoch_name: str

    def __post_init__(self):
        # https://docs.python.org/3/library/dataclasses.html#frozen-instances
        object.__setattr__(self, 'gate', conf.settings.GATE_TESTED)
        object.__setattr__(self, 'to_channel', str(conf.settings.BASE_CONDA_PATH / self.epoch_name / self.gate))


@dataclass(frozen=True)
class DistroBuildCfg(BuildCfg):
    version: str
    epoch_name: str
    owner: str
    repo: str
    gate: str
    from_channel: str
    package_versions: Dict[str, str] = field(default_factory=dict)
    pr_number: int = None

    def __post_init__(self):
        # https://docs.python.org/3/library/dataclasses.html#frozen-instances
        object.__setattr__(self, 'distro_name', self.package_name)
        object.__setattr__(self, 'to_channel',
                           str(conf.settings.BASE_CONDA_PATH / self.epoch_name / self.gate / self.distro_name))
        object.__setattr__(self, 'repository', '%s/%s' % (self.owner, self.repo))

        if self.pr_number is not None:
            pr_url = 'https://github.com/%s/%s/pull/%d' % (self.owner, self.repo, self.pr_number)
        else:
            pr_url = ''

        object.__setattr__(self, 'pr_url', pr_url)


@dataclass
class PackageBuildCtx:
    pk: Optional[str] = None
    not_all_architectures_present: bool = True


@dataclass
class DistroBuildCtx:
    pk: Optional[str] = None
    not_all_architectures_present: bool = True
    pkg_fns: List[str] = field(default_factory=list)


@dataclass
class HandlePRsCtx:
    epoch_name: str = None
    github_token: str = None
    package_versions: Dict[str, str] = field(default_factory=dict)
    package_build_pks: List[str] = field(default_factory=list)
    distro_build_pks: Dict[str, str] = field(default_factory=dict)
    distro_build_versions: Dict[str, str] = field(default_factory=dict)
    pr_url: str = None
    version: str = None

    def ready_to_open_pr(self):
        return len(self.package_versions)

    def ready_to_update_distro_build_records(self):
        return len(self.distro_build_pks) and self.pr_url


@shared_task(name='pipeline.handle_prs')
def handle_prs():
    chains = []
    for build_target in ['dev', 'release']:
        for epoch in Epoch.objects.by_build_target(build_target):
            ctx = HandlePRsCtx(epoch_name=epoch.name, github_token=conf.settings.GITHUB_TOKEN)
            chain_link = chain(
                db.find_packages_ready_for_integration.s(ctx),
                git.open_pull_request.s(),
                db.update_distro_build_records_integration_pr_url.s(),
            )
            chains.append(chain_link)
    return group(*chains).apply_async()


@shared_task(name='pipeline.reindex_conda_channels')
def reindex_conda_channels():
    tasks = []
    for build_target in ['dev', 'release']:
        for epoch in Epoch.objects.by_build_target(build_target):
            task = packages.reindex_conda_channel.s(
                None,
                str(conf.settings.BASE_CONDA_PATH / epoch.name / conf.settings.GATE_TESTED),
                '%s-%s' % (epoch.name, conf.settings.GATE_TESTED),
            )
            tasks.append(task)

            for distro in epoch.distros.all():
                task = packages.reindex_conda_channel.s(
                    None,
                    str(conf.settings.BASE_CONDA_PATH / epoch.name / conf.settings.GATE_STAGED / distro.name),
                    '%s-%s-%s' % (epoch.name, distro.name, conf.settings.GATE_STAGED),
                )
                tasks.append(task)

    return group(*tasks).apply_async()


@shared_task(name='pipeline.handle_new_builds')
def handle_new_package_build(initial_data):
    chains = []
    epoch_names = initial_data.pop('epoch_names')
    for epoch_name in epoch_names:
        ctx = PackageBuildCtx()
        cfg = PackageBuildCfg(epoch_name=epoch_name, **initial_data)

        chain_link = chain(
            # explicitly pass ctx into the first subtask in the chain
            db.create_package_build_record_and_update_package.s(ctx, cfg),
            # ctx is implicitly applied as first arg for every other subtask in the chain
            packages.fetch_package_from_github.s(cfg),
            packages.reindex_conda_channel.s(cfg.to_channel, '%s-%s' % (cfg.epoch_name, conf.settings.GATE_TESTED)),
            db.mark_uploaded_package.s(cfg),
            db.verify_all_architectures_present.s(cfg),
            git.update_conda_build_config.s(cfg),
        )
        chains.append(chain_link)

    return group(*chains).apply_async(countdown=conf.settings.TASK_TIMES['10_MIN'])


@shared_task(name='pipeline.handle_new_distro_build')
def handle_new_distro_build(cfg: DistroBuildCfg):
    ctx = DistroBuildCtx()
    tasks = chain(
        # explicitly pass ctx into the first subtask in the chain
        db.get_or_create_and_update_distro_build_record.s(ctx, cfg),
        # ctx is implicitly applied as first arg for every other subtask in the chain
        packages.fetch_package_from_github.s(cfg),
        db.mark_distro_gate.s(cfg),
        db.verify_all_architectures_present.s(cfg),
        packages.find_packages_to_copy.s(cfg),
        packages.copy_conda_packages.s(cfg),
        packages.reindex_conda_channel.s(cfg.to_channel, '%s-%s-%s' %
                                         (cfg.epoch_name, cfg.distro_name, conf.settings.GATE_STAGED)),
        git.merge_integration_pr.s(cfg),
    )

    return tasks.apply_async(countdown=conf.settings.TASK_TIMES['10_MIN'])


@shared_task(name='pipeline.handle_passed_distro_build')
def handle_passed_distro_build(cfg: DistroBuildCfg):
    ctx = DistroBuildCtx()
    tasks = chain(
        # explicitly pass ctx into the first subtask in the chain
        db.get_or_create_and_update_distro_build_record.s(ctx, cfg),
        # ctx is implicitly applied as first arg for every other subtask in the chain
        db.mark_distro_gate.s(cfg),
        db.verify_all_architectures_present.s(cfg),
        packages.find_packages_to_copy.s(cfg),
        packages.copy_conda_packages.s(cfg),
        packages.reindex_conda_channel.s(cfg.to_channel, '%s-%s-%s' %
                                         (cfg.epoch_name, cfg.distro_name, conf.settings.GATE_PASSED)),
    )

    return tasks.apply_async(countdown=conf.settings.TASK_TIMES['10_MIN'])
