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

    <div class="mb-8 sm:mb-10">
      <div class="flex items-center gap-3 mb-2">
        <span class="w-2 sm:w-2.5 h-7 sm:h-8 bg-emerald-500 rounded-full inline-block shrink-0" aria-hidden="true" />
        <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">計概專區</h1>
      </div>
      <p class="text-base sm:text-lg text-gray-500 dark:text-gray-400 transition-colors duration-300">依課程單元整理的上課卡關點。</p>
    </div>

    <section v-for="group in groups" :key="group.unit.id" class="mb-12 sm:mb-16">
      <div class="flex items-center gap-3 pb-3 mb-6 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{{ group.unit.name }}</h2>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 transition-colors">
          {{ group.posts.length }} 篇
        </span>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <PostCard v-for="post in group.posts" :key="post.path" :post="post" />
      </div>
    </section>

    <div v-if="!groups?.length" class="text-center py-16 text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl transition-colors duration-300">
      <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <p class="font-medium">尚無文章。</p>
    </div>
  </div>
</template>
