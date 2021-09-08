# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

import uuid

from django.db import models
from django import conf

from library.utils.models import AuditModel


# ### CUSTOM QUERYSETS

class PackageBuildQuerySet(models.QuerySet):
    def ready_for_integration(self, epoch_name, distro):
        return self.filter(
            epoch__name=epoch_name,
            linux_64=True,
            osx_64=True,
            package__in=distro.packages.all(),
            distro_builds__isnull=True,
        ).values('package__name', 'version', 'id')


class EpochQuerySet(models.QuerySet):
    def by_build_target(self, build_target):
        return self.filter(
            include_in_ci=True,
            is_dev=build_target.lower() == 'dev',
        )


# ### BASE MODELS

class Package(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    repository = models.CharField(max_length=255)

    def __str__(self):
        name = self.name if self.name else 'UNSYNCED'
        return 'Package<name=%s>' % (name,)


class PackageBuild(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    package = models.ForeignKey('Package', on_delete=models.CASCADE, related_name='package_builds')
    epoch = models.ForeignKey('Epoch', on_delete=models.CASCADE, related_name='package_builds')
    github_run_id = models.CharField(max_length=100, verbose_name='Github Run ID')
    version = models.CharField(max_length=255)
    linux_64 = models.BooleanField(default=False, verbose_name='Linux 64 Package?')
    osx_64 = models.BooleanField(default=False, verbose_name='OSX 64 Package?')
    build_target = models.CharField(max_length=50, verbose_name='Build Target')

    def verify_gate(self, gate):
        if gate not in (conf.settings.GATE_TESTED,):
            raise Exception('invalid gate: %s' % (gate,))

        return self.linux_64 and self.osx_64

    # Custom Manager
    objects = PackageBuildQuerySet.as_manager()

    def __str__(self):
        return 'PackageBuild<github_run_id=%s, version=%s, build_target=%s>' % (
            self.github_run_id, self.version, self.build_target)

    class Meta:
        verbose_name = 'Package Build'


class Distro(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    packages = models.ManyToManyField(
        Package,
        through='ThroughDistroPackage',
        related_name='distros',
    )

    def __str__(self):
        return 'Distro<%s>' % (self.name,)

    class Meta:
        verbose_name = 'Distro'


class Epoch(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    is_dev = models.BooleanField(default=True, verbose_name='Is Dev?')
    include_in_ci = models.BooleanField(default=False, verbose_name='Include In CI?')
    distros = models.ManyToManyField(
        Distro,
        through='ThroughEpochDistro',
        related_name='epochs',
    )

    # Custom Manager
    objects = EpochQuerySet.as_manager()

    def __str__(self):
        return 'Epoch<%s>' % (self.name,)

    class Meta:
        verbose_name = 'Epoch'


class DistroBuild(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    distro = models.ForeignKey('Distro', on_delete=models.CASCADE, related_name='distro_builds')
    epoch = models.ForeignKey('Epoch', on_delete=models.CASCADE, related_name='distro_builds')
    version = models.CharField(max_length=255)
    staged_github_run_id = models.CharField(max_length=100, verbose_name='Staged GH Run ID')
    staged_linux_64 = models.BooleanField(default=False, verbose_name='Linux Staged Pkg?')
    staged_osx_64 = models.BooleanField(default=False, verbose_name='OSX Staged Pkg?')
    passed_github_run_id = models.CharField(max_length=100, verbose_name='Passed GH Run ID')
    passed_linux_64 = models.BooleanField(default=False, verbose_name='Linux Passed Pkg?')
    passed_osx_64 = models.BooleanField(default=False, verbose_name='OSX Passed Pkg?')
    # TODO: should/can this be unique?
    pr_url = models.URLField(default='', verbose_name='PR URL')

    def mark_gate(self, gate, artifact_name):
        if gate not in (conf.settings.GATE_STAGED, conf.settings.GATE_PASSED):
            raise Exception('invalid gate: %s' % (gate,))

        distro, arch = artifact_name.split('-')

        if distro != self.distro.name:
            raise Exception('invalid distro: %s' % (distro,))

        if arch not in ('linux', 'osx'):
            raise Exception('invalid arch: %s' % (arch,))

        attr = {
            conf.settings.GATE_STAGED: {'linux': 'staged_linux_64', 'osx': 'staged_osx_64'},
            conf.settings.GATE_PASSED: {'linux': 'passed_linux_64', 'osx': 'passed_osx_64'},
        }[gate][arch]

        setattr(self, attr, True)

    def verify_gate(self, gate):
        if gate not in (conf.settings.GATE_STAGED, conf.settings.GATE_PASSED):
            raise Exception('invalid gate: %s' % (gate,))

        if gate == conf.settings.GATE_STAGED:
            return self.staged_linux_64 and self.staged_osx_64

        if gate == conf.settings.GATE_PASSED:
            return self.passed_linux_64 and self.passed_osx_64

    def __str__(self):
        return 'DistroBuild<pk=%s>' % (self.pk,)

    package_builds = models.ManyToManyField(
        PackageBuild,
        through='ThroughDistroBuildPackageBuild',
        related_name='distro_builds',
    )

    class Meta:
        verbose_name = 'Distro Build'
        unique_together = ['distro', 'pr_url', 'epoch']


# ### BRIDGE TABLES

# Django will make these tables for us automatically, but in my experience this
# is usually a big pain when you need to start tracking any additional attributes,
# so let's just get this out of the way now and make these tables.

class ThroughDistroPackage(AuditModel):
    id = models.BigAutoField(primary_key=True)
    distro = models.ForeignKey(Distro, on_delete=models.CASCADE)
    package = models.ForeignKey(Package, on_delete=models.CASCADE)

    def __str__(self):
        return 'ThroughDistroPackage<distro=%s, package=%s>' % (self.distro, self.package)

    class Meta:
        unique_together = ['distro', 'package']


class ThroughEpochDistro(AuditModel):
    id = models.BigAutoField(primary_key=True)
    epoch = models.ForeignKey(Epoch, on_delete=models.CASCADE)
    distro = models.ForeignKey(Distro, on_delete=models.CASCADE)

    def __str__(self):
        return 'ThroughEpochDistro<release=%s, distro=%s>' % (self.epoch, self.distro)

    class Meta:
        unique_together = ['epoch', 'distro']


class ThroughDistroBuildPackageBuild(AuditModel):
    id = models.BigAutoField(primary_key=True)
    distro_build = models.ForeignKey(DistroBuild, on_delete=models.CASCADE)
    package_build = models.ForeignKey(PackageBuild, on_delete=models.CASCADE)

    def __str__(self):
        return 'ThroughDistroBuildPackageBuild<distro_build=%s, package_build=%s>' % (
            self.distro_build, self.package_build)

    class Meta:
        unique_together = ['distro_build', 'package_build']
