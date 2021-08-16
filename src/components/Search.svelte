<script lang="ts">
  import SongListRow from "$components/SongListRow.svelte"
  import ClickOutside from "svelte-click-outside"

  let query = ""
  let shown = false
  let triggerEl
  let keyListener

  const getSongs = async () => {
    const res = await fetch(`/search/${query}.json`)
    const { songs } = await res.json()
    return songs
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      shown = false
    }
  }
</script>

<svelte:body on:keydown={handleKeydown} />
<div class="relative">
  <form on:submit|preventDefault={() => (shown = true)}>
    <input class="bg-gray-300 dark:bg-gray-800" type="text" bind:value={query} />
    <button
      bind:this={triggerEl}
      type="submit"
      aria-controls="search_results"
    >
      search
    </button>
  </form>
  <ClickOutside on:clickoutside={() => (shown = false)} exclude={[triggerEl]}>
    <div
      id="search_results"
      aria-expanded={shown}
      class="mt-1 w-full absolute shadow bg-gray-50 dark:bg-black rounded dark:ring-gray-700"
      class:dark:ring-1={shown}
    >
      {#if shown}
        <h3 class="text-center text-lg m-4">Search Results</h3>
        {#await getSongs()}
          <p class="text-center py-2">Loading...</p>
        {:then songs}
          <ul>
            {#each songs as song}
              <li>
                <SongListRow {song} />
              </li>
            {/each}
          </ul>
        {:catch}
          <p class="text-center py-2">Could not load data.</p>
        {/await}
      {/if}
    </div>
  </ClickOutside>
</div>
