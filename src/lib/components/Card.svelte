<script lang="ts">
    import type { Snippet } from "svelte";

    let { href, children }: {href?: string, children: Snippet} = $props();
</script>

{#snippet card(hover: boolean)}
<div class='bg-white border border-[#ffffff29] w-80 relative flex flex-col
            intersect-once intersect-quarter intercept-no-queue rounded-lg
            shadow-[0_4px_10px_rgba(0,0,0,0.1)] backdrop-blur p-6 my-6'
     class:hover:shadow-[0_4px_10px_rgba(0,0,0,0.3)]={hover}>
    {@render children()}
</div>
{/snippet}

{#if href}
<a class='flex' href={href}>{@render card(true)}</a>
{:else}
{@render card(false)}
{/if}