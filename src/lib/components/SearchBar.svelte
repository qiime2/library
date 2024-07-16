<script lang="ts">
    import { overview } from "$lib/scripts/OverviewStore";

    let repo_overviews: Array<Object>;
    let filter: string;
    let filtered_overviews: Array<Object>;
    let date_fetched: string;

    overview.subscribe((value) => {
        repo_overviews = value.repo_overviews;
        filter = value.filter;
        filtered_overviews = value.filtered_overviews;
        date_fetched = value.date_fetched;
    });

    export function applySearchFilter () {
        const searchBar = document.getElementById("searchInput") as HTMLInputElement;
        const searchFilter = searchBar.value;

        let _filtered_overviews = []

        for (const repo_overview of repo_overviews) {
            if (String(repo_overview["Repo Name" as keyof Object]).startsWith(searchFilter)) {
                _filtered_overviews.push(repo_overview);
            }
        }

        overview.set({
            repo_overviews: repo_overviews,
            filter: searchFilter,
            filtered_overviews: _filtered_overviews,
            date_fetched: date_fetched
        });
    }
</script>

<div id="searchBar">
    Search: <input id="searchInput" placeholder="repo name" value={filter} on:input={applySearchFilter} />
</div>

<style lang="postcss">
    #searchBar {
        margin-right: auto;
        margin-top: auto;
    }
</style>