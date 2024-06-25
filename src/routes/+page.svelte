<script lang="ts">
    import SvelteMarkdown from "svelte-markdown";

    async function getRepoInfos() {
        const response = await fetch('/json/overview.json');
        const json = await response.json();
        return json;
    }
</script>

<!-- Get a list of repos from somewhere and fetch this info about these repos
 then make the list of data sortable by last commit date, last ci pass date,
 and number of stars -->
<div id="container">
    {#await getRepoInfos()}
        ...getting repo infos
    {:then repo_infos}
        {repo_infos}
        <!-- {#each Object.keys(repo_infos) as owner}
            {#each Object.values(repo_infos[owner]) as repo_info}
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
            {/each}
        {/each} -->
    {/await}
</div>

<style lang="postcss">
    #container {
        width: 50%;
        margin: auto;
    }

    .card {
        border-style: solid;
        border-color: black;
        border: 2px;
    }
</style>
