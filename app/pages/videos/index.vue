<script setup lang="ts">
useSeoMeta({ title: 'Videos — BridgeAI Learn' })

const { data: videos } = await useAsyncData('videos-list', () =>
  queryCollection('videos').order('date', 'DESC').all()
)
</script>

<template>
  <div class="section-videos">
    <div class="mb-6">
      <SectionButton to="/" section="neutral" class="mb-4">
        ↑ Back to Home
      </SectionButton>
    </div>
    <h1 class="text-3xl font-bold text-ink transition-colors duration-300 mb-2">Videos</h1>
    <p class="text-ink-muted mb-10 transition-colors duration-300">Curated YouTube videos on AI and machine learning.</p>

    <div v-if="videos?.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <VideoCard v-for="video in videos" :key="video.path" :video="video" />
    </div>
    <p v-else class="text-ink-muted transition-colors duration-300">No videos yet.</p>
  </div>
</template>
