<script lang='ts'>
    import VideoCard from "$lib/components/VideoCard.svelte";
    import Carousel from "$lib/widgets/Carousel.svelte";
    import Card from '$lib/components/Card.svelte'

    import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>


<div class="max-width">
    <article class='prose py-10'>
        <h1 class='text-[#1a414c]'>Welcome to the QIIME 2 Library</h1>
    </article>
</div>
<article class='bg-gray-50 border-y border-y-gray-200 pb-10 mb-5'>
    <header class='max-width'>
        <div class='prose prose-lg pt-5 mt-5 -mb-4'>
            <h2><a href='/plugin' class='text-[#2a414c]'>Recently Updated Plugins</a></h2>
        </div>
    </header>
    <Carousel entries={data.plugins} expand={true}>
        {#snippet card(plugin: any)}
        <Card href={`/plugin/${plugin['Plugin Owner']}/${plugin['Plugin Name']}`}>
                <div class='mx-auto inline-block'>
                    <div class="flex flex-col w-max font-bold">
                        <h3 class='text-2xl text-[#1a414c] mx-2 inline'>{plugin['Plugin Name']}</h3>
                        <h4 class='text-sm text-gray-600 mx-2 inline place-self-center'>{plugin['Plugin Owner']}</h4>
                    </div>
                </div>
                <p class='prose prose-sm mt-2 text-gray-600'>{plugin['Description']}</p>
        </Card>
        {/snippet}
        {#snippet finalCard()}
        <Card href={'/plugin'}>
            <div class='m-auto mr-1'>
                <h3 class='text-2xl text-[#2a414c] mx-2 font-bold text-right'>Discover more</h3>
                <p class='prose prose-sm mt-2 text-gray-600 pb-5 text-right'>Find new plugins and methods.</p>
            </div>
        </Card>
        {/snippet}
    </Carousel>
</article>

<article class='pb-10'>
    <header class='max-width'>
        <div class='prose prose-lg pt-5 -mb-4'>
            <h2><a href='/video' class='text-[#2a414c]'>Latest Videos</a></h2>
        </div>
    </header>
    <Carousel entries={data.videos} expand={true}>
        {#snippet card(video: any)}
            <VideoCard {video}/>
        {/snippet}
        {#snippet finalCard()}
            <div class='w-80 flex flex-col my-4'>
                <a class='watch-more-anchor relative' href='/video'>
                    <div class='bg-gray-50 border border-gray-200 rounded-2xl object-cover object-center h-52 flex'>
                        <div class="m-auto mr-5">
                            <h3 class='text-2xl text-[#2a414c] font-bold text-right '><span class="watch-more px-4 py-1.5">Watch more</span></h3>
                            <p class='prose prose-sm mt-2 text-gray-600 pb-5 text-right'>Find recorded workshops and videos.</p>
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
        @apply bg-red-600 text-white rounded-xl;
    }
</style>