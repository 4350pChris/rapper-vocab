<script lang="ts">
	let query = '';
	let songs = [];

	const handleSubmit = async () => {
		const res = await fetch(`/search/${query}.json`);
		songs = (await res.json()).songs;
		console.log(songs);
	};
</script>

<h2>Search for artist</h2>
<form on:submit|preventDefault={handleSubmit}>
	<input type="text" bind:value={query} />
	<button type="submit">search</button>
</form>
<ul>
	{#each songs as song}
		<li>
			{song.title}
		</li>
	{/each}
</ul>
