import type { RequestHandler } from "@sveltejs/kit"

export const get: RequestHandler<{ artist: string }> = async ({ params }) => {
  const { artist } = params

  const url = `https://api.genius.com/artists/${artist}?text_format=html`

  const res = await fetch(url, {
    headers: {
      authorization: "Bearer " + import.meta.env.VITE_GENIUS_CLIENT_ACCESS_TOKEN
    }
  })

  if (res.ok) {
    const json = await res.json()
    return { body: json.response.artist }
  }
}
