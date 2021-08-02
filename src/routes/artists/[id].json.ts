import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler<{ id: string }> = async ({ params }) => {
	const { id } = params;

	const url = 'https://api.genius.com/artists/' + id;

	const res = await fetch(url, {
		headers: {
			authorization: 'Bearer ' + import.meta.env.VITE_GENIUS_CLIENT_ACCESS_TOKEN
		}
	});

	if (res.ok) {
		const json = await res.json();
		return { body: json.response.artist };
	}
};
