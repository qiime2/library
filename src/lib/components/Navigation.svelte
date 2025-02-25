<script lang='ts'>
    import { page } from '$app/state';
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
    <li class='h-full'>
        <a href={url} class='h-full px-3 flex items-center'>
            <span class='inline-block border-y-4 border-transparent' class:active={isActive(page.url.pathname, url)} title={title}>
                {title}
            </span>
        </a>
    </li>
    {/each}
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