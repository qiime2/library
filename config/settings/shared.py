# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

import os
import pathlib

import environ
from celery.schedules import crontab


env = environ.Env()


def list_of_tuples(var):
    return [tuple(p.split(',')) for p in var.split(';')]


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PROJ_DIR = os.path.join(BASE_DIR, 'library')
SECRET_KEY = env('SECRET_KEY',
                 default='ou$@l5=z0h#^l!or)35eyf6wcb2y%+=1vik%f(ww^=++$apsab')
DEBUG = env('DEBUG', default=True)
ALLOWED_HOSTS = []
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'django_celery_results',

    # utils needs to be registered for template tags, and needs to come first
    # because other apps use it
    'library.utils.apps.UtilsConfig',
    'library.plugins.apps.PluginsConfig',
    'library.users.apps.UsersConfig',
    'library.api.apps.APIConfig',
    'library.packages.apps.PackagesConfig',
]
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
ROOT_URLCONF = 'config.urls'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(PROJ_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
WSGI_APPLICATION = 'config.wsgi.application'
DATABASES = {
    'default': env.db('DATABASE_URL', default='postgres://postgres@db:5432/postgres'),
}
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},  # noqa: E501
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},  # noqa: E501
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},  # noqa: E501
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},  # noqa: E501
]
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True
STATIC_URL = '/static/'
# Note that these paths should use Unix-style forward slashes, even on Windows
STATICFILES_DIRS = ['%s/static' % PROJ_DIR]
STATIC_ROOT = os.path.join(BASE_DIR, 'collected_static')
APPEND_SLASH = True  # This is the default, but just want make it explicit
LOGIN_URL = '/login/'
LOGOUT_REDIRECT_URL = 'index'
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
ADMINS = env('ADMINS', default=list_of_tuples('x,x@x.com;y,y@y.com'),
             cast=list_of_tuples)
AUTH_USER_MODEL = 'users.User'
RABBITMQ_URL = env('RABBITMQ_URL', default='amqp://guest@mq')
# We want to use the rmq url set by dokku, emulating in dev
CELERY_BROKER_URL = env('RABBITMQ_URL', default='amqp://guest@mq')
CELERY_RESULT_BACKEND = 'django-db'
CELERY_RESULT_EXPIRES = 60 * 60 * 24  # once per day
CELERY_RESULT_SERIALIZER = 'library-json'
CELERY_TASK_SERIALIZER = 'library-json'
CELERY_ACCEPT_CONTENT = ['library-json']
CELERY_TASK_ROUTES = {
    'index.*': {'queue': 'default'},
    'db.*': {'queue': 'db'},
    'packages.*': {'queue': 'packages'},
    'git.*': {'queue': 'git'},
    'periodic.*': {'queue': 'periodic'},
    # NOTE: pipeline must run on the same worker node as `db`
    'pipeline.*': {'queue': 'pipeline'},
}
BASE_CONDA_PATH = pathlib.Path('/data/qiime2')
GITHUB_TOKEN = env('GITHUB_TOKEN', default='')
# Don't forget to update local.py when changing here
TASK_TIMES = {
    '03_MIN': 60 * 3,
    '05_MIN': 60 * 5,
    '10_MIN': 60 * 10,
    '90_MIN': 60 * 90,
    '02_HR': 60 * 60 * 2,

    '4A_CRON': crontab(minute=0, hour=4),  # daily at 4a
    'HRLY_CRON': crontab(minute=0),  # hourly
}


def generate_beat_schedule(TASK_TIMES):
    return {
        'periodic.clean_up_backend': {
            'task': 'db.celery_backend_cleanup',
            'schedule': TASK_TIMES['4A_CRON'],
        },
        'periodic.handle_prs': {
            'task': 'pipeline.handle_prs',
            'schedule': TASK_TIMES['HRLY_CRON'],
        },
        'periodic.reindex_conda_channels': {
            'task': 'pipeline.reindex_conda_channels',
            'schedule': TASK_TIMES['05_MIN'],
        },
    }


CELERY_BEAT_SCHEDULE = generate_beat_schedule(TASK_TIMES)
INTEGRATION_REPO = {
    'owner': 'not-a-real-owner',
    'repo': 'package-integration',
    'branch': 'main',
    'token': 'foo',
}
GATE_TESTED = 'tested'
GATE_STAGED = 'staged'
GATE_PASSED = 'passed'
