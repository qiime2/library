<script lang='ts'>
    import VideoCard from "$lib/components/VideoCard.svelte";
    import Carousel from "./Carousel.svelte";

	let { playlist } = $props();
</script>

<Carousel url={playlist.url} title={playlist.title} entries={playlist.entries}>
    {#snippet card(video: any)}
        <VideoCard {video}/>
    {/snippet}
</Carousel>
