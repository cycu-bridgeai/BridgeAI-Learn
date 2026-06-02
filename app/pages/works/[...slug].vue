<script setup lang="ts">
const route = useRoute()
const slug = (route.params.slug as string[]).join('/')

const { data: work } = await useAsyncData(`work-${slug}`, () =>
  queryCollection('works').path(`/works/${slug}`).first()
)

if (!work.value) {
  throw createError({ statusCode: 404, statusMessage: 'Work not found' })
}

useSeoMeta({
  title: () => `${work.value?.title} - BridgeAI Learn`,
  description: () => work.value?.description,
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

const config = useRuntimeConfig()

const thumbnailSrc = computed(() => {
  const thumbnail = work.value?.thumbnail
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
  const body = work.value?.body as { toc?: { links?: TocLink[] } } | undefined
  return body?.toc?.links ?? []
})
</script>

<template>
  <aside
    v-if="work && tocLinks.length"
    class="group fixed bottom-0 left-0 top-16 z-20 hidden w-72 -translate-x-60 transition-transform duration-200 ease-out hover:translate-x-0 focus-within:translate-x-0 xl:block"
  >
    <div class="relative h-full border-r border-gray-200 bg-white/95 py-6 pl-5 pr-14 shadow-lg shadow-gray-900/10 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 dark:shadow-black/30">
      <div class="h-full overflow-y-auto pr-2">
        <Sidebar :links="tocLinks" title="目錄" />
      </div>
      <div class="absolute right-0 top-6 flex h-28 w-12 items-center justify-center rounded-r-lg border border-l-0 border-gray-200 bg-white text-xs font-bold tracking-widest text-gray-500 shadow-sm transition-colors group-hover:text-purple-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:group-hover:text-purple-300">
        <span class="[writing-mode:vertical-rl]">目錄</span>
      </div>
    </div>
  </aside>

  <article v-if="work" class="relative left-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-[52rem]">
      <main class="min-w-0">
        <NuxtLink to="/works" class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-semibold text-xs sm:text-sm rounded-lg hover:shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:scale-105 transition-all duration-300 mb-8">
          Back to Works
        </NuxtLink>

        <header class="mb-10">
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-xs font-bold rounded-lg shrink-0">
               👤 作者: {{ work.author }}
            </span>
          </div>
          
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">{{ work.title }}</h1>
          <p class="text-lg text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{{ work.description }}</p>

          <!-- Integration buttons inside detail page header -->
          <div v-if="work.demoUrl || work.githubUrl" class="flex flex-wrap gap-3 mb-6">
            <a
              v-if="work.demoUrl"
              :href="work.demoUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg flex items-center gap-2 transition-all hover:scale-105 shadow-md shadow-purple-500/20 active:scale-95 text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              造訪 Demo 成果網頁
            </a>
            <a
              v-if="work.githubUrl"
              :href="work.githubUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-gray-200 dark:border-gray-700 text-sm"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              查看 GitHub 程式碼
            </a>
          </div>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <time class="text-sm text-gray-400 dark:text-gray-500">{{ formatDate(work.date) }}</time>

            <div v-if="work.tags?.length" class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="tag in work.tags"
                :key="tag"
                :to="`/tags/${tag}`"
                class="px-2.5 py-0.5 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
              >
                #{{ tag }}
              </NuxtLink>
            </div>
          </div>

          <details v-if="tocLinks.length" class="mt-6 rounded-lg border border-gray-200 bg-white/80 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40 xl:hidden">
            <summary class="cursor-pointer text-sm font-bold text-gray-900 dark:text-white">文章目錄</summary>
            <Sidebar :links="tocLinks" title="" class="mt-3" />
          </details>

          <img v-if="thumbnailSrc" :src="thumbnailSrc" :alt="work.work" class="w-full rounded-2xl object-cover mt-6" />
        </header>

        <div class="prose prose-gray dark:prose-invert prose-lg max-w-none dark:text-gray-300">
          <ContentRenderer :value="work" />
        </div>
      </main>
    </div>
  </article>
</template>
