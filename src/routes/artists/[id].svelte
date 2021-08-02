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

<h1>{artist.name}</h1>
