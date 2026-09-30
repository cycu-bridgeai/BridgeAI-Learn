<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  post: {
    path: string
    title: string
    description: string
    date: string
    tags?: string[]
    thumbnail?: string
  }
  section?: 'blog' | 'cs'
}>(), {
  section: 'blog',
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

const config = useRuntimeConfig()

const thumbnailSrc = computed(() => {
  const thumbnail = props.post.thumbnail
  const baseURL = config.app.baseURL === '/'
    ? ''
    : config.app.baseURL.replace(/\/$/, '')

  if (!thumbnail)
    return undefined

  if (/^(?:[a-z]+:)?\/\//i.test(thumbnail) || thumbnail.startsWith('data:'))
    return thumbnail

  if (config.app.baseURL !== '/' && thumbnail.startsWith(config.app.baseURL))
    return thumbnail

  return `${baseURL}${thumbnail.startsWith('/') ? thumbnail : `/${thumbnail}`}`
})
</script>

<template>
  <div
    :class="[`section-${section}`, 'group relative flex flex-col bg-surface rounded-card overflow-hidden shadow-sm hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300 h-full border border-line']"
  >
    <!-- Card Link (covers whole card) -->
    <NuxtLink :to="post.path" class="absolute inset-0 z-0" :aria-label="post.title" />

    <!-- Image Section -->
    <div 
      class="aspect-video overflow-hidden shrink-0 w-full"
    >
      <img v-if="thumbnailSrc" :src="thumbnailSrc" :alt="post.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div v-else class="w-full h-full bg-gradient-to-br from-section/10 to-section/20 flex items-center justify-center transition-colors duration-300">
        <svg class="w-8 sm:w-12 h-8 sm:h-12 text-section group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    </div>

    <!-- Content Section -->
    <div class="p-4 sm:p-6 flex flex-col flex-1 relative z-10 pointer-events-none">
      <h3 
        class="font-bold text-sm sm:text-base text-ink dark:drop-shadow-md mb-2 group-hover:text-section transition-colors line-clamp-2"
      >
        {{ post.title }}
      </h3>
      
      <p 
        class="text-xs sm:text-sm text-ink-muted dark:drop-shadow-sm line-clamp-2 mb-4"
      >
        {{ post.description }}
      </p>

      <div class="mt-auto pt-4 border-t border-line flex flex-wrap items-center gap-2 pointer-events-auto">
        <time class="text-xs text-ink-muted mr-1 shrink-0">
          {{ formatDate(post.date) }}
        </time>
        <template v-if="post.tags?.length">
          <TagChip
            v-for="tag in post.tags"
            :key="tag"
            :tag="tag"
            :section="section"
          />
        </template>
      </div>
    </div>
  </div>
</template>
