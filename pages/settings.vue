<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div>
            <h1 class="text-xl font-semibold text-gray-900">設定</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ currentUser?.displayName || currentUser?.email }}</span>
            <button
              @click="handleLogout"
              class="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <!-- メインコンテンツ -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- プライバシー設定 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">プライバシー設定</h2>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">プロフィール公開</label>
                  <p class="text-xs text-gray-500">他の研究者があなたのプロフィールを閲覧できます</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="privacySettings.public_profile"
                    @change="updatePrivacy"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">検索結果に表示</label>
                  <p class="text-xs text-gray-500">マッチング検索結果に表示されます</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="privacySettings.show_in_search"
                    @change="updatePrivacy"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-700">コラボレーション許可</label>
                  <p class="text-xs text-gray-500">他の研究者からの共同研究提案を受け付けます</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="privacySettings.allow_collaboration"
                    @change="updatePrivacy"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <!-- 保存状態表示 -->
            <div v-if="saveStatus" class="mt-4 p-3 rounded-md" :class="saveStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
              <p class="text-sm">{{ saveStatus.message }}</p>
            </div>
          </div>
        </div>
        
        <!-- ユーザー情報表示 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">ユーザー情報</h2>
            
            <div v-if="userProfile" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">表示名</label>
                <p class="mt-1 text-sm text-gray-900">{{ userProfile.display_name }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">メールアドレス</label>
                <p class="mt-1 text-sm text-gray-900">{{ userProfile.email }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">アカウント作成日</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(userProfile.created_at) }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">最終更新日</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(userProfile.updated_at) }}</p>
              </div>
            </div>
            
            <div v-else class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-2 text-sm text-gray-600">ユーザー情報を読み込み中...</p>
            </div>
          </div>
          
          <!-- 公開ユーザー一覧 -->
          <div class="mt-8 bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">公開研究者一覧</h2>
            
            <div v-if="publicUsers.length > 0" class="space-y-3">
              <div
                v-for="user in publicUsers"
                :key="user.uid"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div>
                  <p class="font-medium text-gray-900">{{ user.display_name }}</p>
                  <p class="text-sm text-gray-600">{{ user.email }}</p>
                </div>
                <div class="flex space-x-2">
                  <span v-if="user.privacy_settings?.show_in_search" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    検索可能
                  </span>
                  <span v-if="user.privacy_settings?.allow_collaboration" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    コラボ可能
                  </span>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-8">
              <p class="text-sm text-gray-600">現在公開されている研究者はいません</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
const { 
  currentUser, 
  isAuthenticated, 
  authInitialized,
  firebaseReady,
  logout, 
  updatePrivacySettings, 
  getUserProfile, 
  watchPublicUsers 
} = useFirebase()
const router = useRouter()

// リアクティブデータ
const userProfile = ref(null)
const publicUsers = ref([])
const privacySettings = reactive({
  public_profile: false,
  show_in_search: false,
  allow_collaboration: true
})
const saveStatus = ref(null)

// ページメタ設定
useHead({
  title: '設定 - 大阪大学研究マッチングシステム'
})

// 未認証ユーザーをログインページにリダイレクト（認証初期化後）
watch(authInitialized, (initialized) => {
  if (initialized && !isAuthenticated.value) {
    console.log('⚙️ Settings: Auth initialized but user not authenticated, redirecting to login')
    router.push('/auth/login')
  }
}, { immediate: true })

// ユーザー情報読み込み
watch(currentUser, async (user) => {
  if (user) {
    const profile = await getUserProfile(user.uid)
    if (profile) {
      userProfile.value = profile
      // プライバシー設定を同期
      if (profile.privacy_settings) {
        Object.assign(privacySettings, profile.privacy_settings)
      }
    }
  }
}, { immediate: true })

// 公開ユーザー一覧のリアルタイム監視
let unsubscribePublicUsers = null

onMounted(() => {
  if (process.client) {
    unsubscribePublicUsers = watchPublicUsers((users) => {
      publicUsers.value = users
    })
  }
})

onUnmounted(() => {
  if (unsubscribePublicUsers) {
    unsubscribePublicUsers()
  }
})

// ログアウト処理
const handleLogout = async () => {
  try {
    await logout()
    router.push('/auth/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// プライバシー設定更新
const updatePrivacy = async () => {
  if (!currentUser.value) return
  
  try {
    saveStatus.value = null
    
    const result = await updatePrivacySettings(currentUser.value.uid, privacySettings)
    
    if (result.success) {
      saveStatus.value = {
        type: 'success',
        message: '設定が保存されました'
      }
    } else {
      saveStatus.value = {
        type: 'error',
        message: '設定の保存に失敗しました'
      }
    }
    
    // 3秒後にメッセージを消去
    setTimeout(() => {
      saveStatus.value = null
    }, 3000)
    
  } catch (error) {
    console.error('Privacy update error:', error)
    saveStatus.value = {
      type: 'error',
      message: '設定の保存中にエラーが発生しました'
    }
    
    setTimeout(() => {
      saveStatus.value = null
    }, 3000)
  }
}

// 日付フォーマット
const formatDate = (timestamp) => {
  if (!timestamp) return '不明'
  
  const date = new Date(timestamp)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>