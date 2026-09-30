<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
}>(), {
  label: '可貼到 AI 問答的提問',
})
</script>

<template>
  <aside class="not-prose my-7 overflow-hidden rounded-panel border border-section/30 bg-section/10" :aria-label="label">
    <div class="flex items-center gap-2 border-b border-section/20 px-5 py-3 text-sm font-bold text-section">
      <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v10a2.5 2.5 0 0 1-2.5 2.5H9l-5 3v-5.5A2.5 2.5 0 0 1 4 13V5.5Z" />
        <path stroke-linecap="round" d="M8 8h8M8 12h5" />
      </svg>
      {{ label }}
    </div>
    <div class="prompt-card-text px-5 py-4 text-base leading-8 text-ink">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.prompt-card-text :deep(p) {
  margin: 0;
}

.prompt-card-text :deep(code) {
  border: 1px solid rgb(var(--color-line));
  border-radius: 0.25rem;
  background: rgb(var(--color-surface));
  padding: 0.1rem 0.25rem;
  font-family: var(--font-mono);
  font-size: 0.9em;
  overflow-wrap: anywhere;
}
</style>
