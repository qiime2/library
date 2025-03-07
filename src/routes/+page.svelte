<script lang='ts'>
    import VideoCard from "$lib/components/VideoCard.svelte";
    import Carousel from "$lib/widgets/Carousel.svelte";
    import Card from '$lib/components/Card.svelte'

    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
    const toExpand = 700;
    let clientWidth = $state(toExpand + 1);
</script>


<article class='max-width' bind:clientWidth>
    <div class="prose lg:prose-lg max-w-4xl mt-10 mb-5 pb-10">
            <h1 class='text-[#1a414c]'>Welcome to the QIIME 2 Library</h1>
            <p>This site is the hub for community distributed software, tutorials, and resources.</p>
    </div>
</article>

<article class='bg-gray-50 border-y border-y-gray-200 pb-10 mb-5'>
    <header class='max-width'>
        <div class='prose prose-sm sm:prose-lg pt-5 mt-5 -mb-4'>
            <h2><a href='/plugins' class='text-[#2a414c]'>Recently Updated Plugins</a></h2>
        </div>
    </header>
    <Carousel entries={data.plugins} expand={clientWidth > toExpand}>
        {#snippet card(plugin: any)}
        <Card href={`/plugins/${plugin.owner}/${plugin.name}`}>
                <div class='mx-auto inline-block'>
                    <div class="flex flex-col w-max font-bold">
                        <h3 class='text-2xl text-[#1a414c] mx-2 inline'>{plugin.name}</h3>
                        <h4 class='text-sm text-gray-600 mx-2 inline place-self-center'>{plugin.owner}</h4>
                    </div>
                </div>
                <p class='prose prose-sm mt-2 text-gray-600'>{plugin.description}</p>
        </Card>
        {/snippet}
        {#snippet finalCard()}
        <Card href={'/plugin'} classes='more-anchor'>
            <div class='m-auto mr-1'>
                <h3 class='text-2xl text-[#2a414c] font-bold text-right'><span class="more px-4 py-1.5">Discover more</span></h3>
                <p class='prose prose-sm mt-2 text-gray-600 pb-5 text-right pr-4'>Find new plugins and methods.</p>
            </div>
        </Card>
        {/snippet}
    </Carousel>
</article>

<article class='pb-10 mb-5'>
    <header class='max-width'>
        <div class='prose prose-sm sm:prose-lg pt-5 mt-5 -mb-4 sm:mb-2'>
            <h2><a href='/plugin' class='text-[#2a414c]'>Base Distributions</a></h2>
        </div>
    </header>
    <Carousel entries={data.distros} expand={clientWidth > toExpand} controls={clientWidth <= toExpand}>
        {#snippet card(distro: any)}
        <Card href='#' classes='!bg-gray-50 !border-gray-200 !p-0'>
            <h1 class='text-center text-xl font-bold text-[#2a414c] pt-4 pb-2'>{distro.title}</h1>
            <p class='prose prose-sm mt-2 text-gray-600 min-h-32 bg-white border-t border-t-gray-200 p-6 rounded-b-lg h-full'>{distro.description}</p>
        </Card>
        {/snippet}
    </Carousel>
</article>

<article class='pb-10 mb-5'>
    <header class='max-width'>
        <div class='prose prose-sm sm:prose-lg pt-5 mt-5 -mb-4'>
            <h2><a href='/book' class='text-[#2a414c]'>Books and Tutorials</a></h2>
        </div>
    </header>
    <Carousel entries={data.books} expand={clientWidth > toExpand} colsize='12.88rem'>
        {#snippet card(book: any)}
        <Card href={book.url} classes='!p-0 !border-gray-200 !border-l-0 !w-[12.89rem] !rounded-r-sm !bg-gray-50'>
            <div class='flex rounded-lg'>
                <div class='bg-gray-600 text-white h-60 w-3 rounded-l-lg'></div>
                <div class='w-full'>
                    <h2 class='text-[#2a414c] font-bold text-center px-4 pt-4 tracking-wider'>{book.title}</h2>
                    <div class='text-center decoration-wavy underline decoration-gray-400 border-y border-y-gray-400 pb-3.5 mt-5 w-max mx-auto text-xs leading-0'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    {#if book.description}
                    <div class='flex absolute top-0 h-full bg-white opacity-0 hover:opacity-100 transition-opacity p-4 text-sm text-gray-600 pl-5 rounded-r-sm leading-tight'><span class="my-auto block pb-8">{book.description}</span></div>
                    {/if}
                </div>
            </div>
        </Card>
        {/snippet}
        {#snippet finalCard()}
        <Card href='/book' classes='!p-0 !border-gray-200 !w-[12.75rem] !rounded-sm !bg-gray-50 hover:!bg-white more-anchor transition-colors'>
                <div class='m-auto px-2'>
                    <h3 class='text-2xl text-[#2a414c] font-bold text-right'><span class="more px-4 py-1.5">Read more</span></h3>
                    <p class='prose prose-sm mt-2 text-gray-600 pb-5 text-right pr-4'>Find books and tutorials.</p>
                </div>
        </Card>
        {/snippet}
    </Carousel>
</article>

<article class='pb-10'>
    <header class='max-width'>
        <div class='prose prose-sm sm:prose-lg pt-5 -mb-4'>
            <h2><a href='/video' class='text-[#2a414c]'>Latest Videos</a></h2>
        </div>
    </header>
    <Carousel entries={data.videos} expand={clientWidth > toExpand}>
        {#snippet card(video: any)}
            <VideoCard {video}/>
        {/snippet}
        {#snippet finalCard()}
            <div class='w-80 flex flex-col my-4'>
                <a class='watch-more-anchor relative' href='/video'>
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