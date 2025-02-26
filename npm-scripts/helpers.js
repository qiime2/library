import utf8 from "utf8";
import yaml from "js-yaml";
import { mystParse } from "myst-parser";
import { visit } from "unist-util-visit";

import { join } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import child_process from "node:child_process";
import fs from "node:fs";

const exec = promisify(child_process.exec);
const mkdtemp = promisify(fs.mkdtemp);

// Env files are ignored if they do not match this regex
const ENV_FILE_REGEX = new RegExp(
  `.*-qiime2-.*-20[0-9][0-9]\.([1-9]|1[0-2])\.yml`,
);

// Get the plugins that are in the library
export async function getLibraryPlugins(library) {
  // Will hold the loaded yaml contents of the data
  const plugins = [];

  let workdir = await mkdtemp(join(tmpdir(), "q2-library-clone"));
  try {
    let { stdout, stderr } = await exec(
      `git clone --depth=1 -- '${library}' '${workdir}'`,
    );
    console.log(stdout);
    console.error(stderr);
    let basedir = join(workdir, "plugins");
    let entries = await promisify(fs.readdir)(basedir);
    for (const entry of entries) {
      let data = await promisify(fs.readFile)(join(basedir, entry));
      plugins.push(yaml.load(data));
    }
  } finally {
    await promisify(fs.rm)(workdir, { force: true, recursive: true });
  }
  return plugins;
}

// Get the latest commit of the specified branch of the specified repo
export async function getLatestCommit(octokit, owner, repo_name, branch) {
  const commit = await octokit.request(
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

  return commit;
}

// Get the action runs on specified commit and report status
//
// 1. passed if all passed
//
// 2. failed if any failed
//
// 3. in progress if any still running
export async function getRunsStatusOfCommit(octokit, owner, repo_name, sha) {
  let build_status = "passed";

  const runs = await octokit.request(
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

  for (const run of runs["data"]["check_runs"]) {
    if (run["status"] !== "completed") {
      build_status = "in progress";
      break;
    }

    if (run["conclusion"] === "failure") {
      build_status = "failed";
      break;
    }
  }

  return build_status;
}

// Get the highest level overview of the repo
export async function getHighLevelRepoOverview(
  octokit,
  owner,
  repo_name,
  branch,
) {
  return await octokit.request(`GET /repos/${owner}/${repo_name}`, {
    owner: owner,
    repo: repo_name,
    ref: branch,
    headers: {
      "X-Github-Api-Version": "2022-11-28",
    },
  });
}

// Get the README then convert it to a utf string
export async function getReadme(octokit, owner, repo_name, branch) {
  const readme = await octokit.request(
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

  // Convert the README to a normal utf8 string
  let ast = mystParse(utf8.decode(atob(readme["data"]["content"])));
  visit(ast, (node) => {
    // no reason to store all of this
    delete node["position"];
  });
  return ast;
}

const gh_shortcode =
  /(?<=^|\s)https:\/\/github.com\/\S+\/((?<=compare\/)\S+\.\.\.\S+|\d+)(?=$|\s)/;
function reviseReleaseMarkdown(ast, org, repo) {
  visit(ast, (node, idx, parent) => {
    // no reason to store all of this
    delete node["position"];
    if (node.type === "cite") {
      let github_user = node.label;
      Object.keys(node).forEach((key) => delete node[key]);
      node.type = "link";
      node.url = `https://github.com/${github_user}`;
      node.children = [{ type: "text", value: `@${github_user}` }];
    } else if (node.type == "text") {
      let match = gh_shortcode.exec(node.value);
      if (match) {
        const pre = { type: "text", value: node.value.slice(0, match.index) };
        const post = {
          type: "text",
          value: node.value.slice(match.index + match[0].length),
        };
        const link = {
          type: "link",
          url: match[0],
          children: [{ type: "text", value: `#${match[1]}` }],
          urlSource: match[0],
          data: {
            kind: "issue",
            org,
            repo,
            issue_number: match[1],
          },
          internal: false,
          protocol: "github",
        };
        parent.children.splice(idx, 1, pre, link, post);
      }
    }
  });
}

export async function getGithubReleases(octokit, owner, repo_name) {
  const releases = await octokit.request("GET /repos/{owner}/{repo}/releases", {
    owner: owner,
    repo: repo_name,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  let result = [];
  for (const release of releases.data) {
    let { tag_name, html_url, name, published_at, body } = release;
    let ast = mystParse(body);
    reviseReleaseMarkdown(ast, owner, repo_name);
    result.push({ tag_name, html_url, name, published_at, ast });
  }
  return result;
}

// Get all environment files from the given repo and return them sorted by
// epoch most to least recent then by distro alphabetically
export async function getEnvironmentFiles(octokit, owner, repo_name, branch) {
  let releases = [];

  const envs = await octokit.request(
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

  for (const env of envs["data"]) {
    if (ENV_FILE_REGEX.test(env["name"])) {
      // Strip the extension off the end of the name
      const name = env["name"].substring(0, env["name"].indexOf(".yml"));
      const split = name.split("-");

      // If the name matched the regex this ought to be the locations of this
      // information
      const distro = split[split.length - 2];
      const epoch = split[split.length - 1];
      const release = `${distro}-${epoch}`;

      releases.push(release);
    }
  }

  return releases.sort(sortReleases);
}

// Sort QIIME 2 releases newest to oldest by epoch first then distro
export function sortReleases(a, b) {
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

// Sort QIIME 2 epochs from newest to oldest
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
