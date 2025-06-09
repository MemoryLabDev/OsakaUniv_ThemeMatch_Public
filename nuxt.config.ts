// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  
  // 静的サイト生成モード
  ssr: false,
  
  // GitHub Pages用の設定
  nitro: {
    prerender: {
      routes: ['/'],
      failOnError: false
    }
  },
  
  // Vite設定
  vite: {
    server: {
      hmr: {
        overlay: false
      }
    }
  },
  
  // ベースURL設定（GitHub Pagesのリポジトリ名に応じて設定）
  app: {
    baseURL: '/OsakaUniv_ThemeMatch_Public/',
    head: {
      title: '大阪大学研究マッチングシステム',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AI技術を活用した研究者マッチングと研究テーマ提案システム' },
        { name: 'keywords', content: '研究マッチング,大阪大学,AI,研究者,コラボレーション' }
      ]
    }
  },
  
  // Modules
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  
  // CSS設定
  css: [
    '~/assets/css/main.css'
  ],
  
  // ランタイム設定
  runtimeConfig: {
    public: {
      baseURL: '/OsakaUniv_ThemeMatch_Public/'
    }
  }
})