<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm border-b border-gray-200 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- ロゴ -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2 sm:space-x-3">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">OU</span>
              </div>
              <div class="hidden sm:block">
                <h1 class="text-lg font-semibold text-gray-900">研究マッチングシステム</h1>
                <p class="text-xs text-gray-500">Osaka University</p>
              </div>
              <div class="block sm:hidden">
                <h1 class="text-base font-semibold text-gray-900">研究マッチング</h1>
              </div>
            </NuxtLink>
          </div>
          
          <!-- デスクトップナビゲーション -->
          <nav class="hidden md:flex items-center space-x-6">
            <!-- 認証済みユーザーのみダッシュボード表示（ホーム） -->
            <NuxtLink 
              v-if="isAuthenticated"
              to="/" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-blue-600 bg-blue-50': $route.path === '/' }"
            >
              ダッシュボード
            </NuxtLink>
            <NuxtLink 
              to="/researchers" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-blue-600 bg-blue-50': $route.path === '/researchers' }"
            >
              公開データの検索
            </NuxtLink>
            <NuxtLink 
              to="/stats" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-blue-600 bg-blue-50': $route.path === '/stats' }"
            >
              統計情報
            </NuxtLink>
            
            <!-- ユーザーアカウントメニュー -->
            <div class="relative" v-if="isAuthenticated">
              <button
                @click="isUserMenuOpen = !isUserMenuOpen"
                class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-medium text-xs">{{ userInitials }}</span>
                </div>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- ユーザーメニューDropdown -->
              <div 
                v-if="isUserMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
              >
                <div class="py-1">
                  <div class="px-4 py-2 text-sm text-gray-700 border-b">
                    {{ currentUser?.displayName || currentUser?.email }}
                  </div>
                  <NuxtLink 
                    to="/settings"
                    @click="isUserMenuOpen = false"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    設定
                  </NuxtLink>
                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    ログアウト
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 未認証ユーザーには何も表示しない -->
          </nav>

          <!-- モバイルメニューボタン -->
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            :class="{ 'bg-gray-100': isMobileMenuOpen }"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                v-if="!isMobileMenuOpen"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path 
                v-else
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- モバイルナビゲーションドロワー -->
      <div 
        v-if="isMobileMenuOpen"
        class="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50"
      >
        <div class="px-4 py-2 space-y-1">
          <!-- 認証済みユーザー情報表示 -->
          <div v-if="isAuthenticated" class="px-3 py-3 border-b border-gray-200">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span class="text-white font-medium text-sm">{{ userInitials }}</span>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">{{ currentUser?.displayName || 'ユーザー' }}</p>
                <p class="text-xs text-gray-500">{{ currentUser?.email }}</p>
              </div>
            </div>
          </div>
          
          <!-- 認証済みユーザーのみダッシュボード表示（ホーム） -->
          <NuxtLink 
            v-if="isAuthenticated"
            to="/" 
            @click="isMobileMenuOpen = false"
            class="block px-3 py-3 rounded-md text-base font-medium transition-colors"
            :class="$route.path === '/' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'"
          >
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              ダッシュボード
            </div>
          </NuxtLink>
          
          <NuxtLink 
            to="/researchers" 
            @click="isMobileMenuOpen = false"
            class="block px-3 py-3 rounded-md text-base font-medium transition-colors"
            :class="$route.path === '/researchers' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'"
          >
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              公開データの検索
            </div>
          </NuxtLink>
          
          <NuxtLink 
            to="/stats" 
            @click="isMobileMenuOpen = false"
            class="block px-3 py-3 rounded-md text-base font-medium transition-colors"
            :class="$route.path === '/stats' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'"
          >
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              統計情報
            </div>
          </NuxtLink>
          
          <!-- ログアウトボタン（認証済みユーザーのみ） -->
          <button 
            v-if="isAuthenticated"
            @click="handleLogout"
            class="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              ログアウト
            </div>
          </button>
        </div>
      </div>
    </header>

    <!-- モバイルメニューオーバーレイ -->
    <div 
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="md:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
    ></div>

    <!-- メインコンテンツ -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- フッター -->
    <footer class="bg-white border-t border-gray-200 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-gray-500">
          <p class="text-sm">
            © 2025 Osaka University Research Matching System. 
            Powered by AI and built with <span class="text-red-500">♥</span>
          </p>
          <p class="text-xs mt-2">
            最終更新: {{ new Date().toLocaleDateString('ja-JP') }}
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Firebase認証機能
const { currentUser, isAuthenticated, logout } = useFirebase()
const router = useRouter()

// リアクティブデータ
const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

// ユーザーイニシャル生成
const userInitials = computed(() => {
  if (!currentUser.value) return 'U'
  const displayName = currentUser.value.displayName || currentUser.value.email || ''
  if (displayName.includes('@')) {
    // メールアドレスの場合は最初の2文字
    return displayName.substring(0, 2).toUpperCase()
  }
  // 表示名の場合は最初の文字
  return displayName.substring(0, 1).toUpperCase()
})

// ログアウト処理
const handleLogout = async () => {
  try {
    await logout()
    isUserMenuOpen.value = false
    isMobileMenuOpen.value = false
    router.push('/auth/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// ルート変更時にメニューを閉じる
watch(() => useRoute().path, () => {
  isMobileMenuOpen.value = false
  isUserMenuOpen.value = false
})

// 外部クリック時にメニューを閉じる
onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      isMobileMenuOpen.value = false
      isUserMenuOpen.value = false
    }
  }
  
  const handleClickOutside = (e) => {
    // ユーザーメニューの外部クリック
    if (isUserMenuOpen.value && !e.target.closest('.relative')) {
      isUserMenuOpen.value = false
    }
  }
  
  document.addEventListener('keydown', handleEscape)
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
    document.removeEventListener('click', handleClickOutside)
  })
})

// メタデータの設定
useHead({
  htmlAttrs: {
    lang: 'ja'
  },
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap'
    }
  ]
})
</script>