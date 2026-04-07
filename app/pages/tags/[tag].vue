<script setup lang="ts">
const route = useRoute()
const tag = route.params.tag as string

useSeoMeta({
  title: `Tag: ${tag} — BridgeAI Learn`,
  description: `Content tagged with ${tag}`
})

const { getContentByTag } = useTags()

// Query both collections using composable
const { data: tagContent } = await useAsyncData(`tags-${tag}`, () => getContentByTag(tag))

// Combine blogs and videos, sorted by date DESC
const results = computed(() => {
  if (!tagContent.value) return []
  
  const combined = [
    ...tagContent.value.blogs.map(b => ({ ...b, type: 'blog' })),
    ...tagContent.value.videos.map(v => ({ ...v, type: 'video' }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return combined
})
</script>

<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/" class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-xs sm:text-sm rounded-lg hover:shadow-[0_0_15px_rgba(107,114,128,0.4)] hover:scale-105 transition-all duration-300 mb-4">
        ↑ Back to Home
      </NuxtLink>
    </div>
    <h1 class="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
        <span class="text-blue-600">#</span> {{ tag }}
      </h1>
    <p class="text-gray-500 dark:text-gray-400 mt-2 mb-10">
      Showing all articles and videos tagged with "{{ tag }}".
    </p>

    <div v-if="results.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <template v-for="item in results" :key="item.path">
        <PostCard v-if="item.type === 'blog'" :post="item as any" />
        <VideoCard v-else :video="item as any" />
      </template>
    </div>
    
    <div v-else class="py-20 text-center">
      <p class="text-gray-400 dark:text-gray-500 text-lg">No content found for this tag.</p>
      <NuxtLink to="/" class="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg">
        Go Home
      </NuxtLink>
    </div>
  </div>
</template>
