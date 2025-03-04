import { writable } from "svelte/store";
import { SortType, Column } from "$lib/scripts/Column";

export const sort_info = writable({
  sort_col: new Column("Stars", "stars", SortType.numerical),
  sort_descending: true,
});
