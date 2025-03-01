// This script executed via github actions
import fs from "node:fs";

import {
  getLibraryPlugins,
  getLatestCommit,
  getRunsStatusOfCommit,
  getHighLevelRepoOverview,
  getReadme,
  getEnvironmentFiles,
  sortReleases,
} from "./helpers.js";

// Paths we are writing to
const ROOT_PATH = "/home/runner/work/library/library/static/json";
const NEW_ROOT_PATH = "/home/runner/work/library/library/static/new";

// Objects containing the loaded .yml files for each plugin indicated in library-plugins
const REPOS = await getLibraryPlugins();

// Info about all repos
const GLOBAL_INFO = {
  Repos: {},
};

// A set containing all QIIME 2 releases represented by all plugins on the library
let global_releases = new Set();

// Make sure we start from a clean slate
if (fs.existsSync(NEW_ROOT_PATH)) {
  fs.rmSync(NEW_ROOT_PATH, { recursive: true, force: true });
}
fs.mkdirSync(NEW_ROOT_PATH);

for (const repo of REPOS) {
  const owner = repo["owner"];
  const repo_name = repo["name"];
  const branch = repo["branch"];

  let repo_info = {};

  let repo_overview = {
    "Plugin Owner": owner,
    "Plugin Name": repo_name,
    Branch: branch,
    "User Docs": repo["docs"],
  };

  // Get the latest commit
  const commit = await getLatestCommit(owner, repo_name, branch);
  const sha = commit["data"][0]["sha"];

  // Get the status of the latest commit
  repo_overview["Build Status"] = await getRunsStatusOfCommit(
    owner,
    repo_name,
    sha,
  );

  // Get the date of the latest commit, can be done via author or committer
  const commit_date = commit["data"][0]["commit"]["committer"]["date"];
  repo_overview["Commit Date"] = commit_date;

  // Get general repo data
  const repo_data = await getHighLevelRepoOverview(owner, repo_name, branch);
  repo_overview["Stars"] = repo_data["data"]["stargazers_count"];
  repo_overview["Description"] = repo_data["data"]["description"];

  // Get repo README
  repo_info["Readme"] = await getReadme(owner, repo_name, branch);

  // Get the releases this plugin is compatible with
  repo_overview["Releases"] = await getEnvironmentFiles(
    owner,
    repo_name,
    branch,
  );
  global_releases = new Set([...global_releases, ...repo_overview["Releases"]]);

  repo_info = { ...repo_info, ...repo_overview };

  if (!fs.existsSync(`${NEW_ROOT_PATH}/${owner}`)) {
    fs.mkdirSync(`${NEW_ROOT_PATH}/${owner}`);
  }
  fs.writeFileSync(
    `${NEW_ROOT_PATH}/${owner}/${repo_name}.json`,
    JSON.stringify(repo_info),
  );

  GLOBAL_INFO["Repos"][repo_name] = repo_overview;
}

GLOBAL_INFO["Date Fetched"] = new Date();

global_releases = Array.from(global_releases);
global_releases.sort(sortReleases);

GLOBAL_INFO["Releases"] = global_releases;

fs.writeFileSync(`${NEW_ROOT_PATH}/overview.json`, JSON.stringify(GLOBAL_INFO));

// Remove this at the last minute
if (fs.existsSync(ROOT_PATH)) {
  fs.rmSync(ROOT_PATH, { recursive: true, force: true });
}
fs.renameSync(NEW_ROOT_PATH, ROOT_PATH);
