<script lang="ts">
    import SvelteMarkdown from "svelte-markdown";
    import utf8 from "utf8";
    import { Octokit, App } from "octokit";

    const repos = [['qiime2', 'qiime2'], ['qiime2', 'q2cli'], ['qiime2', 'q2-types']]

    // Probably want to create an authentication token and secret it in here
    // somehow
    const octokit = new Octokit();

    async function getRepoInfo(owner, repo) {
        console.log(owner)
        console.log(repo)
        const repo_info = {};

        // Get the latest commit
        const commits = await octokit.request(`GET /repos/${owner}/${repo}/commits`, {
            owner: owner,
            repo: repo,
            per_page: 1,
            headers: {
                'X-Github-Api-Version': '2022-11-28'
            }
        });

        // Get the date, can be done via author or committer
        const commit_date = commits['data'][0]['commit']['committer']['date']
        console.log(commit_date)
        repo_info['commit_date'] = commit_date;

        // Get general repo data
        const repo_data = await octokit.request(`GET /repos/${owner}/${repo}`, {
            owner: owner,
            repo: repo,
            headers: {
                'X-Github-Api-Version': '2022-11-28'
            }
        });

        // Pull stars off that
        const stars = repo_data['data']['stargazers_count'];
        console.log(stars);
        repo_info['stars'] = stars;

        // Get the readme
        const readme = await octokit.request(`GET /repos/${owner}/${repo}/readme`, {
            owner: owner,
            repo: repo,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        // Convert it back to a normal string
        const contents = utf8.decode(atob(readme['data']['content']));
        console.log(contents);
        repo_info['readme'] = contents

        const per_page = 30;
        let page = 0;
        let total_count = -1;
        let time = '';

        // Need to get the first page of runs
        // Check for a status completed conclusions success run of ci-dev
        //  If found then get the time
        //  If not found get the next page
        // Repeat until we have found the time or exhausted all runs
        do {
            const runs = await octokit.request(`GET /repos/${owner}/${repo}/actions/runs`, {
                owner: owner,
                repo: repo,
                per_page: `${per_page}`,
                page: `${page + 1}`,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            if (total_count == -1) {
                total_count = runs['data']['total_count'];
            }

            // Check for valid run
            for (const run of runs['data']['workflow_runs']) {
                if (run['name'] == 'ci-dev' && run['status'] === 'completed' && run['conclusion'] == 'success') {
                    time = run['updated_at'];
                    break;
                }
            }

            if (time !== '') {
                break;
            }

            page++;
        } while (per_page * page < total_count)
        repo_info['last_passed'] = time;

        console.log(time);
        return repo_info;
    }
</script>

<!-- Get a list of repos from somewhere and fetch this info about these repos
 then make the list of data sortable by last commit date, last ci pass date,
 and number of stars -->
{#each repos as repo }
    <div style="width: 50%;">
        {#await getRepoInfo(repo[0], repo[1])}
            ...getting repo info
        {:then repo_info}
            <SvelteMarkdown source={repo_info['readme']} />
            <p>
                {repo_info['commit_date']}
            </p>
            <p>
                {repo_info['stars']}
            </p>
            <p>
                {repo_info['last_passed']}
            </p>
        {/await}
    </div>
{/each}