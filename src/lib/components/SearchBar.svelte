<script lang="ts">
    import "../../app.css";

    import { overview } from "$lib/scripts/OverviewStore";

    let overview_store;

    overview.subscribe((value) => {
        overview_store = value;
    });

    export function applySearchFilter () {
        const searchBar = document.getElementById("searchInput") as HTMLInputElement;
        const searchFilter = searchBar.value;

        let filtered_overviews = []

        for (const repo_overview of overview_store.repo_overviews) {
            if (String(repo_overview["Repo Name" as keyof Object]).startsWith(searchFilter)) {
                filtered_overviews.push(repo_overview);
            }
        }

        overview_store.filter = searchFilter;
        overview_store.filtered_overviews = filtered_overviews;

        overview.set({
            ...overview_store
        });
    }
</script>

<input id="searchInput" placeholder="search" value={overview_store.filter} on:input={applySearchFilter} />

<style lang="postcss">
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