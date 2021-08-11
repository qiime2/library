# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

import uuid

from django.db import models

from library.utils.models import AuditModel


class Package(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    repository = models.CharField(max_length=255)

    def __str__(self):
        name = self.name if self.name else 'UNSYNCED'
        return 'Package<name=%s, token=%s>' % (name, self.token)


class PackageBuildQuerySet(models.QuerySet):
    def ready_for_integration(self, release, distro):
        return self.filter(
            release=release,
            linux_64_tested=True,
            osx_64_tested=True,
            integration_pr_url='',
            linux_64_staged=False,
            osx_64_staged=False,
            package__in=distro.packages.all(),
        ).values('package__name', 'version', 'id')


class PackageBuild(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    package = models.ForeignKey('Package', on_delete=models.CASCADE, related_name='package_builds')
    github_run_id = models.CharField(max_length=100)
    version = models.CharField(max_length=255)
    linux_64_tested = models.BooleanField(default=False)
    osx_64_tested = models.BooleanField(default=False)
    linux_64_staged = models.BooleanField(default=False)
    osx_64_staged = models.BooleanField(default=False)
    integration_pr_url = models.URLField(default='')
    # this could be a fk to `Release`, but its simpler to just store the raw release name
    release = models.CharField(max_length=50)
    build_target = models.CharField(max_length=50)

    objects = PackageBuildQuerySet.as_manager()

    def __str__(self):
        return 'PackageBuild<github_run_id=%s, version=%s, release=%s, build_target=%s>' % (
            self.github_run_id, self.version, self.release, self.build_target)


class Distro(AuditModel):
    name = models.CharField(max_length=255)
    packages = models.ManyToManyField(
        Package,
        through='DistroPackage',
    )

    def __str__(self):
        return 'Distro<%s>' % (self.name,)


class DistroPackage(AuditModel):
    distro = models.ForeignKey(Distro, on_delete=models.CASCADE)
    package = models.ForeignKey(Package, on_delete=models.CASCADE)

    def __str__(self):
        return 'DistroPackage<distro=%s, package=%s>' % (self.distro, self.package)


class EpochQuerySet(models.QuerySet):
    def releases_by_build_target(self, build_target):
        return self.filter(
            include_in_ci=True,
            is_dev=build_target.lower() == 'dev',
        ).values_list('release', flat=True)


class Epoch(AuditModel):
    release = models.CharField(max_length=255)
    is_dev = models.BooleanField(default=True)
    include_in_ci = models.BooleanField(default=False)
    distros = models.ManyToManyField(
        Distro,
        through='EpochDistro',
    )

    objects = EpochQuerySet.as_manager()

    def __str__(self):
        return 'Epoch<name=%s, is_dev=%s, include_in_ci=%s>' % (
            self.release, self.is_dev, self.include_in_ci)


class EpochDistro(AuditModel):
    epoch = models.ForeignKey(Epoch, on_delete=models.CASCADE)
    distro = models.ForeignKey(Distro, on_delete=models.CASCADE)

    def __str__(self):
        return 'EpochDistro<release=%s, distro=%s>' % (self.epoch, self.distro)
