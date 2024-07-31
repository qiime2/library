<script lang="ts">
    import "../app.css";

    import { onDestroy } from "svelte";

    import RepoCard from "$lib/components/RepoCard.svelte";
    import SortButtons from "$lib/components/SortButtons.svelte";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import { overview } from "$lib/scripts/OverviewStore";
    import { cards } from "$lib/scripts/CardsStore";
    import { sort_info } from "$lib/scripts/SortStore.ts";
    import { sortOverviews } from "$lib/scripts/util";
    import FilterButton from "$lib/components/FilterButton.svelte";

    let repo_overviews: Array<Object>;
    let search_filter: string;
    let filtered_overviews: Array<Object>;
    let date_fetched: string;
    let distros: Array<string> = [];
    let epochs: Array<string> = [];
    let filter_distros: Array<string> = [];
    let filter_epochs: Array<string> = [];

    overview.subscribe((value) => {
        repo_overviews = value.repo_overviews;
        search_filter = value.search_filter;
        filtered_overviews = value.filtered_overviews;
        date_fetched = value.date_fetched;
        distros = value.distros,
        epochs = value.epochs,
        filter_distros = value.filter_distros,
        filter_epochs = value.filter_epochs
    });

    let cards_per_page: number;
    let current_page: number;
    let num_pages: number;

    cards.subscribe((value) => {
        cards_per_page = value.cards_per_page;
        current_page = value.current_page;
        num_pages = value.num_pages;
    })

    let sort_col: string;
    let sort_descending: boolean;

    sort_info.subscribe((sort_values) => {
        sort_col = sort_values.sort_col;
        sort_descending = sort_values.sort_descending;
    });

    // Update our info when we leave so we can snag it when we come back
    onDestroy(() => {
        cards.set({
            cards_per_page: cards_per_page,
            current_page: current_page,
            num_pages: num_pages
        })
    });

    async function getOverview() {
        // Check if we already got it
        if (repo_overviews.length !== 0) {
            return;
        }

        const response = await fetch("/json/overview.json");
        const json = await response.json();

        for (const repo of Object.keys(json["Repos"])) {
            repo_overviews.push(json["Repos"][repo]);
        }

        date_fetched = json["Date Fetched"];
        distros = json["Distros"];
        epochs = json["Epochs"];

        repo_overviews = sortOverviews(repo_overviews, sort_col, sort_descending);
        overview.set({
            repo_overviews: repo_overviews,
            search_filter: "",
            filtered_overviews: repo_overviews,
            date_fetched: date_fetched,
            distros: distros,
            epochs: epochs,
            filter_distros: filter_distros,
            filter_epochs: filter_epochs
        });

        num_pages = Math.ceil(filtered_overviews.length / cards_per_page);
    }

    function getCurrentPage() {
        return filtered_overviews.slice(
            (current_page - 1) * cards_per_page,
            current_page * cards_per_page,
        );
    }

    function handleChange(event: Event) {
        const inputElement = document.getElementById(
            "setCardsPerPage",
        ) as HTMLInputElement;

        const currentVal = parseInt(inputElement.value);

        // If we have something less than 1 (should only ever be 0) or a NaN
        // then set this back to what it was before
        if (currentVal < 1 || currentVal !== currentVal) {
            inputElement.value = String(cards_per_page);
        } else {
            cards_per_page = currentVal;
        }
    }

    $: {
        const _num_pages = Math.ceil(filtered_overviews.length / cards_per_page);

        if (_num_pages === 0) {
            num_pages = 1;
        } else {
            num_pages = _num_pages;
        }

        // The num_pages could drop below the current page we're on. We don't
        // want to leave ourselves on some weird empty non page
        if (current_page > num_pages) {
            current_page = num_pages;
        }
    }
</script>

<!-- Get a list of repos from somewhere and fetch this info about these repos
 then make the list of data sortable by last commit date, last ci pass date,
 and number of stars -->
<div id="container">
    {#await getOverview()}
        ...getting overview
    {:then}
        <div id="topBar">
            <SearchBar />
            <SortButtons />
        </div>
        <div id="gridContainer">
            <div class="h-fit">
                <span class="font-bold">
                    Distros:
                </span>
                <br/>
                {#each distros as distro}
                    <FilterButton this_filter={distro} filter_type="Distro"/>
                {/each}
                <br/>
                <span class="font-bold">
                    Epochs:
                </span>
                <br/>
                {#each epochs as epoch}
                    <FilterButton this_filter={epoch} filter_type="Epoch" />
                {/each}
            </div>
            <div>
                {#key [cards_per_page, filtered_overviews, current_page]}
                    {#each getCurrentPage() as repo_overview}
                        <RepoCard {repo_overview} />
                    {/each}
                {/key}
            </div>
        </div>
        <div id="bottomBar">
            <div style="margin-right: auto">
                <button
                        on:click={() => {
                            if (current_page > 1) {
                                current_page--;
                            }
                        }}
                    >
                    <svg fill="none"
                        width="10"
                        height="10">
                        <path
                            stroke-width="3"
                            stroke="rgb(119, 119, 119)"
                            d="m8 0L3 5a0,2 0 0 1 1,1M3 5L8 10"/>
                    </svg>
                </button>
                {current_page}/{num_pages}
                <button
                    on:click={() => {
                        if (current_page < num_pages) {
                            current_page++;
                        }
                    }}
                >
                    <svg fill="none"
                        width="10"
                        height="10">
                        <path
                            stroke-width="3"
                            stroke="rgb(119, 119, 119)"
                            d="m3 0L8 5a0,2 0 0 1 1,1M8 5L3 10"/>
                    </svg>
                </button>
            </div>
            Cards per page:&nbsp;<input
                id="setCardsPerPage"
                type="number"
                value={cards_per_page}
                min="1"
                on:change={handleChange}
            />
        </div>
        <p id="date">
            Date Updated:&nbsp;
            {#if date_fetched !== ""}
                {date_fetched}
            {:else}
                error
            {/if}
        </p>
    {/await}
</div>

<style lang="postcss">
    #container {
        margin-top: 70px;
        @apply max-w-screen-2xl
        mx-auto;
    }

    #date {
        @apply text-center;
    }

    #topBar {
        display: flex;
        border-bottom: 2px solid lightgrey;
        @apply border-gray-400
        pb-4
        mb-4;
    }

    #bottomBar {
        display: flex;
        border-top: 2px solid;
        @apply border-gray-400
        pt-4
        mt-4;
    }

    #setCardsPerPage {
        @apply border
        border-solid
        rounded
        border-gray-300
        px-2;
    }

    #gridContainer {
        @apply grid
        lg:grid-cols-[15%_85%];
    }

    .filterButton {
        @apply my-1
        mr-1
        p-1
        border
        border-gray-300
        border-solid
        rounded;
    }
</style>
