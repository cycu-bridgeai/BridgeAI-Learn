<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  video: {
    path: string
    title: string
    description: string
    date: string
    youtubeId: string
    tags?: string[]
  }
}>()

// Use YouTube's thumbnail API
const thumbnail = computed(
  () => `https://img.youtube.com/vi/${props.video.youtubeId}/mqdefault.jpg`
)

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
</script>

<template>
  <div
    class="section-videos group relative flex flex-col bg-surface rounded-card overflow-hidden shadow-sm hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300 h-full border border-line"
  >
    <!-- Card Link (covers whole card) -->
    <NuxtLink :to="video.path" class="absolute inset-0 z-0" :aria-label="video.title" />

    <div class="relative aspect-video overflow-hidden bg-surface-muted shrink-0">
      <img :src="thumbnail" :alt="video.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <!-- Dark overlay on hover -->
      <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
      <!-- Play button overlay -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-10 sm:w-14 h-10 sm:h-14 bg-section/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300">
          <svg class="w-4 sm:w-6 h-4 sm:h-6 text-white ml-0.5 sm:ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        </div>
      </div>
      <!-- Call to action text -->
      <div class="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 text-white text-xs sm:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        點擊觀看
      </div>
    </div>

    <div class="p-4 sm:p-6 flex flex-col flex-1 relative z-10 pointer-events-none">
      <h3 class="font-bold text-sm sm:text-base text-ink dark:drop-shadow-md mb-2 group-hover:text-section transition-colors line-clamp-2">
        {{ video.title }}
      </h3>
      <p class="text-xs sm:text-sm text-ink-muted dark:drop-shadow-sm line-clamp-2 mb-4">{{ video.description }}</p>
      
      <div class="mt-auto pt-4 border-t border-line flex flex-wrap items-center gap-2 pointer-events-auto">
        <time class="text-xs text-ink-muted mr-1 shrink-0">{{ formatDate(video.date) }}</time>
        <template v-if="video.tags?.length">
          <TagChip
            v-for="tag in video.tags"
            :key="tag"
            :tag="tag"
            section="videos"
          />
        </template>
      </div>
    </div>
  </div>
</template>
