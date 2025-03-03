<script lang='ts'>
    import MyStMinimal from '$lib/components/MySTMinimal.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>


<div class="pl-5">
    <ol class="relative border-s-4 border-gray-200 dark:border-gray-700 list-none">
    {#each data.repo_info.releases as release}
        <li class="mb-10 ms-4">
            <span class="absolute flex items-center justify-center size-10 text-white bg-[#1a414c] rounded-full -start-5.5 ring-8 ring-white ">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                    <path fill-rule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clip-rule="evenodd" />
                    <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
                </svg>
            </span>
            <h3 class="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white"><span class="bg-[#e39e54] text-white text-sm font-medium me-3 px-2.5 py-0.5 rounded-sm">{release.tag_name}</span><a href={release.html_url} class='text-xl font-bold text-black'>{release.name}</a></h3>
            <time class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{new Date(release.published_at).toDateString()}</time>
            <p class="mb-4 prose-sm">
                <MyStMinimal ast={release.ast}/>
            </p>
        </li>
    {:else}
    <p>No releases found on Github.</p>
    {/each}
    </ol>
</div>