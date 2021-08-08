<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ page, fetch }) => {
		const id = page.params.artist;

		async function getArtistInfo() {
			const url = `/artists/${id}.json`;
			const res = await fetch(url);
			return await res.json();
		}

		async function getLyricsInfo() {}

		async function getSongs() {
			const url = `/artists/${id}/songs`;
			const res = await fetch(url);
			const json = await res.json();
			return json.songs;
		}

		try {
			const [artist, songs] = await Promise.all([getArtistInfo(), getSongs()]);
			return {
				props: {
					artist,
					songs
				}
			};
		} catch (e) {
			return {
				error: new Error(`Failed to load data.\n${e.message} ${e.stack}`)
			};
		}
	};
</script>

<script lang="ts">
	import SongOverview from '$components/SongOverview.svelte';

	export let artist: Record<string, any>;
	export let songs: Record<string, any>[];

	let loading = false;

	const analyzeLyrics = async () => {
		loading = true;
		await fetch(`/artists/${artist.id}/songs`, { method: 'POST' });
		const songRes = await fetch(`/artists/${artist.id}/songs`);
		songs = (await songRes.json()).songs;
		loading = false;
	};
</script>

<svelte:head>
	<title>Artist - {artist.name}</title>
</svelte:head>

<img
	class="h-40 w-40 md:w-64 md:h-64 lg:h-80 lg:w-80 rounded-full"
	class:animate-pulse={loading}
	alt={artist.name}
	src={artist.image_url}
/>
<h1 class="text-4xl mt-4">{artist.name}</h1>
<p class="text-center my-2 text-gray-700 dark:text-gray-300 text-lg">
	Also known as
	<br />
	<span>
		{artist.alternate_names.join(', ')}
	</span>
</p>
<section class="text-center my-4">
	<SongOverview {songs} />
</section>
<button
	class="bg-white dark:bg-gray-700 ring-1 my-2 py-2 px-4 text-lg rounded uppercase transition hover:bg-gray-200 dark:hover:bg-gray-700"
	on:click={analyzeLyrics}
	disabled={loading}
>
	{#if loading}
		updating...
	{:else}
		update songs
	{/if}
</button>
