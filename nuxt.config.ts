// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // GitHub Pages用の設定
  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  
  // 静的サイト生成（SSG）モード
  ssr: false,
  
  // ベースURL設定（GitHub Pagesのリポジトリ名に応じて設定）
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/OsakaUniv_ThemeMatch_Public/' : '/',
    buildAssetsDir: '/assets/',
    head: {
      title: '大阪大学研究マッチングシステム',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AI技術を活用した研究者マッチングと研究テーマ提案システム' },
        { name: 'keywords', content: '研究マッチング,大阪大学,AI,研究者,コラボレーション' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
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
  
  
  // 静的ファイルの処理
  runtimeConfig: {
    public: {
      baseURL: process.env.NODE_ENV === 'production' ? '/OsakaUniv_ThemeMatch_Public/' : '/'
    }
  }
})