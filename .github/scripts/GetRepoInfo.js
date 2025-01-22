// This script executed via github actions
import utf8 from "utf8";
import fs from "node:fs";
import github from "@actions/github";
import yaml from "js-yaml";

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
  const commits = await OCTOKIT.request(
    `GET /repos/${owner}/${repo_name}/commits`,
    {
      owner: owner,
      repo: repo_name,
      sha: branch,
      per_page: 1,
      headers: {
        "X-Github-Api-Version": "2022-11-28",
      },
    },
  );

  const sha = commits["data"][0]["sha"];
  const runs = await OCTOKIT.request(
    `GET /repos/${owner}/${repo_name}/commits/${sha}/check-runs`,
    {
      owner: owner,
      repo: repo_name,
      head_sha: `${sha}`,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );
  repo_info["Commit Runs"] = runs;

  repo_overview["Build Status"] = "passed";
  for (const run of runs["data"]["check_runs"]) {
    if (run["status"] !== "completed") {
      repo_overview["Build Status"] = "in progress";
      break;
    }

    if (run["conclusion"] === "failure") {
      repo_overview["Build Status"] = "failed";
      break;
    }
  }

  // Get the date, can be done via author or committer
  const commit_date = commits["data"][0]["commit"]["committer"]["date"];
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

  // Get the README
  const readme = await OCTOKIT.request(
    `GET /repos/${owner}/${repo_name}/readme`,
    {
      owner: owner,
      repo: repo_name,
      ref: branch,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  // Convert the README to a normal string
  const readme_contents = utf8.decode(atob(readme["data"]["content"]));
  repo_info["Readme"] = readme_contents;

  const envs = await OCTOKIT.request(
    `GET /repos/${owner}/${repo_name}/contents/environment-files/`,
    {
      owner: owner,
      repo: repo_name,
      ref: branch,
      path: `/environment-files/`,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  repo_overview["Releases"] = [];

  for (const env of envs["data"]) {
    if (ENV_FILE_REGEX.test(env["name"])) {
      // Strip the extension off the end of the name
      const name = env["name"].substring(0, env["name"].indexOf(".yml"));
      const split = name.split("-");

      const distro = split[split.length - 2];
      const epoch = split[split.length - 1];
      const release = `${distro}-${epoch}`;

      repo_overview["Releases"].push(release);
      global_releases.add(release);
    }
  }

  repo_overview["Releases"].sort(sortReleases);

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

function sortReleases(a, b) {
  const A = a.split("-");
  const B = b.split("-");

  const distroA = A[0];
  const epochA = A[1];

  const distroB = B[0];
  const epochB = B[1];

  const byEpoch = sortEpochs(epochA, epochB);

  if (byEpoch === 0) {
    if (distroA > distroB) {
      return 1;
    } else if (distroA < distroB) {
      return -1;
    }
  }

  return byEpoch;
}

function sortEpochs(a, b) {
  const A = a.split(".");
  const B = b.split(".");

  const yearA = parseInt(A[0]);
  const monthA = parseInt(A[1]);

  const yearB = parseInt(B[0]);
  const monthB = parseInt(B[1]);

  if (yearA > yearB) {
    return -1;
  } else if (yearA < yearB) {
    return 1;
  }

  if (monthA > monthB) {
    return -1;
  } else if (monthA < monthB) {
    return 1;
  }

  return 0;
}

overview["Releases"] = global_releases;

fs.writeFileSync(`${NEW_ROOT_PATH}/overview.json`, JSON.stringify(overview));
fs.renameSync(NEW_ROOT_PATH, ROOT_PATH)
