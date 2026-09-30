<script setup lang="ts">
const props = withDefaults(defineProps<{
  post: {
    title: string
    description: string
    date: string
    tags?: string[]
    thumbnail?: string
    body?: unknown
  }
  backTo: string
  backLabel: string
  section?: 'blog' | 'cs'
}>(), {
  section: 'blog',
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

const config = useRuntimeConfig()

const thumbnailSrc = computed(() => {
  const thumbnail = props.post.thumbnail
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
  const body = props.post.body as { toc?: { links?: TocLink[] } } | undefined
  return body?.toc?.links ?? []
})
</script>

<template>
  <TocDrawer v-if="tocLinks.length" :links="tocLinks" :section="section" />

  <article :class="[`section-${section}`, 'relative left-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 lg:px-8']">
    <div class="mx-auto max-w-[52rem]">
      <main class="min-w-0">
        <SectionButton :to="backTo" :section="section" class="mb-8">
          {{ backLabel }}
        </SectionButton>

        <header class="mb-10">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-ink leading-tight mb-4">{{ post.title }}</h1>
          <p class="text-lg text-ink-muted mb-6 leading-relaxed">{{ post.description }}</p>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 border-t border-line">
            <time class="text-sm text-ink-muted">{{ formatDate(post.date) }}</time>

            <div v-if="post.tags?.length" class="flex flex-wrap gap-2">
              <TagChip
                v-for="tag in post.tags"
                :key="tag"
                :tag="tag"
                :section="section"
              />
            </div>
          </div>

          <img v-if="thumbnailSrc" :src="thumbnailSrc" :alt="post.title" class="w-full rounded-panel object-cover mt-6" />
        </header>

        <div class="prose prose-gray dark:prose-invert prose-lg max-w-none">
          <ContentRenderer :value="post" />
        </div>
      </main>
    </div>
  </article>
</template>
