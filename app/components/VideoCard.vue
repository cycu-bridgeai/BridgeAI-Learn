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
    class="group relative flex flex-col bg-white dark:bg-gray-950 rounded-lg sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 transition-all duration-300 h-full border border-gray-100 dark:border-gray-800"
  >
    <!-- Card Link (covers whole card) -->
    <NuxtLink :to="video.path" class="absolute inset-0 z-0" :aria-label="video.title" />

    <div class="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
      <img :src="thumbnail" :alt="video.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <!-- Dark overlay on hover -->
      <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
      <!-- Play button overlay -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-10 sm:w-14 h-10 sm:h-14 bg-red-600 dark:bg-red-700 bg-opacity-90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300">
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
      <h3 class="font-bold text-sm sm:text-base text-gray-900 dark:text-white dark:drop-shadow-md mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
        {{ video.title }}
      </h3>
      <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 dark:drop-shadow-sm line-clamp-2 mb-4">{{ video.description }}</p>
      
      <div class="mt-auto pt-4 border-t border-gray-50 dark:border-gray-800 flex flex-wrap items-center gap-y-2 pointer-events-auto">
        <time class="text-xs text-gray-400 dark:text-gray-500 mr-3 shrink-0">{{ formatDate(video.date) }}</time>
        
        <div v-if="video.tags?.length" class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="tag in video.tags"
            :key="tag"
            :to="`/tags/${tag}`"
            class="px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-[10px] sm:text-xs font-semibold rounded-full hover:bg-red-100 dark:hover:bg-red-800/50 transition-colors z-20"
          >
            #{{ tag }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
