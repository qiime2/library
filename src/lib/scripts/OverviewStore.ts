import { writable } from "svelte/store";

export const overview = writable<{
  repo_overviews: Object[];
  search_filter: string;
  filtered_overviews: Object[];
  date_fetched: string;
  distros: string[];
  epochs: string[];
  filter_distros: string[];
  filter_epochs: string[];
}>({
  repo_overviews: [],
  search_filter: "",
  filtered_overviews: [],
  date_fetched: "",
  distros: [],
  epochs: [],
  filter_distros: [],
  filter_epochs: [],
});
