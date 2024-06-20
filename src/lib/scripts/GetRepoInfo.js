// This script executed via github actions
// import utf8 from 'utf8';
import fs from 'node:fs';
import core from '@actions/core';
import github from '@actions/github';

const repos = [['qiime2', 'qiime2'], ['qiime2', 'q2cli'], ['qiime2', 'q2-types']]

const repo_infos = {};

// const token = core.getInput('github-token');
const octokit = github.getOctokit(process.argv[1]);

for (const repo of repos) {
    const repo_info = {};
    const owner = repo[0];
    const repo_name = repo[1];

    // Get the latest commit
    const commits = await octokit.request(`GET /repos/${owner}/${repo_name}/commits`, {
        owner: owner,
        repo: repo_name,
        per_page: 1,
        headers: {
            'X-Github-Api-Version': '2022-11-28'
        }
    });

    const sha = commits['data'][0]['sha'];
    const runs = await octokit.request(`GET /repos/${owner}/${repo_name}/commits/${sha}/check-runs`, {
        owner: owner,
        repo: repo_name,
        ref: `${sha}`,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
    repo_info['runs'] = runs;

    // Get the date, can be done via author or committer
    const commit_date = commits['data'][0]['commit']['committer']['date']
    repo_info['commit_date'] = commit_date;

    // Get general repo data
    const repo_data = await octokit.request(`GET /repos/${owner}/${repo_name}`, {
        owner: owner,
        repo: repo_name,
        headers: {
            'X-Github-Api-Version': '2022-11-28'
        }
    });

    // Pull stars off that
    const stars = repo_data['data']['stargazers_count'];
    repo_info['stars'] = stars;

    // Get the readme
    const readme = await octokit.request(`GET /repos/${owner}/${repo_name}/readme`, {
        owner: owner,
        repo: repo_name,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    // Convert it back to a normal string
    // const contents = utf8.decode(atob(readme['data']['content']));
    const contents = atob(readme['data']['content']);
    repo_info['readme'] = contents

    if (!(owner in repo_infos)) {
        repo_infos[owner] = {};
    }

    repo_infos[owner][repo_name] = repo_info;
}

fs.writeFile('/static/info.json', JSON.stringify(repo_infos));
