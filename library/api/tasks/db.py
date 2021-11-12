# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

import datetime
from typing import Union

from celery import shared_task
from django_celery_results.models import TaskResult
from django.db import transaction
from django import conf
from django.utils import timezone

from .. import utils
from library.packages.models import Package, PackageBuild, Distro, DistroBuild, Epoch


@shared_task(name='db.celery_backend_cleanup')
def celery_backend_cleanup():
    with transaction.atomic():
        TaskResult.objects.filter(
            date_done__lt=timezone.now() - datetime.timedelta(seconds=conf.settings.CELERY_RESULT_EXPIRES),
            task_name__in=[
                'packages.reindex_conda_server',
                'packages.celery_backend_cleanup',
            ],
        ).delete()


@shared_task(name='db.create_package_build_record_and_update_package')
def create_package_build_record_and_update_package(ctx: 'PackageBuildCtx',  # noqa: F821
                                                   cfg: 'PackageBuildCfg'):  # noqa: F821
    package_record = Package.objects.get(token=cfg.package_token)
    package_record.name = cfg.package_name
    package_record.repository = cfg.repository
    package_record.save()

    epoch_record = Epoch.objects.get(name=cfg.epoch_name)

    package_build_record, _ = PackageBuild.objects.get_or_create(
        package=package_record,
        github_run_id=cfg.run_id,
        version=cfg.version,
        epoch=epoch_record,
        build_target=cfg.build_target,
    )

    ctx.pk = str(package_build_record.pk)

    return ctx


@shared_task(name='db.mark_uploaded_package')
def mark_uploaded_package(ctx: 'PackageBuildCtx', cfg: 'PackageBuildCfg'):  # noqa: F821
    package_build_record = PackageBuild.objects.get(pk=ctx.pk)

    if cfg.artifact_name not in ('linux-64', 'osx-64'):
        raise Exception('unknown build type')

    attr = cfg.artifact_name.replace('-', '_')
    setattr(package_build_record, attr, True)
    package_build_record.save()

    return ctx


@shared_task(name='db.mark_distro_gate')
def mark_distro_gate(ctx: 'DistroBuildCtx', cfg: 'DistroBuildCfg'):  # noqa: F821
    distro_build_record = DistroBuild.objects.get(pk=ctx.pk)
    distro_build_record.mark_gate(cfg.gate, cfg.artifact_name)
    distro_build_record.save()

    return ctx


@shared_task(name='db.verify_all_architectures_present')
def verify_all_architectures_present(ctx: Union['PackageBuildCtx',  # noqa: F821
                                                'DistroBuildCtx'],  # noqa: F821
                                     cfg: Union['PackageBuildCfg',  # noqa: F821
                                                'DistroBuildCfg']):  # noqa: F821
    model = {
        'PackageBuildCtx': PackageBuild,
        'DistroBuildCtx': DistroBuild,
    }[str(type(ctx).__name__)]

    build_record = model.objects.get(pk=ctx.pk)
    if build_record.verify_gate(cfg.gate):
        # I know, double-negative is weird here...
        ctx.not_all_architectures_present = False

    return ctx


@shared_task(name='db.find_packages_ready_for_integration')
def find_packages_ready_for_integration(ctx: 'HandlePRsCtx'):  # noqa: F821
    package_builds = dict()
    distro_build_pks = dict()

    epoch = Epoch.objects.get(name=ctx.epoch_name)

    for distro in Distro.objects.all():
        package_build_records = PackageBuild.objects.ready_for_integration(ctx.epoch_name, distro)
        package_build_records = list(package_build_records)
        if len(package_build_records) > 0:
            version = datetime.datetime.utcnow().strftime('%Y.%m.%d.%H.%M.%S')
            distro_build_record, _ = DistroBuild.objects.get_or_create(
                distro=distro,
                epoch=epoch,
                pr_url='',
                version=version,
            )
            distro_build_record.save()
            pbrs = [r['id'] for r in package_build_records]
            distro_build_record.package_builds.set(pbrs)

            package_builds[distro.name] = package_build_records
            distro_build_pks[distro.name] = str(distro_build_record.pk)

    package_versions, package_build_pks = utils.find_packages_ready_for_integration(
        package_builds)

    ctx.package_versions = package_versions
    ctx.package_build_pks = list(package_build_pks)
    ctx.distro_build_pks = distro_build_pks

    return ctx


@shared_task(name='db.update_distro_build_record_integration_pr_url')
def update_distro_build_records_integration_pr_url(ctx: 'HandlePRsCtx'):  # noqa: F821
    if not ctx.ready_to_update_distro_build_records():
        return ctx

    with transaction.atomic():
        for distro_name, pk in ctx.distro_build_pks.items():
            distro_build_record = DistroBuild.objects.get(pk=pk)
            if distro_build_record.pr_url != '':
                raise Exception('a pr already exists for this distro build: %s vs %s' %
                                (distro_build_record.pr_url, ctx.pr_url))
            distro_build_record.pr_url = ctx.pr_url
            distro_build_record.save()

    return ctx


@shared_task(name='db.update_distro_build_record')
def get_or_create_and_update_distro_build_record(ctx: 'DistroBuildCtx', cfg: 'DistroBuildCfg'):  # noqa: F821
    # NOTE: it is possible for a PR to be created manually, which means
    # there aren't any specifically associated PackageBuild records, or
    # preexisting DistroBuild records.
    distro = Distro.objects.get(name=cfg.distro_name)
    epoch = Epoch.objects.get(name=cfg.epoch_name)

    record, _ = DistroBuild.objects.get_or_create(
        distro=distro,
        epoch=epoch,
        version=cfg.version,
    )

    if cfg.gate == conf.settings.GATE_STAGED:
        record.staged_github_run_id = cfg.run_id
    elif cfg.gate == conf.settings.GATE_PASSED:
        record.passed_github_run_id = cfg.run_id
    else:
        raise Exception('invalid gate %s' % (cfg.gate,))

    record.save()

    ctx.pk = str(record.pk)

    return ctx
