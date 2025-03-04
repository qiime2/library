<script lang="ts">
    import { getFilterContext } from "$lib/contexts";


    let state = getFilterContext();

    export function applySearchFilter (event: Event) {
        const searchBar = event.target as HTMLInputElement;
        const search_filter = searchBar.value;

        state.filters.search = search_filter;
    }
</script>

<input id="searchInput" placeholder="search" value={state.filters.search} oninput={applySearchFilter} />

<style lang="postcss">
    @reference "tailwindcss/theme";
    #searchInput {
        @apply border
        border-solid
        rounded
        border-gray-300
        mr-auto
        mt-auto
        pl-2;
    }
</style>