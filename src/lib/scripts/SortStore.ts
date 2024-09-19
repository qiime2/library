import { writable } from "svelte/store";

export const sort_info = writable({
  sort_col: "Plugin Name",
  sort_descending: true,
});
