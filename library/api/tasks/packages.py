# ----------------------------------------------------------------------------
# Copyright (c) 2018-2021, QIIME 2 development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# ----------------------------------------------------------------------------

import pathlib
import shutil
import tempfile
from typing import Union
import urllib.error

from celery import shared_task
import conda_build.api
from django import conf

from .. import utils


@shared_task(name='packages.fetch_package_from_github',
             autoretry_for=[urllib.error.HTTPError, urllib.error.URLError, utils.GitHubNotReadyException],
             max_retries=12, retry_backoff=conf.settings.TASK_TIMES['03_MIN'],
             retry_backoff_max=conf.settings.TASK_TIMES['90_MIN'])
def fetch_package_from_github(ctx: Union['PackageBuildCtx', 'DistroBuildCtx'], cfg: 'BuildCfg'):  # noqa: F821
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_pathlib = pathlib.Path(tmpdir)

        mgr = utils.GitHubArtifactManager(cfg.github_token, cfg.repository, cfg.run_id, cfg.artifact_name, tmp_pathlib)
        tmp_filepaths = mgr.sync()

        for filepath in tmp_filepaths:
            utils.unzip(filepath)

        pkgs_fp = pathlib.Path(cfg.to_channel)
        utils.bootstrap_pkgs_dir(pkgs_fp)

        filematcher = '**/*%s*.tar.bz2' % (cfg.package_name,)
        for from_path in tmp_pathlib.glob(filematcher):
            to_path = pkgs_fp / from_path.parent.name / from_path.name
            shutil.copy(from_path, to_path)

    return ctx


@shared_task(name='packages.reindex_conda_channel')
def reindex_conda_channel(channel, channel_name):
    utils.bootstrap_pkgs_dir(channel)

    conda_config = conda_build.api.Config(verbose=False)
    conda_build.api.update_index(
        channel,
        config=conda_config,
        threads=1,
        channel_name=channel_name,
    )


@shared_task(name='packages.find_packages_to_copy')
def find_packages_to_copy(ctx: 'DistroBuildCtx', cfg: 'DistroBuildCfg'):  # noqa: F821
    if ctx.not_all_architectures_present:
        return ctx

    fns = []
    for pkg, ver in cfg.package_versions.items():
        base_dir = pathlib.Path(cfg.from_channel)
        fn_pair = [str(fn.relative_to(base_dir)) for fn in base_dir.glob('**/%s*%s*.tar.bz2' % (pkg, ver))]
        if len(fn_pair) != 2:  # 2 bc one osx, one linux
            raise Exception('Incorrect number of file matches: %r' % (fn_pair,))
        fns.extend(fn_pair)

    ctx.pkg_fns = fns

    return ctx


@shared_task(name='packages.copy_conda_packages')
def copy_conda_packages(ctx: 'DistroBuildCtx', cfg: 'DistroBuildCfg'):  # noqa: F821
    if ctx.not_all_architectures_present:
        return ctx

    from_path = pathlib.Path(cfg.from_channel)
    to_path = pathlib.Path(cfg.to_channel)

    for fn in ctx.pkg_fns:
        shutil.copy(from_path / fn,
                    to_path / fn)

    return ctx
