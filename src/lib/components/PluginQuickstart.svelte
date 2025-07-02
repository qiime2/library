<script lang="ts">
    import InstallPlugin from './InstallPlugin.svelte';

    const { owner, plugin, branch, releases, in_distro }: {
        owner: string, plugin: string, branch: string, releases: string[], in_distro: boolean
    } = $props();

    let selected_ = $state(JSON.stringify(releases[0]));
    let selected = $derived(JSON.parse(selected_))
    let env_name = $derived(`${plugin}-${selected[1]}-${selected[0]}`);
    let env_filepath = $derived(`https://raw.githubusercontent.com/${owner}/${plugin}/refs/heads/${branch}/${selected[2]}`);

    let grouped_releases: Record<string, [string, string, string][]> = {};
    for (const [epoch, distro, env] of releases) {
        if (!grouped_releases[epoch]) {
            grouped_releases[epoch] = [];
        }
        grouped_releases[epoch].push([epoch, distro, env])
    }

</script>

<section class='border-l-violet-500 bg-white border-l-4 rounded overflow-clip shadow-md prose-sm'>
    <div class='px-2 py-1 bg-violet-100 not-prose text-base flex items-center'>
        <div class="flex flex-row gap-2 items-center">
            <span class="mt-1 mb-1 font-bold">Quickstart install for:</span>
            <select class='bg-white px-4 py-1 rounded border-gray-200 border shadow-inner' bind:value={selected_}>
                {#each Object.keys(grouped_releases) as epoch}
                <optgroup label={epoch}>
                    {#each grouped_releases[epoch] as release}
                    <option value={JSON.stringify(release)}>{release[0]}/{release[1]}</option>
                    {/each}
                </optgroup>
                {/each}
            </select>
        </div>
    </div>
    <InstallPlugin env_url={env_filepath} env_name={env_name} base_env={selected[1]}/>
</section>