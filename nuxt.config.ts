export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  app: {
    baseURL: import.meta.env.NUXT_APP_BASE_URL || '/BridgeAI-Learn/',
  },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss'],
  runtimeConfig: {
    siteOrigin: 'https://cycu-bridgeai.github.io',
  },
  nitro: {
    prerender: {
      // 目錄頁會連到所有 JSON，預渲染器據此產出每一篇
      routes: ['/api/v1/'],
    },
  },
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
