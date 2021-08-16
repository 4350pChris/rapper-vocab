<script>
  import Search from "$components/Search.svelte"
  import "../app.postcss"
</script>

<header class="z-50 dark:bg-black bg-gray-50 fixed inset-x-0 top-0 shadow">
  <div class="container h-12 mx-auto flex justify-center items-center">
    <Search />
  </div>
</header>
<main class="max-w-screen-lg container mx-auto pt-16 pb-4 px-4 flex flex-col items-center">
  <slot />
</main>
