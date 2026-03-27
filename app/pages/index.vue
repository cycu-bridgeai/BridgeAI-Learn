<script setup lang="ts">
const { data: latestPosts } = await useAsyncData('home-blog', () =>
  queryCollection('blog').order('date', 'DESC').limit(3).all()
)

const { data: latestVideos } = await useAsyncData('home-videos', () =>
  queryCollection('videos').order('date', 'DESC').limit(3).all()
)
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="text-center py-16">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">BridgeAI Learn</h1>
      <p class="text-lg text-gray-500 max-w-xl mx-auto">
        Tutorials, articles, and videos on AI concepts and practical learning.
      </p>
      <div class="mt-8 flex justify-center gap-4">
        <NuxtLink to="/blog" class="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Read Blog
        </NuxtLink>
        <NuxtLink to="/videos" class="px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
          Watch Videos
        </NuxtLink>
      </div>
    </section>

    <!-- Latest Posts -->
    <section v-if="latestPosts?.length" class="mb-14">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Latest Articles</h2>
        <NuxtLink to="/blog" class="text-sm text-blue-600 hover:underline">View all →</NuxtLink>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <PostCard v-for="post in latestPosts" :key="post.path" :post="post" />
      </div>
    </section>

    <!-- Latest Videos -->
    <section v-if="latestVideos?.length">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Latest Videos</h2>
        <NuxtLink to="/videos" class="text-sm text-blue-600 hover:underline">View all →</NuxtLink>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <VideoCard v-for="video in latestVideos" :key="video.path" :video="video" />
      </div>
    </section>
  </div>
</template>
