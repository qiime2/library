<script lang='ts'>
  import Playlist from '$lib/widgets/Playlist.svelte';
  import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<article class="max-w-none">
  <div class="max-width">
    <header class="prose prose-sm md:prose-base lg:prose-lg mt-10 mx-2">
      <h1>Videos</h1>
    </header>
  </div>
  {#each data.videos as playlist}
  <div class="mt-10">
    <Playlist {playlist}/>
  </div>
  {/each}
</article>