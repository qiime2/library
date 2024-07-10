<script lang="ts">
    import CutOffList from '$lib/components/CutOffList.svelte';

    export let repo_overview: Object;
</script>

<div class='repo-card'>
    <div>Owner: {repo_overview['Repo Owner']}</div>
    <div>Name: <a href="repo?owner={repo_overview['Repo Owner']}&repo_name={repo_overview['Repo Name']}">{repo_overview['Repo Name']}</a></div>
    <div># Stars: {repo_overview['Stars']}</div>
    <div>Latest Commit Date: {repo_overview['Commit Date']}</div>
    <div>Latest Commit Status: {repo_overview['Commit Status']}</div>
    <div>Supported Distros: <CutOffList list={repo_overview['Distros']} collapseNumber={3} /></div>
    <div>Supported Epochs: <CutOffList list={repo_overview['Epochs']} collapseNumber={3} /></div>
</div>

<style lang="postcss">
    .repo-card {
        box-shadow: rgb(153, 153, 153) 5px 5px 5px;
        @apply border
        border-solid
        rounded-lg
        border-gray-300
        max-w-7xl
        my-10
        mx-auto
        p-4;
    }
</style>