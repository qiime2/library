<script lang="ts">
    import "../../app.css";

    import { overview } from "$lib/scripts/OverviewStore";
    import { sort_info } from "$lib/scripts/SortStore.ts";

    let sort_col: string;
    let sort_descending: boolean;

    sort_info.subscribe((sort_values) => {
        sort_col = sort_values.sort_col;
        sort_descending = sort_values.sort_descending;
    });

    let repo_overviews: Object[];
    let filter: string;
    let filtered_overviews: Object[];
    let date_fetched: string;

    overview.subscribe((value) => {
        repo_overviews = value.repo_overviews;
        filter = value.filter;
        filtered_overviews = value.filtered_overviews;
        date_fetched = value.date_fetched;
    });

    const columns = ["Repo Owner", "Repo Name", "Stars", "Commit Date", "Commit Status"];

    function sortArray(this_col: string) {
        if (this_col === sort_col) {
            sort_descending = !sort_descending;
        } else {
            sort_col = this_col;
            sort_descending = true;
        }

        sort_info.set({
            sort_col: sort_col,
            sort_descending: sort_descending,
        });

        function compareElements(a: Object, b: Object) {
            const A = a[this_col as keyof Object];
            const B = b[this_col as keyof Object];

            if (A < B) {
                return sort_descending === true ? 1 : -1;
            } else if (A > B) {
                return sort_descending === true ? -1 : 1;
            }

            return 0;
        }

        if (repo_overviews !== undefined) {
            overview.set({
                repo_overviews: repo_overviews,
                filter: filter,
                filtered_overviews: filtered_overviews.sort(compareElements),
                date_fetched: date_fetched
            });
        }
    }
</script>

<div id="buttons">
    {#each columns as column}
        <div class="sortButton">
            <button on:click={() => sortArray(column)}>
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