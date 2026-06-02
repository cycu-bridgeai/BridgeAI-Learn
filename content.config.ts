import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        tags: z.array(z.string()).optional(),
        thumbnail: z.string().optional(),
      }),
    }),
    videos: defineCollection({
      type: 'page',
      source: 'videos/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        youtubeId: z.string(),
        tags: z.array(z.string()).optional(),
      }),
    }),
    works: defineCollection({
      type: 'page',
      source: 'works/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        author: z.string(),
        thumbnail: z.string().optional(),
        demoUrl: z.string().optional(),
        githubUrl: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    }),
  },
})
