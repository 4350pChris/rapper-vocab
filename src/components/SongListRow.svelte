<script lang="ts">
  export let song
</script>

<a
  class="flex flex-nowrap items-center rounded p-2 transition hover:bg-gray-200 dark:hover:bg-gray-700"
  sveltekit:prefetch
  href="/artists/{song.primary_artist.id}"
>
  <img
    alt="song art"
    class="inline-block rounded-full h-12 w-12"
    src={song.song_art_image_thumbnail_url}
  />
  <div class="ml-4">
    <p class="font-bold">{song.title_with_featured}</p>
    <p class="text-gray-500 dark:text-gray-300">{song.primary_artist.name}</p>
  </div>
</a>
