<script lang='ts'>
    import { page } from '$app/state';
    import { Popover } from "melt/builders";

    const popover = new Popover({computePositionOptions: {placement: "bottom-end"}});

    const {
        entries,
        isActive,
        includeHome = false
    }: {
        entries: [string, string][],
        isActive: (arg0: string, arg1: string) => boolean,
        includeHome?: boolean
    } = $props();
</script>

<ul class='not-prose grid grid-flow-col items-center -mx-1'>
    {#each entries as [url, title]}
    {@const active = isActive(page.url.pathname, url)}
    <li class='h-full sm:block' class:hidden={!active} class:block={active}>
        <a href={url} class='h-full px-2 pl-3 text-sm md:px-3 md:text-base flex items-center'>
            <span class='inline-block border-y-4 border-transparent' class:active title={title}>
                {title}
            </span>
        </a>
    </li>
    {/each}
    <li class='h-full block sm:hidden'>
      <button type='button' class='h-full px-2 pl-3 text-gray-600 cursor-pointer hover:text-black' {...popover.trigger}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -3 24 24" fill="currentColor" class="size-8">
          <title>Menu</title>
          <path fill-rule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
        </svg>
      </button>
    </li>
</ul>
<div {...popover.content} class='-mt-2 bg-white border border-gray-200 rounded-lg shadow-xl'>
  <ul class='px-4 py-2 not-prose'>
      {#if includeHome && page.url.pathname != '/'}
      <li>
          <a href="/" class='px-2 pl-3 text-lg' onclick={() => popover.open = false}>
              <span class='inline-block border-y-4 border-transparent' title="Home">
                  Home
              </span>
          </a>
      </li>
      {/if}
      {#each entries as [url, title]}
      {@const active = isActive(page.url.pathname, url)}
      {#if !active}
      <li>
          <a href={url} class='px-2 pl-3 text-lg' onclick={() => popover.open = false}>
              <span class='inline-block border-y-4 border-transparent' title={title}>
                  {title}
              </span>
          </a>
      </li>
      {/if}
      {/each}
  </ul>
</div>

<style lang='postcss'>
  @reference 'tailwindcss/theme';

  li a {
    @apply text-gray-600 no-underline;
  }

  li a:hover {
    @apply text-gray-950;
  }

  li span.active {
    @apply text-gray-950 font-bold border-b-4 border-b-[#e39e54];
  }

  li a span::before {
    content: attr(title);
    @apply font-bold block h-[1px] w-max text-transparent overflow-hidden invisible;
  }

</style>