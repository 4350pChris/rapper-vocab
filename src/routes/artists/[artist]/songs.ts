import { getSongs, putSongs } from "$lib/db"
import { parseDocument, DomUtils } from "htmlparser2"
import type { RequestHandler } from "@sveltejs/kit"

const getPaginatedSongs = async (artist: string) => {
  const baseUrl = `https://api.genius.com/artists/${artist}/songs?sort=popularity`
  const existing = (await getSongs(artist)).Items.map((v) => parseInt(v.id.N))

  let page = 1
  const songs: Record<string, any>[] = []
  while (page !== null && songs.length < 10) {
    const res = await fetch(baseUrl + "&page=" + page, {
      headers: {
        authorization: "Bearer " + import.meta.env.VITE_GENIUS_CLIENT_ACCESS_TOKEN
      }
    })
    const json: { songs: Array<Record<string, any>>; next_page: number } = (await res.json())
      .response
    page = json.next_page
    // filter out songs that are already in the db or do not have the specified artist as their primary artist
    const filtered = json.songs.filter(
      ({ id, primary_artist }) => !existing.includes(id) && primary_artist.id === parseInt(artist)
    )
    songs.push(...filtered)
  }
  return songs
}

const crawlLyrics = async (songUrl: string) => {
  const res = await fetch(songUrl)
  const html = await res.text()
  const dom = parseDocument(html)
  const found = DomUtils.findOne(
    (elem) =>
      elem.attribs.class === "lyrics" || elem.attribs.class?.startsWith("Lyrics__Container"),
    dom.childNodes
  )
  if (found) {
    const text = DomUtils.textContent(found).trim()
    return text
  }
}

// TODO: do this later, I'm too stupid rn
// const removeVersesNotByRapper = (rapper: string, text: string) => {
// 	const matches = Array.from(text.matchAll(/\[[^\]]*\]/g))
// 	const sanitized = matches.reduce((result, match) => match.)
// }

export const get: RequestHandler<{ artist: string }> = async ({ params }) => {
  const { artist } = params
  const songs = await getSongs(artist)
  return { body: { songs: songs.Items } }
}

export const post: RequestHandler<{ artist: string }> = async ({ params }) => {
  const { artist } = params

  const songs = await getPaginatedSongs(artist)

  const crawlRequests = songs.map(async (song) => {
    const raw = await crawlLyrics(song.url)
    const lyrics = raw
      ?.replace(/\n+/g, " ")
      .replace(/[\s,.!?]/g, " ")
      .toLowerCase()
    return {
      lyrics,
      ...song
    }
  })

  const lyrics = (await Promise.all(crawlRequests)).filter(({ lyrics }) => !!lyrics)

  if (lyrics.length) {
    await putSongs(lyrics)
  }

  return { status: 201 }
}
