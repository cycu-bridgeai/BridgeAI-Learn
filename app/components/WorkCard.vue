<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  work: {
    path: string
    title: string
    description: string
    date: string
    author: string
    thumbnail?: string
    demoUrl?: string
    githubUrl?: string
    tags?: string[]
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
    'from-purple-50 dark:from-purple-900/30 to-fuchsia-100 dark:to-fuchsia-900/30',
    'from-indigo-50 dark:from-indigo-900/30 to-purple-100 dark:to-purple-900/30',
    'from-pink-50 dark:from-pink-900/30 to-rose-100 dark:to-rose-900/30',
    'from-violet-50 dark:from-violet-900/30 to-indigo-100 dark:to-indigo-900/30',
  ]
  const hash = props.work.title.charCodeAt(0) + props.work.title.length
  return colors[hash % colors.length]
})

const config = useRuntimeConfig()

const thumbnailSrc = computed(() => {
  const thumbnail = props.work.thumbnail
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
    class="group relative flex flex-col bg-white dark:bg-gray-950 rounded-lg sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:-translate-y-0.5 transition-all duration-300 h-full border border-gray-100 dark:border-gray-800"
  >
    <!-- Card Link (covers whole card except external action button containers) -->
    <NuxtLink :to="work.path" class="absolute inset-0 z-0" :aria-label="work.title" />

    <!-- Image Section -->
    <div class="aspect-video overflow-hidden shrink-0 w-full relative">
      <img v-if="thumbnailSrc" :src="thumbnailSrc" :alt="work.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div v-else :class="`w-full h-full bg-gradient-to-br ${gradientColor} flex items-center justify-center transition-colors duration-300`">
        <svg class="w-8 sm:w-12 h-8 sm:h-12 text-purple-400 dark:text-purple-300 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
      
      <!-- Creator Badge -->
      <span class="absolute top-2 right-2 px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg z-10">
        👤 {{ work.author }}
      </span>
    </div>

    <!-- Content Section -->
    <div class="p-4 sm:p-6 flex flex-col flex-1 relative z-10 pointer-events-none">
      <h3 
        class="font-bold text-sm sm:text-base text-gray-900 dark:text-white dark:drop-shadow-md mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2"
      >
        {{ work.title }}
      </h3>
      
      <p 
        class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 dark:drop-shadow-sm line-clamp-2 mb-4"
      >
        {{ work.description }}
      </p>

      <!-- Action buttons (Demo / GitHub) and Tag section -->
      <div class="mt-auto pointer-events-auto">
        <!-- Quick Action Links -->
        <div v-if="work.demoUrl || work.githubUrl" class="flex items-center gap-2 mb-4 z-20 relative">
          <a
            v-if="work.demoUrl"
            :href="work.demoUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex-1 py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Demo
          </a>
          <a
            v-if="work.githubUrl"
            :href="work.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="py-1.5 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95 border border-gray-200 dark:border-gray-700"
            :class="{ 'flex-1': !work.demoUrl }"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </a>
        </div>

        <div class="pt-4 border-t border-gray-50 dark:border-gray-800 flex flex-wrap items-center gap-y-2">
          <time class="text-xs text-gray-400 dark:text-gray-500 mr-3 shrink-0">
            {{ formatDate(work.date) }}
          </time>
          
          <div v-if="work.tags?.length" class="flex flex-wrap gap-2">
            <NuxtLink
              v-for="tag in work.tags"
              :key="tag"
              :to="`/tags/${tag}`"
              class="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-[10px] sm:text-xs font-semibold rounded-full hover:bg-purple-100 dark:hover:bg-purple-800/50 transition-colors z-20"
            >
              #{{ tag }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
