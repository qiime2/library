<script lang="ts">
    export let list: Array<string>;
    export let collapseNumber: number;

    let isCollapsed: Boolean = true;

    function displayList(): Array<string> {
        if (isCollapsed && list.length > collapseNumber + 1) {
            return list.slice(0, collapseNumber);
        }

        return list.slice(0, -1);
    }
</script>

{#key isCollapsed}
    {#each displayList() as element}
        &nbsp;{element},
    {/each}
    {#if !(isCollapsed && list.length > collapseNumber + 1)}
        {list.slice(-1)}
    {/if}
    {#if list.length > collapseNumber + 1}
        {#if isCollapsed}
            <span on:click={() => (isCollapsed = !isCollapsed)}>&nbsp;...</span>
        {:else}
            <span on:click={() => (isCollapsed = !isCollapsed)}>&nbsp;&lt;-</span>
        {/if}
    {/if}
{/key}
