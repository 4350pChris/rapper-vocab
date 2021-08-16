<script lang="ts">
  export let songs: string[]

  let allShown = false

  let sorted = []
  $: sorted = allShown
    ? [...songs].sort((a, b) => a.localeCompare(b))
    : songs.slice(0, 3)
</script>

<h2>Songs</h2>
{#if sorted.length}
  <ul class="list-none">
    {#each sorted as song}
      <li>{song}</li>
    {/each}
    {#if !allShown}
      <li>And {songs.length - 3} more</li>
    {/if}
  </ul>
{:else}
  <p>No songs yet.</p>
{/if}
<button
  class="transition rounded hover:bg-gray-200 dark:hover:bg-gray-700 my-2 px-4 py-2 uppercase"
  on:click={() => (allShown = !allShown)}
>
  Show {allShown ? "fewer" : "all"}
</button>
