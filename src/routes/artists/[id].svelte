<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ page, fetch }) => {
		const url = `/artists/${page.params.id}.json`;
		const res = await fetch(url);
		if (res.ok) {
			return {
				props: {
					artist: await res.json()
				}
			};
		}
		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	};
</script>

<script lang="ts">
	export let artist;
</script>

<svelte:head>
	<title>Artist - {artist.name}</title>
</svelte:head>

<img class="h-40 w-40 md:w-64 md:h-64 lg:h-80 lg:w-80 rounded-full" alt={artist.name} src={artist.image_url}>
<h1 class="text-4xl mt-4">{artist.name}</h1>
<p class="text-lg">Also known as: {artist.alternate_names.join(', ')}</p>

