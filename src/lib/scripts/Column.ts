export enum SortType {
  alphabetical = "alphabetical",
  numerical = "numerical",
}

export class Column {
  name = "";
  sort_type = "alphabetical";

  constructor(name: string, sort_type: SortType) {
    this.name = name;
    this.sort_type = sort_type;
  }
}
