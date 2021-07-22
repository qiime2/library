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
from library.packages.models import Package, PackageBuild, Distro


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
        ctx, package_id, run_id, version, package_name, repository, artifact_name,
        release, epoch):
    package_build_record, _ = PackageBuild.objects.get_or_create(
        package_id=package_id,
        github_run_id=run_id,
        version=version,
        release=release,
        epoch=epoch,
    )

    package = Package.objects.get(pk=package_id)
    package.name = package_name
    package.repository = repository
    package.save()

    ctx['package_build_record'] = package_build_record.pk

    return ctx


@shared_task(name='db.mark_uploaded')
def mark_uploaded(ctx, artifact_name):
    if 'uploaded' not in ctx:
        raise Exception('mark_as_uploaded called before reindex_conda_server')

    pk = ctx['package_build_record']
    package_build_record = PackageBuild.objects.get(pk=pk)

    if artifact_name == 'linux-64':
        package_build_record.linux_64 = True
    elif artifact_name == 'osx-64':
        package_build_record.osx_64 = True
    else:
        raise Exception('unknown build type')

    package_build_record.save()

    return ctx


@shared_task(name='db.verify_all_architectures_present')
def verify_all_architectures_present(ctx):
    pk = ctx['package_build_record']
    ctx['not_all_architectures_present'] = True

    package_build_record = PackageBuild.objects.get(pk=pk)
    if package_build_record.linux_64 and package_build_record.osx_64:
        ctx['not_all_architectures_present'] = False

    return ctx


@shared_task(name='db.find_packages_ready_for_integration')
def find_packages_ready_for_integration(ctx, release):
    package_versions = dict()
    package_build_ids = set()

    for distro in Distro.objects.all():
        package_versions[distro.name] = dict()
        for record in PackageBuild.objects.filter(
                    linux_64=True,
                    osx_64=True,
                    integration_pr_url='',
                    release=release,
                    package__in=distro.packages.all(),
                ):
            if record.package.name in package_versions[distro.name]:
                # in case multiple versions exist at this point, only consider the _newest_ one
                if utils.compare_package_versions(package_versions[distro.name][record.package.name], record.version):
                    package_versions[distro.name][record.package.name] = record.version
                    package_build_ids.add(record.id)
            else:
                package_versions[distro.name][record.package.name] = record.version
                package_build_ids.add(record.id)
        if len(package_versions[distro.name]) == 0:
            package_versions.pop(distro.name)

    ctx['package_versions'] = package_versions
    ctx['package_build_ids'] = list(package_build_ids)

    return ctx


@shared_task(name='db.update_package_build_record_integration_pr_url')
def update_package_build_record_integration_pr_url(ctx):
    if len(ctx['package_versions']) < 1:
        return ctx

    url = ctx['pr_url']

    with transaction.atomic():
        for pk in ctx['package_build_ids']:
            package_build_record = PackageBuild.objects.get(pk=pk)
            if package_build_record.integration_pr_url != '':
                raise Exception('a pr already exists for this package build')
            package_build_record.integration_pr_url = url
            package_build_record.save()

    return ctx
