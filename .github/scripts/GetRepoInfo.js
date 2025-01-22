// This script executed via github actions
import fs from "node:fs";
import yaml from "js-yaml";
import github from "@actions/github";

import { Octokit } from "octokit";
import { getLatestCommit, getRunsStatusOfCommit, getReadme, getEnvironmentFiles, sortReleases } from "./util";

const ROOT_PATH = "/home/runner/work/library/library/static/json";
const NEW_ROOT_PATH = "/home/runner/work/library/library/static/new";
const OCTOKIT = github.getOctokit(process.argv[2]);

const LIBRARY_PLUGINS_OWNER = "qiime2";
const LIBRARY_PLUGINS_REPO = "library-plugins";
const LIBRARY_PLUGINS_BRANCH = "main";

const ENV_FILE_REGEX = new RegExp(
  `.*-qiime2-.*-20[0-9][0-9]\.([1-9]|1[0-2])\.yml`,
);

const repo_list = await OCTOKIT.request(
  `GET /repos/${LIBRARY_PLUGINS_OWNER}/${LIBRARY_PLUGINS_REPO}/contents/plugins/`,
  {
    owner: LIBRARY_PLUGINS_OWNER,
    repo: LIBRARY_PLUGINS_REPO,
    path: "/plugins/",
    ref: LIBRARY_PLUGINS_BRANCH,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  },
);

const repos = [];

for (const repo of repo_list["data"]) {
  const repo_file_name = repo["name"];

  const repo_file = await OCTOKIT.request(
    `GET /repos/${LIBRARY_PLUGINS_OWNER}/${LIBRARY_PLUGINS_REPO}/contents/plugins/${repo_file_name}`,
    {
      owner: LIBRARY_PLUGINS_OWNER,
      repo: LIBRARY_PLUGINS_REPO,
      path: `/plugins/${repo_file_name}`,
      ref: LIBRARY_PLUGINS_BRANCH,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  const repo_string = utf8.decode(atob(repo_file["data"]["content"]));
  repos.push(yaml.load(repo_string));
}

const overview = {
  Repos: {},
};

let global_releases = new Set();

// Make sure we start from a clean slate
if (fs.existsSync(NEW_ROOT_PATH)) {
  fs.rmSync(NEW_ROOT_PATH, { recursive: true, force: true });
}
fs.mkdirSync(NEW_ROOT_PATH);

for (const repo of repos) {
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
  const commit = await getLatestCommit(OCTOKIT, owner, repo_name, branch);
  const sha = commit["data"][0]["sha"];

  // Get the status of the latest commit
  repo_overview["Build Status"] = await getRunsStatusOfCommit(OCTOKIT, owner, repo_name, sha);

  // Get the date of the latest commit, can be done via author or committer
  const commit_date = commit["data"][0]["commit"]["committer"]["date"];
  repo_overview["Commit Date"] = commit_date;

  // Get general repo data
  const repo_data = await OCTOKIT.request(`GET /repos/${owner}/${repo_name}`, {
    owner: owner,
    repo: repo_name,
    ref: branch,
    headers: {
      "X-Github-Api-Version": "2022-11-28",
    },
  });

  // Pull stars off that
  const stars = repo_data["data"]["stargazers_count"];
  repo_overview["Stars"] = stars;

  // Pull repo description
  repo_overview["Description"] = repo_data["data"]["description"];

  // Get repo README
  repo_info["Readme"] = await getReadme(Octokit, owner, repo_name, branch);

  // Get the releases this plugin is compatible with
  repo_overview["Releases"] = getEnvironmentFiles(OCTOKIT, ENV_FILE_REGEX, owner, repo_name, branch);
  global_releases = new Set([...global_releases, ...repo_overview["Releases"]]);

  repo_info = { ...repo_info, ...repo_overview };

  if (!fs.existsSync(`${NEW_ROOT_PATH}/${owner}`)) {
    fs.mkdirSync(`${NEW_ROOT_PATH}/${owner}`);
  }
  fs.writeFileSync(
    `${NEW_ROOT_PATH}/${owner}/${repo_name}.json`,
    JSON.stringify(repo_info),
  );

  overview["Repos"][repo_name] = repo_overview;
}

overview["Date Fetched"] = new Date();

global_releases = Array.from(global_releases);
global_releases.sort(sortReleases);

overview["Releases"] = global_releases;

fs.writeFileSync(`${NEW_ROOT_PATH}/overview.json`, JSON.stringify(overview));

// Remove this at the last minute
if (fs.existsSync(ROOT_PATH)) {
  fs.rmSync(ROOT_PATH, { recursive: true, force: true });
}
fs.renameSync(NEW_ROOT_PATH, ROOT_PATH)
