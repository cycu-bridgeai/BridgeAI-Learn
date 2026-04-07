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
  <div
    class="group relative flex flex-col bg-white dark:bg-gray-950 rounded-lg sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition-all duration-300 h-full border border-gray-100 dark:border-gray-800"
  >
    <!-- Card Link (covers whole card) -->
    <NuxtLink :to="post.path" class="absolute inset-0 z-0" :aria-label="post.title" />

    <!-- Image Section -->
    <div 
      class="aspect-video overflow-hidden shrink-0 w-full"
    >
      <img v-if="post.thumbnail" :src="post.thumbnail" :alt="post.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div v-else :class="`w-full h-full bg-gradient-to-br ${gradientColor} flex items-center justify-center transition-colors duration-300`">
        <svg class="w-8 sm:w-12 h-8 sm:h-12 text-blue-400 dark:text-blue-300 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    </div>

    <!-- Content Section -->
    <div class="p-4 sm:p-6 flex flex-col flex-1 relative z-10 pointer-events-none">
      <h3 
        class="font-bold text-sm sm:text-base text-gray-900 dark:text-white dark:drop-shadow-md mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2"
      >
        {{ post.title }}
      </h3>
      
      <p 
        class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 dark:drop-shadow-sm line-clamp-2 mb-4"
      >
        {{ post.description }}
      </p>

      <div class="mt-auto pt-4 border-t border-gray-50 dark:border-gray-800 flex flex-wrap items-center gap-y-2 pointer-events-auto">
        <time class="text-xs text-gray-400 dark:text-gray-500 mr-3 shrink-0">
          {{ formatDate(post.date) }}
        </time>
        
        <div v-if="post.tags?.length" class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="tag in post.tags"
            :key="tag"
            :to="`/tags/${tag}`"
            class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[10px] sm:text-xs font-semibold rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors z-20"
          >
            #{{ tag }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
