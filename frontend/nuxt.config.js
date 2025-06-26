// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  // Disable SSR to prevent hydration mismatches with complex components
  ssr: false,
  nitro: {
    // Configure for better handling of large static files and caching
    routeRules: {
      // Content caching - allow byte ranges for videos but keep cache control
      '/content/**': { 
        static: true,
        headers: {
          'Accept-Ranges': 'bytes',
        }
      },
      // API endpoints - prevent caching to ensure fresh data
      '/api/**': {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      },
      // Main HTML pages - prevent caching to always show latest content
      '/**': {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    }
  },
  
  runtimeConfig: {
    databasePath: process.env.DATABASE_PATH || '/app/data/database/database.sqlite',
    defaultAdminName: process.env.DEFAULT_ADMIN_NAME || 'admin',
    defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'admin',
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'SkillGoblin',
      appShortName: process.env.NUXT_PUBLIC_APP_SHORT_NAME || 'App',
      appDescription: process.env.NUXT_PUBLIC_APP_DESCRIPTION || 'A streamlined, self-hosted learning platform!',
      backgroundColor: process.env.NUXT_PUBLIC_BACKGROUND_COLOR || '#2d89ef',
      themeColor: process.env.NUXT_PUBLIC_THEME_COLOR || '#ffffff',
      apiBase: '/api'
    }
  },

  app: {
    // Keep this minimal
    head: {
      link: [
          { rel: 'icon', type: 'image/x-icon', href: '/api/logo' },
          { rel: 'icon', type: 'image/svg+xml', href: '/api/logo' },
          { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/api/logo' },
          { rel: 'apple-touch-icon', sizes: '180x180', href: '/api/logo' },
          { rel: 'manifest', href: '/site.webmanifest' }
      ]
    }
  },

  serverHandlers: [
    {
      route: '/site.webmanifest',
      handler: '~/server/api/webmanifest.js'
    },
    {
      route: '/api/logo',
      handler: '~/server/api/logo.js'
    }
  ]
})
