<script setup lang="ts">
useSeoMeta({ title: 'Videos — BridgeAI Learn' })

const { data: videos } = await useAsyncData('videos-list', () =>
  queryCollection('videos').order('date', 'DESC').all()
)
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Videos</h1>
    <p class="text-gray-500 dark:text-gray-400 mb-10 transition-colors duration-300">Curated YouTube videos on AI and machine learning.</p>

    <div v-if="videos?.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <VideoCard v-for="video in videos" :key="video.path" :video="video" />
    </div>
    <p v-else class="text-gray-400 dark:text-gray-500 transition-colors duration-300">No videos yet.</p>
  </div>
</template>
