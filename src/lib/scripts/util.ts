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
