<script setup lang="ts">
defineProps<{
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
</script>

<template>
  <NuxtLink
    :to="post.path"
    class="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all"
  >
    <div v-if="post.thumbnail" class="aspect-video overflow-hidden">
      <img :src="post.thumbnail" :alt="post.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    </div>
    <div v-else class="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <svg class="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <div class="p-5">
      <div v-if="post.tags?.length" class="flex flex-wrap gap-1.5 mb-3">
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded"
        >
          {{ tag }}
        </span>
      </div>
      <h3 class="font-semibold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-2">
        {{ post.title }}
      </h3>
      <p class="text-sm text-gray-500 line-clamp-2 mb-3">{{ post.description }}</p>
      <time class="text-xs text-gray-400">{{ formatDate(post.date) }}</time>
    </div>
  </NuxtLink>
</template>
