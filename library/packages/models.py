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
    release = models.CharField(max_length=50)
    epoch = models.CharField(max_length=50)

    def __str__(self):
        return 'PackageBuild<github_run_id=%s, version=%s>' % (self.github_run_id, self.version)


class Distro(AuditModel):
    name = models.CharField(max_length=255)
    packages = models.ManyToManyField(
        Package,
        through='DistroPackages',
    )

    def __str__(self):
        return self.name


# For now we won't worry about release and/or epoch, but I imagine we will
# want to circle back on that in the future.
class DistroPackages(AuditModel):
    distro = models.ForeignKey(Distro, on_delete=models.CASCADE)
    package = models.ForeignKey(Package, on_delete=models.CASCADE)

    def __str__(self):
        return 'DistroPackages<distro=%s, package=%s>' % (self.distro, self.package)
