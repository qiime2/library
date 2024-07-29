<script lang="ts">
    import "../../app.css";

    import CutOffList from '$lib/components/CutOffList.svelte';

    export let repo_overview: Object;

    function getStatusColor() {
        let text_format = 'text-white rounded px-2 font-bold ';

        if (repo_overview['Commit Status'] === 'passed') {
            text_format += 'bg-green-500';
        } else if (repo_overview['Commit Status'] === 'failed') {
            text_format += 'bg-red-500';
        } else if (repo_overview['Commit Status'] === 'in progress') {
            text_format += 'bg-yellow-500';
        } else {
            // If we get here then... Who knows what we have. Just display the
            // text
            return '';
        }

        return text_format;
    }
</script>

<div class='repo-card'>
    <h1>
        <a href="repo?owner={repo_overview['Repo Owner']}&repo_name={repo_overview['Repo Name']}">
            {repo_overview['Repo Owner']}/{repo_overview['Repo Name']}</a>
    </h1>
    <p class='description'>
        {repo_overview['Short Description']}
    </p>
    <div><span class='font-bold'>NOTE: </span>Not all distros are necessarily supported for all epochs</div>
    <div class='container mb-4'>
        <div class='flex mr-auto'>Supported Distros:<CutOffList list={repo_overview['Distros']} collapseNumber={2} /></div>
        <div class='flex ml-auto'>Supported Epochs:<CutOffList list={repo_overview['Epochs']} collapseNumber={2} /></div>
    </div>
    <div class='container'>
        <div class='flex mr-auto'>
            <svg height="24" width="160" xmlns="http://www.w3.org/2000/svg" stroke-width="1.5" stroke="currentColor">
                <path fill="none" stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                <text stroke-width="1" x="30" y="18">{repo_overview['Stars']}</text>
            </svg>
        </div>
        <div class='flex mx-auto'>Latest Commit Date: {repo_overview['Commit Date']}</div>
        <div class='flex ml-auto'>Latest Commit Status:&nbsp;
            <span class='{getStatusColor()}'>
                {repo_overview['Commit Status']}
            </span>
        </div>
    </div>
</div>

<style lang="postcss">
    .repo-card {
        box-shadow: rgb(153, 153, 153) 2px 2px 2px;
        @apply max-w-7xl
        border
        border-solid
        rounded-lg
        border-gray-300
        my-5
        mx-auto
        p-4;
    }

    .link {
        @apply text-xl;
    }

    .description {
        @apply py-2
    }

    .container {
        @apply flex
        mx-auto;
    }

    h1 {
        @apply text-2xl
        font-bold;
    }
</style>
