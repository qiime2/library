# ----------------------------------------------------------------------------
# Copyright (c) 2018-2023, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

from django.urls import path, include

from . import views


app_name = 'api2'


urlpatterns = [
    path('packages/', include([
        path('', views.list_packages, name='list-packages'),
    ])),
    path('distros/', include([
        path('', views.list_distros, name='list-distros'),
    ])),
]
