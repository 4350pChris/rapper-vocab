<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit"

  export const load: Load = async ({ fetch }) => {
    const res = await fetch("/artists")
    const { artists } = await res.json()
    return {
      props: {
        artists
      }
    }
  }
</script>

<script lang="ts">
  export let artists: Record<string, any>[]
</script>

<section class="flex flex-col gap-4">
  <h1 class="text-4xl">Rapper Vocabulary - WIP</h1>
  <p>Search in the top bar</p>
  <h3>Analyzed Artists</h3>
  <ul class="flex flex-col gap-4">
    {#each artists as artist}
      <li>
        <a
          class="text-xl flex items-center gap-4 p-4 hover:bg-gray-200 transition rounded-full"
          href="/artists/{artist.id}"
        >
          <img class="rounded-full h-20 w-20" alt={artist.name} src={artist.image_url} />
          {artist.name}
        </a>
      </li>
    {/each}
  </ul>
</section>
