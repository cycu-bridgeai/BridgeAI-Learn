<script setup lang="ts">
const props = defineProps<{
  posts: { tags?: string[] }[]
}>()

const selected = defineModel<string | null>({ default: null })

const allTags = computed(() => {
  const set = new Set<string>()
  props.posts.forEach(p => p.tags?.forEach(t => set.add(t)))
  // 優先顯示 students / teachers，其餘按字母排序
  const prioritized = ['students', 'teachers']
  const rest = Array.from(set).filter(t => !prioritized.includes(t)).sort()
  return [...prioritized.filter(t => set.has(t)), ...rest]
})
</script>

<template>
  <div v-if="allTags.length" class="flex flex-wrap gap-2 mb-8">
    <button
      @click="selected = null"
      :class="[
        'px-3 py-1 rounded-chip text-xs font-semibold transition-colors',
        selected === null
          ? 'bg-section text-white'
          : 'bg-surface-muted text-ink-muted hover:bg-surface-muted'
      ]"
    >
      All
    </button>
    <button
      v-for="tag in allTags"
      :key="tag"
      @click="selected = selected === tag ? null : tag"
      :class="[
        'px-3 py-1 rounded-chip text-xs font-semibold transition-colors',
        selected === tag
          ? 'bg-section text-white'
          : 'bg-section/10 text-section hover:bg-section/20'
      ]"
    >
      #{{ tag }}
    </button>
  </div>
</template>
