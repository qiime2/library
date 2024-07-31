<script lang="ts">
    import "../../app.css";
    import { sortOverviews } from "$lib/scripts/util";
    import { overview } from "$lib/scripts/OverviewStore";
    import { sort_info } from "$lib/scripts/SortStore.ts";

    let overview_store;

    overview.subscribe((value) => {
        overview_store = value;
    });

    let sort_col: string;
    let sort_descending: boolean;

    sort_info.subscribe((sort_values) => {
        sort_col = sort_values.sort_col;
        sort_descending = sort_values.sort_descending;
    });

    const columns = ["Repo Owner", "Repo Name", "Stars", "Commit Date", "Commit Status"];

    function sortButton(this_col: string) {
        if (this_col === sort_col) {
            sort_descending = !sort_descending;
        } else {
            sort_descending = true;
        }

        overview_store.filtered_overviews = sortOverviews(overview_store.filtered_overviews, this_col, sort_descending);

        sort_info.set({
            sort_col: this_col,
            sort_descending: sort_descending
        });

        overview.set({
            ...overview_store
        });
    }
</script>

<div id="buttons">
    {#each columns as column}
        <div class="sortButton">
            <button on:click={() => sortButton(column)}>
                <div class="float-left">
                    {column}
                </div>
                <svg fill="none"
                    width="10"
                    height="10"
                    class="svg"
                >
                    {#if sort_col !== column}
                        <path
                            stroke-width="3"
                            stroke="rgb(119, 119, 119)"
                            d="M0 5L10 5"
                        />
                    {:else if sort_descending}
                        <path
                            stroke-width="3"
                            stroke="rgb(119, 119, 119)"
                            d="M0 3L5 8a0,2 0 0 1 1,1M5 8L10 3"
                        />
                    {:else}
                        <path
                            stroke-width="3"
                            stroke="rgb(119, 119, 119)"
                            d="M0 8L5 3a0,2 0 0 1 1,1M5 3L10 8"
                        />
                    {/if}
                </svg>
            </button>
        </div>
    {/each}
</div>

<style lang="postcss">
    #buttons {
        @apply flex;
    }

    .sortButton {
        @apply flex
        mx-2;
    }

    .label {
        @apply float-left;
    }

    .svg {
        @apply ml-2
        my-2
        float-right;
    }
</style>