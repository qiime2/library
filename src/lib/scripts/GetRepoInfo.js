// This script executed via github actions
import utf8 from 'utf8';
import fs from 'node:fs';
import github from '@actions/github';

const root_path = '/home/runner/work/library-svelte/library-svelte/static/json';
const repos = [['qiime2', 'qiime2'], ['qiime2', 'q2cli'], ['qiime2', 'q2-types']];
const overview = {};
const octokit = github.getOctokit(process.argv[2]);

// Make sure we start from a clean slate
if (fs.existsSync(root_path)) {
    fs.rmdirSync(root_path, { recursive: true, force: true });
}
fs.mkdirSync(root_path);

for (const repo of repos) {
    const repo_info = {};
    const repo_overview = {}
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

    overview['runs_status'] = 'passed'
    for (const run of runs['data']) {
        if (run['status'] !== 'completed') {
            overview['runs_status'] = 'in progress'
            break;
        }

        if (run['conclusion'] === 'failure') {
            overview['runs_status'] = 'failed';
            break;
        }
    }


    // Get the date, can be done via author or committer
    const commit_date = commits['data'][0]['commit']['committer']['date']
    repo_info['commit_date'] = commit_date;
    repo_overview['commit_date'] = commit_date;

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
    repo_overview['stars'] = stars;

    // Get the readme
    const readme = await octokit.request(`GET /repos/${owner}/${repo_name}/readme`, {
        owner: owner,
        repo: repo_name,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    // Convert it back to a normal string
    const contents = utf8.decode(atob(readme['data']['content']));
    repo_info['readme'] = contents

    if (!fs.existsSync(`${root_path}/${owner}`)) {
        fs.mkdirSync(`${root_path}/${owner}`);
    }
    fs.writeFileSync(`${root_path}/${owner}/${repo_name}.json`, JSON.stringify(repo_info));

    if (!(owner in overview)) {
        overview[owner] = {};
    }

    overview[owner][repo_name] = repo_overview;
    overview['date_fetched'] = new Date();
}

fs.writeFileSync(`${root_path}/overview.json`, JSON.stringify(overview));
