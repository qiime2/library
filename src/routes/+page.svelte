<script lang='ts'>
    import Carousel from "$lib/widgets/Carousel.svelte";
    import Card from '$lib/components/cards/BaseCard.svelte'
    import VideoCard from "$lib/components/cards/VideoCard.svelte";

    import type { PageProps } from './$types';
    import PluginCard from "$lib/components/cards/PluginCard.svelte";
    import DistroCard from "$lib/components/cards/DistroCard.svelte";
    import BookCard from "$lib/components/cards/BookCard.svelte";

    let { data }: PageProps = $props();
    const toExpand = 700;
    let clientWidth = $state(toExpand + 1);
</script>


<article class='max-width' bind:clientWidth>
    <div class="prose lg:prose-lg max-w-4xl mt-10 mb-5 pb-10">
        <h1 class='text-[#1a414c]'>Welcome to the QIIME 2 Library</h1>
        <p>
            This site is the hub for community distributed software, tutorials, and resources.<br/>
            You can learn how to add your own plugins to this site <a href="https://develop.qiime2.org/en/latest/plugins/how-to-guides/distribute-on-library.html">here</a>.
        </p>
    </div>
</article>

<article class='bg-gray-50 border-y border-y-gray-200 py-10 mb-5'>
    <Carousel entries={data.plugins} expand={clientWidth > toExpand}
        title="Recently Updated Plugins" href="/plugins">
        {#snippet card(plugin: any)}
        <PluginCard {...plugin} />
        {/snippet}
        {#snippet finalCard()}
        <Card href={'/plugins'} classes='more-anchor'>
            <div class='m-auto mr-1'>
                <h3 class='text-2xl text-[#2a414c] font-bold text-right'><span class="more px-4 py-1.5">Discover more</span></h3>
                <p class='prose prose-sm mt-2 text-gray-600 pb-5 text-right pr-4'>Find new plugins and methods.</p>
            </div>
        </Card>
        {/snippet}
    </Carousel>
</article>

<article class='py-10 mb-5'>
    <Carousel entries={data.distros} expand={clientWidth > toExpand} controls={clientWidth <= toExpand}
        title="Base Distributions" href="/quickstart">
        {#snippet card(distro: any)}
        <DistroCard href="/quickstart/{distro.name}" {...distro} />
        {/snippet}
    </Carousel>
</article>

<article class='pb-10 mb-5'>
    <Carousel entries={data.books} expand={clientWidth > toExpand} colsize='12.88rem'
        title='Books and Tutorials' href='/books'>
        {#snippet card(book: any)}
        <BookCard {...book} />
        {/snippet}
        {#snippet finalCard()}
        <Card href='/books' classes='!p-0 !border-gray-200 !w-[12.75rem] !rounded-sm !bg-gray-50 hover:!bg-white more-anchor transition-colors'>
                <div class='m-auto px-2'>
                    <h3 class='text-2xl text-[#2a414c] font-bold text-right'><span class="more px-4 py-1.5">Read more</span></h3>
                    <p class='prose prose-sm mt-2 text-gray-600 pb-5 text-right pr-4'>Find books and tutorials.</p>
                </div>
        </Card>
        {/snippet}
    </Carousel>
</article>

<article class='pb-10'>
    <Carousel entries={data.videos} expand={clientWidth > toExpand}
        title="Latest Videos" href="/videos">
        {#snippet card(video: any)}
            <VideoCard {video}/>
        {/snippet}
        {#snippet finalCard()}
            <div class='w-80 flex flex-col my-4'>
                <a class='watch-more-anchor relative' href='/videos'>
                    <div class='bg-gray-50 border hover:bg-white border-gray-200 rounded-2xl object-cover object-center h-52 flex hover:shadow-md'>
                        <div class="m-auto mr-5">
                            <h3 class='text-2xl text-[#2a414c] font-bold text-right '><span class="watch-more px-4 py-1.5">Watch more</span></h3>
                            <p class='prose prose-sm mt-2 text-gray-600 pb-5 text-right pr-4'>Find recorded workshops and videos.</p>
                        </div>
                    </div>
                </a>
            </div>
        {/snippet}
    </Carousel>
</article>

<style lang='postcss'>
    @reference 'tailwindcss';
    .watch-more-anchor:hover .watch-more {
        @apply bg-red-600 text-white rounded-xl transition-colors;
    }

    .more-anchor:hover .more {
        @apply bg-[#2a414c] text-white rounded-xl;
    }
</style>