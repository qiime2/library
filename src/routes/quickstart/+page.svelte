<script lang='ts'>
    import DistroCard from '$lib/components/cards/DistroCard.svelte';

    let {data} = $props();
</script>
<div class="max-width">
    <article>
        <header class="prose prose-sm md:prose-base lg:prose-lg mt-10 max-w-4xl">
            <h1>Getting Started with QIIME 2</h1>
            <p>
                QIIME 2 is distributed as a combination of domain/omic-specific
                <i>base distributions</i> and any additional plugins you may wish to install.
                Not all plugins are compatible (or necessarily useful) with all distributions, so compatibility with
                a base distribution is always indicated. The following base distributions are available:
            </p>
        </header>
        <div class="not-prose flex flex-wrap gap-6">
            {#each data.distros as distro}
            <DistroCard href='/quickstart/{distro.name}' {...distro} />
            {/each}
        </div>
    </article>
    <div class='pb-10'><p>(Select one the of cards above to learn more.)</p></div>
</div>