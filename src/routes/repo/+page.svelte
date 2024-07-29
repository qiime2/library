<script lang='ts'>
    import '../../app.css';

    import SvelteMarkdown from 'svelte-markdown';

    async function getRepoInfo() {
        const url = new URL(window.location.href);
        const owner = url.searchParams.get('owner');
        const repo_name = url.searchParams.get('repo_name');

        const response = await fetch(`/json/${owner}/${repo_name}.json`);
        const repo_info = await response.json();

        return repo_info;
    }
</script>

<div id='container'>
    {#await getRepoInfo()}
        ...getting info
    {:then repo_info}
        <div id='info'>
            <h1 class='info-content'>
                {repo_info['Repo Owner']}/{repo_info['Repo Name']}
            </h1>
            <p class='info-content'>
                <span class='font-bold'>source: </span>
                <a href="https://github.com/{repo_info['Repo Owner']}/{repo_info['Repo Name']}/tree/{repo_info['Branch']}">
                    https://github.com/{repo_info['Repo Owner']}/{repo_info['Repo Name']}/tree/{repo_info['Branch']}
                </a>
            </p>
            <p class='info-content'>
                {repo_info['Short Description']}
            </p>
        </div>
        <!-- I prefer the width setting it to small makes the div, but now it's too small. For some reason just prose makes it too narrow -->
        <div class='prose-base'>
            <SvelteMarkdown source={repo_info['Info']} />
        </div>
    {/await}
</div>

<style lang='postcss'>
    #container {
        margin-top: 70px;
        @apply max-w-screen-2xl
        mx-auto
        grid
        grid-cols-2
        gap-4;
    }

    #info {
        @apply h-fit;
    }

    .info-content {
        @apply border
        border-solid
        border-gray-300
        p-4;
    }

    h1 {
        @apply text-2xl
        font-bold;
    }
</style>
