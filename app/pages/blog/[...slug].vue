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
  title: () => `${post.value?.title} - BridgeAI Learn`,
  description: () => post.value?.description,
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

const config = useRuntimeConfig()

const thumbnailSrc = computed(() => {
  const thumbnail = post.value?.thumbnail
  const baseURL = config.app.baseURL === '/'
    ? ''
    : config.app.baseURL.replace(/\/$/, '')

  if (!thumbnail)
    return undefined

  if (/^(?:[a-z]+:)?\/\//i.test(thumbnail) || thumbnail.startsWith('data:'))
    return thumbnail

  if (config.app.baseURL !== '/' && thumbnail.startsWith(config.app.baseURL))
    return thumbnail

  return `${baseURL}${thumbnail.startsWith('/') ? thumbnail : `/${thumbnail}`}`
})

type TocLink = {
  id: string
  text: string
  children?: TocLink[]
}

const tocLinks = computed<TocLink[]>(() => {
  const body = post.value?.body as { toc?: { links?: TocLink[] } } | undefined
  return body?.toc?.links ?? []
})
</script>

<template>
  <aside
    v-if="post && tocLinks.length"
    class="group fixed bottom-0 left-0 top-16 z-20 hidden w-72 -translate-x-60 transition-transform duration-200 ease-out hover:translate-x-0 focus-within:translate-x-0 xl:block"
  >
    <div class="relative h-full border-r border-gray-200 bg-white/95 py-6 pl-5 pr-14 shadow-lg shadow-gray-900/10 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 dark:shadow-black/30">
      <div class="h-full overflow-y-auto pr-2">
        <Sidebar :links="tocLinks" title="目錄" />
      </div>
      <div class="absolute right-0 top-6 flex h-28 w-12 items-center justify-center rounded-r-lg border border-l-0 border-gray-200 bg-white text-xs font-bold tracking-widest text-gray-500 shadow-sm transition-colors group-hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:group-hover:text-blue-300">
        <span class="[writing-mode:vertical-rl]">目錄</span>
      </div>
    </div>
  </aside>

  <article v-if="post" class="relative left-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-[52rem]">
      <main class="min-w-0">
        <NuxtLink to="/blog" class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm rounded-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:scale-105 transition-all duration-300 mb-8">
          Back to Blog
        </NuxtLink>

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

          <details v-if="tocLinks.length" class="mt-6 rounded-lg border border-gray-200 bg-white/80 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40 xl:hidden">
            <summary class="cursor-pointer text-sm font-bold text-gray-900 dark:text-white">文章目錄</summary>
            <Sidebar :links="tocLinks" title="" class="mt-3" />
          </details>

          <img v-if="thumbnailSrc" :src="thumbnailSrc" :alt="post.title" class="w-full rounded-2xl object-cover mt-6" />
        </header>

        <div class="prose prose-gray dark:prose-invert prose-lg max-w-none dark:text-gray-300">
          <ContentRenderer :value="post" />
        </div>
      </main>
    </div>
  </article>
</template>
