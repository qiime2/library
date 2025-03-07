<script lang="ts">
    export let repo_overview: any;
</script>

<div class={`bg-white border border-gray-200 relative grid grid-cols-subgrid col-span-full rounded-lg
            shadow-[0_4px_10px_rgba(0,0,0,0.1)] backdrop-blur !my-0 p-4 sm:p-6 sm:my-6`}
     class:hover:shadow-[0_4px_10px_rgba(0,0,0,0.3)]={true}>
        <a href="/plugin/{repo_overview.owner}/{repo_overview.name}" class="grid grid-cols-subgrid col-span-full md:col-span-1">
            <div class='my-auto grid col-span-full md:col-span-1 grid-cols-subgrid'>
                <div class="flex flex-col w-max mx-auto md:mx-0 col-span-2 md:col-span-1">
                    <h1 class='text-2xl md:text-3xl font-bold text-[#1a414c] mb-0 inline'>{repo_overview.name}</h1>
                    <h2 class='font-bold md:text-lg text-gray-600 mt-1 mb-4 inline place-self-center md:place-self-end'>{repo_overview.owner}</h2>
                </div>
                <p class="text-sm lg:text-base max-w-2xl text-gray-600 col-span-2 mb-1 md:mb-0 md:col-end-1">
                    {repo_overview.description}
                </p>
                <p class='text-xs text-gray-600 mt-2'>Last updated: {(new Date(repo_overview.last_commit.date)).toDateString()}</p>
            </div>
        </a>

        <div class='prose prose-sm col-span-2 md:col-start-2 my-auto flex flex-wrap md:flex-col gap-4 md:gap-1 items-center md:items-start md:border-l border-l-gray-200 md:pl-6 md:ml-6 md:py-4'>
            <a href={repo_overview.docs} class='flex min-w-max items-center gap-1'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class='size-4' fill='currentColor'><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><title>Documentation</title><path d="M96 0C43 0 0 43 0 96L0 416c0 53 43 96 96 96l288 0 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-64c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L384 0 96 0zm0 384l256 0 0 64L96 448c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16zm16 48l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>
                Documentation
            </a>
            <a href={`https://github.com/${repo_overview.owner}/${repo_overview.name}`} class='flex min-w-max items-center gap-1'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class='size-4' fill='currentColor'><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><title>GitHub</title><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>
                Source Code
            </a>
            <a class='font-mono text-xs' href={`https://github.com/${repo_overview.owner}/${repo_overview.name}/commit/${repo_overview.last_commit.sha}`}>
                <div class="bg-gray-50 border border-gray-200 rounded py-1 px-3 flex gap-1 w-max items-center">
                    {repo_overview.last_commit.sha.slice(0, 7)}
                    {#if repo_overview.last_commit.status == "passed" }
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-3 lg:size-4 text-green-600 -mr-1">
                        <title>Passed</title>
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-3 lg:size-4 text-red-600 -mr-1">
                        <title>Failed</title>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    {/if}
                </div>
            </a>
            <span class="flex items-center gap-1 font-bold text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5 -ml-0.5 text-[#e39e54]">
                    <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" />
                </svg>
                {repo_overview.stars}
            </span>
        </div>
</div>