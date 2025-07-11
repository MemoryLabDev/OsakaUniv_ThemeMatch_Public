// https://nuxt.com/docs/api/configuration/nuxt-config
const isDev = process.env.NODE_ENV !== 'production'

export default defineNuxtConfig({
  devtools: { enabled: false },
  
  // 静的サイト生成モード
  ssr: false,
  
  // GitHub Pages用の設定
  nitro: {
    preset: 'github_pages',
    prerender: {
      routes: ['/'],
      failOnError: false,
      crawlLinks: true
    }
  },
  
  // ベースURL設定（GitHub Pagesのリポジトリ名に応じて設定）
  app: {
    baseURL: isDev ? '/' : '/OsakaUniv_ThemeMatch_Public/',
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
  
  // Firebase設定のための環境変数
  runtimeConfig: {
    public: {
      baseURL: isDev ? '/' : '/OsakaUniv_ThemeMatch_Public/',
      firebaseConfig: {
        apiKey: "AIzaSyAlmViV0hbksyW_jxnjZ5cdDVN2txrsDhc",
        authDomain: "osaka-univ.firebaseapp.com", 
        databaseURL: "https://osaka-univ-default-rtdb.firebaseio.com/",
        projectId: "osaka-univ",
        storageBucket: "osaka-univ.firebasestorage.app",
        messagingSenderId: "657330737802",
        appId: "1:657330737802:web:31ca9eeff3a56c0be25373"
      }
    }
  },
  
  // CSS設定
  css: [
    '~/assets/css/main.css'
  ],
  
  
  // Vite設定
  vite: {
    server: {
      hmr: {
        overlay: false
      }
    }
  }
})