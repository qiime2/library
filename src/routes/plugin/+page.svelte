<script lang="ts">
    import RepoCard from "$lib/components/RepoCard.svelte";
    import SortButtons from "$lib/components/SortButtons.svelte";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import { getFilterContext } from "$lib/contexts";
    import FilterCheckbox from "$lib/components/FilterCheckbox.svelte";
    import { fade } from "svelte/transition";


    let state = getFilterContext();
</script>

<div class="max-width">
    <div id="banner" class='prose prose-sm sm:prose-md lg:prose-lg max-w-none'>
        This is a reimplementation of the QIIME 2 Library.
        Learn how to add your plugin <a href="https://develop.qiime2.org/en/latest/plugins/how-to-guides/distribute-on-library.html">here</a>.<br/>
        The old QIIME 2 Library has been deprecated and for the time being may be found <a href="https://old-library.qiime2.org/">here</a>.
    </div>
    <div class='sm:flex items-end border-[#1a414c] border-b-4 pb-4 mb-4'>
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
        <div class="pt-7 mx-auto grid gap-6 auto-rows-fr max-h-min grid-cols-[auto_auto]">
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

<style lang="postcss">
    @reference "tailwindcss/theme";

    #banner {
        @apply text-center
        py-4
        px-10
        my-10
        border
        border-solid
        border-blue-200
        rounded-lg
        text-gray-800
        bg-blue-50;
    }

    #filterButtons {
        @apply grid
        grid-cols-1
        h-full
        overflow-y-auto;
    }

    #date {
        @apply text-center;
    }

    #pageControls {
        @apply grid
        grid-cols-3
        pt-4;
    }

    #bottomBar {
        border-top: 2px solid;
        @apply border-gray-400
        py-4
        mt-4;
    }

    #setCardsPerPage {
        @apply border
        border-solid
        rounded
        border-gray-300
        px-2;
    }

    #gridContainer {
        @apply grid
        lg:grid-cols-[15%_85%];
    }

    .pageButton {
        @apply p-2
        rounded-md;
    }

    .filterButton {
        @apply my-1
        mr-1
        p-1
        border
        border-gray-300
        border-solid
        rounded;
    }
</style>
