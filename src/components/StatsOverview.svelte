<script lang="ts">
  export let stats: {
    uniques?: number
    words?: number
    top?: { [word: string]: number }
  }

  let wordCount = 10

  let topWords = []
  $: if (stats?.top)
    topWords = Object.entries(stats.top)
      .sort((a, b) => b[1] - a[1])
      .slice(0, wordCount)
</script>

<div class="text-center">
  <h2>Stats</h2>
  {#if stats}
    <p class="my-4">
      <span class="font-semibold">{stats.words}</span>
      words in total out of which
      <span class="font-semibold">{stats.uniques}</span> are unique.
    </p>
    <h3 class="text-lg font-bold mb-2">Top {wordCount === 100 ? "hundred" : "ten"}</h3>
    <ol>
      {#each topWords as [word, count]}
        <li>{word}: {count}</li>
      {/each}
    </ol>
    <button
      class="my-2"
      on:click={() => (wordCount = wordCount === 100 ? 10 : 100)}
    >
      Show {wordCount === 100 ? "top ten" : "top hundred"}
    </button>
  {:else}
    <p>No stats yet. Press update songs to start analyzing.</p>
  {/if}
</div>
