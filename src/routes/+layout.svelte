<script lang="ts">
    import "../app.css";
    import NavBanner from "$lib/components/NavBanner.svelte";
    import Navigation from "$lib/components/Navigation.svelte";
    const entries: [string, string][] = [
      ['/quickstart', 'Quickstart'],
      ['/plugin', 'Plugins'],
      ['/book', 'Books'],
      ['/video', 'Videos'],
      ['/workshop', 'Workshops'],
      ['/data-resources', 'Resources'],
    ]
</script>


<svelte:head>
  <title>QIIME 2 Library</title>
</svelte:head>

<NavBanner/>
<nav id='navbar' class='pl-2 scroll-edge z-50'>
  <div class='flex max-width'>
    <a href='/' class='mr-auto'>
      <img id='navlogo' src='/q2library.svg' alt='QIIME 2 library logo' />
    </a>
    <Navigation {entries} isActive={(path, url) => path.startsWith(url)} includeHome={true}/>
</nav>
<slot />
<footer class='mt-10'></footer>

<style lang='postcss'>
  @reference 'tailwindcss/theme';
  #navbar {
    box-shadow: rgb(153, 153, 153) 0px 1px 5px;
    background-color: #f8f8f8;
    @apply sticky
    w-full
    z-10
    top-0
    left-0
    right-0;
  }

  #navlogo {
    width: 125px;
    height: 40px;
    @apply my-1;
  }

  li a {
    @apply text-gray-600 no-underline;
  }

  li a:hover {
    @apply text-gray-950;
  }

  li a.active {
    @apply text-gray-950 font-bold border-b-4 border-b-[#e39e54];
  }

  li a::before {
    content: attr(title);
    @apply font-bold block h-[1px] w-max text-transparent overflow-hidden invisible;
  }

</style>