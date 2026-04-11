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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
</script>

<template>
  <article v-if="video" class="max-w-3xl mx-auto">
    <NuxtLink to="/videos" class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold text-xs sm:text-sm rounded-lg hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:scale-105 transition-all duration-300 mb-8">
      ← Back to Videos
    </NuxtLink>

    <header class="mb-8">
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">{{ video.title }}</h1>
      <p class="text-lg text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{{ video.description }}</p>
      
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
        <time class="text-sm text-gray-400 dark:text-gray-500">{{ formatDate(video.date) }}</time>
        
        <div v-if="video.tags?.length" class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="tag in video.tags"
            :key="tag"
            :to="`/tags/${tag}`"
            class="px-2.5 py-0.5 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-medium rounded-full hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
          >
            #{{ tag }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- YouTube embed -->
    <ContentYoutubeEmbed :id="video.youtubeId" :title="video.title" class="mb-10" />

    <!-- Additional content / notes -->
    <div v-if="video.body" class="prose prose-slate dark:prose-invert prose-lg max-w-none">
      <ContentRenderer :value="video" />
    </div>
  </article>
</template>
