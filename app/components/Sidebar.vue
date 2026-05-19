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
    <h2 v-if="title" class="mb-3 text-sm font-bold text-gray-900 dark:text-white">
      {{ title }}
    </h2>
    <ul class="space-y-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
      <li v-for="link in links" :key="link.id">
        <a
          :href="`#${link.id}`"
          class="block rounded px-2 py-1 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
        >
          {{ link.text }}
        </a>
        <ul
          v-if="link.children?.length"
          class="mt-1 space-y-1 border-l border-gray-200 pl-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400"
        >
          <li v-for="child in link.children" :key="child.id">
            <a
              :href="`#${child.id}`"
              class="block rounded px-2 py-1 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
            >
              {{ child.text }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
