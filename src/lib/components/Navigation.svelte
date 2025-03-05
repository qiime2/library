<script lang='ts'>
    import { page } from '$app/state';
    import { Collapsible } from 'melt/components';

    const {
        entries,
        isActive
    }: {
        entries: [string, string][],
        isActive: (arg0: string, arg1: string) => boolean
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
    <!-- <li class='h-full block sm:hidden'>
      Menu
    </li> -->
</ul>

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