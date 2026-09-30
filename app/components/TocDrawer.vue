<script setup lang="ts">
type TocLink = {
  id: string
  text: string
  children?: TocLink[]
}

defineProps<{
  links: TocLink[]
  section: 'blog' | 'cs' | 'works'
}>()

const isOpen = ref(false)
const isPinned = ref(false)
const toggleButton = ref<HTMLButtonElement | null>(null)

function toggleToc() {
  isPinned.value = !isPinned.value
  isOpen.value = isPinned.value
}

function closeToc() {
  isPinned.value = false
  isOpen.value = false
}

function closeOnMouseLeave() {
  if (!isPinned.value)
    isOpen.value = false
}

async function closeOnEscape() {
  closeToc()
  await nextTick()
  toggleButton.value?.focus()
}
</script>

<template>
  <div
    :class="[`section-${section}`, { 'is-open': isOpen }]"
    class="toc-drawer fixed bottom-0 left-0 top-16 z-30"
    @mouseleave="closeOnMouseLeave"
  >
    <button
      ref="toggleButton"
      type="button"
      class="toc-button absolute top-6 z-10 flex items-center justify-center rounded-r-lg border border-line bg-page text-xs font-bold tracking-widest text-ink-muted shadow-sm transition-[left,color] duration-200 hover:text-section focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-section"
      :aria-expanded="isOpen"
      aria-controls="article-toc"
      :aria-label="isOpen ? '收合文章目錄' : '展開文章目錄'"
      @click="toggleToc"
      @mouseenter="isOpen = true"
      @keydown.esc="closeOnEscape"
    >
      <span class="[writing-mode:vertical-rl]">目錄</span>
    </button>

    <aside
      v-show="isOpen"
      id="article-toc"
      class="toc-panel absolute bottom-0 top-0 border-r border-line bg-page/95 py-6 pl-5 pr-4 shadow-lg shadow-ink/10 backdrop-blur"
      @keydown.esc="closeOnEscape"
    >
      <div class="h-full overflow-y-auto pr-2" @click="closeToc">
        <Sidebar :links="links" title="目錄" />
      </div>
    </aside>
  </div>
</template>

<style scoped>
.toc-drawer {
  --toc-tab-width: 2.5rem;
  --toc-panel-width: min(18rem, calc(100vw - var(--toc-tab-width)));
  width: var(--toc-tab-width);
  pointer-events: none;
}

.toc-drawer.is-open {
  width: calc(var(--toc-panel-width) + var(--toc-tab-width));
  pointer-events: auto;
}

.toc-button {
  left: 0;
  width: var(--toc-tab-width);
  height: 6rem;
  pointer-events: auto;
}

.toc-panel {
  left: var(--toc-tab-width);
  width: var(--toc-panel-width);
  pointer-events: auto;
}

@media (min-width: 640px) {
  .toc-drawer {
    --toc-tab-width: 3rem;
  }

  .toc-button {
    height: 7rem;
  }
}
</style>
