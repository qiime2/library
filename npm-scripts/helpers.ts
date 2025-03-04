import yaml from "js-yaml";
import { mystParse } from "myst-parser";
import { visit } from "unist-util-visit";

import { createOAuthDeviceAuth } from "@octokit/auth-oauth-device";
import { createActionAuth } from "@octokit/auth-action";
import { Octokit } from "octokit";

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

const DEFAULT_CATALOG_REPO = "https://github.com/qiime2/library-plugins.git";

export async function cleanup(catalog) {
  await promisify(fs.rm)(catalog, { force: true, recursive: true });
}

export async function getLibraryCatalog() {
  let catalog = process.argv[process.argv.length - 1];
  if (process.argv.length <= 2) {
    catalog = DEFAULT_CATALOG_REPO;
  }

  let workdir = await mkdtemp(join(tmpdir(), "q2-library-clone"));
  try {
    let { stdout, stderr } = await exec(
      `git clone --depth=1 -- '${catalog}' '${workdir}'`,
    );
    console.log(stdout);
    console.error(stderr);
  } catch {
    await promisify(fs.rm)(workdir, { force: true, recursive: true });
  }

  return workdir;
}

let EPOCH = /^20\d\d\.\d\d?$/;
export async function getDistributionsData(distros) {
  let workdir = await mkdtemp(join(tmpdir(), "q2-distributions-clone"));
  try {
    let { stdout, stderr } = await exec(
      `git clone --depth=1 -- 'https://github.com/qiime2/distributions.git' '${workdir}'`,
    );
    console.log(stdout);
    console.error(stderr);
    const { packages } = await loadYamlPath(join(workdir, "data.yaml"));
    let plugins: Record<string, any> = {};

    for (const pkg of packages) {
      let [owner, name] = pkg.repo.split("/");
      let docs = null;
      for (const distro of distros) {
        if (distro.docs && pkg.distros.includes(distro.name)) {
          docs = distro.docs;
          break;
        }
      }
      plugins[pkg.name] = { owner, name, docs, in_distro: true, distros: [] };
    }

    let epochs = (await promisify(fs.readdir)(workdir)).filter((dir) =>
      EPOCH.exec(dir),
    );
    epochs.sort(sortEpochs);

    let distro_names: string[] = [];
    for (const distro of distros) {
      distro_names.push(distro.name);
      if (distro.alt) {
        distro_names.push(distro.alt);
      }
    }
    for (const epoch of epochs) {
      for (const distro of distro_names) {
        try {
          let env = await loadYamlPath(
            join(
              workdir,
              epoch,
              distro,
              "released",
              "seed-environment-conda.yml",
            ),
          );
          for (const dep of env.dependencies) {
            let name = dep.split("=")[0];
            if (Object.hasOwn(plugins, name)) {
              plugins[name].distros.push(`${distro}-${epoch}`);
            }
          }
        } catch {
          continue;
        }
      }
    }

    return Object.values(plugins).filter(({ distros }) => distros.length > 0);
  } finally {
    await promisify(fs.rm)(workdir, { force: true, recursive: true });
  }
}

export async function get_octokit() {
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

export async function loadYamlPath(path: string) {
  let data = await promisify(fs.readFile)(path);
  return yaml.load(data.toString("utf8")) as any;
}

export async function loadYamlDir(path: string) {
  let results: any[] = [];
  let entries = await promisify(fs.readdir)(path);
  for (const entry of entries) {
    results.push(await loadYamlPath(join(path, entry)));
  }
  return results;
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
      build_status = "pending";
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
  let ast = mystParse(
    Buffer.from(readme["data"]["content"], "base64").toString("utf-8"),
  );
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
  let result: any[] = [];
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
  let releases: any[] = [];

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
