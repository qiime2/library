<script lang='ts'>
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<article class="max-w-none">
  {#each data.videos as playlist}
  <section>
    <header class="max-width">
      <h2 class='prose pt-10 -mb-3 text-lg'><a href={playlist.url}>{playlist.title}</a></h2>
    </header>
    <div class='stream grid grid-rows-1 grid-flow-col gap-6 overflow-x-auto'>
      {#each playlist.entries as video}
      <a class='flex' href={`https://www.youtube.com/watch?v=${video.id}`}>
        <div class='w-80 px-4 pt-4 shadow-md hover:shadow-lg rounded-2xl border-gray-200 border'>
          <img class='rounded object-cover object-center h-40' width=480 height=360 src={`https://i.ytimg.com/vi_webp/${video.id}/hqdefault.webp`} alt={video.title}/>
          <h3 class='font-bold text-sm pt-2 pb-4 text-gray-800 no-underline'>{video.title}</h3>
        </div>
      </a>
      {/each}
    </div>
  </section>
  {/each}
</article>

<style lang='postcss'>
  .stream {
    padding: 2rem max(calc(calc(100vw - calc(1110px + 17em)) / 2 + .67em), .67em)
  }
</style>