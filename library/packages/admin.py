# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

from django import conf
from django.contrib import admin
from django.utils.html import format_html

from .models import Package, PackageBuild, Distro, Epoch, DistroBuild


def url_helper(url, name):
    return format_html(f'<a href="{url}" target="_blank">{name}</a>')


class DistroBuildInline(admin.TabularInline):
    model = PackageBuild.distro_builds.through
    extra = 0
    can_delete = False
    verbose_name = 'Distro Build'
    verbose_name_plural = 'Distro Builds'

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False


class PackageBuildInline(admin.TabularInline):
    model = PackageBuild
    fields = ('package', 'clickable_gh_run_url', 'epoch', 'build_target', 'version',
              'linux_64', 'osx_64', 'created_at', 'updated_at')
    readonly_fields = ('package', 'clickable_gh_run_url', 'epoch', 'build_target', 'version',
                       'linux_64', 'osx_64', 'created_at', 'updated_at')
    extra = 0
    can_delete = False
    ordering = ('-updated_at',)

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    @admin.display(description='GH Run')
    def clickable_gh_run_url(self, instance):
        if instance.github_run_id != '':
            url = f'https://github.com/{instance.package.repository}/actions/runs/{instance.github_run_id}'
            return url_helper(url, 'Link')
        return 'NA'


class PackageBuildInlineDistroBuild(admin.TabularInline):
    model = DistroBuild.package_builds.through
    extra = 0
    can_delete = False

    def has_add_permission(self, request, obj=None):
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
    list_display = ('name', 'token', 'repository', 'created_at', 'updated_at')
    fields = ('name', 'token', 'repository', 'created_at', 'updated_at')
    readonly_fields = ('token', 'created_at', 'updated_at')
    inlines = [DistroInline, PackageBuildInline]
    ordering = ('-updated_at',)

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ('name', 'repository')
        else:
            return self.readonly_fields


class PackageBuildAdmin(admin.ModelAdmin):
    list_display = ('package', 'github_run_id', 'epoch', 'build_target', 'version',
                    'linux_64', 'osx_64', 'created_at', 'updated_at')
    fields = ('package', 'github_run_id', 'epoch', 'build_target', 'version',
              'linux_64', 'osx_64', 'created_at', 'updated_at')
    readonly_fields = ('package', 'github_run_id', 'epoch', 'build_target', 'version',
                       'linux_64', 'osx_64', 'created_at', 'updated_at')
    ordering = ('-updated_at',)
    inlines = [DistroBuildInline]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
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
    list_display = ('name', 'created_at', 'updated_at')
    fields = ('name', 'created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')
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
    list_display = ('name', 'is_dev', 'include_in_ci', 'created_at', 'updated_at')
    fields = ('name', 'is_dev', 'include_in_ci', 'created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-updated_at',)
    inlines = [DistroInline]


class DistroBuildAdmin(admin.ModelAdmin):
    list_display_links = ('distro', 'epoch', 'version')
    list_display = ('distro', 'epoch', 'version', 'clickable_staged_gh_run_url',
                    'staged_linux_64', 'staged_osx_64', 'clickable_passed_gh_run_url',
                    'passed_linux_64', 'passed_osx_64', 'clickable_integration_pr_url',
                    'created_at', 'updated_at')
    fields = ('distro', 'epoch', 'version', 'clickable_staged_gh_run_url',
              'staged_linux_64', 'staged_osx_64', 'clickable_passed_gh_run_url',
              'passed_linux_64', 'passed_osx_64', 'clickable_integration_pr_url',
              'created_at', 'updated_at')
    readonly_fields = ('distro', 'epoch', 'version', 'clickable_staged_gh_run_url',
                       'staged_linux_64', 'staged_osx_64', 'clickable_passed_gh_run_url',
                       'passed_linux_64', 'passed_osx_64', 'clickable_integration_pr_url',
                       'created_at', 'updated_at')
    ordering = ('-updated_at',)
    inlines = [PackageBuildInlineDistroBuild]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    @admin.display(description='Integration PR')
    def clickable_integration_pr_url(self, instance):
        if instance.pr_url != '':
            return url_helper(instance.pr_url, 'Link')
        return 'NA'

    @admin.display(description='Staged GH Run')
    def clickable_staged_gh_run_url(self, instance):
        if instance.staged_github_run_id != '':
            org = conf.settings.INTEGRATION_REPO['owner']
            repo = conf.settings.INTEGRATION_REPO['repo']
            gh_run_id = instance.staged_github_run_id
            url = f'https://github.com/{org}/{repo}/actions/runs/{gh_run_id}'
            return url_helper(url, 'Link')
        return 'NA'

    @admin.display(description='Passed GH Run')
    def clickable_passed_gh_run_url(self, instance):
        if instance.passed_github_run_id != '':
            org = conf.settings.INTEGRATION_REPO['owner']
            repo = conf.settings.INTEGRATION_REPO['repo']
            gh_run_id = instance.passed_github_run_id
            url = f'https://github.com/{org}/{repo}/actions/runs/{gh_run_id}'
            return url_helper(url, 'Link')
        return 'NA'


admin.site.register(Package, PackageAdmin)
admin.site.register(PackageBuild, PackageBuildAdmin)
admin.site.register(Distro, DistroAdmin)
admin.site.register(Epoch, EpochAdmin)
admin.site.register(DistroBuild, DistroBuildAdmin)
