web: gunicorn config.wsgi:application
worker: celery worker -A config.celery --loglevel=info -Q default,db --hostname=worker01@library.qiime2.org
# TODO: do we need to move the celery beat agent over to this server?
