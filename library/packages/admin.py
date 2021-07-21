# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

from django.contrib import admin
from django.utils.html import format_html

from .models import Package, PackageBuild


def url_helper(instance, field):
    url = getattr(instance, field)
    return format_html(f'<a href="{url}" target="_blank">{url}</a>')


class PackageBuildInline(admin.TabularInline):
    model = PackageBuild
    fields = ('package', 'github_run_id', 'version', 'linux_64', 'osx_64',
              'clickable_integration_pr_url', 'release')
    readonly_fields = ('package', 'github_run_id', 'version', 'linux_64', 'osx_64',
                       'clickable_integration_pr_url', 'release')
    extra = 0
    can_delete = False

    def has_add_permission(self, req, obj):
        return False

    @admin.display(description='Integration PR')
    def clickable_integration_pr_url(self, instance):
        return url_helper(instance, 'integration_pr_url')


class PackageAdmin(admin.ModelAdmin):
    readonly_fields = ('token', )
    inlines = [PackageBuildInline]

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ('name', 'repository')
        else:
            return self.readonly_fields


class PackageBuildAdmin(admin.ModelAdmin):
    fields = ('package', 'github_run_id', 'version', 'linux_64', 'osx_64',
              'clickable_integration_pr_url', 'release')
    readonly_fields = ('package', 'github_run_id', 'version', 'linux_64', 'osx_64',
                       'clickable_integration_pr_url', 'release')

    @admin.display(description='Integration PR')
    def clickable_integration_pr_url(self, instance):
        return url_helper(instance, 'integration_pr_url')


admin.site.register(Package, PackageAdmin)
admin.site.register(PackageBuild, PackageBuildAdmin)
