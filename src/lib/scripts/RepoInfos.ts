import { writable } from "svelte/store";
import { sort_info } from "$lib/scripts/SortStore.ts";

let repo_infos: Array<Object>;
let date_fetched: string;
export const overview = writable<{
  repo_overviews: Object[];
  date_fetched: string;
}>({
  'repo_overviews': [],
  'date_fetched': ''
});

let sort_col: string;
let sort_ascending: boolean;

sort_info.subscribe((sort_values) => {
  sort_col = sort_values.sort_col;
  sort_ascending = sort_values.sort_descending;
});

export function sortArray(this_col: string) {
  if (this_col === sort_col) {
    sort_ascending = !sort_ascending;
  } else {
    sort_col = this_col;
    sort_ascending = true;
  }

  sort_info.set({
    sort_col: sort_col,
    sort_descending: sort_ascending,
  });

  function compareElements(a: Object, b: Object) {
    const A = a[this_col as keyof Object];
    const B = b[this_col as keyof Object];

    if (A < B) {
      return sort_ascending === true ? -1 : 1;
    } else if (A > B) {
      return sort_ascending === true ? 1 : -1;
    }

    return 0;
  }

  overview.subscribe((value) => {
    repo_infos = value.repo_overviews;
    date_fetched = value.date_fetched;
  });

  if (repo_infos !== undefined) {
    overview.set({
      'repo_overviews': repo_infos.sort(compareElements),
      'date_fetched': date_fetched
    });
  }
}
