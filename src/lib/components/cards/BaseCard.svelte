<script lang="ts">
    import type { Snippet } from "svelte";

    let { href, classes, children }: {href?: string, classes?: string, children: Snippet} = $props();
</script>

{#snippet card(hover: boolean)}
<div class={`bg-white border border-[#ffffff29] w-80 relative flex flex-col rounded-lg
            shadow-[0_4px_10px_rgba(0,0,0,0.1)] backdrop-blur p-4 sm:p-6 my-4 sm:my-6 ${classes || ''}`}
     class:hover:shadow-[0_4px_10px_rgba(0,0,0,0.3)]={hover}>
    {@render children()}
</div>
{/snippet}

{#if href}
<a class='flex' href={href}>{@render card(true)}</a>
{:else}
{@render card(false)}
{/if}