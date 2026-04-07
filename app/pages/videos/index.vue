<script setup lang="ts">
useSeoMeta({ title: 'Videos — BridgeAI Learn' })

const { data: videos } = await useAsyncData('videos-list', () =>
  queryCollection('videos').order('date', 'DESC').all()
)
</script>

<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/" class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-xs sm:text-sm rounded-lg hover:shadow-[0_0_15px_rgba(107,114,128,0.4)] hover:scale-105 transition-all duration-300 mb-4">
        ↑ Back to Home
      </NuxtLink>
    </div>
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300 mb-2">Videos</h1>
    <p class="text-gray-500 dark:text-gray-400 mb-10 transition-colors duration-300">Curated YouTube videos on AI and machine learning.</p>

    <div v-if="videos?.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <VideoCard v-for="video in videos" :key="video.path" :video="video" />
    </div>
    <p v-else class="text-gray-400 dark:text-gray-500 transition-colors duration-300">No videos yet.</p>
  </div>
</template>
