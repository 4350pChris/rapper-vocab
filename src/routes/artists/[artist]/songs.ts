import { getSongs, putSongs } from '$lib/db';
import { JSDOM } from 'jsdom';
import type { RequestHandler } from '@sveltejs/kit';

async function getPaginatedSongs(artist: string) {
	const baseUrl = `https://api.genius.com/artists/${artist}/songs?sort=popularity`;

	let page = 1;
	const chunks = [];
	while (page !== null && page <= 10) {
		const res = await fetch(baseUrl + '&page=' + page, {
			headers: {
				authorization: 'Bearer ' + import.meta.env.VITE_GENIUS_CLIENT_ACCESS_TOKEN
			}
		});
		const json: { songs: Array<Record<string, any>>; next_page: number } = (await res.json())
			.response;
		page = json.next_page;
		// filter out songs that do not have the specified artist as their primary artist
		chunks.push(json.songs.filter(({ primary_artist }) => primary_artist.id === parseInt(artist)));
	}

	return chunks;
}

async function crawlLyrics(songUrl: string) {
	const res = await fetch(songUrl);
	const html = await res.text();
	const { document } = new JSDOM(html).window;
	const lyrics = document.querySelector('.lyrics');
	const text = lyrics?.textContent.trim();
	return text;
}

export const get: RequestHandler<{ artist: string }> = async ({ params }) => {
	const { artist } = params;
	const songs = await getSongs(artist);
	return { body: { songs: songs.Items } };
};

export const post: RequestHandler<{ artist: string }> = async ({ params }) => {
	const { artist } = params;
	const chunks = [];

	const existing = (await getSongs(artist)).Items.map((v) => parseInt(v.id.N));
	const songs = await getPaginatedSongs(artist);
	const filtered = songs.map((chunk) => chunk.filter((song) => !existing.includes(song.id))).filter(chunk => chunk.length > 0);
	for (const chunk of filtered) {
		const crawlRequests = chunk.map(async (song) => ({
			lyrics: await crawlLyrics(song.url),
			...song
		}));
		const lyrics = await Promise.all(crawlRequests);
		chunks.push(lyrics.filter(({ lyrics }) => !!lyrics));
	}

	if (chunks.length) {
		await putSongs(chunks);
	}

	return { status: 201 };
};
