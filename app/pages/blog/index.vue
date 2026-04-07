<script setup lang="ts">
useSeoMeta({ title: 'Blog — BridgeAI Learn' })

const { data: posts } = await useAsyncData('blog-list', () =>
  queryCollection('blog').order('date', 'DESC').all()
)
</script>

<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/" class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-xs sm:text-sm rounded-lg hover:shadow-[0_0_15px_rgba(107,114,128,0.4)] hover:scale-105 transition-all duration-300 mb-4">
        ↑ Back to Home
      </NuxtLink>
    </div>
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300 mb-2">Blog</h1>
    <p class="text-gray-500 dark:text-gray-400 mb-10 transition-colors duration-300">Articles on AI learning, tutorials, and deep dives.</p>

    <div v-if="posts?.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <PostCard v-for="post in posts" :key="post.path" :post="post" />
    </div>
    <p v-else class="text-gray-400 dark:text-gray-500 transition-colors duration-300">No posts yet.</p>
  </div>
</template>
