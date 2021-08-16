<script lang="ts">
  import SongListRow from "$components/SongListRow.svelte"

  let query = ""
  let songs = []

  const handleSubmit = async () => {
    const res = await fetch(`/search/${query}.json`)
    songs = (await res.json()).songs
  }
</script>

<h2 class="text-2xl mb-4">Artist Search</h2>
<form on:submit|preventDefault={handleSubmit}>
  <input type="text" bind:value={query} />
  <button
    class="py-2 px-4 rounded uppercase transition hover:bg-gray-200 dark:hover:bg-gray-700"
    type="submit">search</button
  >
</form>
{#if songs.length}
  <h3 class="text-lg my-4">Search Results</h3>
  <ul>
    {#each songs as song}
      <li>
        <SongListRow {song} />
      </li>
    {/each}
  </ul>
{/if}
