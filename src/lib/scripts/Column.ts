export enum SortType {
  alphabetical = "alphabetical",
  numerical = "numerical",
}

export class Column {
  name = "";
  attr = "";
  sort_type = "alphabetical";

  constructor(name: string, attr: string, sort_type: SortType) {
    this.name = name;
    this.attr = attr;
    this.sort_type = sort_type;
  }
}
