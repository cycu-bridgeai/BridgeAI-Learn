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
</script>

<template>
  <ArticleView v-if="post" :post="post" back-to="/blog" back-label="Back to Blog" />
</template>
