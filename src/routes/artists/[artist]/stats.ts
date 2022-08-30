import { getArtist } from "$lib/artists"
import { putStats } from "$lib/songs"
import type { RequestHandler } from "@sveltejs/kit"

export const get: RequestHandler<{ artist: string }> = async ({ params }) => {
  const artist = parseInt(params.artist)

  const result = await getArtist(artist)
  return { body: result.Item }
}

export const post: RequestHandler<{ artist: string }> = async ({ params }) => {
  const artist = parseInt(params.artist)

  const result = await putStats(artist)
  return { status: 201, body: result.Attributes }
}
