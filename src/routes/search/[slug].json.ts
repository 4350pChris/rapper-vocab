import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler<{ slug: string }> = async ({ params }) => {
	const { slug } = params;

	const url = 'https://api.genius.com/search?q=' + slug;

	const res = await fetch(url, {
		headers: {
			authorization: 'Bearer ' + import.meta.env.VITE_GENIUS_CLIENT_ACCESS_TOKEN
		}
	});

	if (res.ok) {
		const json = await res.json();
		const songs = json.response.hits.map(({ result }) => result);
		return { body: { songs } };
	}
};
