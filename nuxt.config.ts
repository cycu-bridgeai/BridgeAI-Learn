export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  app: {
    baseURL: '/BridgeAI-Learn/',
  },
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
