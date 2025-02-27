<script lang='ts'>
	import type { PageProps } from './$types';


	let { data }: PageProps = $props();
</script>

<article class="max-w-none">
  {#each data.videos as playlist}
  <section class='mt-10'>
    <header class="stream">
      <h2 class='text-xl'><a href={playlist.url} class='bg-[#2a414c] text-white hover:text-white pb-1 pt-2 px-3 rounded-t'>{playlist.title}</a></h2>
    </header>
    <div class='stream grid grid-rows-1 grid-flow-col gap-6 overflow-x-scroll border-t-4 border-t-[#1a414c]'>
      {#each playlist.entries as video}
        <div class='w-80 flex flex-col my-4'>
        <a class='relative' href={`https://www.youtube.com/watch?v=${video.id}`}>
          <img class='rounded-2xl object-cover object-center h-52 hover:drop-shadow-lg' width=480 height=360 src={`https://i.ytimg.com/vi_webp/${video.id}/hqdefault.webp`} alt={video.title}/>
          <div class='w-full h-full z-10 absolute left-0 top-0 opacity-0 hover:opacity-100'>
            <div class='bg-red-600 text-white w-16 h-10 rounded-xl absolute top-1/2 -mt-5 left-1/2 -ml-8 flex items-center justify-center'>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </a>
        <h3 class='font-bold text-sm pt-2 text-gray-800 px-3'>{video.title}</h3>
        <p class='text-gray-600 px-3 text-sm flex mt-1'>
          <span>{new Date(video.timestamp * 1000).toDateString()}</span>
          <span class='ml-auto'><a href={`https://www.youtube.com/${video.uploader_id}`}>{video.uploader}</a></span>
        </p>
        </div>
      {/each}
    </div>
  </section>
  {/each}
</article>

<style lang='postcss'>
  .stream {
    max-width: calc(1110px + 17em);
    margin: 0 auto;
    padding: 0 0.67em;
  }
  .stream:hover {
    max-width: none;
    margin: 0;
    padding: 0 max(calc(calc(100% - calc(1110px + 17em)) / 2 + .67em), .67em);
  }
</style>