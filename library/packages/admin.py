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
    ordering = ('-updated_at',)

    def has_add_permission(self, req):
        return False

    def has_change_permission(self, request, obj=None):
        return False


class DistroInline(admin.StackedInline):
    model = Package.distros.through
    extra = 0
    can_delete = False
    ordering = ('-updated_at',)
    verbose_name = 'Distro'
    verbose_name_plural = 'Distros'

    def has_change_permission(self, request, obj=None):
        return False


class PackageAdmin(admin.ModelAdmin):
    list_display=('name', 'token', 'repository', 'updated_at', 'created_at')
    fields=('name', 'token', 'repository', 'updated_at', 'created_at')
    readonly_fields = ('token', 'updated_at', 'created_at')
    inlines = [PackageBuildInline, DistroInline]
    ordering = ('-updated_at',)

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ('name', 'repository')
        else:
            return self.readonly_fields


class PackageBuildAdmin(admin.ModelAdmin):
    list_display = ('package', 'github_run_id', 'epoch_name', 'build_target', 'version',
                    'linux_64_tested', 'osx_64_tested', 'linux_64_staged', 'osx_64_staged',
                    'created_at', 'updated_at')
    fields = ('package', 'github_run_id', 'epoch_name', 'build_target', 'version',
              'linux_64_tested', 'osx_64_tested', 'linux_64_staged', 'osx_64_staged',
              'created_at', 'updated_at')
    readonly_fields = ('package', 'github_run_id', 'epoch_name', 'build_target', 'version',
                       'linux_64_tested', 'osx_64_tested', 'linux_64_staged', 'osx_64_staged',
                       'created_at', 'updated_at')
    ordering = ('-updated_at',)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


class PackageInline(admin.TabularInline):
    model = Distro.packages.through
    extra = 0
    verbose_name = 'Package'
    verbose_name_plural = 'Packages'
    ordering = ('-updated_at',)

    def has_change_permission(self, request, obj=None):
        return False


class EpochInline(admin.TabularInline):
    model = Epoch.distros.through
    extra = 0
    verbose_name = 'Epoch'
    verbose_name_plural = 'Epochs'
    ordering = ('-updated_at',)

    def has_change_permission(self, request, obj=None):
        return False


class DistroAdmin(admin.ModelAdmin):
    list_display = ('name', 'updated_at', 'created_at')
    fields = ('name', 'updated_at', 'created_at')
    readonly_fields = ('updated_at', 'created_at')
    ordering = ('-updated_at',)
    inlines = [PackageInline, EpochInline]


class DistroInline(admin.TabularInline):
    model = Epoch.distros.through
    extra = 0
    verbose_name = 'Distro'
    verbose_name_plural = 'Distros'
    ordering = ('-updated_at',)

    def has_change_permission(self, request, obj=None):
        return False


class EpochAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_dev', 'include_in_ci')
    fields = ('name', 'is_dev', 'include_in_ci')
    ordering = ('-updated_at',)
    inlines = [DistroInline]


# TODO: show associated package builds
class DistroBuildAdmin(admin.ModelAdmin):
    list_display = ('version', 'github_run_id', 'distro_name', 'linux_64', 'osx_64',
                    'clickable_integration_pr_url', 'updated_at', 'created_at')
    fields = ('version', 'github_run_id', 'distro_name', 'linux_64', 'osx_64',
              'clickable_integration_pr_url', 'updated_at', 'created_at')
    readonly_fields = ('version', 'github_run_id', 'distro_name', 'linux_64', 'osx_64',
                       'clickable_integration_pr_url', 'updated_at', 'created_at')
    ordering = ('-updated_at',)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    @admin.display(description='Integration PR')
    def clickable_integration_pr_url(self, instance):
        return url_helper(instance, 'pr_url')


admin.site.register(Package, PackageAdmin)
admin.site.register(PackageBuild, PackageBuildAdmin)
admin.site.register(Distro, DistroAdmin)
admin.site.register(Epoch, EpochAdmin)
admin.site.register(DistroBuild, DistroBuildAdmin)
