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

// Combine blogs, videos and works, sorted by date DESC
const results = computed(() => {
  if (!tagContent.value) return []
  
  const combined = [
    ...tagContent.value.blogs.map(b => ({ ...b, type: 'blog' })),
    ...tagContent.value.videos.map(v => ({ ...v, type: 'video' })),
    ...tagContent.value.works.map(w => ({ ...w, type: 'work' })),
    ...tagContent.value.cs.map(c => ({ ...c, type: 'cs' }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return combined
})
</script>

<template>
  <div>
    <div class="mb-6">
      <SectionButton to="/" section="neutral" class="mb-4">
        ↑ Back to Home
      </SectionButton>
    </div>
    <h1 class="text-3xl sm:text-4xl font-black text-ink flex items-center gap-3">
        <span class="text-section">#</span> {{ tag }}
      </h1>
    <p class="text-ink-muted mt-2 mb-10">
      Showing all articles, videos, and student works tagged with "{{ tag }}".
    </p>

    <div v-if="results.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <template v-for="item in results" :key="item.path">
        <PostCard v-if="item.type === 'blog'" :post="item as any" />
        <PostCard v-else-if="item.type === 'cs'" :post="item as any" section="cs" />
        <WorkCard v-else-if="item.type === 'work'" :work="item as any" />
        <VideoCard v-else :video="item as any" />
      </template>
    </div>
    
    <div v-else class="py-20 text-center">
      <p class="text-ink-muted text-lg">No content found for this tag.</p>
      <NuxtLink to="/" class="mt-4 inline-block px-6 py-2 bg-section hover:bg-section/90 text-white rounded-card">
        Go Home
      </NuxtLink>
    </div>
  </div>
</template>
