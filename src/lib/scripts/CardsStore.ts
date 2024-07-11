import { writable } from "svelte/store";

export const cards = writable<{
  cards_per_page: number;
  current_page: number;
  num_pages: number;
}>({
  cards_per_page: 2,
  current_page: 1,
  num_pages: 1,
});
