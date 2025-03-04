<script lang="ts">
    import { page } from '$app/state';
    import Navigation from '$lib/components/Navigation.svelte';
    import PluginQuickstart from "$lib/components/PluginQuickstart.svelte";
    import { spaceSeperatedList } from '$lib/scripts/util';

    let {owner, plugin} = page.params;
    let base = `/plugin/${owner}/${plugin}`

    let entries: [string, string][] = [
        [`${base}`, 'Introduction'],
        [`${base}/overview`, 'Overview'],
        [`${base}/tutorials`, 'Tutorials'],
        [`${base}/releases`, 'Releases'],
        [`${base}/discussions`, 'Discussions'],
    ];


    // This data comes from +layout.ts
    let data = page.data;
    const repo = `${data.repo_info.owner}/${data.repo_info.name}`;
    const releases = data.repo_info.distros.map((x: string) => x.split('-'))
    let grouped_releases: Record<string, string[]> = {};
    for (const [distro, epoch] of releases) {
        if (!grouped_releases[epoch]) {
            grouped_releases[epoch] = [];
        }
        grouped_releases[epoch].push(distro)
    }

    function environmentLink(epoch: string, distro: string) {
        if (data.repo_info.in_distro) {
            return `https://github.com/qiime2/distributions/blob/dev/${epoch}/${distro}/released/seed-environment-conda.yml`
        }
        return `https://github.com/${owner}/${plugin}/blob/${data.repo_info.branch}/environment-files/${plugin}-qiime2-${distro}-${epoch}.yml`
    }
</script>

<article class='prose max-w-none'>
    <div class="border-b border-gray-200 bg-gray-50 scroll-edge">
        <header class='max-width flex flex-wrap'>
            <div class='mr-auto flex flex-col pt-12'>
                <div class='mb-2'>
                    <div class="flex flex-col w-max">
                        <h1 class='text-6xl text-[#1a414c] mb-0 mx-2 inline'>{page.params.plugin}</h1>
                        <h2 class='text-3xl text-gray-600 mt-1 mb-4 mx-2 inline place-self-end'>{page.params.owner}</h2>
                    </div>
                </div>
                <div class='h-[48px] bg-[#f8f8f8] mt-auto'>
                    <nav class='flex h-full'>
                        <div class="text-lg h-full flex mt-auto">
                            <Navigation {entries} isActive={(path, url) => path == url}/>
                            <span class='ml-auto'></span>
                        </div>
                    </nav>
                </div>
            </div>
            <div class="px-2 max-w-xl py-3 self-center">
                <PluginQuickstart owner={data.repo_info.owner} plugin={data.repo_info.name} branch={data.repo_info.branch} releases={data.repo_info.distros} in_distro={data.repo_info.in_distro || false} />
            </div>
        </header>
    </div>
    <div class="scroll-edge">
        <div class="max-width">
            <div class="mx-2 my-5 relative flex gap-6">
                <div class='max-w-4xl grow min-h-screen'><slot/></div>
                <div class='hidden md:block shrink-0 ml-auto p-4 text-xs lg:text-base'>
                    <dl>
                        <dt>Links</dt>
                        <dd>
                            <a href={data.repo_info.docs} class='flex w-max items-center gap-1'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class='size-4' fill='currentColor'><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><title>Documentation</title><path d="M96 0C43 0 0 43 0 96L0 416c0 53 43 96 96 96l288 0 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-64c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L384 0 96 0zm0 384l256 0 0 64L96 448c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16zm16 48l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>
                                Documentation
                            </a>
                        </dd>
                        <dd>
                            <a href={`https://github.com/${repo}`} class='flex w-max items-center gap-1'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class='size-4' fill='currentColor'><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><title>GitHub</title><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>
                                Source Code
                            </a>
                        </dd>
                        <dt>Stars</dt>
                        <dd class='mt-0'>
                            {data.repo_info.stars}
                        </dd>
                        <dt>Last Commit</dt>
                        <dd>
                            <a class='font-mono text-sm' href={`https://github.com/${repo}/commit/${data.repo_info.last_commit.sha}`}>
                                <div class="bg-gray-50 border border-gray-200 rounded py-1 px-3 flex gap-1 w-max items-center">
                                    {data.repo_info.last_commit.sha.slice(0, 7)}
                                    {#if data.repo_info.last_commit.status == "passed" }
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-4 text-green-600 -mr-1">
                                        <title>Passed</title>
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                    {:else}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-4 text-red-600 -mr-1">
                                        <title>Failed</title>
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                    {/if}
                                </div>
                            </a>
                        </dd>
                        <dt>Available Distros</dt>
                        <dd class="mt-0 ml-0 pl-0">
                            <dl class=''>
                                {#each Object.keys(grouped_releases) as epoch}
                                <dt class='text-[#1a414c] mt-0'>{epoch}</dt>
                                {#each grouped_releases[epoch] as distro}
                                <dd class='py-0 mt-0 border-l-2 border-l-gray-200 pl-7 ml-7'><a href={environmentLink(epoch, distro)}>{epoch}/{distro}</a></dd>
                                {/each}
                                {/each}
                            </dl>
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    </div>
</article>