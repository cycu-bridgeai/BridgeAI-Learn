<script setup lang="ts">
const route = useRoute()
const slug = (route.params.slug as string[]).join('/')

const { data } = await useAsyncData(`cs-${slug}`, async () => {
  const [post, unitsDoc] = await Promise.all([
    queryCollection('cs').path(`/cs/${slug}`).first(),
    queryCollection('csUnits').first(),
  ])
  return { post, unitName: post ? unitNameOf(unitsDoc?.units ?? [], post.unit) : undefined }
})

if (!data.value?.post) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

useSeoMeta({
  title: () => `${data.value?.post?.title} - BridgeAI Learn`,
  description: () => data.value?.post?.description,
})
</script>

<template>
  <ArticleView v-if="data?.post" :post="data.post" back-to="/cs" back-label="回計概專區" :unit-name="data.unitName" />
</template>
