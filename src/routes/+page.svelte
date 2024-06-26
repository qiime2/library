<script lang="ts">
    import RepoCard from '$lib/components/RepoCard.svelte';
    import { repo_infos } from '$lib/scripts/RepoInfos.ts';

    let _repo_infos: Array<Object>;
    let date_fetched: string | undefined = undefined;

    repo_infos.subscribe((value) => {
        _repo_infos = value;
    });

    async function getOverview() {
        const response = await fetch('/json/overview.json');
        const json = await response.json();

        date_fetched = json['Date Fetched'];
        delete json['Date Fetched'];

        for (const repo of Object.keys(json)) {
            _repo_infos.push(json[repo]);
        }

        repo_infos.set(_repo_infos);
    }
</script>

<!-- Get a list of repos from somewhere and fetch this info about these repos
 then make the list of data sortable by last commit date, last ci pass date,
 and number of stars -->
 <div id='container'>
    {#await getOverview()}
        ...getting overview
    {:then}
        <table>
            <tr>
                <RepoCard this_col={'Repo Owner'}/>
                <RepoCard this_col={'Repo Name'}/>
                <RepoCard this_col={'Stars'}/>
                <RepoCard this_col={'Commit Date'}/>
                <RepoCard this_col={'Commit Status'}/>
            </tr>
            {#each _repo_infos as repo_info}
                <tr>
                    <td>{repo_info['Repo Owner']}</td>
                    <td><a href="repo?owner={repo_info['Repo Owner']}&repo_name={repo_info['Repo Name']}">{repo_info['Repo Name']}</a></td>
                    <td>{repo_info['Stars']}</td>
                    <td>{repo_info['Commit Date']}</td>
                    <td>{repo_info['Commit Status']}</td>
                </tr>
            {/each}
        </table>
        <p>
            date fetched:&nbsp;
            {#if date_fetched !== undefined}
                {date_fetched}
            {:else}
                error
            {/if}
        </p>
    {/await}
</div>

<style lang="postcss">
    #container {
        width: 50%;
        margin: auto;
    }

    table, th, td {
        @apply border
        border-solid
        border-gray-300
        text-left;
    }

    th, td {
        @apply p-4;
    }
</style>
