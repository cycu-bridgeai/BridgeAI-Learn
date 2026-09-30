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
  <article v-if="video" class="section-videos max-w-3xl mx-auto">
    <SectionButton to="/videos" section="videos" class="mb-8">
      ← Back to Videos
    </SectionButton>

    <header class="mb-8">
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-ink leading-tight mb-4">{{ video.title }}</h1>
      <p class="text-lg text-ink-muted mb-6 leading-relaxed">{{ video.description }}</p>
      
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 border-t border-line">
        <time class="text-sm text-ink-muted">{{ formatDate(video.date) }}</time>
        
        <div v-if="video.tags?.length" class="flex flex-wrap gap-2">
          <TagChip
            v-for="tag in video.tags"
            :key="tag"
            :tag="tag"
            section="videos"
          />
        </div>
      </div>
    </header>

    <!-- YouTube embed -->
    <ContentYoutubeEmbed :id="video.youtubeId" :title="video.title" class="mb-10" />

    <!-- Additional content / notes -->
    <div v-if="video.body" class="prose prose-gray dark:prose-invert prose-lg max-w-none">
      <ContentRenderer :value="video" />
    </div>
  </article>
</template>
