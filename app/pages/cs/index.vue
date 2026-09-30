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
  <div class="section-cs">
    <div class="mb-6">
      <SectionButton to="/" section="neutral" class="mb-4">
        ↑ Back to Home
      </SectionButton>
    </div>

    <div class="mb-8 sm:mb-10">
      <div class="flex items-center gap-3 mb-2">
        <span class="w-2 sm:w-2.5 h-7 sm:h-8 bg-section rounded-full inline-block shrink-0" aria-hidden="true" />
        <h1 class="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight transition-colors duration-300">計概專區</h1>
      </div>
      <p class="text-base sm:text-lg text-ink-muted transition-colors duration-300">依課程單元整理的上課卡關點。</p>
    </div>

    <section v-for="group in groups" :key="group.unit.id" class="mb-12 sm:mb-16">
      <div class="flex items-center gap-3 pb-3 mb-6 border-b border-line transition-colors duration-300">
        <h2 class="text-xl sm:text-2xl font-bold text-ink transition-colors duration-300">{{ group.unit.name }}</h2>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-chip text-xs font-semibold bg-section/10 text-section border border-section/30 transition-colors">
          {{ group.posts.length }} 篇
        </span>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <PostCard v-for="post in group.posts" :key="post.path" :post="post" section="cs" />
      </div>
    </section>

    <div v-if="!groups?.length" class="text-center py-16 text-ink-muted border border-dashed border-line rounded-panel transition-colors duration-300">
      <svg class="w-12 h-12 mx-auto text-ink-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <p class="font-medium">尚無文章。</p>
    </div>
  </div>
</template>
