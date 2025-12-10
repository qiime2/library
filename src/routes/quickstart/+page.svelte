<script lang='ts'>
    import DistroCard from '$lib/components/cards/DistroCard.svelte';

    let {data} = $props();
</script>
<div class="max-width">
    <article>
        <header class="prose prose-sm md:prose-base lg:prose-lg mt-10 max-w-4xl">
            <h1>Installation</h1>
            <p>
                The pages linked below provide conda and docker-based installation instructions for our base distributions, as well as the list of plugins built into each distribution, and links to relevant documentation. 
                Other plugins can be installed in the resulting environments by following the instructions on the plugin pages. 
                Plugin pages will provide information on which distribution(s) they are compatible with. 
            </p>
        </header>
        <div class="not-prose flex flex-wrap gap-6">
            {#each data.distros as distro}
            <DistroCard href='/quickstart/{distro.name}' {...distro} />
            {/each}
        </div>
    </article>
    <div class='pb-10'><p>(Select one the of cards above for installation instructions and more.)</p></div>
</div>
