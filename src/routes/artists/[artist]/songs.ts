import { getSongs, putSongs } from "$lib/db"
import { parseDocument, DomUtils } from "htmlparser2"
import type { RequestHandler } from "@sveltejs/kit"

const getPaginatedSongs = async (artist: number) => {
  const baseUrl = `https://api.genius.com/artists/${artist}/songs?sort=popularity`
  const existing = (await getSongs(artist)).Items.map((v) => parseInt(v.id))

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
      ({ id, primary_artist }) => !existing.includes(id) && primary_artist.id === artist
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
    const text = DomUtils.innerText(found).trim()
    return text
  }
}

/**
 *
 * @param artist THe artists name - in some cases this might be two artists like 'Bob Marley & the Wailers'
 * @param text The complete lyrics which should contain square brackets in front of each verse
 * @returns
 */
const removeVersesNotByArtist = (artist: string, text: string) => {
  // get the positions of each square brackets denoting verses
  const matches = Array.from(text.matchAll(/\[[^\]]*\]/g))
  const sanitized = matches.reduce((acc, val, i) => {
    const end = matches[i + 1] ? matches[i + 1].index : undefined
    const part = text.slice(val.index, end)
    const token = val[0]
    // tokens like [Verse 1] don't have to be checked
    if (!token.includes(":")) {
      acc += part
      return acc
    }
    // token looks like [Verse 1: artist] so we have to check if the current artist is the one this verse belongs to
    // split at the colon to get the artist
    const colonIndex = token.indexOf(":")
    const verseArtists = token.slice(colonIndex + 1)
    // when there's an & in the token, the first artist should be part of the primary artist(s)
    const mainVerseArtist = verseArtists.split(" & ")[0].trim().replace("]", "")
    // in case the primary artist contains an ampersand the verse's artist needs to be one of them
    const primaryArtists = artist.split(" & ")

    if (primaryArtists.includes(mainVerseArtist)) {
      acc += part
    }
    return acc
  }, "")
  return sanitized
}

const removeExtraCharacters = (text: string) =>
  text
    .replace(/[\n\s]+/g, " ")
    .replace(/[^\u00C0-\u02AF\w'-]/g, " ")
    .replace(" - ", " ")

const removeBrackets = (text: string) => text.replace(/\[[^\]]*\]/g, " ")

const sanitizeLyrics = (artist: string, text: string) => {
  const onlyByMainArtist = removeVersesNotByArtist(artist, text)
  const noBrackets = removeBrackets(onlyByMainArtist)
  const noExtras = removeExtraCharacters(noBrackets)
  return noExtras.toLowerCase().trim()
}

export const get: RequestHandler<{ artist: string }> = async ({ params }) => {
  const artist = parseInt(params.artist)
  const songs = await getSongs(artist)
  return { body: { songs: songs.Items?.map(({ lyrics, ...song }) => song) } }
}

export const post: RequestHandler<{ artist: string }> = async ({ params }) => {
  const artist = parseInt(params.artist)

  const songs = await getPaginatedSongs(artist)

  const crawlRequests = songs.map(async (song) => {
    const lyrics = await crawlLyrics(song.url)
    return {
      lyrics,
      ...song
    }
  })

  const results = await Promise.all(crawlRequests)
  const lyrics = results
    .filter((song) => !!song.lyrics)
    .map((song: { [key: string]: any }) => ({
      ...song,
      lyrics: sanitizeLyrics(song.primary_artist.name, song.lyrics)
    }))

  if (lyrics.length) {
    await putSongs(lyrics)
  }

  return { status: 201 }
}
