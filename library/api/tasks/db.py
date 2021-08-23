# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

import datetime

from celery import shared_task
from django_celery_results.models import TaskResult
from django.db import transaction
from django import conf
from django.utils import timezone

from .. import utils
from library.packages.models import Package, PackageBuild, Distro, DistroBuild


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
def create_package_build_record_and_update_package(
        ctx, package_id, run_id, version, package_name, repository, release, build_target):
    package_build_record, _ = PackageBuild.objects.get_or_create(
        package_id=package_id,
        github_run_id=run_id,
        version=version,
        release=release,
        build_target=build_target,
    )

    package = Package.objects.get(pk=package_id)
    package.name = package_name
    package.repository = repository
    package.save()

    ctx['package_build_record'] = package_build_record.pk

    return ctx


@shared_task(name='db.mark_uploaded_package')
def mark_uploaded_package(ctx, artifact_name, gate):
    if 'uploaded' not in ctx:
        raise Exception('mark_uploaded_package called before reindex_conda_server')

    pk = ctx['package_build_record']
    package_build_record = PackageBuild.objects.get(pk=pk)

    if artifact_name not in ('linux-64', 'osx-64'):
        raise Exception('unknown build type')

    attr = '%s_%s' % (artifact_name.replace('-', '_'), gate)
    setattr(package_build_record, attr, True)
    package_build_record.save()

    return ctx


@shared_task(name='db.mark_uploaded_distro')
def mark_uploaded_distro(ctx, artifact_name):
    if 'uploaded' not in ctx:
        raise Exception('mark_uploaded_distro called before reindex_conda_server')

    pk = ctx['distro_build_record']
    distro_build_record = DistroBuild.objects.get(pk=pk)

    if 'linux' in artifact_name:
        distro_build_record.linux_64 = True
    elif 'osx' in artifact_name:
        distro_build_record.osx_64 = True
    else:
        raise 'invalid architecture'

    distro_build_record.save()

    return ctx


@shared_task(name='db.verify_all_architectures_present')
def verify_all_architectures_present(ctx, gate):
    pk = ctx['package_build_record']
    ctx['not_all_architectures_present'] = True

    package_build_record = PackageBuild.objects.get(pk=pk)
    linux_64 = getattr(package_build_record, 'linux_64_%s' % (gate,))
    osx_64 = getattr(package_build_record, 'osx_64_%s' % (gate,))
    if linux_64 and osx_64:
        ctx['not_all_architectures_present'] = False

    return ctx


@shared_task(name='db.find_packages_ready_for_integration')
def find_packages_ready_for_integration(ctx, release):
    package_builds = dict()
    distro_build_ids = list()
    for distro in Distro.objects.all():
        package_build_records = PackageBuild.objects.ready_for_integration(release, distro)
        package_build_records = list(package_build_records)
        if len(package_build_records) > 0:
            distro_build_record = DistroBuild(
                distro_name=distro.name,
            )

            distro_build_record.save()
            pbrs = [r['id'] for r in package_build_records]
            distro_build_record.package_builds.set(pbrs)

            package_builds[distro.name] = package_build_records
            distro_build_ids.append(distro_build_record.pk)

    package_versions, package_build_ids = utils.find_packages_ready_for_integration(
        package_builds)

    ctx['package_versions'] = package_versions
    ctx['package_build_ids'] = list(package_build_ids)
    ctx['distro_build_ids'] = distro_build_ids

    return ctx


@shared_task(name='db.update_distro_build_record_integration_pr_url')
def update_distro_build_records_integration_pr_url(ctx):
    if len(ctx['distro_build_ids']) < 1:
        return ctx

    if 'pr_url' not in ctx:
        return ctx

    distro_build_ids = ctx.pop('distro_build_ids')
    url = ctx.pop('pr_url')

    with transaction.atomic():
        for pk in distro_build_ids:
            distro_build_record = DistroBuild.objects.get(pk=pk)
            if distro_build_record.pr_url != '':
                raise Exception('a pr already exists for this distro build')
            distro_build_record.pr_url = url
            distro_build_record.save()

    return ctx


@shared_task(name='db.update_distro_build_record')
def get_or_create_and_update_distro_build_record(ctx, distro_name, run_id, version, pr_url, artifact_name):
    # NOTE: it is possible for a PR to be created manually, which means
    # there aren't any specifically associated PackageBuild records, or
    # preexisting DistroBuild records.
    record, _ = DistroBuild.objects.get_or_create(
        distro_name=distro_name,
        pr_url=pr_url,
    )

    record.version = version
    record.github_run_id = run_id
    record.save()

    ctx['distro_build_record'] = str(record.pk)

    return ctx
