<script lang='ts' generics="T">
    import LazyDiv from '$lib/components/LazyDiv.svelte';
    import type { Snippet } from 'svelte';
    interface Props<T> {
        entries: T[],
        card: Snippet<[T]>,
        finalCard?: Snippet,
        title?: string,
        url?: string,
        expand?: boolean
    }

    function toggleExpand() {
        expand = !expand;
    }

	let { entries, card, finalCard, title, url, expand = false }: Props<T> = $props();

</script>

<section>
    <header class="max-width flex">
        {#if title && url}
        <h2 class='text-xl overflow-visible'><a href={url} class='bg-[#2a414c] text-white hover:text-white hover:underline pb-1 pt-2 px-3 rounded-t'>{title}</a></h2>
        {/if}
        <div class='ml-auto'><button type="button" class='font-bold text-gray-600 cursor-pointer flex items-center' onclick={toggleExpand}>
            {#if expand}
            collapse
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
            {:else}
            expand
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            {/if}</button></div>
    </header>
    <div class="stream" class:expand>
        <LazyDiv>
            <div class='stream-grid grid grid-flow-col gap-6 overflow-x-scroll border-t-4 border-t-[#1a414c]' class:expand>
                {#each entries as entry}
                {@render card(entry)}
                {/each}
                {#if finalCard}
                {@render finalCard()}
                {/if}
            </div>
        </LazyDiv>
    </div>
</section>

<style lang='postcss'>
  .stream, .expand.stream:hover {
    max-width: calc(1110px + 17em);
    margin: 0 auto;
    padding: 0 0.67em;
  }
  .stream:hover {
    max-width: none;
    margin: 0;

  }
  .expand.stream-grid:hover {
    padding: 0;
  }

  .stream-grid:hover {
    padding: 0 max(calc(calc(100% - calc(1110px + 17em)) / 2 + .67em), .67em);
  }

  .expand {
    grid-auto-flow: unset;
    grid-auto-rows: 1fr;
    place-content: start;
    overflow-x: auto;
    grid-template-columns: repeat(auto-fill, 20rem);
  }
</style>