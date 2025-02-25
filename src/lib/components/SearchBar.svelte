<script lang="ts">
    import "../../app.css";

    import { overview } from "$lib/scripts/OverviewStore";
    import { applyFilters } from "$lib/scripts/util";

    let overview_store;

    overview.subscribe((value) => {
        overview_store = value;
    });

    export function applySearchFilter () {
        const searchBar = document.getElementById("searchInput") as HTMLInputElement;
        const search_filter = searchBar.value;

        overview_store.search_filter = search_filter;
        overview.set({
            ...overview_store
        });

        applyFilters();
    }
</script>

<input id="searchInput" placeholder="search" value={overview_store.search_filter} on:input={applySearchFilter} />

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