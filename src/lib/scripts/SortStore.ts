import { writable } from "svelte/store";

export const sort_info = writable({
  sort_col: "Repo Name",
  sort_descending: true,
});
