<script lang="ts">
    import { getFilterContext } from "$lib/contexts";

    let state = getFilterContext();

    export function applySearchFilter (event: Event) {
        const searchBar = event.target as HTMLInputElement;
        const search_filter = searchBar.value;

        state.filters.search = search_filter;
    }
</script>

<input class='border border-solid rounded border-gray-200 shadow-inner mr-auto mt-auto mb-4 sm:mb-0 px-4 py-1 text-sm md:text-lg block'
    placeholder="search" value={state.filters.search} oninput={applySearchFilter} />