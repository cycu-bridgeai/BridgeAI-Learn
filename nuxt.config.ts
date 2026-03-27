export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss'],
  vite: {
    resolve: {
      alias: {
        vue: '/home/jyw/workspace/BridgeAI-Learn/node_modules/.pnpm/vue@3.5.31_typescript@6.0.2/node_modules/vue',
      },
    },
  },
  content: {
    watch: {
      enabled: true,
    },
    highlight: {
      theme: 'github-dark',
    },
  },
})
