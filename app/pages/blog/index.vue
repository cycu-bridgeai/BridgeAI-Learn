<script setup lang="ts">
useSeoMeta({ title: 'Blog — BridgeAI Learn' })

const { data: posts } = await useAsyncData('blog-list', () =>
  queryCollection('blog').order('date', 'DESC').all()
)
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Blog</h1>
    <p class="text-gray-500 dark:text-gray-400 mb-10 transition-colors duration-300">Articles on AI learning, tutorials, and deep dives.</p>

    <div v-if="posts?.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <PostCard v-for="post in posts" :key="post.path" :post="post" />
    </div>
    <p v-else class="text-gray-400 dark:text-gray-500 transition-colors duration-300">No posts yet.</p>
  </div>
</template>
