import { getArtist, putStats } from "$lib/db"
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
