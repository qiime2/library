<nav id='navbar'>
  <div id='nav-container'>
    <a href='/'>
      <img id='navlogo' src='q2library.svg' alt='QIIME 2 library logo' />
    </a>
</nav>

<slot />

<style lang='postcss'>
  #navbar {
    width: 100vw;
    box-shadow: rgb(153, 153, 153) 0px 1px 5px;
    background-color: #f8f8f8;
    @apply fixed
    w-full
    z-10
    top-0
    left-0
    right-0;
  }

  #nav-container {
    @apply flex
    max-w-7xl
    mx-auto
    px-2;
  }

  #navlogo {
    width: 125px;
    height: 40px;
    @apply my-1;
  }
</style>