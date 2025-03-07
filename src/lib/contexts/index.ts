import type { Column } from "$lib/scripts/Column";
import { getContext, setContext } from "svelte";
import type { SvelteSet } from "svelte/reactivity";

const FILTER_KEY = Symbol("plugin-filter");

export interface PluginFilter {
  sort: {
    sort_col: Column;
    sort_descending: boolean;
  };
  filters: {
    search: string;
    epochs: SvelteSet<string>;
    distros: SvelteSet<string>;
    status: SvelteSet<"passed" | "failed" | "pending">;
  };
  filtered: any[];
  filtered_epochs: string[];
  filtered_distros: string[];
}

export function setFilterContext(state: PluginFilter) {
  setContext(FILTER_KEY, state);
}

export function getFilterContext() {
  return getContext<PluginFilter>(FILTER_KEY);
}
