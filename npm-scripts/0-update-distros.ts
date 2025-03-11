import { join } from "path";
import fs from "node:fs";
import {
  cleanup,
  get_octokit,
  getDistributionsData,
  getGithubReleases,
  getHighLevelRepoOverview,
  getLatestCommit,
  getLibraryCatalog,
  getReadme,
  getRunsStatusOfCommit,
  loadYamlPath,
  parseMystMarkdown,
  sortReleases,
} from "./helpers";

const ROOT_PATH = "./static/json";

export async function main(catalog, octokit) {
  let {
    index,
    ignore,
  }: {
    index: { name: string; source: string; docs?: string }[];
    ignore: string[];
  } = await loadYamlPath(join(catalog, "distros", "index.yml"));
  let plugins = await getDistributionsData(index);
  plugins = plugins.filter(({ name }) => !ignore.includes(name));

  let distro_overview: Record<string, any> = { plugins: [] };
  let global_releases = new Set();

  for (const plugin of plugins) {
    const owner = plugin["owner"];
    const repo_name = plugin["name"];

    let repo_info: Record<string, any> = {};

    // Get general repo data
    const repo_data = await getHighLevelRepoOverview(
      octokit,
      owner,
      repo_name,
      "",
    );
    plugin.stars = repo_data["data"]["stargazers_count"];
    plugin.description = repo_data["data"]["description"];
    plugin.branch = repo_data["data"]["default_branch"];
    const branch = plugin.branch;

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

    // Get repo README
    repo_info.readme = await getReadme(octokit, owner, repo_name, branch);

    repo_info.releases = await getGithubReleases(octokit, owner, repo_name);

    global_releases = new Set([...global_releases, ...plugin.distros]);

    repo_info = { ...repo_info, ...plugin };

    if (!fs.existsSync(`${ROOT_PATH}/${owner}`)) {
      fs.mkdirSync(`${ROOT_PATH}/${owner}`);
    }
    fs.writeFileSync(
      `${ROOT_PATH}/${owner}/${repo_name}.json`,
      JSON.stringify(repo_info, null, 2),
    );

    distro_overview.plugins.push(plugin);
  }
  distro_overview.plugins.sort(
    (a, b) =>
      new Date(b.last_commit.date).getTime() -
      new Date(a.last_commit.date).getTime(),
  );

  let releases = Array.from(global_releases);
  releases.sort(sortReleases);
  distro_overview.distros = index;

  let install = fs.readFileSync(
    "./npm-scripts/install-distro.myst.md",
    "utf-8",
  );
  distro_overview.install = parseMystMarkdown(install);

  fs.writeFileSync(
    `${ROOT_PATH}/distros.json`,
    JSON.stringify(distro_overview, null, 2),
  );
}

if (process.argv[1] === import.meta.filename) {
  let octokit = await get_octokit();
  let catalog = await getLibraryCatalog();
  try {
    await main(catalog, octokit);
  } finally {
    await cleanup(catalog);
  }
}
