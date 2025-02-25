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
</script>

<article class='prose max-w-none'>
    <div class="border-b border-gray-200 bg-[#f8f8f8] scroll-edge">
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
                <PluginQuickstart owner={data.repo_info['Plugin Owner']} plugin={data.repo_info['Plugin Name']} branch={data.repo_info['Branch']} releases={data.repo_info['Releases']} />
            </div>
        </header>
    </div>
    <div class="scroll-edge">
        <div class="max-width">
            <div class="mx-2 my-5 relative flex gap-6">
                <div class='max-w-4xl grow'><slot/></div>
                <div class='hidden md:block w-3xs lg:w-xs shrink-0 ml-auto border p-4 text-xs lg:text-base'>
                    <p class="info-content">
                        {data.repo_info["Description"]}
                    </p>
                    <p class="info-content">
                        <span class="font-bold">Source: </span>
                        <a href="https://github.com/{data.repo_info['Plugin Owner']}/{data.repo_info['Plugin Name']}">
                            https://github.com/{data.repo_info["Plugin Owner"]}/{data.repo_info["Plugin Name"]}</a>
                    </p>
                    <div class="info-content">
                        <p class="my-2">
                            <span class="font-bold">Compatible Releases: </span>
                            {spaceSeperatedList(data.repo_info["Releases"])}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</article>