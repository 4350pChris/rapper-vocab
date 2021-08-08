<script lang="ts">
	export let songs: { title: { S: string } }[];

	let allShown = false;

	let sorted = [];
	$: sorted = allShown
		? [...songs].sort((a, b) => a.title.S.localeCompare(b.title.S))
		: songs.slice(0, 3);
</script>

<h2 class="text-2xl">Songs</h2>
<button
	class="transition rounded hover:bg-gray-200 dark:hover:bg-gray-700 my-2 px-4 py-2 uppercase"
	on:click={() => (allShown = !allShown)}
>
  Show {allShown ? 'fewer' : 'all'}
</button>
{#if sorted.length}
	<ul>
		{#each sorted as song}
			<li>{song.title.S}</li>
		{/each}
		{#if !allShown}
			<li>And {songs.length - 3} more</li>
		{/if}
	</ul>
{:else}
	<p>No songs yet.</p>
{/if}
