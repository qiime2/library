# ----------------------------------------------------------------------------
# Copyright (c) 2018-2023, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

# Generated by Django 3.0.7 on 2020-06-05 18:07

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('plugins', '0002_optional_plugin_deps'),
        ('users', '0002_DATA_trust_level_1_can_add_plugins'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='PluginAuthorship',
            new_name='LegacyPluginAuthorship',
        ),
        migrations.AlterModelOptions(
            name='legacypluginauthorship',
            options={'verbose_name_plural': 'legacy plugin authorship'},
        ),
    ]
