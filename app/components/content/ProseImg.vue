<script setup lang="ts">
const props = defineProps<{
  src?: string
  alt?: string
}>()

const config = useRuntimeConfig()

const resolvedSrc = computed(() => {
  const src = props.src || ''

  if (!src || config.app.baseURL === '/')
    return src

  if (/^(?:[a-z]+:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('#'))
    return src

  if (src.startsWith(config.app.baseURL))
    return src

  if (!src.startsWith('/'))
    return src

  return `${config.app.baseURL.replace(/\/$/, '')}${src}`
})
</script>

<template>
  <img v-bind="$attrs" :src="resolvedSrc" :alt="alt || ''">
</template>
