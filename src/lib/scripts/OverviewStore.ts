import { writable } from "svelte/store";

export const overview = writable<{
  repo_overviews: Object[];
  date_fetched: string;
}>({
  repo_overviews: [],
  date_fetched: "",
});
