export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss'],
  content: {
    watch: {
      enabled: true,
    },
    highlight: {
      theme: 'github-dark',
    },
  },
})
