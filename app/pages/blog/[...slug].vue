<script setup lang="ts">
const route = useRoute()
const slug = (route.params.slug as string[]).join('/')

const { data: post } = await useAsyncData(`blog-${slug}`, () =>
  queryCollection('blog').path(`/blog/${slug}`).first()
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

useSeoMeta({
  title: () => `${post.value?.title} — BridgeAI Learn`,
  description: () => post.value?.description,
})
</script>

<template>
  <article v-if="post" class="max-w-3xl mx-auto">
    <!-- Back link -->
    <NuxtLink to="/blog" class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 mb-8 transition-colors">
      ← Back to Blog
    </NuxtLink>

    <!-- Header -->
    <header class="mb-10">
      <div v-if="post.tags?.length" class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full"
        >
          {{ tag }}
        </span>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white leading-snug mb-3">{{ post.title }}</h1>
      <p class="text-gray-500 dark:text-gray-400 text-base mb-4">{{ post.description }}</p>
      <time class="text-sm text-gray-400 dark:text-gray-500">{{ formatDate(post.date) }}</time>
    </header>

    <!-- Content -->
    <div class="prose prose-gray dark:prose-invert prose-lg max-w-none dark:text-gray-300">
      <ContentRenderer :value="post" />
    </div>
  </article>
</template>

<script lang="ts">
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
</script>
