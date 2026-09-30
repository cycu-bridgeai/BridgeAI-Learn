<script setup lang="ts">
useSeoMeta({ title: 'Blog — BridgeAI Learn' })

const { data: posts } = await useAsyncData('blog-list', () =>
  queryCollection('blog').order('date', 'DESC').all()
)

const selectedTag = ref<string | null>(null)

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

    <TagFilter v-model="selectedTag" :posts="posts ?? []" />

    <div v-if="filteredPosts.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <PostCard v-for="post in filteredPosts" :key="post.path" :post="post" />
    </div>
    <p v-else class="text-ink-muted transition-colors duration-300">No posts found.</p>
  </div>
</template>
