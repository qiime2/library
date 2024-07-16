<script lang="ts">
    import { onDestroy } from 'svelte';

    import RepoCard from "$lib/components/RepoCard.svelte";
    import SortButtons from "$lib/components/SortButtons.svelte";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import { overview } from "$lib/scripts/OverviewStore";
    import { cards } from "$lib/scripts/CardsStore";

    let repo_overviews: Array<Object>;
    let filter: string;
    let filtered_overviews: Array<Object>;
    let date_fetched: string;

    overview.subscribe((value) => {
        repo_overviews = value.repo_overviews;
        filter = value.filter;
        filtered_overviews = value.filtered_overviews;
        date_fetched = value.date_fetched;
    });

    let cards_per_page: number;
    let current_page: number;
    let num_pages: number;

    cards.subscribe((value) => {
        cards_per_page = value.cards_per_page;
        current_page = value.current_page;
        num_pages = value.num_pages;
    })

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
            filtered_overviews = repo_overviews;
            return;
        }

        const response = await fetch("/json/overview.json");
        const json = await response.json();

        date_fetched = json["Date Fetched"];
        delete json["Date Fetched"];

        for (const repo of Object.keys(json)) {
            repo_overviews.push(json[repo]);
        }

        overview.set({
            repo_overviews: repo_overviews,
            filter: "",
            filtered_overviews: repo_overviews,
            date_fetched: date_fetched,
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
            num_pages = Math.ceil(filtered_overviews.length / cards_per_page);
        }

        // The num_pages could drop below the current page we're on. We don't
        // want to leave ourselves on some weird empty non page
        if (current_page > num_pages) {
            current_page = num_pages;
        }
    }

    $: {
        const _num_pages = Math.ceil(filtered_overviews.length / cards_per_page);

        if (_num_pages === 0) {
            num_pages = 1;
        } else {
            num_pages = _num_pages;
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
        <div id="columns">
            <SearchBar />
            <SortButtons />
        </div>
        {#key [cards_per_page, filtered_overviews, current_page]}
            {#each getCurrentPage() as repo_overview}
                <RepoCard {repo_overview} />
            {/each}
        {/key}
        <button
            on:click={() => {
                if (current_page > 1) {
                    current_page--;
                }
            }}
        >
            &lt;-
        </button>
        {current_page}/{num_pages}
        <button
            on:click={() => {
                if (current_page < num_pages) {
                    current_page++;
                }
            }}
        >
            -&gt;
        </button>
        <p>
            date fetched:&nbsp;
            {#if date_fetched !== ""}
                {date_fetched}
            {:else}
                error
            {/if}
        </p>
        Cards per page:<input
            id="setCardsPerPage"
            type="number"
            value={cards_per_page}
            min="1"
            on:change={handleChange}
        />
    {/await}
</div>

<style lang="postcss">
    #container {
        margin-top: 70px;
        @apply max-w-7xl
        mx-auto;
    }

    #columns {
        display: flex;
        border-bottom: 2px solid lightgrey;
        @apply pb-4
        mb-4
    }

    #searchBar {
        margin-right: auto;
        margin-top: auto;
    }
</style>
