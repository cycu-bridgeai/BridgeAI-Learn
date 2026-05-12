<script setup>
const config = useRuntimeConfig()
useHead({
  link: [
    { rel: 'icon', type: 'image/x-icon', href: `${config.app.baseURL}favicon.ico` }
  ]
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
