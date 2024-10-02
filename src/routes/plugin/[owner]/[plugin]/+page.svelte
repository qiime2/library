<script lang="ts">
    import "../../../../app.css";

    import { createSelect, melt } from '@melt-ui/svelte';
    import { fade } from 'svelte/transition';
    import { spaceSeperatedList } from "$lib/scripts/util";
    import SvelteMarkdown from "svelte-markdown";

    export let data;

    let releases: Array<string> = [];

    let env_name: string = '<env-name>';
    let env_filepath: string = '<path-to-env-file>';

    const {
        elements: { trigger, menu, option, group, groupLabel, label },
        states: { selectedLabel, open },
        helpers: { isSelected },
    } = createSelect<string>({
        forceVisible: true,
        positioning: {
        placement: 'bottom',
        fitViewport: true,
        sameWidth: true,
        },
    });

    function updateInstallInstructions(release: string) {
      env_name = `qiime2-${release}`;
      env_filepath = `https://raw.githubusercontent.com/${data.repo_info['Plugin Owner']}/${data.repo_info['Plugin Name']}/refs/heads/${data.repo_info['Branch']}/.qiime2/library/environments/${data.repo_info['Plugin Name']}-qiime2-${release}.yml`
    }
</script>

<div id="container">
    <div id="info">
        <h1 class="info-content">
            {data.repo_info["Plugin Owner"]}/{data.repo_info["Plugin Name"]}
        </h1>
        <p class="info-content">
            <span class="font-bold">Source: </span>
            <a href="https://github.com/{data.repo_info['Plugin Owner']}/{data.repo_info['Plugin Name']}/tree/{data.repo_info['Branch']}">
                https://github.com/{data.repo_info["Plugin Owner"]}/{data.repo_info["Plugin Name"]}/tree/{data.repo_info["Branch"]}
            </a>
        </p>
        <p class="info-content">
            {data.repo_info["Short Description"]}
        </p>
        <div class="info-content">
            <p class="my-2">
                <span class="font-bold">Compatible Releases: </span>
                {spaceSeperatedList(data.repo_info["Releases"])}
            </p>
        </div>
        <div class="info-content">
            <h1 class="font-bold mb-4">
                Install Instructions
            </h1>
            <div class="flex flex-col gap-1">
                <!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
                <h2 class="block font-bold" use:melt={$label}>Desired Release</h2>
                <button
                    class="flex h-10 min-w-[220px] items-center justify-between rounded-lg bg-white px-3 py-2
                    shadow transition-opacity hover:opacity-90"
                    use:melt={$trigger}
                    aria-label="Releases"
                >
                    {$selectedLabel || 'Select a release'}
                    <svg fill="none"
                        width="10"
                        height="10">
                        <path
                            stroke-width="3"
                            stroke="rgb(119, 119, 119)"
                            d="M0 3L5 8a0,2 0 0 1 1,1M5 8L10 3"
                        />
                    </svg>
                </button>
                {#if $open}
                    <div
                    class=" z-10 flex max-h-[300px] flex-col
                    overflow-y-auto rounded-lg bg-white p-1
                    shadow focus:!ring-0"
                    use:melt={$menu}
                    transition:fade={{ duration: 150 }}
                    >
                        {#each data.repo_info["Releases"] as release}
                            <div
                            class="relative cursor-pointer rounded-lg py-1 pl-8 pr-4 text-neutral-800 focus:z-10
                            data-[highlighted]:bg-gray-300
                            data-[disabled]:opacity-50"
                            use:melt={$option({ value: release, label: release })}
                            on:click={() => updateInstallInstructions(release)}
                            >
                                <div class="check inline-block {$isSelected(release) ? 'opacity-100' : 'opacity-0'}">
                                    <svg fill="none"
                                        width="10"
                                        height="10">
                                        <path
                                            stroke-width="2"
                                            stroke="rgb(119, 119, 119)"
                                            d="M0 4L5 8M4 8L10 0"
                                        />
                                    </svg>
                                </div>
                                {release}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
            <h2 class="font-bold my-4">
                Install in new env:
            </h2>
            <p>
                <span class="font-bold">Note: </span>Name can be changed to whatever you choose
            </p>
            <code class="code">
                conda env create --name {env_name} --file {env_filepath}
            </code>
            <h2 class="font-bold my-4">
                Install in existing env:
            </h2>
            <code class="code">
                conda activate &lt;env-name&gt; # conda env you wish to install this plugin into<br><br>conda update --file {env_filepath}
            </code>
        </div>
    </div>
    <!-- I prefer the width setting it to small makes the div, but now it's too small. For some reason just prose makes it too narrow -->
    <div class="prose-base">
        <SvelteMarkdown source={data.repo_info["Long Description"]} />
    </div>
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
        @apply block
        bg-gray-200
        p-3
        rounded
        overflow-x-auto
        whitespace-pre;
    }

    h1 {
        @apply text-2xl
        font-bold;
    }
</style>
