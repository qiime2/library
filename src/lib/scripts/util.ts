import { overview } from "$lib/scripts/OverviewStore";

export function sortOverviews(
  filtered_overviews: Object[],
  sort_col: string,
  sort_descending: boolean,
) {
  function compareElements(a: Object, b: Object) {
    const A = a[sort_col as keyof Object];
    const B = b[sort_col as keyof Object];

    if (A < B) {
      return sort_descending === true ? 1 : -1;
    } else if (A > B) {
      return sort_descending === true ? -1 : 1;
    }

    return 0;
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
    String(e["Repo Name" as keyof Object]).startsWith(
      overview_store.search_filter,
    ),
  );

  for (const distro of overview_store.filter_distros) {
    filtered_overviews = filtered_overviews.filter((e) =>
      e["Distros"].includes(distro),
    );
  }

  for (const epoch of overview_store.filter_epochs) {
    filtered_overviews = filtered_overviews.filter((e) =>
      e["Epochs"].includes(epoch),
    );
  }

  overview_store.filtered_overviews = filtered_overviews;

  overview.set({
    ...overview_store,
  });
}
