# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

from django.contrib import admin
from django.utils.html import format_html

from .models import Package, PackageBuild, Distro, Epoch, DistroBuild


def url_helper(instance, field):
    url = getattr(instance, field)
    return format_html(f'<a href="{url}" target="_blank">{url}</a>')


class PackageBuildInline(admin.TabularInline):
    model = PackageBuild
    fields = ('package', 'github_run_id', 'epoch_name', 'build_target', 'version',
              'linux_64_tested', 'osx_64_tested', 'linux_64_staged', 'osx_64_staged',
              'created_at', 'updated_at')
    readonly_fields = ('package', 'github_run_id', 'epoch_name', 'build_target', 'version',
                       'linux_64_tested', 'osx_64_tested', 'linux_64_staged', 'osx_64_staged',
                       'created_at', 'updated_at')
    extra = 0
    can_delete = False
    ordering = ('-version',)

    def has_add_permission(self, req, obj):
        return False


class DistroInline(admin.TabularInline):
    model = Package.distros.through
    extra = 0
    can_delete = False
    ordering = ('distro__name',)

    def has_change_permission(self, request, obj=None):
        return False


class PackageAdmin(admin.ModelAdmin):
    readonly_fields = ('token', )
    inlines = [PackageBuildInline, DistroInline]

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ('name', 'repository')
        else:
            return self.readonly_fields


class PackageBuildAdmin(admin.ModelAdmin):
    fields = ('package', 'github_run_id', 'epoch_name', 'build_target', 'version',
              'linux_64_tested', 'osx_64_tested', 'linux_64_staged', 'osx_64_staged',
              'created_at', 'updated_at')
    readonly_fields = ('package', 'github_run_id', 'epoch_name', 'build_target', 'version',
                       'linux_64_tested', 'osx_64_tested', 'linux_64_staged', 'osx_64_staged',
                       'created_at', 'updated_at')
    ordering = ('-version',)

    def has_add_permission(self, request, obj=None):
        return False


class PackageInline(admin.TabularInline):
    model = Distro.packages.through
    extra = 0
    can_delete = False
    readonly_field = ('package_name',)

    def has_add_permission(self, req, obj):
        return False

    def has_change_permission(self, request, obj=None):
        return False


class EpochInline(admin.TabularInline):
    model = Epoch.distros.through
    extra = 0
    can_delete = False
    readonly_field = ('name', 'is_dev', 'include_in_ci')

    def has_add_permission(self, req, obj):
        return False

    def has_change_permission(self, request, obj=None):
        return False


class DistroAdmin(admin.ModelAdmin):
    fields = ('name',)
    ordering = ('name',)
    inlines = [PackageInline, EpochInline]


class DistroInline(admin.TabularInline):
    model = Epoch.distros.through
    extra = 0
    readonly_field = ('name',)


class EpochAdmin(admin.ModelAdmin):
    fields = ('name', 'is_dev', 'include_in_ci')
    ordering = ('name', 'is_dev', 'include_in_ci')
    inlines = [DistroInline]


class DistroBuildAdmin(admin.ModelAdmin):
    fields = ('version', 'github_run_id', 'distro_name', 'linux_64', 'osx_64',
              'clickable_integration_pr_url')
    readonly_fields = ('version', 'github_run_id', 'distro_name', 'linux_64', 'osx_64',
                       'clickable_integration_pr_url')
    ordering = ('-updated_at',)

    def has_add_permission(self, request, obj=None):
        return False

    @admin.display(description='Integration PR')
    def clickable_integration_pr_url(self, instance):
        return url_helper(instance, 'pr_url')


admin.site.register(Package, PackageAdmin)
admin.site.register(PackageBuild, PackageBuildAdmin)
admin.site.register(Distro, DistroAdmin)
admin.site.register(Epoch, EpochAdmin)
admin.site.register(DistroBuild, DistroBuildAdmin)
