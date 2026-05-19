export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  app: {
    baseURL: import.meta.env.NUXT_APP_BASE_URL || '/BridgeAI-Learn/',
  },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss'],
  content: {
    watch: {
      enabled: true,
    },
    build: {
      markdown: {
        highlight: {
          theme: 'github-dark',
        },
      },
    },
  },
})
