<script lang="ts">
    import "../../app.css";

    import { spaceSeperatedList } from "$lib/scripts/util";
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
            <h1 class="info-content">
                {repo_info["Repo Owner"]}/{repo_info["Repo Name"]}
            </h1>
            <p class="info-content">
                <span class="font-bold">Source: </span>
                <a href="https://github.com/{repo_info['Repo Owner']}/{repo_info['Repo Name']}/tree/{repo_info['Branch']}">
                    https://github.com/{repo_info["Repo Owner"]}/{repo_info["Repo Name"]}/tree/{repo_info["Branch"]}
                </a>
            </p>
            <p class="info-content">
                {repo_info["Short Description"]}
            </p>
            <div class="info-content">
                <span class="font-bold">Install in new env:</span><br>
                <span class="code">conda env create -n &lt;env-name&gt; -f &lt;path-to-env-file&gt;</span><br>
                <div class="mt-2">
                    <span class="font-bold">Install in exiting env:</span><br>
                    <p class="code w-fit">
                        conda activate &lt;env-name&gt;<br>conda update -f &lt;path-to-env-file&gt;
                    </p>
                </div>
            </div>
            <div class="info-content">
                <p>
                    <span class="font-bold">NOTE: </span>
                    Not all distributions are necessarily supported for all epochs.
                </p>
                <p class="my-2">
                    <span class="font-bold">Compatible Distributions: </span>
                    {spaceSeperatedList(repo_info["Distros"])}
                </p>
                <p>
                    <span class="font-bold">Compatible QIIME 2 Epochs: </span>
                    {spaceSeperatedList(repo_info["Epochs"])}
                </p>
            </div>
        </div>
        <!-- I prefer the width setting it to small makes the div, but now it's too small. For some reason just prose makes it too narrow -->
        <div class="prose-base">
            <SvelteMarkdown source={repo_info["Long Description"]} />
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
        @apply h-fit;
    }

    .info-content {
        @apply border
        border-solid
        border-gray-300
        p-4;
    }

    .code {
        @apply bg-gray-200
        px-2
        rounded
    }

    h1 {
        @apply text-2xl
        font-bold;
    }
</style>
