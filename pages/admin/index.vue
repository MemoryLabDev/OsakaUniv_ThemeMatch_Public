<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 管理者権限チェック -->
    <div v-if="!isAdmin" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.18 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">アクセス権限がありません</h1>
        <p class="text-gray-600 mb-4">このページは管理者のみアクセス可能です。</p>
        <NuxtLink 
          to="/"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          ダッシュボードに戻る
        </NuxtLink>
      </div>
    </div>

    <!-- 管理者ページメインコンテンツ -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- ヘッダー -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">システム管理</h1>
        <p class="text-gray-600 mt-2">全ユーザーのプライバシー設定とシステムの管理を行います</p>
      </div>

      <!-- 統計カード -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">総ユーザー数</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalUsers }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">公開プロフィール</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.publicUsers }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">コラボ許可</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.allowCollaboration }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- フィルター -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">フィルター</h2>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">検索</label>
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="メールアドレスまたは表示名"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">プロフィール公開</label>
              <select 
                v-model="filterPublicProfile"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="public">公開</option>
                <option value="private">非公開</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">検索結果表示</label>
              <select 
                v-model="filterShowInSearch"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="show">表示</option>
                <option value="hide">非表示</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">コラボレーション</label>
              <select 
                v-model="filterCollaboration"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="allow">許可</option>
                <option value="deny">拒否</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- ユーザー一覧 -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">ユーザー管理</h2>
          <div class="flex space-x-2">
            <button 
              @click="refreshUsers"
              class="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              :disabled="loading"
            >
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-else>更新</span>
            </button>
            <button 
              @click="bulkUpdate"
              class="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              :disabled="selectedUsers.length === 0 || loading"
            >
              一括更新
            </button>
          </div>
        </div>

        <!-- ローディング状態 -->
        <div v-if="loading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-gray-600 mt-2">読み込み中...</p>
        </div>

        <!-- ユーザーテーブル -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    v-model="selectAll"
                    @change="toggleSelectAll"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  プロフィール公開
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  検索結果表示
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  コラボレーション
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登録日時
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in filteredUsers" :key="user.uid" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    v-model="selectedUsers"
                    :value="user.uid"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span class="text-white font-medium text-sm">
                        {{ getUserInitials(user) }}
                      </span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.display_name || 'Unknown' }}
                      </div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <label class="inline-flex items-center">
                    <input 
                      type="checkbox" 
                      v-model="user.privacy_settings.public_profile"
                      @change="updateUserSetting(user.uid, 'public_profile', $event.target.checked)"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">公開</span>
                  </label>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <label class="inline-flex items-center">
                    <input 
                      type="checkbox" 
                      v-model="user.privacy_settings.show_in_search"
                      @change="updateUserSetting(user.uid, 'show_in_search', $event.target.checked)"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">表示</span>
                  </label>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <label class="inline-flex items-center">
                    <input 
                      type="checkbox" 
                      v-model="user.privacy_settings.allow_collaboration"
                      @change="updateUserSetting(user.uid, 'allow_collaboration', $event.target.checked)"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">許可</span>
                  </label>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="editUser(user)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    編集
                  </button>
                  <button
                    @click="resetUser(user.uid)"
                    class="text-red-600 hover:text-red-900"
                  >
                    リセット
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ページネーション -->
        <div v-if="filteredUsers.length > 0" class="px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              {{ filteredUsers.length }} 人中 {{ Math.min(currentPage * pageSize, filteredUsers.length) }} 人を表示
            </div>
            <div class="flex space-x-2">
              <button 
                @click="previousPage"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                前へ
              </button>
              <span class="px-3 py-1 text-sm">{{ currentPage }} / {{ totalPages }}</span>
              <button 
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                次へ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 一括更新モーダル -->
    <div v-if="showBulkModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">一括更新</h3>
        <p class="text-gray-600 mb-4">{{ selectedUsers.length }} 人のユーザーを更新します</p>
        
        <div class="space-y-4">
          <label class="flex items-center">
            <input 
              type="checkbox" 
              v-model="bulkSettings.public_profile"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">プロフィール公開を有効化</span>
          </label>
          
          <label class="flex items-center">
            <input 
              type="checkbox" 
              v-model="bulkSettings.show_in_search"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">検索結果表示を有効化</span>
          </label>
          
          <label class="flex items-center">
            <input 
              type="checkbox" 
              v-model="bulkSettings.allow_collaboration"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">コラボレーション許可を有効化</span>
          </label>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="showBulkModal = false"
            class="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            キャンセル
          </button>
          <button
            @click="confirmBulkUpdate"
            class="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            更新
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 管理者権限チェック
const { currentUser, isAuthenticated, getUserProfile, getDatabaseRef, updatePrivacySettings } = useFirebase()

// 認証・管理者権限チェック
definePageMeta({
  middleware: ['auth', 'admin']
})

// 管理者判定
const isAdmin = computed(() => {
  if (!currentUser.value) return false
  // admin@memorylab.jp または管理者フラグで判定
  return currentUser.value.email === 'admin@memorylab.jp' || 
         currentUser.value.isAdmin === true
})

// データ状態
const users = ref([])
const loading = ref(true)
const stats = ref({
  totalUsers: 0,
  publicUsers: 0,
  allowCollaboration: 0
})

// フィルター状態
const searchQuery = ref('')
const filterPublicProfile = ref('all')
const filterShowInSearch = ref('all')
const filterCollaboration = ref('all')

// 選択状態
const selectedUsers = ref([])
const selectAll = ref(false)

