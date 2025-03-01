<script lang='ts'>
    import type { Snippet } from "svelte";

    let { children }: {children: Snippet} = $props();

    let clientHeight = $state(0);
    let wrapper: HTMLDivElement;

    $effect(() => {
        wrapper.style.setProperty('--lz-height', clientHeight + 'px');
    })


</script>

<div bind:this={wrapper} class='overflow-y-clip overflow-x-visible lazy mx-auto'>
    <div bind:clientHeight>
        {@render children()}
    </div>
</div>

<style lang='postcss'>
    .lazy {
        height: var(--lz-height);
        width: 100%;
        transition: height .3s ease-in-out, width .3s ease-in-out;
    }
</style>