import fs from "node:fs";

import {
  getLatestCommit,
  getRunsStatusOfCommit,
  getHighLevelRepoOverview,
  getReadme,
  getGithubReleases,
  getEnvironmentFiles,
  sortReleases,
  getLibraryCatalog,
  get_octokit,
  cleanup,
  loadYamlDir,
} from "./helpers.js";
import type { Octokit } from "octokit";
import { join } from "node:path";

// Paths we are writing to
const ROOT_PATH = "./static/json";

export async function main(catalog: string, octokit: Octokit) {
  let plugins = await loadYamlDir(join(catalog, "plugins"));
  let json_overview: any = {
    plugins: [],
  };

  // A set containing all QIIME 2 releases represented by all plugins on the library
  let global_releases = new Set();

  for (const plugin of plugins) {
    const owner = plugin["owner"];
    const repo_name = plugin["name"];
    const branch = plugin["branch"];

    let repo_info: Record<string, any> = {};

    // Get the latest commit
    const commit = await getLatestCommit(octokit, owner, repo_name, branch);
    const sha = commit["data"][0]["sha"];

    // Get the status of the latest commit
    const last_commit_status = await getRunsStatusOfCommit(
      octokit,
      owner,
      repo_name,
      sha,
    );

    // Get the date of the latest commit, can be done via author or committer
    const commit_date = commit["data"][0]["commit"]["committer"]["date"];

    plugin.last_commit = {
      sha,
      status: last_commit_status,
      date: commit_date,
    };

    // Get general repo data
    const repo_data = await getHighLevelRepoOverview(
      octokit,
      owner,
      repo_name,
      branch,
    );
    plugin.stars = repo_data["data"]["stargazers_count"];
    plugin.description = repo_data["data"]["description"];

    // Get repo README
    repo_info.readme = await getReadme(octokit, owner, repo_name, branch);

    repo_info.releases = await getGithubReleases(octokit, owner, repo_name);

    // Get the releases this plugin is compatible with
    plugin.distros = await getEnvironmentFiles(
      octokit,
      owner,
      repo_name,
      branch,
    );
    global_releases = new Set([...global_releases, ...plugin.distros]);

    repo_info = { ...repo_info, ...plugin };

    if (!fs.existsSync(`${ROOT_PATH}/${owner}`)) {
      fs.mkdirSync(`${ROOT_PATH}/${owner}`);
    }
    fs.writeFileSync(
      `${ROOT_PATH}/${owner}/${repo_name}.json`,
      JSON.stringify(repo_info, null, 2),
    );

    json_overview.plugins.push(plugin);
  }

  json_overview.plugins.sort(
    (a, b) =>
      new Date(b.last_commit.date).getTime() -
      new Date(a.last_commit.date).getTime(),
  );

  let releases = Array.from(global_releases);
  releases.sort(sortReleases);
  json_overview.distros = releases;
  json_overview.last_updated = new Date();

  fs.writeFileSync(
    `${ROOT_PATH}/plugins.json`,
    JSON.stringify(json_overview, null, 2),
  );
}

if (process.argv[1] === import.meta.filename) {
  let octokit = await get_octokit();
  let catalog = await getLibraryCatalog();
  try {
    await main(catalog, octokit);
  } finally {
    cleanup(catalog);
  }
}
