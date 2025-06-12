<script lang='ts'>
    import BookCard from '$lib/components/cards/BookCard.svelte';
    import Carousel from '$lib/widgets/Carousel.svelte';

    let { data } = $props();
</script>

<div class="max-width">
<header class="prose prose-sm md:prose-base lg:prose-lg mt-10 mx-2">
    <h1>The Stacks</h1>
</header>
</div>

<article class='pt-10 mb-5'>
    <Carousel entries={data.distros} colsize='12.88rem' expand={true} controls={false}
        title='Distribution Documentation' href='/books'>
        {#snippet card(distro: any)}
        <BookCard {...distro.book} />
        {/snippet}
    </Carousel>
</article>

<article class='pt-10 mb-5'>
    <Carousel entries={data.plugins} colsize='12.88rem' expand={true} controls={false}
        title='Plugin Documentation' href='/books'>
        {#snippet card(book: any)}
        <BookCard {...book} />
        {/snippet}
    </Carousel>
</article>

<article class='pt-10 mb-5'>
    <Carousel entries={data.books} colsize='12.88rem' expand={true} controls={false}
        title='Framework Documentation' href='/books'>
        {#snippet card(book: any)}
        <BookCard {...book} />
        {/snippet}
    </Carousel>
</article>


<article class='pt-10 mb-5'>
    <Carousel entries={data.tutorials} colsize='12.88rem' expand={true} controls={false}
        title='Dataset-focused Tutorials' href='/books'>
        {#snippet card(book: any)}
        <BookCard {...book} />
        {/snippet}
    </Carousel>
</article>