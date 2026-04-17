import yaml from "js-yaml";
import { mystParse } from "myst-parser";
import { tabDirectives } from "myst-ext-tabs";
import {
  headingLabelTransform,
  htmlTransform,
  liftMystDirectivesAndRolesTransform,
} from "myst-transforms";

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
  `.*-(qiime2|rachis)-.*-20[0-9][0-9]\.([1-9]|1[0-2])(?:-release-.*)?\.yml`,
);
const SEED_ENVIRONMENT_REGEX =
  /^seed-environment-conda(?:-[a-z0-9-]+)?\.ya?ml$/i;
const SOLVED_ENVIRONMENT_REGEX = /^(qiime2|rachis)-.*-conda\.ya?ml$/i;

const DEFAULT_CATALOG_REPO = "https://github.com/qiime2/library-catalog.git";

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

function getDistroAliases(distro): string[] {
  if (Array.isArray(distro.alt)) {
    return distro.alt;
  }

  if (typeof distro.alt === "string") {
    return [distro.alt];
  }

  return [];
}

async function getReleasedSeedEnvironmentFiles(workdir, epoch, distro) {
  const released = join(workdir, epoch, distro, "released");
  let entries: string[];

  try {
    entries = await promisify(fs.readdir)(released);
  } catch {
    return [];
  }

  const seedEntries = entries.filter((entry) => SEED_ENVIRONMENT_REGEX.test(entry));
  const seen = new Set(seedEntries);
  const preferred = [
    "seed-environment-conda.yml",
    "seed-environment-conda-linux.yml",
    "seed-environment-conda-osx.yml",
  ];

  const ordered = [
    ...preferred.filter((name) => seen.has(name)),
    ...seedEntries
      .filter((name) => !preferred.includes(name))
      .sort((a, b) => a.localeCompare(b)),
  ];

  return ordered.map((entry) => join(epoch, distro, "released", entry));
}

function getSolvedEnvironmentKind(path: string) {
  if (/-((linux-64)|(ubuntu-latest))-conda\.ya?ml$/i.test(path)) {
    return "linux";
  }

  if (/-((osx-64)|(osx-arm64)|(macos-latest))-conda\.ya?ml$/i.test(path)) {
    return "osx";
  }

  return null;
}

async function getReleasedSolvedEnvironmentFiles(workdir, epoch, distro) {
  const released = join(workdir, epoch, distro, "released");
  let entries: string[];

  try {
    entries = await promisify(fs.readdir)(released);
  } catch {
    return [];
  }

  return entries
    .filter((entry) => SOLVED_ENVIRONMENT_REGEX.test(entry))
    .sort((a, b) => a.localeCompare(b))
    .map((entry) => join(epoch, distro, "released", entry));
}

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
    let releaseEnvironmentFiles: Record<string, Record<string, any>> = {};
    const distroAliases = new Map<string, string>();
    const distroNames: string[] = [];

    for (const distro of distros) {
      for (const name of [distro.name, ...getDistroAliases(distro)]) {
        distroNames.push(name);
        if (!distroAliases.has(name)) {
          distroAliases.set(name, distro.name);
        }
      }
    }
    const allDistros = [...new Set(distroNames)];

    for (const pkg of packages) {
      let [owner, name] = pkg.repo.split("/");
      let docs = null;
      const pkgDistros = new Set(pkg.distros);
      for (const distro of distros) {
        const names = [distro.name, ...getDistroAliases(distro)];
        const hasDistro = names.some((name) => pkgDistros.has(name));
        if (distro.docs && hasDistro) {
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

    const seenReleases = new Set();
    for (const epoch of epochs) {
      for (const distro of allDistros) {
        const canonicalDistro = distroAliases.get(distro) || distro;
        const solvedEnvPaths = await getReleasedSolvedEnvironmentFiles(
          workdir,
          epoch,
          distro,
        );
        if (solvedEnvPaths.length > 0) {
          if (!releaseEnvironmentFiles[canonicalDistro]) {
            releaseEnvironmentFiles[canonicalDistro] = {};
          }
          if (!releaseEnvironmentFiles[canonicalDistro][epoch]) {
            releaseEnvironmentFiles[canonicalDistro][epoch] = { source: distro };
          }
          for (const envPath of solvedEnvPaths) {
            const envKind = getSolvedEnvironmentKind(envPath);
            if (
              envKind &&
              !releaseEnvironmentFiles[canonicalDistro][epoch][envKind]
            ) {
              releaseEnvironmentFiles[canonicalDistro][epoch][envKind] = envPath;
            }
          }
        }

        let envPaths = await getReleasedSeedEnvironmentFiles(
          workdir,
          epoch,
          distro,
        );

        for (const envPath of envPaths) {
          let env;
          try {
            env = await loadYamlPath(join(workdir, envPath));
          } catch {
            continue;
          }

          for (const dep of env.dependencies || []) {
            if (typeof dep !== "string") {
              continue;
            }
            let name = dep.split("=")[0];
            if (Object.hasOwn(plugins, name)) {
              const key = JSON.stringify([name, epoch, canonicalDistro]);
              if (!seenReleases.has(key)) {
                seenReleases.add(key);
                plugins[name].distros.push([epoch, canonicalDistro, envPath]);
              }
            }
          }
        }
      }
    }

    return {
      plugins: Object.values(plugins).filter(({ distros }) => distros.length > 0),
      releaseEnvironmentFiles,
    };
  } finally {
    await promisify(fs.rm)(workdir, { force: true, recursive: true });
  }
}

export async function get_octokit() {
  let authenticationStrategy: any;
  let strategyOptions: any;
  let authOptions: any;

  if (process.env.GITHUB_TOKEN) {
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

export function parseMystMarkdown(string) {
  let ast = mystParse(string, { directives: [...tabDirectives] });
  visit(ast, (node) => {
    // no reason to store all of this
    delete node["position"];
  });
  htmlTransform(ast);
  headingLabelTransform(ast);
  liftMystDirectivesAndRolesTransform(ast);
  return ast;
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
  let ast = parseMystMarkdown(
    Buffer.from(readme["data"]["content"], "base64").toString("utf-8"),
  );

  if (ast.children && ast.children[0].type == "heading") {
    // Drop the redundant title
    ast.children = ast.children.slice(1);
  }
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
    let ast = parseMystMarkdown(body);
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
      let name = env["name"].substring(0, env["name"].indexOf(".yml"));
      if (name.includes('-release-')) {
        let x = name.split('-release-')
        name = x[0]
      }
      const split = name.split("-");

      // If the name matched the regex this ought to be the locations of this
      // information
      const distro = split[split.length - 2];
      const epoch = split[split.length - 1];

      releases.push([epoch, distro, join('environment-files', env["name"])]);
    }
  }

  return releases.sort(sortReleases);
}

// Sort QIIME 2 releases newest to oldest by epoch first then distro
export function sortReleases(a, b) {
  const epochA = a[0];
  const distroA = a[1];

  const epochB = b[0];
  const distroB = b[1];

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

export function uniqReleases(releases) {
  const seen = new Set();

  return releases.filter((release) => {
    const key = JSON.stringify(release);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
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
