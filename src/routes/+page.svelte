<script lang="ts">
    import RepoCard from '$lib/components/RepoCard.svelte';
    import { overview } from '$lib/scripts/RepoInfos.ts';

    let repo_overviews: Array<Object>;
    let date_fetched: string;

    overview.subscribe((value) => {
        repo_overviews = value.repo_overviews;
        date_fetched = value.date_fetched;
    });

    async function getOverview() {
        // Check if we already got it
        if (repo_overviews.length !== 0) {
            return;
        }

        const response = await fetch('/json/overview.json');
        const json = await response.json();

        date_fetched = json['Date Fetched'];
        delete json['Date Fetched'];

        for (const repo of Object.keys(json)) {
            repo_overviews.push(json[repo]);
        }

        overview.set({
            'repo_overviews': repo_overviews,
            'date_fetched': date_fetched
        });
    }
</script>

<!-- Get a list of repos from somewhere and fetch this info about these repos
 then make the list of data sortable by last commit date, last ci pass date,
 and number of stars -->
<div id='container'>
    {#await getOverview()}
        ...getting overview
    {:then}
        <table class="centered">
            <tr>
                <RepoCard this_col={'Repo Owner'}/>
                <RepoCard this_col={'Repo Name'}/>
                <RepoCard this_col={'Stars'}/>
                <RepoCard this_col={'Commit Date'}/>
                <RepoCard this_col={'Commit Status'}/>
            </tr>
            {#each repo_overviews as repo_overview}
                <tr>
                    <td>{repo_overview['Repo Owner']}</td>
                    <td><a href="repo?owner={repo_overview['Repo Owner']}&repo_name={repo_overview['Repo Name']}">{repo_overview['Repo Name']}</a></td>
                    <td>{repo_overview['Stars']}</td>
                    <td>{repo_overview['Commit Date']}</td>
                    <td>{repo_overview['Commit Status']}</td>
                </tr>
            {/each}
        </table>
        <p>
            date fetched:&nbsp;
            {#if date_fetched !== ''}
                {date_fetched}
            {:else}
                error
            {/if}
        </p>
    {/await}
</div>

<style lang="postcss">
    #container {
        @apply max-w-7xl
        m-auto;
    }

    .centered {
        @apply mx-auto;
    }

    table, td {
        @apply border
        border-solid
        border-gray-300
        text-left;
    }

    td {
        @apply p-4;
    }

    p {
        @apply text-center;
    }
</style>
