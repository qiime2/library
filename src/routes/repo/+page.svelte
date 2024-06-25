<script lang="ts">
    import SvelteMarkdown from "svelte-markdown";

    const url = new URL(window.location.href);
    console.log(url)
    const owner = url.searchParams.get('owner');
    const repo_name = url.searchParams.get('repo_name');

    async function getRepoInfo() {
        const response = await fetch(`/json/${owner}/${repo_name}.json`);
        const repo_info = await response.json();

        console.log(repo_info)
        return repo_info;
    }
</script>

<div id="container">
    {#await getRepoInfo()}
        ...getting info
    {:then repo_info}
        <SvelteMarkdown source={repo_info['readme']} />
        <p>
            {repo_info['commit_date']}
        </p>
        <p>
            {repo_info['stars']}
        </p>
        <p>
            {#each repo_info['runs']['data']['check_runs'] as run}
                <p>{run['name']}</p>
                <p>{run['status']}</p>
                <p>{run['conclusion']}</p>
            {/each}
        </p>
    {/await}
</div>