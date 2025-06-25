<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">QRログイン</h1>
        <p class="text-gray-600">認証情報を確認してください</p>
      </div>

      <div v-if="credentials" class="space-y-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
          <div class="bg-white border rounded-md p-3 text-gray-900 font-mono text-sm">
            {{ credentials.email }}
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
          <div class="bg-white border rounded-md p-3 text-gray-900 font-mono text-sm">
            {{ showPassword ? credentials.password : '*'.repeat(credentials.password.length) }}
          </div>
          <button
            @click="showPassword = !showPassword"
            class="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            {{ showPassword ? 'パスワードを隠す' : 'パスワードを表示' }}
          </button>
        </div>

        <div class="flex space-x-3 mt-6">
          <button
            @click="proceedToLogin"
            class="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            ログインする
          </button>
          <button
            @click="copyCredentials"
            class="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors font-medium"
          >
            コピー
          </button>
        </div>

        <div class="text-center mt-4">
          <nuxt-link 
            to="/"
            class="text-sm text-gray-500 hover:text-gray-700"
          >
            手動でログインする
          </nuxt-link>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <div class="text-gray-500 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p class="text-gray-600 mb-4">認証情報が見つかりません</p>
        <nuxt-link 
          to="/"
          class="text-blue-600 hover:text-blue-800"
        >
          ホームに戻る
        </nuxt-link>
      </div>

      <div v-if="copySuccess" class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
        コピーしました！
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const credentials = ref(null)
const showPassword = ref(false)
const copySuccess = ref(false)

/**
 * URLパラメータから認証情報を取得・デコード
 */
const getCredentialsFromURL = () => {
  if (process.client) {
    const urlParams = new URLSearchParams(window.location.search)
    const authParam = urlParams.get('auth')
    
    if (authParam) {
      try {
        const decoded = atob(authParam)
        return JSON.parse(decoded)
      } catch (error) {
        console.error('認証情報のデコードに失敗:', error)
      }
    }
  }
  return null
}

/**
 * ログイン処理を実行
 */
const proceedToLogin = async () => {
  if (!credentials.value) return
  
  try {
    // Firebase認証を実行
    const { $auth } = useNuxtApp()
    await $auth.signInWithEmailAndPassword(credentials.value.email, credentials.value.password)
    
    // 認証成功後、メインページにリダイレクト
    await navigateTo('/')
  } catch (error) {
    console.error('ログインエラー:', error)
    alert('ログインに失敗しました。認証情報を確認してください。')
  }
}

/**
 * 認証情報をクリップボードにコピー
 */
const copyCredentials = async () => {
  if (!credentials.value) return
  
  const text = `メールアドレス: ${credentials.value.email}\nパスワード: ${credentials.value.password}`
  
  try {
    await navigator.clipboard.writeText(text)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('コピーに失敗:', error)
  }
}

onMounted(() => {
  credentials.value = getCredentialsFromURL()
})

// ページメタデータ
definePageMeta({
  layout: false
})

useHead({
  title: 'QRログイン - 大阪大学研究マッチングシステム'
})
</script>