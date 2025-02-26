<script lang='ts'>
    import MyStMinimal from '$lib/components/MySTMinimal.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
    console.log(data.repo_info)
</script>


<div class="pl-5">
    <ol class="relative border-s-4 border-gray-200 dark:border-gray-700 list-none">
    {#each data.repo_info['Github Releases'] as release}
        <li class="mb-10 ms-4">
            <span class="absolute flex items-center justify-center size-10 bg-blue-100 rounded-full -start-5.5 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                <svg class="size-5 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                </svg>
            </span>
            <h3 class="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white"><span class="bg-blue-100 text-blue-800 text-sm font-medium me-3 px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300">{release.tag_name}</span><a href={release.html_url} class='text-xl font-bold no-underline'>{release.name}</a></h3>
            <time class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{release.published_at}</time>
            <p class="mb-4 prose-sm">
                <MyStMinimal ast={release.ast}/>
            </p>
        </li>
    {:else}
    <p>No releases found on Github.</p>
    {/each}
    </ol>
</div>