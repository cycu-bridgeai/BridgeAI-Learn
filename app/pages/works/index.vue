<script setup lang="ts">
useSeoMeta({ title: 'Works — BridgeAI Learn' })

const { data: works } = await useAsyncData('works-list', () =>
  queryCollection('works').order('date', 'DESC').all()
)

const selectedTag = ref<string | null>(null)

const allTags = computed(() => {
  if (!works.value) return []
  const set = new Set<string>()
  works.value.forEach(w => w.tags?.forEach(t => set.add(t)))
  // Prioritize students & teachers, then alphabetical
  const prioritized = ['students', 'teachers']
  const rest = Array.from(set).filter(t => !prioritized.includes(t)).sort()
  return [...prioritized.filter(t => set.has(t)), ...rest]
})

const filteredWorks = computed(() => {
  if (!selectedTag.value || !works.value) return works.value ?? []
  return works.value.filter(w => w.tags?.includes(selectedTag.value!))
})
</script>

<template>
  <div class="section-works">
    <div class="mb-6">
      <SectionButton to="/" section="neutral" class="mb-4">
        ↑ Back to Home
      </SectionButton>
    </div>
    
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-ink transition-colors duration-300 mb-2">Student Works</h1>
        <p class="text-ink-muted transition-colors duration-300">期末成果、專題發表與各類 AI API 二次開發優秀作品展示。</p>
      </div>
    </div>

    <!-- Tag Filter -->
    <div v-if="allTags.length" class="flex flex-wrap gap-2 mb-8">
      <button
        @click="selectedTag = null"
        :class="[
          'px-3 py-1 rounded-chip text-xs font-semibold transition-colors',
          selectedTag === null
            ? 'bg-section text-white shadow-sm'
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
            ? 'bg-section text-white shadow-sm'
            : 'bg-section/10 text-section hover:bg-section/20'
        ]"
      >
        #{{ tag }}
      </button>
    </div>

    <div v-if="filteredWorks.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <WorkCard v-for="work in filteredWorks" :key="work.path" :work="work" />
    </div>
    <div v-else class="text-center py-12 text-ink-muted border border-dashed border-line rounded-panel transition-colors duration-300">
      <svg class="w-12 h-12 mx-auto text-ink-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <p class="font-medium">尚未發布優秀作品</p>
      <p class="text-xs mt-1 text-ink-muted">請稍後再回來查看！</p>
    </div>
  </div>
</template>
