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
  <div class="section-blog">
    <div class="mb-6">
      <SectionButton to="/" section="neutral" class="mb-4">
        ↑ Back to Home
      </SectionButton>
    </div>
    <h1 class="text-3xl font-bold text-ink transition-colors duration-300 mb-2">Blog</h1>
    <p class="text-ink-muted mb-6 transition-colors duration-300">Articles on AI learning, tutorials, and deep dives.</p>

    <!-- Tag Filter -->
    <div v-if="allTags.length" class="flex flex-wrap gap-2 mb-8">
      <button
        @click="selectedTag = null"
        :class="[
          'px-3 py-1 rounded-chip text-xs font-semibold transition-colors',
          selectedTag === null
            ? 'bg-section text-white'
            : 'bg-surface-muted text-ink-muted hover:bg-surface-muted'
        ]"
      >
        All
      </button>
      <button
        v-for="tag in allTags"
        :key="tag"
        @click="selectedTag = selectedTag === tag ? null : tag"
        :class="[
          'px-3 py-1 rounded-chip text-xs font-semibold transition-colors',
          selectedTag === tag
            ? 'bg-section text-white'
            : 'bg-section/10 text-section hover:bg-section/20'
        ]"
      >
        #{{ tag }}
      </button>
    </div>

    <div v-if="filteredPosts.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <PostCard v-for="post in filteredPosts" :key="post.path" :post="post" />
    </div>
    <p v-else class="text-ink-muted transition-colors duration-300">No posts found.</p>
  </div>
</template>
