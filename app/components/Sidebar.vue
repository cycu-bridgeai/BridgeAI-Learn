<script setup lang="ts">
type SidebarLink = {
  id: string
  text: string
  children?: SidebarLink[]
}

withDefaults(defineProps<{
  links: SidebarLink[]
  title?: string
}>(), {
  title: '目錄',
})
</script>

<template>
  <nav :aria-label="title || '目錄'">
    <h2 v-if="title" class="mb-3 text-sm font-bold text-ink">
      {{ title }}
    </h2>
    <ul class="space-y-1 text-sm leading-6 text-ink-muted">
      <li v-for="link in links" :key="link.id">
        <a
          :href="`#${link.id}`"
          class="block rounded-card px-2 py-1 transition-colors hover:bg-section/20 hover:text-section focus-visible:outline focus-visible:outline-2 focus-visible:outline-section"
        >
          {{ link.text }}
        </a>
        <ul
          v-if="link.children?.length"
          class="mt-1 space-y-1 border-l border-line pl-3 text-xs text-ink-muted"
        >
          <li v-for="child in link.children" :key="child.id">
            <a
              :href="`#${child.id}`"
              class="block rounded-card px-2 py-1 transition-colors hover:bg-section/20 hover:text-section focus-visible:outline focus-visible:outline-2 focus-visible:outline-section"
            >
              {{ child.text }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
