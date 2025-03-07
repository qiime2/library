import { writable } from "svelte/store";
import { SortType, Column } from "$lib/scripts/Column";

export const sort_info = writable({
  sort_col: new Column("Commit Date", "last_commit.date", SortType.numerical),
  sort_descending: true,
});
