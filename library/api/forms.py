# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

from django import forms, conf
from django.core.exceptions import PermissionDenied

from ..packages.models import Package


class PackageIntegrationForm(forms.Form):
    token = forms.UUIDField(required=True)
    run_id = forms.CharField(required=True)
    version = forms.CharField(required=True)
    package_name = forms.CharField(required=True)
    repository = forms.CharField(required=True)
    artifact_name = forms.CharField(required=True)
    build_target = forms.CharField(required=False)

    def is_known(self):
        try:
            package = Package.objects.get(token=self.cleaned_data['token'])
            build_target = self.cleaned_data['build_target']
            build_target = build_target if build_target != '' else 'dev'

            config = {
                'package_id': package.pk,
                'run_id': self.cleaned_data['run_id'],
                'version': self.cleaned_data['version'],
                'package_name': self.cleaned_data['package_name'],
                'repository': self.cleaned_data['repository'],
                'artifact_name': self.cleaned_data['artifact_name'],
                'github_token': conf.settings.GITHUB_TOKEN,
                'build_target': build_target,
            }
        except Package.DoesNotExist:
            config = None

        return config


class DistroIntegrationForm(forms.Form):
    token = forms.CharField(required=True)
    version = forms.CharField(required=True)
    run_id = forms.CharField(required=True)
    distro_name = forms.CharField(required=True)
    release = forms.CharField(required=True)
    artifact_name = forms.CharField(required=True)
    pr_number = forms.IntegerField(required=True)

    def is_authorized(self):
        token = conf.settings.INTEGRATION_REPO['token']
        if token != self.cleaned_data['token']:
            raise PermissionDenied
        config = {
            'version': self.cleaned_data['version'],
            'run_id': self.cleaned_data['run_id'],
            'distro_name': self.cleaned_data['distro_name'],
            # TODO: is this an epoch?
            'release': self.cleaned_data['release'],
            'artifact_name': self.cleaned_data['artifact_name'],
            'github_token': conf.settings.GITHUB_TOKEN,
            'pr_number': self.cleaned_data['pr_number'],
        }

        return config
