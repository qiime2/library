<script lang="ts">
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
        const contents = atob(readme['data']['content']);
        console.log(contents);
    }
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
