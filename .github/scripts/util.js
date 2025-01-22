import utf8 from "utf8";

// Use GitHub API to get the latest commit of the specified branch of the
// specified repo
export async function getLatestCommit(OCTOKIT, owner, repo_name, branch) {
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


// Use GitHub API to get the action runs on specified commit and report status
//
// 1. passed if all passed
//
// 2. failed if any failed
//
// 3. in progress if any still running
export async function getRunsStatusOfCommit(OCTOKIT, owner, repo_name, sha) {
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


// Use the GitHub API to pull the README then convert it to a utf string
export async function getReadme(OCTOKIT, owner, repo_name, branch) {
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


export async function getEnvironmentFiles(OCTOKIT, ENV_FILE_REGEX, owner, repo_name, branch) {
  let releases = []

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

      const distro = split[split.length - 2];
      const epoch = split[split.length - 1];
      const release = `${distro}-${epoch}`;

      releases.push(release);
    }
  }

  return releases.sort(sortReleases);
}


// Sort QIIME 2 releases newest to oldest by epoch first then distro
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
