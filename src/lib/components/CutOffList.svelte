<script lang="ts">
    export let list: Array<string>;
    export let collapseNumber: number;

    let isCollapsed: Boolean = true;

    function displayList(): Array<string> {
        if (isCollapsed && list.length > collapseNumber) {
            return list.slice(0, collapseNumber);
        }

        return list.slice(0, -1);
    }
</script>

{#each displayList() as element}
    {element},&nbsp;
{/each}
{#if !(isCollapsed && list.length > collapseNumber)}
    {list.slice(-1)}
{/if}
{#if list.length > collapseNumber}
    {#if isCollapsed}
        <span on:click={() => isCollapsed = !isCollapsed}>...</span>
    {:else}
        <span on:click={() => isCollapsed = !isCollapsed}>&lt;-</span>
    {/if}
{/if}