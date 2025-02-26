import fs from "node:fs";
import { argv } from "node:process";

import { createOAuthDeviceAuth } from "@octokit/auth-oauth-device";
import { createActionAuth } from "@octokit/auth-action";
import { Octokit } from "octokit";

import {
  getLibraryPlugins,
  getLatestCommit,
  getRunsStatusOfCommit,
  getHighLevelRepoOverview,
  getReadme,
  getGithubReleases,
  getEnvironmentFiles,
  sortReleases,
} from "./helpers.js";

const DEFAULT_LIBRARY_REPO = "https://github.com/qiime2/library-plugins.git";
// Paths we are writing to
const ROOT_PATH = "./static/json";
const NEW_ROOT_PATH = "./static/new";

async function get_octokit() {
  let authenticationStrategy: any;
  let strategyOptions: any;
  let authOptions: any;

  if (process.env.GITHUB_ACTION) {
    authenticationStrategy = createActionAuth;
    strategyOptions = {};
    authOptions = {};
  } else {
    authenticationStrategy = createOAuthDeviceAuth;
    strategyOptions = {
      clientType: "oauth-app",
      clientId: "Ov23liI4jm74lL6qxSsN",
      scopes: ["public_repo"],
      onVerification(verification) {
        console.log("========[ GitHub Device Flow ]========");
        console.log(" Open %s", verification.verification_uri);
        console.log(" Enter code: %s", verification.user_code);
        console.log("======================================");
      },
    };
    authOptions = { type: "oauth" };
  }

  const octokit = new Octokit({
    authStrategy: authenticationStrategy,
    auth: strategyOptions,
  });
  await octokit.auth(authOptions);
  return octokit;
}

async function main(library: string) {
  let octokit = await get_octokit();
  let plugins = await getLibraryPlugins(library);
  let json_overview = {
    Repos: {},
  };

  // A set containing all QIIME 2 releases represented by all plugins on the library
  let global_releases = new Set();

  // Make sure we start from a clean slate
  if (fs.existsSync(NEW_ROOT_PATH)) {
    fs.rmSync(NEW_ROOT_PATH, { recursive: true, force: true });
  }
  fs.mkdirSync(NEW_ROOT_PATH);

  for (const plugin of plugins) {
    const owner = plugin["owner"];
    const repo_name = plugin["name"];
    const branch = plugin["branch"];

    let repo_info = {};

    let repo_overview = {
      "Plugin Owner": owner,
      "Plugin Name": repo_name,
      Branch: branch,
      "User Docs": plugin["docs"],
    };

    // Get the latest commit
    const commit = await getLatestCommit(octokit, owner, repo_name, branch);
    const sha = commit["data"][0]["sha"];

    // Get the status of the latest commit
    repo_overview["Build Status"] = await getRunsStatusOfCommit(
      octokit,
      owner,
      repo_name,
      sha,
    );

    // Get the date of the latest commit, can be done via author or committer
    const commit_date = commit["data"][0]["commit"]["committer"]["date"];
    repo_overview["Commit Date"] = commit_date;

    // Get general repo data
    const repo_data = await getHighLevelRepoOverview(
      octokit,
      owner,
      repo_name,
      branch,
    );
    repo_overview["Stars"] = repo_data["data"]["stargazers_count"];
    repo_overview["Description"] = repo_data["data"]["description"];

    // Get repo README
    repo_info["Readme"] = await getReadme(octokit, owner, repo_name, branch);

    repo_info["Github Releases"] = await getGithubReleases(
      octokit,
      owner,
      repo_name,
    );

    // Get the releases this plugin is compatible with
    repo_overview["Releases"] = await getEnvironmentFiles(
      octokit,
      owner,
      repo_name,
      branch,
    );
    global_releases = new Set([
      ...global_releases,
      ...repo_overview["Releases"],
    ]);

    repo_info = { ...repo_info, ...repo_overview };

    if (!fs.existsSync(`${NEW_ROOT_PATH}/${owner}`)) {
      fs.mkdirSync(`${NEW_ROOT_PATH}/${owner}`);
    }
    fs.writeFileSync(
      `${NEW_ROOT_PATH}/${owner}/${repo_name}.json`,
      JSON.stringify(repo_info, null, 2),
    );

    json_overview["Repos"][repo_name] = repo_overview;
  }

  let releases = Array.from(global_releases);
  releases.sort(sortReleases);
  json_overview["Releases"] = releases;
  json_overview["Date Fetched"] = new Date();

  fs.writeFileSync(
    `${NEW_ROOT_PATH}/overview.json`,
    JSON.stringify(json_overview, null, 2),
  );

  // Remove this at the last minute
  if (fs.existsSync(ROOT_PATH)) {
    fs.rmSync(ROOT_PATH, { recursive: true, force: true });
  }
  fs.renameSync(NEW_ROOT_PATH, ROOT_PATH);
}

if (process.argv[1] === import.meta.filename) {
  let library = argv[argv.length - 1];
  if (process.argv.length <= 2) {
    library = DEFAULT_LIBRARY_REPO;
  }
  console.log(process.argv);

  await main(library);
}
