<script lang='ts'>
    import { Column, SortType } from "$lib/scripts/Column";
    import type { Snippet } from "svelte";
    import { setFilterContext, type PluginFilter } from ".";
    import { sortOverviews } from "$lib/scripts/util";
    import { SvelteSet } from "svelte/reactivity";

    let { children, unfiltered, distro_epochs }:
        { children: Snippet, unfiltered: any[], distro_epochs: string[] } = $props();

    const releases = distro_epochs.map((x: string) => x.split('-'))
    const distros: Set<string> = new Set();
    const epochs: Set<string> = new Set();
    for (const [distro, epoch] of releases) {
        distros.add(distro);
        epochs.add(epoch);
    }


    let state: PluginFilter = $state({
        sort: {
            sort_col: new Column("Updated", "last_commit.date", SortType.numerical),
            sort_descending: true,
        },
        filters: {
            search: "",
            epochs: new SvelteSet(),
            distros: new SvelteSet(),
            status: new SvelteSet()
        },
        filtered: unfiltered,
        filtered_epochs: [...epochs],
        filtered_distros: [...distros]
    })
    $effect(() => {
        let new_distros: Set<string> = new Set()
        if (state.filters.epochs.size > 0) {
            for (const [distro, epoch] of releases) {
                if (state.filters.epochs.has(epoch)) {
                    new_distros.add(distro)
                }
            }
            state.filtered_distros = [...new_distros];
            for (const distro of state.filters.distros.difference(new_distros)) {
                state.filters.distros.delete(distro)
            }
        } else {
            state.filtered_distros = [...distros];
        }

        let new_epochs: Set<string> = new Set()
        if (state.filters.distros.size > 0) {
            for (const [distro, epoch] of releases) {
                if (state.filters.distros.has(distro)) {
                    new_epochs.add(epoch)
                }
            }
            state.filtered_epochs = [...new_epochs];
            for (const epoch of state.filters.epochs.difference(new_epochs)) {
                state.filters.epochs.delete(epoch)
            }
        } else {
            state.filtered_epochs = [...epochs];
        }
    })

    function contains(target: string | undefined, query: string) {
        if (!target) {
            return false
        }
        return target.toLowerCase().search(query.toLowerCase()) >= 0;
    }

    $effect(() => {
        let filtered = unfiltered.slice();

        if (state.filters.search.length > 0) {
            filtered = filtered.filter((e) =>
                contains(e.name, state.filters.search)
                || contains(e.owner, state.filters.search)
                || contains(e.description, state.filters.search)
            );

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