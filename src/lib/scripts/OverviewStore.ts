import { writable } from "svelte/store";

export const overview = writable<{
  repo_overviews: Object[];
  search_filter: string;
  filtered_overviews: Object[];
  date_fetched: string;
  releases: string[];
  filter_releases: string[];
}>({
  repo_overviews: [],
  search_filter: "",
  filtered_overviews: [],
  date_fetched: "",
  releases: [],
  filter_releases: [],
});
