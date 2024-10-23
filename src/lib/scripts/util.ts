import { overview } from "$lib/scripts/OverviewStore";
import { SortType, type Column } from "$lib/scripts/Column";

export function sortOverviews(
  filtered_overviews: Object[],
  sort_col: Column,
  sort_descending: boolean,
) {
  function compareElements(a: Object, b: Object) {
    const A = a[sort_col.name as keyof Object];
    const B = b[sort_col.name as keyof Object];

    if (A < B) {
      return sort_descending === true ? 1 : -1;
    } else if (A > B) {
      return sort_descending === true ? -1 : 1;
    }

    return 0;
  }

  // It turns out that similar to how 4 > 3 is true f > b is true, so if we
  // want to sort alphabetically in the manner expected we need to reverse the
  // sort order for alphabetical column
  if (sort_col.sort_type === SortType.alphabetical) {
    sort_descending = !sort_descending;
  }

  filtered_overviews.sort(compareElements);
  return filtered_overviews;
}

export function applyFilters() {
  let overview_store;

  overview.subscribe((value) => {
    overview_store = value;
  });

  let filtered_overviews = [];

  filtered_overviews = overview_store.repo_overviews.filter((e) =>
    String(e["Plugin Name" as keyof Object]).startsWith(
      overview_store.search_filter,
    ),
  );

  for (const release of overview_store.filter_releases) {
    filtered_overviews = filtered_overviews.filter((e) =>
      e["Releases"].includes(release),
    );
  }

  overview_store.filtered_overviews = filtered_overviews;

  overview.set({
    ...overview_store,
  });
}

export function formatDate(dateStr: string) {
  // Expecting a date string of the format given by the GitHub REST API
  // yyyy-mm-ddTHH:MM:SS.MILZ
  const split = dateStr.split("T");

  const date = split[0];
  const time = split[1];

  const splitTime = time.split(":");
  const finalTime = splitTime[0] + ":" + splitTime[1];

  return date + " at " + finalTime + " UTC";
}

export function spaceSeperatedList(list: Array<Object>) {
  // If you put a {some_list_var} in a svelte file you get element,element with
  // no space. I don't like this
  let listStr = `${list[0]}`;

  for (const elem of list.slice(1)) {
    listStr += `, ${elem}`;
  }

  return listStr;
}
