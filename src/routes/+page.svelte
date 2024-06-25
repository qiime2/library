<script lang="ts">
    let sortCol = '';
    let sortDescending = true;

    let date_fetched: string | undefined = undefined;
    let repo_infos: Array<Object> = [];

    async function getOverview() {
        const response = await fetch('/json/overview.json');
        const json = await response.json();

        date_fetched = json['date_fetched'];
        delete json['date_fetched'];

        for (const repo of Object.keys(json)) {
            repo_infos.push(json[repo]);
        }
    }

    function sortArray(sortBy: string) {
        if (sortBy === sortCol) {
            sortDescending = !sortDescending;
        } else {
            sortCol = sortBy;
            sortDescending = true;
        }

        function compareElements(a: Object, b: Object) {
            const A = a[sortBy as keyof Object];
            const B = b[sortBy as keyof Object];

            if (A < B) {
                return sortDescending === true ? 1 : -1;
            } else if (A > B) {
                return sortDescending === true ? -1 : 1;
            }

            return 0;
        }

        repo_infos = repo_infos.sort(compareElements);
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
                <th><button on:click={() => sortArray('owner')}>Repo Owner</button></th>
                <th><button on:click={() => sortArray('repo_name')}>Name</button></th>
                <th>Stars<button on:click={() => sortArray('stars')}>
                    <svg fill="none"
                        width="10"
                        height="10"
                    >
                        {#if sortCol !== 'stars'}
                            <path
                                stroke-width="3"
                                stroke="rgb(119, 119, 119)"
                                d="M0 5L10 5"
                            />
                        {:else if sortDescending}
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
                </button></th>
                <th><button on:click={() => sortArray('commit_date')}>Commit Date</button></th>
                <th><button on:click={() => sortArray('runs_status')}>Commit Status</button></th>
            </tr>
            {#each repo_infos as repo_info}
                <tr>
                    <td>{repo_info['owner']}</td>
                    <td><a href="repo?owner={repo_info['owner']}&repo_name={repo_info['repo_name']}">{repo_info['repo_name']}</a></td>
                    <td>{repo_info['stars']}</td>
                    <td>{repo_info['commit_date']}</td>
                    <td>{repo_info['runs_status']}</td>
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
