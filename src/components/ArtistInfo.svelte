<script lang="ts">
  export let artist

  let fullDescription = false
</script>

<div class="mx-4">
  {#if artist.alternate_names.length}
    <div class="my-4">
      <h3>Also known as</h3>
      <p>
        {artist.alternate_names.join(", ")}
      </p>
    </div>
  {/if}
  <p class:line-clamp-4={!fullDescription}>
    {artist.description.plain}
  </p>
  <button class="w-full my-2" on:click={() => (fullDescription = !fullDescription)}>
    Show {fullDescription ? "less" : "more"}
  </button>
</div>
