<script setup lang="ts">
withDefaults(defineProps<{
  to: string
  section?: 'blog' | 'cs' | 'videos' | 'works' | 'neutral'
  size?: 'sm' | 'md'
}>(), { section: 'neutral', size: 'sm' })
</script>

<template>
  <NuxtLink
    :to="to"
    :class="[
      `section-${section}`,
      'inline-flex items-center gap-1.5 rounded-card bg-section/10 font-semibold text-section transition-all duration-300 hover:scale-105 hover:shadow-glow',
      size === 'sm' ? 'px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm' : 'px-6 py-2.5 text-sm sm:px-8 sm:py-3.5 sm:text-base',
    ]"
  >
    <slot />
  </NuxtLink>
</template>
