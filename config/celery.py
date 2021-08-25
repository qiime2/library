# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

import dataclasses
import json

from celery import Celery
from kombu.serialization import register


class LibraryJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if dataclasses.is_dataclass(obj):
            return {
                # save the class name for later!
                '__type__': type(obj).__name__,
                **dataclasses.asdict(obj),
            }
        return super().default(obj)


def decoder(obj):
    # this is one of our custom dataclasses, let's rehydrate it!
    if type_ := obj.pop('__type__', None):
        from library.api.tasks import (
            DistroBuildCfg,
            DistroBuildCtx,
            HandlePRsCtx,
            PackageBuildCfg,
            PackageBuildCtx,
        )
        # throwaway dict to map str name to actual class. we could also `eval`
        # but for smaller sets of custom classes, i think this is a bit cleaner
        return {
            'DistroBuildCfg': DistroBuildCfg,
            'DistroBuildCtx': DistroBuildCtx,
            'HandlePRsCtx': HandlePRsCtx,
            'PackageBuildCfg': PackageBuildCfg,
            'PackageBuildCtx': PackageBuildCtx,
        }[type_](**obj)
    return obj


def dumps(obj):
    return json.dumps(obj, cls=LibraryJSONEncoder)


def loads(obj):
    return json.loads(obj, object_hook=decoder)


app = Celery('library-tasks')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()


register('library-json', dumps, loads, content_type='application/x-library-json',
         content_encoding='utf-8')
