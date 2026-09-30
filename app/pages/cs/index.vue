<script setup lang="ts">
useSeoMeta({ title: '計概專區 — BridgeAI Learn' })

const { data: groups } = await useAsyncData('cs-list', async () => {
  const [unitsDoc, posts] = await Promise.all([
    queryCollection('csUnits').first(),
    queryCollection('cs').all(),
  ])
  return groupCsByUnit(unitsDoc?.units ?? [], posts)
})
</script>

<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/" class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-xs sm:text-sm rounded-lg hover:shadow-[0_0_15px_rgba(107,114,128,0.4)] hover:scale-105 transition-all duration-300 mb-4">
        ↑ Back to Home
      </NuxtLink>
    </div>
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300 mb-2">計概專區</h1>
    <p class="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">依課程單元整理的上課卡關點。</p>

    <section v-for="group in groups" :key="group.unit.id" class="mb-10">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">{{ group.unit.name }}</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <PostCard v-for="post in group.posts" :key="post.path" :post="post" />
      </div>
    </section>

    <p v-if="!groups?.length" class="text-gray-400 dark:text-gray-500 transition-colors duration-300">尚無文章。</p>
  </div>
</template>
