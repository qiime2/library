# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

from django import forms, conf
from django.core.exceptions import PermissionDenied

from .tasks import DistroBuildCfg
from ..packages.models import Package, Epoch


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
            Package.objects.get(token=self.cleaned_data['token'])
            build_target = self.cleaned_data['build_target']
            build_target = build_target if build_target != '' else 'dev'

            config = {
                'version': self.cleaned_data['version'],
                'run_id': self.cleaned_data['run_id'],
                'package_name': self.cleaned_data['package_name'],
                'repository': self.cleaned_data['repository'],
                'artifact_name': self.cleaned_data['artifact_name'],
                'github_token': conf.settings.GITHUB_TOKEN,
                'build_target': build_target,
                'epoch_names': Epoch.objects.by_build_target(build_target).values_list('name', flat=True),
                'package_token': str(self.cleaned_data['token']),
            }
        except Package.DoesNotExist:
            config = None

        return config


class DistroIntegrationForm(forms.Form):
    token = forms.CharField(required=True)
    version = forms.CharField(required=True)
    run_id = forms.CharField(required=True)
    distro = forms.CharField(required=True)
    epoch = forms.CharField(required=True)
    artifact_name = forms.CharField(required=True)
    pr_number = forms.IntegerField(required=False)
    package_versions = forms.JSONField(required=True)

    def is_authorized(self, gate):
        token = conf.settings.INTEGRATION_REPO['token']
        if token != self.cleaned_data['token']:
            raise PermissionDenied

        from_channel_base = conf.settings.BASE_CONDA_PATH / self.cleaned_data['epoch']
        if gate == conf.settings.GATE_STAGED:
            from_channel = str(from_channel_base / conf.settings.GATE_TESTED)
        elif gate == conf.settings.GATE_PASSED:
            from_channel = str(from_channel_base / conf.settings.GATE_STAGED / self.cleaned_data['distro'])
        else:
            raise ValueError('invalid gate: %s' % (gate,))

        config = DistroBuildCfg(
            version=self.cleaned_data['version'],
            run_id=self.cleaned_data['run_id'],
            package_name=self.cleaned_data['distro'],
            epoch_name=self.cleaned_data['epoch'],
            artifact_name=self.cleaned_data['artifact_name'],
            github_token=conf.settings.GITHUB_TOKEN,
            pr_number=self.cleaned_data['pr_number'],
            owner=conf.settings.INTEGRATION_REPO['owner'],
            repo=conf.settings.INTEGRATION_REPO['repo'],
            package_versions=self.cleaned_data['package_versions'],
            gate=gate,
            from_channel=from_channel,
        )

        return config
