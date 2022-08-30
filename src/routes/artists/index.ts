import { getArtists } from "$lib/artists"
import type { RequestHandler } from "@sveltejs/kit"

export const get: RequestHandler = async () => {
  const artists = await getArtists()
  return { body: { artists: artists.Items } }
}
