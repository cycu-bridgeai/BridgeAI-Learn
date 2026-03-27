<script setup lang="ts">
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
    class="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-red-200 transition-all"
  >
    <div class="relative aspect-video overflow-hidden bg-gray-100">
      <img :src="thumbnail" :alt="video.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      <!-- Play button overlay -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-12 h-12 bg-red-600 bg-opacity-90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <svg class="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        </div>
      </div>
    </div>
    <div class="p-5">
      <div v-if="video.tags?.length" class="flex flex-wrap gap-1.5 mb-3">
        <span
          v-for="tag in video.tags"
          :key="tag"
          class="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded"
        >
          {{ tag }}
        </span>
      </div>
      <h3 class="font-semibold text-gray-900 mb-1.5 group-hover:text-red-600 transition-colors line-clamp-2">
        {{ video.title }}
      </h3>
      <p class="text-sm text-gray-500 line-clamp-2 mb-3">{{ video.description }}</p>
      <time class="text-xs text-gray-400">{{ formatDate(video.date) }}</time>
    </div>
  </NuxtLink>
</template>
