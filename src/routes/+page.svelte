<script lang="ts">
    let date_fetched: string = '';

    async function getOverview() {
        const response = await fetch('/json/overview.json');
        const json = await response.json();

        date_fetched = json['date_fetched'];
        delete json['date_fetched'];
        return json;
    }
</script>

<!-- Get a list of repos from somewhere and fetch this info about these repos
 then make the list of data sortable by last commit date, last ci pass date,
 and number of stars -->
<div id="container">
    {#await getOverview()}
        ...getting overview
    {:then overview}
        <table>
            <tr>
                <th>Repo Owner</th>
                <th>Repo Name</th>
                <th>Num Stars</th>
                <th>Last Commit Date</th>
                <th>Last Commit Status</th>
            </tr>
            {#each Object.keys(overview) as owner}
                {#each Object.keys(overview[owner]) as repo_name}
                    <tr>
                        <td>{owner}</td>
                        <td><a href="repo?owner={owner}&repo_name={repo_name}">{repo_name}</a></td>
                        <td>{overview[owner][repo_name]['stars']}</td>
                        <td>{overview[owner][repo_name]['commit_date']}</td>
                        <td>{overview[owner][repo_name]['runs_status']}</td>
                    </tr>
                {/each}
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
        width: 50%;
        margin: auto;
    }

    .card {
        border-style: solid;
        border-color: black;
        border: 2px;
    }
</style>
