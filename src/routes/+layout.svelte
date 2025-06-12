<script lang="ts">
    import "../app.css";
    import NavBanner from "$lib/components/NavBanner.svelte";
    import Navigation from "$lib/components/Navigation.svelte";
    const entries: [string, string][] = [
      ['/quickstart', 'Quickstart'],
      ['/plugins', 'Plugins'],
      ['/docs', 'Docs'],
      ['/videos', 'Videos'],
      ['/workshops', 'Workshops'],
      ['/data-resources', 'Resources'],
    ]
</script>


<svelte:head>
  <title>QIIME 2 Library</title>
</svelte:head>

<NavBanner/>
<nav class='pl-2 scroll-edge z-50'>
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
  nav {
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

</style>