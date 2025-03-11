<script lang='ts'>
    import BookCard from '$lib/components/cards/BookCard.svelte';
    import Carousel from '$lib/widgets/Carousel.svelte';

    let { data } = $props();
</script>

<div class="max-width">
<header class="prose prose-sm md:prose-base lg:prose-lg mt-10 mx-2">
    <h1>Books & Tutorials</h1>
</header>
</div>
<article class='pt-10 mb-5'>
    <Carousel entries={data.books} colsize='12.88rem' expand={true} controls={false}
        title='Books' href='/books'>
        {#snippet card(book: any)}
        <BookCard {...book} />
        {/snippet}
    </Carousel>
</article>

<article class='pt-10 mb-5'>
    <Carousel entries={data.distros} colsize='12.88rem' expand={true} controls={false}
        title='Base Distribution Documentation' href='/books'>
        {#snippet card(distro: any)}
        <BookCard {...distro.book} />
        {/snippet}
    </Carousel>
</article>

<article class='pt-10 mb-5'>
    <Carousel entries={data.tutorials} colsize='12.88rem' expand={true} controls={false}
        title='Tutorials' href='/books'>
        {#snippet card(book: any)}
        <BookCard {...book} />
        {/snippet}
    </Carousel>
</article>