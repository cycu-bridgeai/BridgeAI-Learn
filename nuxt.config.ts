const baseURL = (import.meta.env.NUXT_APP_BASE_URL || '/BridgeAI-Learn/').replace(/\/?$/, '/')

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  app: {
    baseURL,
    head: {
      link: [{ rel: 'icon', type: 'image/x-icon', href: `${baseURL}favicon.ico` }],
      script: process.env.NODE_ENV === 'production' ? [
        {
          key: 'google-analytics-loader',
          async: true,
          src: 'https://www.googletagmanager.com/gtag/js?id=G-BE8TKLE6HK',
        },
        {
          key: 'google-analytics-config',
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BE8TKLE6HK');
          `,
        },
      ] : [],
    },
  },
  css: ['~/assets/css/theme.css', '~/assets/css/main.css'],
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
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
        },
      },
    },
  },
})
