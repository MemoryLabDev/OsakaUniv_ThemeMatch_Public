<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">ログイン</h1>
        <p class="text-gray-600">大阪大学研究マッチングシステム</p>
      </div>
      
      <!-- ログインフォーム -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            メールアドレス
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your.email@memorylab.handai.jp"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            パスワード
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="パスワードを入力"
          />
        </div>
        
        <!-- Firebase接続状態 -->
        <div v-if="!authInitialized" class="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
          <p class="text-yellow-800 text-sm">認証システム初期化中...</p>
        </div>
        <div v-else-if="!firebaseAvailable" class="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p class="text-red-800 text-sm">Firebase接続エラー。ページを再読み込みしてください。</p>
        </div>
        
        <!-- エラーメッセージ -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-3">
          <p class="text-red-800 text-sm">{{ error }}</p>
        </div>
        
        <!-- ログインボタン -->
        <button
          type="submit"
          :disabled="loading || !authInitialized"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ログイン中...
          </span>
          <span v-else>ログイン</span>
        </button>
      </form>
      
      <!-- フッター -->
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-600">
          システムに関するお問い合わせは管理者までご連絡ください
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
console.log('📱 Login page: Script setup starting...')

console.log('📱 Login page: Calling useFirebase()...')
const { login, isAuthenticated, authInitialized, firebaseAvailable, firebaseReady } = useFirebase()
console.log('📱 Login page: useFirebase() completed successfully')

console.log('📱 Login page: Getting router...')
const router = useRouter()
console.log('📱 Login page: Router obtained')

// リアクティブデータ
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

// ページメタ設定
useHead({
  title: 'ログイン - 大阪大学研究マッチングシステム'
})

// 認証済みユーザーはホームにリダイレクト（認証初期化後）
watch(authInitialized, (initialized) => {
  if (initialized && isAuthenticated.value) {
    console.log('📱 Login: Auth initialized and user authenticated, redirecting to home')
    router.push('/')
  }
}, { immediate: true })

// ログイン処理
const handleLogin = async () => {
  if (loading.value) return
  
  // Firebase利用可否チェック
  if (!firebaseAvailable.value) {
    error.value = 'Firebase接続エラー。ページを再読み込みしてください。'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const result = await login(email.value, password.value)
    
    if (result.success) {
      // ログイン成功 - リフレッシュしてダッシュボードにリダイレクト
      console.log('📱 Login: Login successful, refreshing page')
      
      // 少し待ってからリフレッシュ（認証状態が確実に更新されるように）
      setTimeout(() => {
        if (process.client) {
          window.location.href = '/'
        }
      }, 500)
    } else {
      // ログイン失敗
      error.value = result.error || 'メールアドレスまたはパスワードが正しくありません'
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'ログインに失敗しました。しばらく時間をおいて再度お試しください。'
  } finally {
    loading.value = false
  }
}

// マウント時にメールフィールドにフォーカス
onMounted(() => {
  if (process.client) {
    const emailInput = document.getElementById('email')
    if (emailInput) {
      emailInput.focus()
    }
  }
})
</script>