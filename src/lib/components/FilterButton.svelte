<script lang="ts">
    import "../../app.css";

    import { overview } from "$lib/scripts/OverviewStore";
    import { applyFilters } from "$lib/scripts/util";

    export let this_filter: string;

    let repo_overviews: Array<Object>;
    let search_filter: string;
    let filtered_overviews: Array<Object>;
    let date_fetched: string;
    let releases: Array<string> = [];
    let filter_releases: Array<string> = [];

    overview.subscribe((value) => {
        repo_overviews = value.repo_overviews;
        search_filter = value.search_filter;
        filtered_overviews = value.filtered_overviews;
        date_fetched = value.date_fetched;
        releases = value.releases,
        filter_releases = value.filter_releases
    });

    let selected = filter_releases.includes(this_filter);

    function addFilter() {
        let filter_list = filter_releases;

        selected = !selected

        if (selected) {
            filter_list.push(this_filter)
        } else {
            filter_list = filter_list.filter(e => e !== this_filter)
        }

        overview.set({
            repo_overviews: repo_overviews,
            search_filter: search_filter,
            filtered_overviews: filtered_overviews,
            date_fetched: date_fetched,
            releases: releases,
            filter_releases: filter_list,
        });

        applyFilters();
    }
</script>

<button class="filterButton" class:active={selected} on:click={() => addFilter()}>{this_filter}</button>

<style lang="postcss">
    .filterButton {
        @apply my-1
        mr-1
        p-1
        border
        border-gray-300
        border-solid
        rounded;
    }

    .active {
        @apply bg-gray-500
        text-white;
    }
</style>
