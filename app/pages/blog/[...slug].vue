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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
</script>
<template>
  <article v-if="post" class="max-w-3xl mx-auto">
    <NuxtLink to="/blog" class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm rounded-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:scale-105 transition-all duration-300 mb-8">
      ← Back to Blog
    </NuxtLink>

    <!-- Header -->
    <header class="mb-10">
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">{{ post.title }}</h1>
      <p class="text-lg text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{{ post.description }}</p>
      
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
        <time class="text-sm text-gray-400 dark:text-gray-500">{{ formatDate(post.date) }}</time>
        
        <div v-if="post.tags?.length" class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="tag in post.tags"
            :key="tag"
            :to="`/tags/${tag}`"
            class="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
          >
            #{{ tag }}
          </NuxtLink>
        </div>
      </div>

      <!-- Thumbnail -->
      <img v-if="post.thumbnail" :src="post.thumbnail" :alt="post.title" class="w-full rounded-2xl object-cover mt-6" />
    </header>

    <!-- Content -->
    <div class="prose prose-gray dark:prose-invert prose-lg max-w-none dark:text-gray-300">
      <ContentRenderer :value="post" />
    </div>
  </article>
</template>
