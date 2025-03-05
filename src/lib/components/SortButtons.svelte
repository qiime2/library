<script lang="ts">
    import "../../app.css";
    import { SortType, Column } from "$lib/scripts/Column";
    import { getFilterContext } from "$lib/contexts";

    let state = getFilterContext();


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
        if (column.name === state.sort.sort_col.name) {
            state.sort.sort_descending = !state.sort.sort_descending;
        } else {
            state.sort.sort_descending = true;
        }
        state.sort.sort_col = column
        // The filtering is done via $effect() in the FilterContext.
    }
</script>

<div class="flex gap-5">
    {#each columns as column}
        <button class="flex items-center gap-1.5 hover:text-black hover:cursor-pointer"
                class:text-black={state.sort.sort_col.name == column.name}
                class:text-gray-600={state.sort.sort_col.name != column.name}
                on:click={() => sortButton(column)}>
            <div class="float-left text-xs md:text-sm lg:text-base">
                {column.name}
            </div>
            <svg fill="none" stroke="currentColor" viewBox="0 0 10 10" class="size-2">
                {#if state.sort.sort_col.name !== column.name}
                    <path
                        stroke-width="2.5"
                        d="M0 5L10 5"
                    />
                {:else if state.sort.sort_descending}
                    <path
                        stroke-width="2.5"
                        d="M0 3L5 8a0,2 0 0 1 1,1M5 8L10 3"
                    />
                {:else}
                    <path
                        stroke-width="2.5"
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
