<script lang="ts">
    export let list: Array<string>;
    export let collapseNumber: number;

    function displayList(): Array<string> {
        if (list.length > collapseNumber + 1) {
            return list.slice(0, collapseNumber);
        }

        return list.slice(0, -1);
    }
</script>

{#each displayList() as element}
    &nbsp;{element},
{/each}
{#if list.length <= collapseNumber}
    {list.slice(-1)}
{/if}
{#if list.length > collapseNumber}
    ...
{/if}
