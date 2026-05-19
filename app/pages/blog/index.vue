<script setup lang="ts">
useSeoMeta({ title: 'Blog — BridgeAI Learn' })

const { data: posts } = await useAsyncData('blog-list', () =>
  queryCollection('blog').order('date', 'DESC').all()
)

const selectedTag = ref<string | null>(null)

const allTags = computed(() => {
  if (!posts.value) return []
  const set = new Set<string>()
  posts.value.forEach(p => p.tags?.forEach(t => set.add(t)))
  // 優先顯示 students / teachers，其餘按字母排序
  const prioritized = ['students', 'teachers']
  const rest = Array.from(set).filter(t => !prioritized.includes(t)).sort()
  return [...prioritized.filter(t => set.has(t)), ...rest]
})

const filteredPosts = computed(() => {
  if (!selectedTag.value || !posts.value) return posts.value ?? []
  return posts.value.filter(p => p.tags?.includes(selectedTag.value!))
})
</script>

<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/" class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-xs sm:text-sm rounded-lg hover:shadow-[0_0_15px_rgba(107,114,128,0.4)] hover:scale-105 transition-all duration-300 mb-4">
        ↑ Back to Home
      </NuxtLink>
    </div>
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300 mb-2">Blog</h1>
    <p class="text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-300">Articles on AI learning, tutorials, and deep dives.</p>

    <!-- Tag Filter -->
    <div v-if="allTags.length" class="flex flex-wrap gap-2 mb-8">
      <button
        @click="selectedTag = null"
        :class="[
          'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
          selectedTag === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        ]"
      >
        All
      </button>
      <button
        v-for="tag in allTags"
        :key="tag"
        @click="selectedTag = selectedTag === tag ? null : tag"
        :class="[
          'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
          selectedTag === tag
            ? 'bg-blue-600 text-white'
            : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50'
        ]"
      >
        #{{ tag }}
      </button>
    </div>

    <div v-if="filteredPosts.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <PostCard v-for="post in filteredPosts" :key="post.path" :post="post" />
    </div>
    <p v-else class="text-gray-400 dark:text-gray-500 transition-colors duration-300">No posts found.</p>
  </div>
</template>
