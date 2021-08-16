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
  import SongOverview from "$components/SongOverview.svelte"
  import StatsOverview from "$components/StatsOverview.svelte"

  export let artist: Record<string, any>
  export let songs: Record<string, any>[]

  let loading = false
  let fullDescription = false

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

<section>
  <img
    class="float-left mr-4 h-40 w-40 md:w-64 md:h-64 lg:h-80 lg:w-80 rounded-full"
    class:animate-pulse={loading}
    alt={artist.name}
    src={artist.image_url}
  />
  <h1 class="text-4xl mt-4">{artist.name}</h1>
  {#if artist.alternate_names.length}
  <div class="my-4">
    <h3 class="font-semibold">Also known as</h3>
    <p>
      {artist.alternate_names.join(", ")}
    </p>
  </div>
  {/if}
  <div>
  <div class:line-clamp-4={!fullDescription}>
    {@html artist.description.html}
  </div>
  <button class="max-w-min whitespace-nowrap my-2" on:click={() => (fullDescription = !fullDescription)}
    >Show {fullDescription ? "less" : "more"}</button
  >
</div>
  <button 
    class="my-4 w-full"
    class:bg-blue-100={!loading}
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
</section>

<section id="stats">
  <StatsOverview stats={artist.stats} />
</section>
<section class="text-center my-4" id="songs">
  <SongOverview songs={songs.map(({ title }) => title)} />
</section>
