<script setup lang="ts">
import ContentYoutubeEmbed from '~/components/content/YoutubeEmbed.vue'

const route = useRoute()
const slug = (route.params.slug as string[]).join('/')

const { data: video } = await useAsyncData(`video-${slug}`, () =>
  queryCollection('videos').path(`/videos/${slug}`).first()
)

if (!video.value) {
  throw createError({ statusCode: 404, statusMessage: 'Video not found' })
}

useSeoMeta({
  title: () => `${video.value?.title} — BridgeAI Learn`,
  description: () => video.value?.description,
})
</script>

<template>
  <article v-if="video" class="max-w-3xl mx-auto">
    <NuxtLink to="/videos" class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 mb-8 transition-colors">
      ← Back to Videos
    </NuxtLink>

    <header class="mb-6">
      <div v-if="video.tags?.length" class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="tag in video.tags"
          :key="tag"
          class="px-2.5 py-0.5 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-medium rounded-full"
        >
          {{ tag }}
        </span>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white leading-snug mb-3">{{ video.title }}</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-4">{{ video.description }}</p>
      <time class="text-sm text-gray-400 dark:text-gray-500">{{ formatDate(video.date) }}</time>
    </header>

    <!-- YouTube embed -->
    <ContentYoutubeEmbed :id="video.youtubeId" :title="video.title" class="mb-10" />

    <!-- Additional content / notes -->
    <div v-if="video.body" class="prose prose-gray dark:prose-invert prose-lg max-w-none dark:text-gray-300">
      <ContentRenderer :value="video" />
    </div>
  </article>
</template>

<script lang="ts">
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
</script>
