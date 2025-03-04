<script lang="ts">
    import "../../app.css";
    import { sortOverviews } from "$lib/scripts/util";
    import { overview } from "$lib/scripts/OverviewStore";
    import { sort_info } from "$lib/scripts/SortStore.ts";
    import { SortType, Column } from "$lib/scripts/Column";

    let overview_store;

    overview.subscribe((value) => {
        overview_store = value;
    });

    let sort_col: Column;
    let sort_descending: boolean;

    sort_info.subscribe((sort_values) => {
        sort_col = sort_values.sort_col;
        sort_descending = sort_values.sort_descending;
    });

    // Type refers to the whether this column is to be sorted in alphabetical
    // order or numerical order
    const columns = [
        new Column("Plugin Owner", "owner", SortType.alphabetical),
        new Column("Plugin Name", "name", SortType.alphabetical),
        new Column("Stars", "stars", SortType.numerical),
        new Column("Commit Date", "last_commit.date", SortType.numerical),
        new Column("Build Status", "last_commit.status", SortType.alphabetical)
    ];

    function sortButton(column: Column) {
        if (column.name === sort_col.name) {
            sort_descending = !sort_descending;
        } else {
            sort_descending = true;
        }

        overview_store.filtered_overviews = sortOverviews(
            overview_store.filtered_overviews,
            column,
            sort_descending,
        );

        sort_info.set({
            sort_col: column,
            sort_descending: sort_descending,
        });

        overview.set({
            ...overview_store,
        });
    }
</script>

<div id="buttons">
    {#each columns as column}
        <button class="sortButton" on:click={() => sortButton(column)}>
            <div class="float-left">
                {column.name}
            </div>
            <svg fill="none" width="10" height="10" class="svg">
                {#if sort_col.name !== column.name}
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
    {/each}
</div>

<style lang="postcss">
    @reference "tailwindcss/theme";
    #buttons {
        @apply flex;
    }

    .sortButton {
        @apply flex
        px-2
        rounded;
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
