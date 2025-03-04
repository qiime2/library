<script lang='ts'>
    import { Column, SortType } from "$lib/scripts/Column";
    import type { Snippet } from "svelte";
    import { setFilterContext, type PluginFilter } from ".";
    import { sortOverviews } from "$lib/scripts/util";
    import { SvelteSet } from "svelte/reactivity";

    let { children, unfiltered }:
        { children: Snippet, unfiltered: any[] } = $props();

    let state: PluginFilter = $state({
        sort: {
            sort_col: new Column("Commit Date", "last_commit.date", SortType.numerical),
            sort_descending: true,
        },
        filters: {
            search: "",
            epochs: new SvelteSet(),
            distros: new SvelteSet(),
            status: new SvelteSet()
        },
        unfiltered,
        filtered: unfiltered,
    })

    $effect(() => {
        let filtered = state.unfiltered;


        if (state.filters.search.length > 0) {
            filtered = filtered.filter((e) =>
                String(e["name" as keyof Object].toLowerCase()).startsWith(
                    state.filters.search.toLowerCase(),
            ));

        }

        if (state.filters.epochs.size > 0) {
            filtered = filtered.filter(({distros}) => {
                return distros
                    .map((d: string) => d.split('-'))
                    .filter(([distro, epoch]: any) => state.filters.epochs.has(epoch))
                    .length > 0
            })
        }

        if (state.filters.distros.size > 0) {
            filtered = filtered.filter(({distros}) => {
                return distros
                    .map((d: string) => d.split('-'))
                    .filter(([distro, epoch]: any) => state.filters.distros.has(distro))
                    .length > 0
            })
        }

        if (state.filters.status.size > 0) {
            filtered = filtered.filter(({last_commit}) => {
                return state.filters.status.has(last_commit.status)
            })
        }

        state.filtered = sortOverviews(
            filtered, state.sort.sort_col, state.sort.sort_descending,
        )
    });

    setFilterContext(state);

</script>

{@render children()}