<script lang="ts">
    import "../../app.css";

    import { overview } from "$lib/scripts/OverviewStore";
    import { applyFilters } from "$lib/scripts/util";

    export let this_filter: string;
    export let filter_type: string;

    let repo_overviews: Array<Object>;
    let search_filter: string;
    let filtered_overviews: Array<Object>;
    let date_fetched: string;
    let distros: Array<string> = [];
    let epochs: Array<string> = [];
    let filter_distros: Array<string> = [];
    let filter_epochs: Array<string> = [];

    overview.subscribe((value) => {
        repo_overviews = value.repo_overviews;
        search_filter = value.search_filter;
        filtered_overviews = value.filtered_overviews;
        date_fetched = value.date_fetched;
        distros = value.distros,
        epochs = value.epochs,
        filter_distros = value.filter_distros,
        filter_epochs = value.filter_epochs
    });

    let selected = (filter_type === "Distro" ? filter_distros : filter_epochs).includes(this_filter);


    function addFilter() {
        let filter_list = (filter_type === "Distro" ? filter_distros : filter_epochs)

        selected = !selected

        if (selected) {
            filter_list.push(this_filter)
        } else {
            filter_list = filter_list.filter(e => e !== this_filter)
        }

        if (filter_type === "Distro") {
            overview.set({
                repo_overviews: repo_overviews,
                search_filter: "",
                filtered_overviews: repo_overviews,
                date_fetched: date_fetched,
                distros: distros,
                epochs: epochs,
                filter_distros: filter_list,
                filter_epochs: filter_epochs
            });
        } else {
            overview.set({
                repo_overviews: repo_overviews,
                search_filter: "",
                filtered_overviews: repo_overviews,
                date_fetched: date_fetched,
                distros: distros,
                epochs: epochs,
                filter_distros: filter_distros,
                filter_epochs: filter_list
            });
        }

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
