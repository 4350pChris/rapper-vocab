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
          artist: { ...artist, stats: lyricsInfo.stats },
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
  import ArtistHeader from "$components/ArtistHeader.svelte"
  import SongOverview from "$components/SongOverview.svelte"
  import StatsOverview from "$components/StatsOverview.svelte"

  export let artist: Record<string, any>
  export let songs: Record<string, any>[]

  let loading = false
  let scroll: number
  let sticky
  $: sticky = scroll > 0
  let imgClasses: string
  $: imgClasses = sticky ? "h-24 w-24 md:w-32 md:h-32 lg:w-40 lg:h-40" : "h-40 w-40 md:w-64 md:h-64 lg:h-80 lg:w-80"

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
    const { stats } = await res.json()
    artist = { ...artist, stats }
  }
</script>

<svelte:head>
  <title>Artist - {artist.name}</title>
</svelte:head>

<svelte:window bind:scrollY={scroll} />

<div class:sticky class:top-16={sticky} class="dark:bg-black bg-gray-100">
  <img
    class="transition-all mt-2 float-left mx-4 rounded-full {imgClasses}"
    class:animate-pulse={loading}
    alt={artist.name}
    src={artist.image_url}
  />
  <div class="flex items-center justify-between border-gray-300" class:border-b={sticky} class:dark:border-gray-500={sticky}>
    <h1 class="py-4 text-4xl mr-4">
      {artist.name}
    </h1>
    <button
      class:bg-blue-300={!loading}
      class:dark:bg-blue-800={!loading}
      on:click={analyzeLyrics}
      disabled={loading}
    >
      {#if loading}
        updating...
      {:else}
        update stats
      {/if}
    </button>
  </div>
</div>
<ArtistHeader {artist} />
<div class="flex flex-col items-center mx-auto max-w-lg">
  <section id="stats" class="w-full">
    <h2 class="my-4">Stats</h2>
    <StatsOverview stats={artist.stats} />
  </section>
  <section id="songs" class="w-full">
    <h2 class="my-4">Songs</h2>
    <SongOverview songs={songs.map(({ title }) => title)} />
  </section>
</div>
