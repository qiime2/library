<script lang="ts">
    import "../../app.css";

    import SvelteMarkdown from "svelte-markdown";

    async function getRepoInfo() {
        const url = new URL(window.location.href);
        const owner = url.searchParams.get("owner");
        const repo_name = url.searchParams.get("repo_name");

        const response = await fetch(`/json/${owner}/${repo_name}.json`);
        const repo_info = await response.json();

        return repo_info;
    }
</script>

<div id="container">
    {#await getRepoInfo()}
        ...getting info
    {:then repo_info}
        <div id="info">
            <p>
                {repo_info["Commit Date"]}
            </p>
            <p>
                {repo_info["Stars"]}
            </p>
            <p>
                {#each repo_info["Commit Runs"]["data"]["check_runs"] as run}
                    <p>{run["name"]}</p>
                    <p>{run["status"]}</p>
                    <p>{run["conclusion"]}</p>
                {/each}
            </p>
            <p>
                {JSON.stringify(repo_info["Envs"])}
            </p>
        </div>
        <div class="prose-lg">
            <SvelteMarkdown source={repo_info["Info"]} />
        </div>
    {/await}
</div>

<style lang="postcss">
    #container {
        margin-top: 70px;
        @apply max-w-screen-2xl
        mx-auto
        grid
        grid-cols-2
        gap-4;
    }

    #info {
        height: fit-content;
        @apply border
        border-solid
        border-gray-300
        p-4;
    }
</style>
