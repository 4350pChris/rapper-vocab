<script lang="ts">
  export let songs: string[]

  let allShown = false

  let sorted = []
  $: sorted = allShown ? [...songs].sort((a, b) => a.localeCompare(b)) : songs.slice(0, 3)
</script>

{#if sorted.length}
  <ul>
    {#each sorted as song}
      <li>{song}</li>
    {/each}
    {#if !allShown}
      <li>And {songs.length - 3} more</li>
    {/if}
  </ul>
  <button class="w-full my-2" on:click={() => (allShown = !allShown)}>
    Show {allShown ? "fewer" : "all"}
  </button>
{:else}
  <p>No songs yet.</p>
{/if}
