<script setup lang="ts">
useSeoMeta({ title: 'Videos — BridgeAI Learn' })

const { data: videos } = await useAsyncData('videos-list', () =>
  queryCollection('videos').order('date', 'DESC').all()
)
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Videos</h1>
    <p class="text-gray-500 mb-10">Curated YouTube videos on AI and machine learning.</p>

    <div v-if="videos?.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <VideoCard v-for="video in videos" :key="video.path" :video="video" />
    </div>
    <p v-else class="text-gray-400">No videos yet.</p>
  </div>
</template>
