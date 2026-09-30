<script setup lang="ts">
useSeoMeta({ title: '計概專區 — BridgeAI Learn' })

const { data: posts } = await useAsyncData('cs-list', () =>
  queryCollection('cs').order('date', 'DESC').all()
)

const selectedTag = ref<string | null>(null)

const filteredPosts = computed(() => {
  if (!selectedTag.value || !posts.value) return posts.value ?? []
  return posts.value.filter(p => p.tags?.includes(selectedTag.value!))
})
</script>

<template>
  <div class="section-cs">
    <div class="mb-6">
      <SectionButton to="/" section="neutral" class="mb-4">
        ↑ Back to Home
      </SectionButton>
    </div>
    <h1 class="text-3xl font-bold text-ink transition-colors duration-300 mb-2">計概專區</h1>
    <p class="text-ink-muted mb-6 transition-colors duration-300">計算機概論上課常卡關的地方，一篇解決一個。</p>

    <a
      href="https://www.youtube.com/channel/UCR8pxSRgz2rNXM5XXOISacQ"
      target="_blank"
      rel="noopener noreferrer"
      class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-panel border border-section/30 bg-section/10 px-5 py-4 transition-colors hover:bg-section/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-section"
    >
      <span>
        <span class="block text-sm font-bold text-section">老師的課堂影片</span>
        <span class="mt-1 block text-sm text-ink-muted">王老師的學習園地：想跟著影片複習，可以從這裡找。</span>
      </span>
      <span class="text-sm font-semibold text-section">前往 YouTube 頻道 ↗</span>
    </a>

    <TagFilter v-model="selectedTag" :posts="posts ?? []" />

    <div v-if="filteredPosts.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <PostCard v-for="post in filteredPosts" :key="post.path" :post="post" section="cs" />
    </div>
    <p v-else class="text-ink-muted transition-colors duration-300">尚無文章。</p>
  </div>
</template>
