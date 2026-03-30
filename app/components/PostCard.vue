<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  post: {
    path: string
    title: string
    description: string
    date: string
    tags?: string[]
    thumbnail?: string
  }
}>()

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

// Generate gradient color based on title for no-thumbnail case
const gradientColor = computed(() => {
  const colors = [
    'from-blue-50 dark:from-blue-900/30 to-indigo-100 dark:to-indigo-900/30',
    'from-blue-50 dark:from-blue-900/30 to-cyan-100 dark:to-cyan-900/30',
    'from-indigo-50 dark:from-indigo-900/30 to-purple-100 dark:to-purple-900/30',
    'from-violet-50 dark:from-violet-900/30 to-purple-100 dark:to-purple-900/30',
  ]
  const hash = props.post.title.charCodeAt(0) + props.post.title.length
  return colors[hash % colors.length]
})
</script>

<template>
  <NuxtLink
    :to="post.path"
    class="group block bg-white dark:bg-gray-950 rounded-lg sm:rounded-xl border-l-4 border-l-blue-500 dark:border-l-blue-600 border-r border-r-gray-200 dark:border-r-gray-800 border-t border-t-gray-200 dark:border-t-gray-800 border-b border-b-gray-200 dark:border-b-gray-800 overflow-hidden shadow-sm hover:shadow-lg dark:shadow-md dark:hover:shadow-lg hover:border-l-blue-600 dark:hover:border-l-blue-500 transition-all duration-300"
  >
    <div v-if="post.thumbnail" class="aspect-video overflow-hidden">
      <img :src="post.thumbnail" :alt="post.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    </div>
    <div v-else :class="`aspect-video bg-gradient-to-br ${gradientColor} flex items-center justify-center relative overflow-hidden transition-colors duration-300`">
      <!-- Animated background pattern -->
      <div class="absolute inset-0 opacity-20 dark:opacity-30">
        <svg class="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#dots)" />
        </svg>
      </div>
      <svg class="w-8 sm:w-12 h-8 sm:h-12 text-blue-300 dark:text-blue-400 relative z-10 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <div class="p-3 sm:p-5">
      <div v-if="post.tags?.length" class="flex flex-wrap gap-2 mb-2 sm:mb-3">
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
        >
          {{ tag }}
        </span>
      </div>
      <h3 class="font-bold text-sm sm:text-base text-gray-900 dark:text-white dark:drop-shadow-md mb-1 sm:mb-2 group-hover:text-blue-600 dark:group-hover:text-gray-100 transition-colors line-clamp-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-500 dark:after:bg-white after:transition-all after:duration-300 group-hover:after:w-full">
        {{ post.title }}
      </h3>
      <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 dark:drop-shadow-sm line-clamp-2 mb-2 sm:mb-3">{{ post.description }}</p>
      <time class="text-xs text-gray-400 dark:text-gray-400">{{ formatDate(post.date) }}</time>
    </div>
  </NuxtLink>
</template>

