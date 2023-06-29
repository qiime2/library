# ----------------------------------------------------------------------------
# Copyright (c) 2018-2023, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

from django import http

from ...packages.models import Package, Distro


def list_packages(request):
    if request.method != 'GET':
        payload = {
            'status': 'error',
            'errors': {'http_method': 'invalid http method'}
        }
        return http.JsonResponse(payload, status=405)

    payload = {
        'packages': {
            pkg.name: pkg.repository for pkg in Package.objects.all()
        }
    }
    return http.JsonResponse(payload, status=200)


def list_distros(request):
    if request.method != 'GET':
        payload = {
            'status': 'error',
            'errors': {'http_method': 'invalid http method'}
        }
        return http.JsonResponse(payload, status=405)

    package = request.GET.get('package')

    query_set = Distro.objects.all
    if package is not None:
        package = Package.objects.filter(name=package).first()
        if package is None:
            payload = {
                'status': 'error',
                'errors': {'query_param': 'package does not exist'}
            }
            return http.JsonResponse(payload, status=404)

        query_set = lambda: package.distros.all()  # noqa: E731

    payload = {
        'distros': [distro.name for distro in query_set()]
    }
    return http.JsonResponse(payload, status=200)
