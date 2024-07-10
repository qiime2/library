import { writable } from "svelte/store";

export const sort_info = writable({
  sort_col: "",
  sort_ascending: true,
});
