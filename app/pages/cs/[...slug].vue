<script setup lang="ts">
const route = useRoute()
const slug = (route.params.slug as string[]).join('/')

const { data: post } = await useAsyncData(`cs-${slug}`, () =>
  queryCollection('cs').path(`/cs/${slug}`).first()
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

useSeoMeta({
  title: () => `${post.value?.title} - BridgeAI Learn`,
  description: () => post.value?.description,
})
</script>

<template>
  <ArticleView v-if="post" :post="post" back-to="/cs" back-label="回計概專區" section="cs" />
</template>
