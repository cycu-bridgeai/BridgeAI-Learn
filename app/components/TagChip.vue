<script setup lang="ts">
withDefaults(defineProps<{
  tag: string
  section?: 'blog' | 'cs' | 'videos' | 'works'
}>(), { section: 'blog' })
</script>

<template>
  <NuxtLink
    :to="`/tags/${tag}`"
    :class="[
      `section-${section}`,
      'relative z-20 rounded-chip bg-section/10 px-2 py-0.5 text-[10px] font-semibold text-section transition-colors hover:bg-section/20 sm:text-xs',
    ]"
  >
    #{{ tag }}
  </NuxtLink>
</template>
