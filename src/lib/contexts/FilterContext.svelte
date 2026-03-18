<script lang='ts'>
    import { Column, SortType } from "$lib/scripts/Column";
    import type { Snippet } from "svelte";
    import { setFilterContext, type PluginFilter } from ".";
    import { sortOverviews } from "$lib/scripts/util";
    import { SvelteSet } from "svelte/reactivity";

    type ReleaseTuple = [string, string, string];

    const DISTRO_SOURCE = "Distribution";
    const THIRD_PARTY_SOURCE = "Stand-alone";

    let { children, unfiltered, distro_epochs }:
        { children: Snippet, unfiltered: any[], distro_epochs: ReleaseTuple[] } = $props();

    const releases = distro_epochs.map((x) => x.slice(0, 2))
    const distros: Set<string> = new Set();
    const epochs: Set<string> = new Set();
    for (const [epoch, distro, _] of releases) {
        distros.add(distro);
        epochs.add(epoch);
    }

    function contains(target: string | undefined, query: string) {
        if (!target) {
            return false
        }
        return target.toLowerCase().search(query.toLowerCase()) >= 0;
    }

    function matchesSearchStatusAndSource(plugin: any, filters: PluginFilter["filters"]) {
        if (
            filters.search.length > 0
            && !contains(plugin.name, filters.search)
            && !contains(plugin.owner, filters.search)
            && !contains(plugin.description, filters.search)
        ) {
            return false;
        }

        if (
            filters.status.size > 0
            && !filters.status.has(plugin.last_commit.status)
        ) {
            return false;
        }

        if (filters.source.size > 0) {
            const source = plugin.in_distro ? DISTRO_SOURCE : THIRD_PARTY_SOURCE;
            if (!filters.source.has(source)) {
                return false;
            }
        }

        return true;
    }

    function getMatchingReleases(
        plugin: any,
        filters: PluginFilter["filters"],
        { ignoreEpoch = false, ignoreDistro = false } = {},
    ) {
        return plugin.distros
            .map((d: ReleaseTuple) => d.slice(0, 2) as [string, string])
            .filter((release: [string, string]) => {
                const [epoch, distro] = release;
                const epochMatch =
                    ignoreEpoch || filters.epochs.size === 0 || filters.epochs.has(epoch);
                const distroMatch =
                    ignoreDistro || filters.distros.size === 0 || filters.distros.has(distro);
                return epochMatch && distroMatch;
            });
    }

    function getAvailableDistros(filters: PluginFilter["filters"]) {
        const available = new Set<string>();
        for (const plugin of unfiltered) {
            if (!matchesSearchStatusAndSource(plugin, filters)) {
                continue;
            }
            for (const [_, distro] of getMatchingReleases(plugin, filters, { ignoreDistro: true })) {
                available.add(distro);
            }
        }
        return [...distros].filter((distro) => available.has(distro));
    }

    function getAvailableEpochs(filters: PluginFilter["filters"]) {
        const available = new Set<string>();
        for (const plugin of unfiltered) {
            if (!matchesSearchStatusAndSource(plugin, filters)) {
                continue;
            }
            for (const [epoch] of getMatchingReleases(plugin, filters, { ignoreEpoch: true })) {
                available.add(epoch);
            }
        }
        return [...epochs].filter((epoch) => available.has(epoch));
    }

    function filterPlugins(
        plugins: any[],
        filters: PluginFilter["filters"],
        sort: PluginFilter["sort"],
    ) {
        let filtered = plugins.slice();

        filtered = filtered.filter((plugin) => {
            return (
                matchesSearchStatusAndSource(plugin, filters)
                && getMatchingReleases(plugin, filters).length > 0
            );
        });

        return sortOverviews(filtered, sort.sort_col, sort.sort_descending)
    }

    const initialSort: PluginFilter["sort"] = {
        sort_col: new Column("Updated", "last_commit.date", SortType.numerical),
        sort_descending: true,
    };
    const initialFilters: PluginFilter["filters"] = {
        search: "",
        epochs: new SvelteSet(),
        distros: new SvelteSet(),
        source: new SvelteSet([THIRD_PARTY_SOURCE]),
        status: new SvelteSet()
    };

    let state: PluginFilter = $state({
        sort: initialSort,
        filters: initialFilters,
        filtered: filterPlugins(unfiltered, initialFilters, initialSort),
        filtered_epochs: getAvailableEpochs(initialFilters),
        filtered_distros: getAvailableDistros(initialFilters)
    })

    $effect(() => {
        const newDistros = new Set(getAvailableDistros(state.filters));
        state.filtered_distros = [...newDistros];
        for (const distro of state.filters.distros.difference(newDistros)) {
            state.filters.distros.delete(distro)
        }

        const newEpochs = new Set(getAvailableEpochs(state.filters));
        state.filtered_epochs = [...newEpochs];
        for (const epoch of state.filters.epochs.difference(newEpochs)) {
            state.filters.epochs.delete(epoch)
        }
    })

    $effect(() => {
        state.filtered = filterPlugins(unfiltered, state.filters, state.sort);
    });

    setFilterContext(state);

</script>

{@render children()}
