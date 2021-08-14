import { getSongs, putSongs } from '$lib/db';
import { parseDocument, DomUtils } from 'htmlparser2';
import type { RequestHandler } from '@sveltejs/kit';

async function getPaginatedSongs(artist: string): Promise<Record<string, any>[]> {
	const baseUrl = `https://api.genius.com/artists/${artist}/songs?sort=popularity`;
	const existing = (await getSongs(artist)).Items.map((v) => parseInt(v.id.N));

	let page = 1;
	const songs: Record<string, any>[] = [];
	while (page !== null && songs.length < 10) {
		const res = await fetch(baseUrl + '&page=' + page, {
			headers: {
				authorization: 'Bearer ' + import.meta.env.VITE_GENIUS_CLIENT_ACCESS_TOKEN
			}
		});
		const json: { songs: Array<Record<string, any>>; next_page: number } = (await res.json())
			.response;
		page = json.next_page;
		// filter out songs that are already in the db or do not have the specified artist as their primary artist
		const filtered = json.songs.filter(({ id, primary_artist }) => !existing.includes(id) && primary_artist.id === parseInt(artist))
		songs.push(...filtered)
	}
	return songs;
}

async function crawlLyrics(songUrl: string) {
	const res = await fetch(songUrl);
	const html = await res.text();
	const dom = parseDocument(html)
	const found = DomUtils.findOne((elem) => elem.attribs.class === "lyrics", dom.childNodes)
	if (found) {
		const text = DomUtils.textContent(found).trim()
		return text;
	}
}

export const get: RequestHandler<{ artist: string }> = async ({ params }) => {
	const { artist } = params;
	const songs = await getSongs(artist);
	return { body: { songs: songs.Items } };
};

export const post: RequestHandler<{ artist: string }> = async ({ params }) => {
	const { artist } = params;

	const songs = await getPaginatedSongs(artist);
	const crawlRequests = songs.map(async (song) => ({
		lyrics: await crawlLyrics(song.url),
		...song
	}));
	const lyrics = (await Promise.all(crawlRequests)).filter(({ lyrics }) => !!lyrics);

	if (lyrics.length) {
		await putSongs(lyrics);
	}

	return { status: 201 };
};
