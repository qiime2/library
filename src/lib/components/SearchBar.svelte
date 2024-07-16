<script lang="ts">
    export let searchFilter: string;

    function searchRepoOverviews(event: Event) {
    }
</script>

<div id="searchBar">
    Search: <input id="searchInput" placeholder="repo name" on:input={searchRepoOverviews} />
</div>

<style lang="postcss">
    #searchBar {
        margin-right: auto;
        margin-top: auto;
    }
</style>