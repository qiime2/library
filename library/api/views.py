# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

from django import http
from django.core.exceptions import PermissionDenied
from django.views.decorators import csrf

from . import forms
from . import tasks


@csrf.csrf_exempt
def prepare_packages_for_integration(request):
    if request.method != 'POST':
        payload = {'status': 'error', 'errors': {'http_method': 'invalid http method'}}
        return http.JsonResponse(payload, status=405)

    form = forms.PackageIntegrationForm(request.POST, initial={'build_target': 'dev'})

    if not form.is_valid():
        payload = {'status': 'error', 'errors': form.errors}
        return http.JsonResponse(payload, status=400)

    if (config := form.is_known()):
        tasks.handle_new_package_build(config)

    payload = {'status': 'ok'}
    return http.JsonResponse(payload, status=200)


@csrf.csrf_exempt
def finalize_integration(request):
    if request.method != 'POST':
        payload = {'status': 'error', 'errors': {'http_method': 'invalid http method'}}
        return http.JsonResponse(payload, status=405)

    form = forms.DistroIntegrationForm(request.POST)

    if not form.is_valid():
        payload = {'status': 'error', 'errors': form.errors}
        return http.JsonResponse(payload, status=400)

    try:
        config = form.is_authorized()
    except PermissionDenied:
        payload = {'status': 'error', 'errors': {'token': 'invalid token'}}
        return http.JsonResponse(payload, status=401)

    tasks.handle_new_distro_build(config)
    payload = {'status': 'ok'}
    return http.JsonResponse(payload, status=200)
