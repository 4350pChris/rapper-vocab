<script>
  import Search from "$components/Search.svelte"
  import "../app.postcss"
</script>

<header
  class="z-50 border-b border-gray-300 dark:border-gray-500 dark:bg-black bg-gray-100 fixed inset-x-0 top-0"
>
  <div class="container h-16 mx-auto flex justify-center items-center">
    <a class="mr-8 font-bold" href="/">Overview</a>
    <Search />
  </div>
</header>
<main class="max-w-screen-lg container mx-auto pt-16 pb-4 px-4">
  <slot />
</main>
