<script lang="ts">
    import CutOffList from '$lib/components/CutOffList.svelte';

    export let repo_overview: Object;

    $: console.log(repo_overview)
</script>

<div class='repo-card'>
    {repo_overview['Repo Owner']}
    <a href="repo?owner={repo_overview['Repo Owner']}&repo_name={repo_overview['Repo Name']}">{repo_overview['Repo Name']}</a>
    {repo_overview['Stars']}
    {repo_overview['Commit Date']}
    {repo_overview['Commit Status']}
    <!-- {repo_overview['Distros']}
    {repo_overview['Epochs']} -->
    <CutOffList list={repo_overview['Distros']} collapseNumber={3} />
    <CutOffList list={repo_overview['Epochs']} collapseNumber={3} />
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