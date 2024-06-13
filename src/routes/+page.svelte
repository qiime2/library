<script lang="ts">
    import utf8 from "utf8";
    import { Octokit, App } from "octokit";

    // Probably want to create an authentication token and secret it in here
    // somehow
    const octokit = new Octokit();
    getStuff();

    async function getStuff() {
        // Get the latest commit
        const commits = await octokit.request('GET /repos/qiime2/qiime2/commits', {
            owner: 'qiime2',
            repo: 'qiime2',
            per_page: 1,
            headers: {
                'X-Github-Api-Version': '2022-11-28'
            }
        });

        // Get the date, can be done via author or committer
        const commit_date = commits['data'][0]['commit']['committer']['date']
        console.log(commit_date)

        // Get general repo data
        const repo_data = await octokit.request('GET /repos/qiime2/qiime2', {
            owner: 'qiime2',
            repo: 'qiime2',
            headers: {
                'X-Github-Api-Version': '2022-11-28'
            }
        });

        // Pull stars off that
        const stars = repo_data['data']['stargazers_count'];
        console.log(stars);

        // Get the readme
        const readme = await octokit.request('GET /repos/qiime2/qiime2/readme', {
            owner: 'qiime2',
            repo: 'qiime2',
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        // Convert it back to a normal string
        const contents = utf8.decode(atob(readme['data']['content']));
        console.log(contents);

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
            const runs = await octokit.request('GET /repos/qiime2/qiime2/actions/runs', {
                owner: 'qiime2',
                repo: 'qiime2',
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

        console.log(time);
    }
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