// モーダル状態
const showBulkModal = ref(false)
const bulkSettings = ref({
  public_profile: false,
  show_in_search: false,
  allow_collaboration: false
})

// ページネーション
const currentPage = ref(1)
const pageSize = ref(20)

// 計算されたプロパティ
const filteredUsers = computed(() => {
  let filtered = users.value

  // 検索フィルター
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.email.toLowerCase().includes(query) ||
      (user.display_name && user.display_name.toLowerCase().includes(query))
    )
  }

  // プロフィール公開フィルター
  if (filterPublicProfile.value !== 'all') {
    const isPublic = filterPublicProfile.value === 'public'
    filtered = filtered.filter(user => 
      user.privacy_settings?.public_profile === isPublic
    )
  }

  // 検索結果表示フィルター
  if (filterShowInSearch.value !== 'all') {
    const showInSearch = filterShowInSearch.value === 'show'
    filtered = filtered.filter(user => 
      user.privacy_settings?.show_in_search === showInSearch
    )
  }

  // コラボレーションフィルター
  if (filterCollaboration.value !== 'all') {
    const allowCollab = filterCollaboration.value === 'allow'
    filtered = filtered.filter(user => 
      user.privacy_settings?.allow_collaboration === allowCollab
    )
  }

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / pageSize.value)
})

// ページネーション
const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// ユーザーイニシャル取得
const getUserInitials = (user) => {
  const name = user.display_name || user.email || 'U'
  if (name.includes('@')) {
    return name.substring(0, 2).toUpperCase()
  }
  return name.substring(0, 1).toUpperCase()
}

// 日付フォーマット
const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleDateString('ja-JP')
}

// 全選択トグル
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedUsers.value = filteredUsers.value.map(user => user.uid)
  } else {
    selectedUsers.value = []
  }
}

// ユーザー設定更新
const updateUserSetting = async (uid, setting, value) => {
  try {
    await updatePrivacySettings(uid, { [setting]: value })
    
    // ローカル状態も更新
    const user = users.value.find(u => u.uid === uid)
    if (user) {
      user.privacy_settings[setting] = value
    }
    
    updateStats()
  } catch (error) {
    alert('設定の更新に失敗しました')
  }
}

// 統計更新
const updateStats = () => {
  stats.value.totalUsers = users.value.length
  stats.value.publicUsers = users.value.filter(u => u.privacy_settings?.public_profile).length
  stats.value.allowCollaboration = users.value.filter(u => u.privacy_settings?.allow_collaboration).length
}

// ユーザー一覧取得
const loadUsers = async () => {
  loading.value = true
  try {
    const usersRef = getDatabaseRef('users')
    
    if (usersRef) {
      const { get } = await import('firebase/database')
      const snapshot = await get(usersRef)
      if (snapshot.exists()) {
        const usersData = snapshot.val()
        users.value = Object.entries(usersData).map(([uid, userData]) => ({
          uid,
          ...userData,
          privacy_settings: userData.privacy_settings || {
            public_profile: false,
            show_in_search: false,
            allow_collaboration: true
          }
        }))
        updateStats()
      }
    }
  } catch (error) {
    // Error handling without console
  } finally {
    loading.value = false
  }
}

// ユーザー一覧更新
const refreshUsers = () => {
  loadUsers()
}

// 一括更新
const bulkUpdate = () => {
  showBulkModal.value = true
}

const confirmBulkUpdate = async () => {
  try {
    const updateCount = selectedUsers.value.length
    
    for (const uid of selectedUsers.value) {
      await updatePrivacySettings(uid, bulkSettings.value)
      
      // ローカル状態も更新
      const user = users.value.find(u => u.uid === uid)
      if (user) {
        Object.assign(user.privacy_settings, bulkSettings.value)
      }
    }
    
    updateStats()
    selectedUsers.value = []
    selectAll.value = false
    showBulkModal.value = false
    
    alert(`${updateCount} 人のユーザー設定を更新しました`)
  } catch (error) {
    alert('一括更新に失敗しました')
  }
}

// ユーザー編集
const editUser = (user) => {
  // 詳細編集ページに遷移するか、モーダルを開く
  // Implementation needed
}

// ユーザーリセット
const resetUser = async (uid) => {
  if (!confirm('このユーザーの設定をリセットしますか？')) return
  
  try {
    const defaultSettings = {
      public_profile: false,
      show_in_search: false,
      allow_collaboration: true
    }
    
    await updatePrivacySettings(uid, defaultSettings)
    
    // ローカル状態も更新
    const user = users.value.find(u => u.uid === uid)
    if (user) {
      Object.assign(user.privacy_settings, defaultSettings)
    }
    
    updateStats()
    alert('ユーザー設定をリセットしました')
  } catch (error) {
    alert('ユーザーリセットに失敗しました')
  }
}

// 初期化
onMounted(async () => {
  // Firebase認証状態の初期化を待つ
  const { authInitialized } = useFirebase()
  
  // 認証状態が初期化されるまで待機
  let attempts = 0
  const maxAttempts = 50 // 5秒間
  
  while (!authInitialized.value && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }
  
  if (isAdmin.value) {
    loadUsers()
  }
})

// 認証状態変化の監視も追加
const { authInitialized } = useFirebase()
watch(authInitialized, (initialized) => {
  if (initialized && isAdmin.value && users.value.length === 0) {
    loadUsers()
  }
})

// メタデータ設定
useHead({
  title: 'システム管理 - 研究マッチングシステム',
  meta: [
    { name: 'description', content: 'システム管理ページ - 全ユーザーのプライバシー設定を管理' }
  ]
})
</script>