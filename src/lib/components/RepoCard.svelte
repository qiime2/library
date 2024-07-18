<script lang="ts">
    import "../../app.css";

    import CutOffList from '$lib/components/CutOffList.svelte';

    export let repo_overview: Object;
</script>

<div class='repo-card'>
    <a href="repo?owner={repo_overview['Repo Owner']}&repo_name={repo_overview['Repo Name']}">{repo_overview['Repo Owner']}/{repo_overview['Repo Name']}</a>
    <div>
        <svg height="16" width="160">
            <!-- Put some kinda svg star here maybe heroicons -->
            <text x="20" y="14">{repo_overview['Stars']}</text>
        </svg>
    </div>
    <div>Latest Commit Date: {repo_overview['Commit Date']}</div>
    <div>Latest Commit Status: {repo_overview['Commit Status']}</div>
    <div>NOTE: Not all distros are necessarily supported for all epochs</div>
    <div>Supported Distros: <CutOffList list={repo_overview['Distros']} collapseNumber={3} /></div>
    <div>Supported Epochs: <CutOffList list={repo_overview['Epochs']} collapseNumber={3} /></div>
</div>

<style lang="postcss">
    .repo-card {
        box-shadow: rgb(153, 153, 153) 2px 2px 2px;
        @apply border
        border-solid
        rounded-lg
        border-gray-300
        max-w-7xl
        my-5
        mx-auto
        p-4;
    }
</style>
