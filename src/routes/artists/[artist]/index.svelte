<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit"

  export const load: Load = async ({ page, fetch }) => {
    const id = page.params.artist

    async function getArtistInfo() {
      const url = `/artists/${id}.json`
      const res = await fetch(url)
      return await res.json()
    }

    async function getLyricsInfo() {
      const url = `/artists/${id}/stats`
      const res = await fetch(url)
      return await res.json()
    }

    async function getSongs() {
      const url = `/artists/${id}/songs`
      const res = await fetch(url)
      const json = await res.json()
      return json.songs
    }

    try {
      const [artist, lyricsInfo, songs] = await Promise.all([
        getArtistInfo(),
        getLyricsInfo(),
        getSongs()
      ])
      return {
        props: {
          artist: { ...lyricsInfo, ...artist },
          songs
        }
      }
    } catch (e) {
      return {
        error: new Error(`Failed to load data.\n${e.message} ${e.stack}`)
      }
    }
  }
</script>

<script lang="ts">
  import SongOverview from "$components/SongOverview.svelte"
  import StatsOverview from "$components/StatsOverview.svelte"

  export let artist: Record<string, any>
  export let songs: Record<string, any>[]

  let loading = false

  const analyzeLyrics = async () => {
    loading = true
    await fetch(`/artists/${artist.id}/songs`, { method: "POST" })
    const songRes = await fetch(`/artists/${artist.id}/songs`)
    songs = (await songRes.json()).songs
    await updateStats()
    loading = false
  }

  const updateStats = async () => {
    const res = await fetch(`/artists/${artist.id}/stats`, { method: "POST" })
    artist = { ...artist, ...(await res.json()) }
  }
</script>

<svelte:head>
  <title>Artist - {artist.name}</title>
</svelte:head>

<img
  class="h-40 w-40 md:w-64 md:h-64 lg:h-80 lg:w-80 rounded-full"
  class:animate-pulse={loading}
  alt={artist.name}
  src={artist.image_url}
/>
<h1 class="text-4xl mt-4">{artist.name}</h1>
<button
    class="my-4 bg-white dark:bg-gray-700 ring-1 py-2 px-4 text-lg rounded uppercase transition hover:bg-gray-200 dark:hover:bg-gray-700"
    on:click={analyzeLyrics}
    disabled={loading}
  >
    {#if loading}
      updating...
    {:else}
      update songs
    {/if}
  </button>
{#if artist.alternate_names.length}
  <p class="text-center my-2 text-gray-700 dark:text-gray-300 text-lg">
    Also known as
    <br />
    <span>
      {artist.alternate_names.join(", ")}
    </span>
  </p>
{/if}
<section>
  <StatsOverview uniques={artist.uniques?.N} />
</section>
<section class="text-center my-4">
  <SongOverview songs={songs.map(({ title }) => title.S)} />
</section>
