<script lang="ts">
    import SvelteMarkdown from "svelte-markdown";

    async function getRepoInfo() {
        const url = new URL(window.location.href);
        const owner = url.searchParams.get('owner');
        const repo_name = url.searchParams.get('repo_name');

        const response = await fetch(`/json/${owner}/${repo_name}.json`);
        const repo_info = await response.json();

        return repo_info;
    }
</script>

<div id="container">
    {#await getRepoInfo()}
        ...getting info
    {:then repo_info}
        <SvelteMarkdown source={repo_info['Readme']} />
        <p>
            {repo_info['Commit Date']}
        </p>
        <p>
            {repo_info['Stars']}
        </p>
        <p>
            {#each repo_info['Commit Status']['data']['check_runs'] as run}
                <p>{run['name']}</p>
                <p>{run['status']}</p>
                <p>{run['conclusion']}</p>
            {/each}
        </p>
    {/await}
</div>
