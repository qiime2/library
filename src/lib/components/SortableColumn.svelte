<!-- I need to make this sort stuff reactive so I can make each table header a component -->
<script lang="ts">
    import { sort_info } from '$lib/scripts/SortStore.ts';
    import { sortArray } from '$lib/scripts/OverviewStore';

    export let this_col: string;

    let sort_col: string;
    let sort_descending: boolean;

    sort_info.subscribe((sort_values) => {
        sort_col = sort_values.sort_col;
        sort_descending = sort_values.sort_descending;
    });
</script>

<th>
    {this_col}
    <button on:click={() => sortArray(this_col)}>
        <svg fill="none"
            width="10"
            height="10"
        >
            {#if sort_col !== this_col}
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
</th>

<style lang="postcss">
    th {
        @apply border
        border-solid
        border-gray-300
        text-left
        p-4;
    }
</style>
