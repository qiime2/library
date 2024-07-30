// This script executed via github actions
import utf8 from "utf8";
import fs from "node:fs";
import github from "@actions/github";
import yaml from "js-yaml";

const root_path = "/home/runner/work/library-svelte/library-svelte/static/json";
const repos = yaml.load(
  fs.readFileSync(
    "/home/runner/work/library-svelte/library-svelte/static/repos.yaml",
  ),
);
const overview = {
  "Repo": Object
};
const octokit = github.getOctokit(process.argv[2]);

let global_distros = new Set();
let global_epochs = new Set();

// Make sure we start from a clean slate
if (fs.existsSync(root_path)) {
  fs.rmSync(root_path, { recursive: true, force: true });
}
fs.mkdirSync(root_path);

for (const repo of repos["repos"]) {
  const owner = repo["owner"];
  const repo_name = repo["name"];
  const branch = repo["branch"];

  let repo_info = {};
  let repo_overview = {
    "Repo Owner": owner,
    "Repo Name": repo_name,
    Branch: branch,
  };

  // Get the latest commit
  const commits = await octokit.request(
    `GET /repos/${owner}/${repo_name}/commits`,
    {
      owner: owner,
      repo: repo_name,
      ref: branch,
      per_page: 1,
      headers: {
        "X-Github-Api-Version": "2022-11-28",
      },
    },
  );

  const sha = commits["data"][0]["sha"];
  const runs = await octokit.request(
    `GET /repos/${owner}/${repo_name}/commits/${sha}/check-runs`,
    {
      owner: owner,
      repo: repo_name,
      ref: `${sha}`,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );
  repo_info["Commit Runs"] = runs;

  repo_overview["Commit Status"] = "passed";
  for (const run of runs["data"]["check_runs"]) {
    if (run["status"] !== "completed") {
      repo_overview["Commit Status"] = "in progress";
      break;
    }

    if (run["conclusion"] === "failure") {
      repo_overview["Commit Status"] = "failed";
      break;
    }
  }

  // Get the date, can be done via author or committer
  const commit_date = commits["data"][0]["commit"]["committer"]["date"];
  repo_overview["Commit Date"] = commit_date;

  // Get general repo data
  const repo_data = await octokit.request(`GET /repos/${owner}/${repo_name}`, {
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

  // Get the short description
  const short_description = await octokit.request(
    `GET /repos/${owner}/${repo_name}/contents/.qiime2/short-description.txt`,
    {
      owner: owner,
      repo: repo_name,
      ref: branch,
      path: ".qiime2/short-description.txt",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  const short_description_contents = utf8.decode(
    atob(short_description["data"]["content"]),
  );
  repo_overview["Short Description"] = short_description_contents;

  // Get the info
  const info = await octokit.request(
    `GET /repos/${owner}/${repo_name}/contents/.qiime2/info.md`,
    {
      owner: owner,
      repo: repo_name,
      ref: branch,
      path: ".qiime2/info.md",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  // Convert it back to a normal string
  const info_contents = utf8.decode(atob(info["data"]["content"]));
  repo_info["Info"] = info_contents;

  const envs = await octokit.request(
    `GET /repos/${owner}/${repo_name}/contents/${repo_name.replace("-", "_")}/environments/`,
    {
      owner: owner,
      repo: repo_name,
      ref: branch,
      path: `/${repo_name.replace("-", "_")}/environments/`,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  const distros = new Set();
  const epochs = new Set();

  for (const env of envs["data"]) {
    // Strip the extension off the end of the name
    const name = env["name"].substring(0, env["name"].indexOf(".yml"));
    const split = name.split("-");

    distros.add(split[1]);
    epochs.add(split[2]);

    global_distros.add(split[1]);
    global_epochs.add(split[2]);
  }

  repo_overview["Distros"] = Array.from(distros);
  repo_overview["Epochs"] = Array.from(epochs);

  repo_info = { ...repo_info, ...repo_overview };

  if (!fs.existsSync(`${root_path}/${owner}`)) {
    fs.mkdirSync(`${root_path}/${owner}`);
  }
  fs.writeFileSync(
    `${root_path}/${owner}/${repo_name}.json`,
    JSON.stringify(repo_info),
  );

  overview['Repos'][repo_name] = repo_overview;
}

overview["Date Fetched"] = new Date();

global_distros = Array.from(global_distros);
global_epochs = Array.from(global_epochs);

global_distros.sort();
global_epochs.sort(sortEpochs);

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
  } else {
    return 1;
  }
}

overview["Distros"] = global_distros;
overview["Epochs"] = global_epochs;

fs.writeFileSync(`${root_path}/overview.json`, JSON.stringify(overview));
