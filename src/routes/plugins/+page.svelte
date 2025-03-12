<script lang="ts">
    import RepoCard from "$lib/components/cards/RepoCard.svelte";
    import SortButtons from "$lib/components/SortButtons.svelte";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import { getFilterContext } from "$lib/contexts";
    import FilterCheckbox from "$lib/components/FilterCheckbox.svelte";
    import { fade } from "svelte/transition";


    let state = getFilterContext();
</script>

<div class="max-width">
    <header class="prose prose-sm md:prose-base lg:prose-lg mt-10">
        <h1>Available Plugins</h1>
        <div class="bg-blue-50 py-2 px-4 border border-blue-200 rounded-xl -mt-2">
            <p class='!my-0 italic'>Plugins listed on the old library can be found at <a href="https://old-library.qiime2.org/plugins" target="_blank" class='whitespace-nowrap'>old-library.qiime2.org</a>.</p>
        </div>
    </header>
    <div class='sm:flex items-end border-[#1a414c] border-b-4 pb-4 mb-4 mt-10'>
        <SearchBar />
        <SortButtons />
    </div>
    <div class="sm:flex gap-4 md:gap-12 relative">
        <div class="prose shrink-0 lg:sticky top-[60px] self-start">
            <dl class='grid grid-cols-3 gap-4 sm:grid-cols-1 sm:grid-rows-3'>
                <div>
                    <dt class='border-b-2 border-b-gray-700 text-gray-700 mb-1 mt-0'>Epoch</dt>
                    {#each state.filtered_epochs as epoch (epoch)}
                    <dd class='mt-0 ml-0 pl-1' transition:fade><FilterCheckbox name={epoch} attr={state.filters.epochs}/></dd>
                    {/each}
                </div>
                <div>
                    <dt class='border-b-2 border-b-gray-700 text-gray-700 mb-1 mt-0'>Base Distribution</dt>
                    {#each state.filtered_distros as distro (distro)}
                    <dd class='mt-0 ml-0 pl-1' transition:fade><FilterCheckbox name={distro} attr={state.filters.distros}/></dd>
                    {/each}
                </div>
                <div>
                    <dt class='border-b-2 border-b-gray-700 text-gray-700 mb-1 mt-0'>Status</dt>
                    {#each ['passed', 'failed'] as status}
                    <dd class='mt-0 ml-0 pl-1'><FilterCheckbox name={status} attr={state.filters.status}/></dd>
                    {/each}
                </div>
            </dl>
        </div>
        <div class="pt-7 mx-auto grid gap-6 auto-rows-fr max-h-min grid-cols-1 w-full max-w-4xl">
            {#each state.filtered as repo_overview (repo_overview.name)}
                <RepoCard {repo_overview} />
            {/each}
            <!-- These are load-bearing divs, they keep the auto-row in check -->
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
</div>