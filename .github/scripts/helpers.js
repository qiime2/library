import utf8 from "utf8";
import yaml from "js-yaml";
import github from "@actions/github";

// Access the GitHub API
const OCTOKIT = github.getOctokit(process.argv[2]);

// Where we are looking for plugin list
const LIBRARY_PLUGINS_OWNER = "qiime2";
const LIBRARY_PLUGINS_REPO = "library-plugins";
const LIBRARY_PLUGINS_BRANCH = "add-q2-micom";

// Env files are ignored if they do not match this regex
const ENV_FILE_REGEX = new RegExp(
  `.*-qiime2-.*-20[0-9][0-9]\.([1-9]|1[0-2])\.yml`,
);

// Get the plugins that are in the library
export async function getLibraryPlugins() {
  // Will hold the loaded yaml contents of the
  const plugins = [];

  const plugin_list = await OCTOKIT.request(
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

  for (const plugin of plugin_list["data"]) {
    const plugin_file_name = plugin["name"];

    const plugin_file = await OCTOKIT.request(
      `GET /repos/${LIBRARY_PLUGINS_OWNER}/${LIBRARY_PLUGINS_REPO}/contents/plugins/${plugin_file_name}`,
      {
        owner: LIBRARY_PLUGINS_OWNER,
        repo: LIBRARY_PLUGINS_REPO,
        path: `/plugins/${plugin_file_name}`,
        ref: LIBRARY_PLUGINS_BRANCH,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    const plugin_string = utf8.decode(atob(plugin_file["data"]["content"]));
    plugins.push(yaml.load(plugin_string));
  }

  return plugins;
}

// Gg\et the latest commit of the specified branch of the specified repo
export async function getLatestCommit(owner, repo_name, branch) {
  const commit = await OCTOKIT.request(
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
export async function getRunsStatusOfCommit(owner, repo_name, sha) {
  let build_status = "passed";

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
export async function getHighLevelRepoOverview(owner, repo_name, branch) {
  return await OCTOKIT.request(`GET /repos/${owner}/${repo_name}`, {
    owner: owner,
    repo: repo_name,
    ref: branch,
    headers: {
      "X-Github-Api-Version": "2022-11-28",
    },
  });
}

// Get the README then convert it to a utf string
export async function getReadme(owner, repo_name, branch) {
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

  // Convert the README to a normal utf8 string
  return utf8.decode(atob(readme["data"]["content"]));
}

// Get all environment files from the given repo and return them sorted by
// epoch most to least recent then by distro alphabetically
export async function getEnvironmentFiles(owner, repo_name, branch) {
  let releases = [];

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
