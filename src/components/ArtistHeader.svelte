<script lang="ts">
  export let artist
  export let loading = false

  let scroll: number

  let sticky: boolean
  $: sticky = scroll > 0

  let imgClasses: string
  $: imgClasses = sticky
    ? "h-20 w-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40"
    : "h-40 w-40 md:w-64 md:h-64 lg:h-80 lg:w-80"
</script>

<svelte:window bind:scrollY={scroll} />

<div
  class:sticky
  class:top-16={sticky}
  class:border-b={sticky}
  class:dark:border-gray-500={sticky}
  class="-mx-4 px-2 sm:px-4 py-2 mb-6 dark:bg-black bg-gray-100"
>
  <img
    class="transition-all float-left mx-4 p-4 rounded-full {imgClasses} circle-shaped"
    class:animate-pulse={loading}
    alt={artist.name}
    src={artist.image_url}
  />
  <div class="flex flex-wrap items-center justify-between border-gray-300">
    <h1 class="mb-2 text-4xl mx-4">
      {artist.name}
    </h1>
    <button
      class:bg-blue-300={!loading}
      class:dark:bg-blue-800={!loading}
      disabled={loading}
      on:click
    >
      {#if loading}
        updating...
      {:else}
        update stats
      {/if}
    </button>
  </div>
</div>
