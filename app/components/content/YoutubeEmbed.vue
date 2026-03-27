<script setup lang="ts">
// MDC component — usable directly in markdown files:
//
//   ::youtube-embed{id="dQw4w9WgXcQ" title="My Video"}
//   ::
//
// or with a block:
//   ::youtube-embed
//   ---
//   id: dQw4w9WgXcQ
//   title: My Video
//   ---
//   ::

defineProps<{
  id: string
  title?: string
}>()
</script>

<template>
  <div class="aspect-video w-full rounded-xl overflow-hidden shadow-lg my-8">
    <iframe
      :src="`https://www.youtube.com/embed/${id}`"
      :title="title || 'YouTube video'"
      class="w-full h-full"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    />
  </div>
</template>
