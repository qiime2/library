<script lang="ts">
    import InstallPlugin from './InstallPlugin.svelte';

    const { owner, plugin, branch, releases, in_distro }: {
        owner: string, plugin: string, branch: string, releases: string[], in_distro: boolean
    } = $props();

    let selected = $state(releases[0]);
    let env_name = $derived(`${plugin}-${selected}`);
    let env_filepath = $derived(`https://raw.githubusercontent.com/${owner}/${plugin}/refs/heads/${branch}/environment-files/${plugin}-qiime2-${selected}.yml`);

    let grouped_releases: Record<string, string[]> = {};
    for (const [distro, epoch] of releases.map(x => x.split('-'))) {
        if (!grouped_releases[epoch]) {
            grouped_releases[epoch] = [];
        }
        grouped_releases[epoch].push(distro)
    }

</script>

<section class='border-l-violet-500 bg-white border-l-4 rounded overflow-clip shadow-md prose-sm'>
    <div class='px-2 py-1 bg-violet-100 not-prose text-base flex items-center'>
        <div class="flex flex-row gap-2 items-center">
            <span class="mt-1 mb-1 font-bold">Quickstart install for:</span>
            <select class='bg-white px-4 py-1 rounded border-gray-200 border shadow-inner' bind:value={selected}>
                {#each Object.keys(grouped_releases) as epoch}
                <optgroup label={epoch}>
                    {#each grouped_releases[epoch] as distro}
                    <option value="{distro}-{epoch}">{epoch}/{distro}</option>
                    {/each}
                </optgroup>
                {/each}
            </select>
            <!-- <button class="flex min-w-[220px] items-center justify-between rounded-lg bg-white px-3 shadow-inner transition-opacity hover:opacity-90 border border-gray-200"
                    use:melt={$trigger}
                    aria-label="Releases">
                {selected}
                <svg fill="none" width="10" height="10">
                    <path stroke-width="3" stroke="rgb(119, 119, 119)" d="M0 3L5 8a0,2 0 0 1 1,1M5 8L10 3"/>
                </svg>
            </button>
            {#if $open}
            <div class=" z-10 flex max-h-[300px] flex-col overflow-y-auto rounded-lg bg-white p-1 shadow focus:!ring-0"
                    use:melt={$menu}
                    transition:fade={{ duration: 150 }}>
               {#each releases as release}
                <div role="button" tabindex="0" class="relative cursor-pointer rounded-lg py-1 pl-8 pr-4 text-neutral-800 focus:z-10 data-[highlighted]:bg-gray-300 data-[disabled]:opacity-50"
                        use:melt={$option({ value: release, label: release })}
                        onclick={() => selected = release}>
                    <div class="check inline-block {$isSelected(release) ? 'opacity-100' : 'opacity-0'}">
                        <svg fill="none" width="10" height="10">
                            <path stroke-width="2" stroke="rgb(119, 119, 119)" d="M0 4L5 8M4 8L10 0" />
                        </svg>
                    </div>
                    {release}
                </div>
                {/each}
            </div>
            {/if} -->
        </div>
    </div>
    <InstallPlugin env_url={env_filepath} env_name={env_name} base_env={selected}/>
</section>