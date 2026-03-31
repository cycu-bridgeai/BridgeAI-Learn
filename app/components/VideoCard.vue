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
  <NuxtLink
    :to="video.path"
    class="group block bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl border-l-4 border-l-red-500 dark:border-l-red-600 border-r border-r-gray-200 dark:border-r-gray-700 border-t border-t-gray-200 dark:border-t-gray-700 border-b border-b-gray-200 dark:border-b-gray-700 overflow-hidden shadow-sm hover:shadow-lg dark:shadow-md dark:hover:shadow-lg hover:border-l-red-600 dark:hover:border-l-red-500 transition-all duration-300"
  >
    <div class="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
      <img :src="thumbnail" :alt="video.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      <!-- Dark overlay on hover -->
      <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
      <!-- Play button overlay -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-10 sm:w-14 h-10 sm:h-14 bg-red-600 dark:bg-red-700 bg-opacity-90 rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 hover:animate-pulse">
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
    <div class="p-3 sm:p-5">
      <div v-if="video.tags?.length" class="flex flex-wrap gap-2 mb-2 sm:mb-3">
        <span
          v-for="tag in video.tags"
          :key="tag"
          class="px-2 sm:px-3 py-0.5 sm:py-1 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-semibold rounded-full border border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/60 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200"
        >
          {{ tag }}
        </span>
      </div>
      <h3 class="font-bold text-sm sm:text-base text-gray-900 dark:text-white dark:drop-shadow-md mb-1 sm:mb-2 group-hover:text-red-600 dark:group-hover:text-gray-100 transition-colors line-clamp-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-500 dark:after:bg-white after:transition-all after:duration-300 group-hover:after:w-full">
        {{ video.title }}
      </h3>
      <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 dark:drop-shadow-sm line-clamp-2 mb-2 sm:mb-3">{{ video.description }}</p>
      <time class="text-xs text-gray-400 dark:text-gray-400">{{ formatDate(video.date) }}</time>
    </div>
  </NuxtLink>
</template>

