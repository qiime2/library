<script lang='ts'>
  import Playlist from '$lib/widgets/Playlist.svelte';
  import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<article class="max-w-none">
  {#each data.videos as playlist}
  <div class="pt-24">
    <Playlist {playlist}/>
  </div>
  {/each}
</article>