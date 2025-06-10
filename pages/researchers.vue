<template>
  <div>
    <!-- ヒーローセクション -->
    <section class="gradient-bg py-12 sm:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 fade-in-up">
          公開データの検索
        </h1>
        <p class="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4 fade-in-up" style="animation-delay: 0.2s">
          公開されている研究者データの閲覧とマッチング結果の確認
        </p>
        
        <!-- 統計サマリー -->
        <div v-if="indexData" class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
          <div class="bg-white/20 backdrop-blur-sm rounded-lg p-4 sm:p-6 text-white fade-in-up" style="animation-delay: 0.4s">
            <div class="text-2xl sm:text-3xl font-bold">{{ indexData.total_researchers }}</div>
            <div class="text-blue-100 text-sm sm:text-base">研究者</div>
          </div>
          <div class="bg-white/20 backdrop-blur-sm rounded-lg p-4 sm:p-6 text-white fade-in-up" style="animation-delay: 0.6s">
            <div class="text-2xl sm:text-3xl font-bold">{{ totalMatches }}</div>
            <div class="text-blue-100 text-sm sm:text-base">マッチング結果</div>
          </div>
          <div class="bg-white/20 backdrop-blur-sm rounded-lg p-4 sm:p-6 text-white fade-in-up" style="animation-delay: 0.8s">
            <div class="text-2xl sm:text-3xl font-bold">{{ avgSimilarity }}%</div>
            <div class="text-blue-100 text-sm sm:text-base">平均マッチ度</div>
          </div>
        </div>
      </div>
    </section>

    <!-- メインコンテンツ -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <!-- 検索・フィルター -->
      <div class="mb-6 sm:mb-8">
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <!-- 検索ボックス -->
          <div class="flex-1 relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="研究者名、所属、キーワードで検索..."
              class="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <!-- ソート -->
          <select
            v-model="sortBy"
            class="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-w-0 sm:min-w-[140px]"
          >
            <option value="name">名前順</option>
            <option value="similarity">マッチ度順</option>
            <option value="matches">マッチング数順</option>
          </select>
        </div>
        
        <!-- 結果件数とデバッグボタン -->
        <div class="flex items-center justify-between">
          <p class="text-gray-600 text-sm sm:text-base">
            {{ filteredResearchers.length }}件の研究者が見つかりました
          </p>
          <button
            @click="showDebug = !showDebug"
            class="bg-gray-600 text-white px-2 py-1.5 rounded-md text-xs hover:bg-gray-700 transition-colors"
            title="デバッグ情報を表示"
          >
            🐛 Debug
          </button>
        </div>
      </div>

      <!-- デバッグ情報パネル -->
      <div v-if="showDebug" class="bg-gray-900 text-white p-4 rounded-lg mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">🐛 Public Search デバッグ情報</h3>
          <button @click="showDebug = false" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 class="font-bold text-yellow-400 mb-2">Firebase 状態</h4>
            <div class="space-y-1">
              <div>Firebase準備: {{ debugInfo.firebaseReady ? '✅' : '❌' }}</div>
              <div>公開ユーザー読み込み: {{ debugInfo.publicUsersLoaded ? '✅' : '❌' }}</div>
              <div>公開ユーザー数: {{ debugInfo.publicUsersCount }}</div>
              <div>現在のステップ: <span class="text-green-400">{{ debugInfo.step }}</span></div>
            </div>
          </div>
          <div>
            <h4 class="font-bold text-blue-400 mb-2">フィルタリング結果</h4>
            <div class="space-y-1">
              <div>総研究者数: {{ indexData?.researchers?.length || 0 }}</div>
              <div>フィルタ後: {{ debugInfo.filteredCount }}</div>
              <div>表示中: {{ filteredResearchers.length }}</div>
              <div>検索クエリ: {{ searchQuery || 'なし' }}</div>
            </div>
          </div>
        </div>
        <div v-if="debugInfo.publicUsersEmails" class="mt-4">
          <h4 class="font-bold text-purple-400 mb-2">公開ユーザーメール一覧</h4>
          <div class="text-xs text-gray-300 break-all">{{ debugInfo.publicUsersEmails?.slice(0, 3).join(', ') }}{{ debugInfo.publicUsersEmails?.length > 3 ? '...' : '' }}</div>
        </div>
        <div v-if="debugInfo.emailMappingUsed" class="mt-4">
          <h4 class="font-bold text-green-400 mb-2">使用されたメールマッピング例</h4>
          <div class="text-xs text-gray-300">{{ debugInfo.emailMappingUsed?.slice(0, 3).join(', ') }}{{ debugInfo.emailMappingUsed?.length > 3 ? '...' : '' }}</div>
        </div>
        <div class="mt-4 text-xs text-gray-400">
          最終更新: {{ debugInfo.timestamp }}
        </div>
      </div>

      <!-- 研究者一覧 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">データを読み込み中...</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">
          <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-medium">データの読み込みに失敗しました</h3>
          <p class="text-gray-600 mt-2">{{ error }}</p>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div
          v-for="researcher in filteredResearchers"
          :key="researcher.name"
          class="card-hover fade-in-up"
          @click="navigateToResearcher(researcher)"
        >
          <!-- 研究者情報 -->
          <div class="flex items-start justify-between mb-3 sm:mb-4">
            <div class="flex-1 min-w-0">
              <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                {{ researcher.name }}
              </h3>
              <p v-if="researcher.name_en" class="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2 truncate">
                {{ researcher.name_en }}
              </p>
              <p v-if="researcher.affiliation" class="text-xs sm:text-sm text-gray-600 line-clamp-2">
                {{ researcher.affiliation }}
              </p>
            </div>
            
            <!-- ステータスアイコン -->
            <div v-if="researcher.has_data" class="flex-shrink-0 ml-2">
              <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>

          <!-- キーワード -->
          <div v-if="researcher.keywords && researcher.keywords.length" class="mb-3 sm:mb-4">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="keyword in researcher.keywords.slice(0, isMobile ? 3 : 5)"
                :key="keyword"
                class="inline-block px-2 py-0.5 sm:py-1 text-xs bg-blue-100 text-blue-800 rounded-full truncate max-w-[100px] sm:max-w-none"
              >
                {{ keyword }}
              </span>
              <span
                v-if="researcher.keywords.length > (isMobile ? 3 : 5)"
                class="inline-block px-2 py-0.5 sm:py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                +{{ researcher.keywords.length - (isMobile ? 3 : 5) }}個
              </span>
            </div>
          </div>

          <!-- 統計情報 -->
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-xs sm:text-sm text-gray-600">
            <span class="truncate">マッチング: {{ researcher.total_matches }}件</span>
            <span v-if="researcher.max_similarity" class="truncate">
              最高マッチ度: {{ Math.round(researcher.max_similarity * 100) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- データが空の場合 -->
      <div v-if="!loading && !error && filteredResearchers.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">検索結果が見つかりませんでした</h3>
        <p class="text-gray-600">別のキーワードで検索してみてください。</p>
      </div>
    </section>
  </div>
</template>

<script setup>
// メタデータ設定
useHead({
  title: '公開データの検索 - 大阪大学研究マッチングシステム',
  meta: [
    { name: 'description', content: '公開されている研究者データの閲覧とマッチング結果の確認' }
  ]
})

// リアクティブデータ
const indexData = ref(null)
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const sortBy = ref('name')
const isMobile = ref(false)
const publicUsers = ref([])

// デバッグ関連
const debugInfo = ref({
  step: 'initialization',
  firebaseReady: false,
  publicUsersLoaded: false,
  publicUsersCount: 0,
  filteredCount: 0,
  publicUsersEmails: null,
  emailMappingUsed: null,
  timestamp: new Date().toISOString()
})

// デバッグ用ヘルパー
const updateDebugInfo = (updates) => {
  debugInfo.value = {
    ...debugInfo.value,
    ...updates,
    timestamp: new Date().toISOString()
  }
  console.log('🐛 PUBLIC SEARCH DEBUG UPDATE:', debugInfo.value)
}
const showDebug = ref(false)

// モバイル検知
const checkMobile = () => {
  if (process.client) {
    isMobile.value = window.innerWidth < 640
  }
}

// Firebase composable
const { getPublicUsers, firebaseReady } = useFirebase()

// データ読み込み
const loadData = async () => {
  try {
    loading.value = true
    const config = useRuntimeConfig()
    const baseURL = config.public.baseURL || '/'
    // baseURLを含む絶対パスを構築
    const dataUrl = baseURL + 'data/researchers_index.json'
    console.log('Loading data from:', dataUrl)
    const data = await $fetch(dataUrl)
    indexData.value = data
    
    // Firebase公開ユーザー情報も読み込み
    await loadPublicUsers()
  } catch (err) {
    console.error('Data loading error:', err)
    error.value = 'データの読み込みに失敗しました: ' + err.message
  } finally {
    loading.value = false
  }
}

// 公開ユーザー設定読み込み
const loadPublicUsers = async () => {
  try {
    updateDebugInfo({ step: 'loading_public_users' })
    
    if (firebaseReady.value) {
      console.log('📋 Researchers: Loading public users from Firebase...')
      updateDebugInfo({ 
        step: 'firebase_ready_loading_users',
        firebaseReady: true 
      })
      
      const users = await getPublicUsers()
      publicUsers.value = users
      
      console.log('📋 Researchers: Loaded public users:', users.length)
      console.log('📋 Researchers: Public users details:', users.map(u => ({ 
        email: u.email, 
        display_name: u.display_name,
        public_profile: u.privacy_settings?.public_profile,
        show_in_search: u.privacy_settings?.show_in_search,
        allow_collaboration: u.privacy_settings?.allow_collaboration
      })))
      console.log('📋 Researchers: Users with show_in_search=true:', users.filter(u => u.privacy_settings?.show_in_search).map(u => u.email))
      
      updateDebugInfo({ 
        step: 'public_users_loaded',
        publicUsersLoaded: true,
        publicUsersCount: users.length,
        publicUsersEmails: users.map(u => u.email)
      })
    } else {
      console.log('📋 Researchers: Firebase not ready, skipping public users load')
      updateDebugInfo({ 
        step: 'firebase_not_ready',
        firebaseReady: false 
      })
    }
  } catch (err) {
    console.warn('📋 Researchers: Failed to load public users:', err)
    updateDebugInfo({ 
      step: 'public_users_error',
      error: err.message
    })
  }
}

// 計算プロパティ
const totalMatches = computed(() => {
  if (!indexData.value?.researchers) return 0
  return indexData.value.researchers.reduce((sum, r) => sum + r.total_matches, 0)
})

const avgSimilarity = computed(() => {
  if (!indexData.value?.researchers) return 0
  const researchers = indexData.value.researchers.filter(r => r.max_similarity > 0)
  if (researchers.length === 0) return 0
  const avg = researchers.reduce((sum, r) => sum + r.max_similarity, 0) / researchers.length
  return Math.round(avg * 100)
})

const filteredResearchers = computed(() => {
  if (!indexData.value?.researchers) {
    updateDebugInfo({ 
      step: 'no_researchers_data',
      filteredCount: 0 
    })
    return []
  }
  
  let filtered = indexData.value.researchers
  const originalCount = filtered.length
  
  console.log('🔍 Starting filteredResearchers computation...')
  console.log('🔍 Original researchers count:', originalCount)
  console.log('🔍 Public users count:', publicUsers.value.length)
  
  // プライバシー設定でフィルタリング（show_in_searchがfalseの研究者を除外）
  // ★重要: プライバシーフィルターは常に適用する
  const publicEmails = new Set(publicUsers.value.map(user => user.email))
  console.log('🔍 Public emails set:', [...publicEmails])
  console.log('🔍 Public users loaded count:', publicUsers.value.length)
  
  const beforePrivacyFilter = filtered.length
  
  filtered = filtered.filter(researcher => {
    // メールアドレスマッピングをチェック
    const emailMapping = {
      '池田和司': 'kazushi_ikeda@memorylab.handai.jp',
      '泉　真祐子': 'mayuko_izumi@memorylab.handai.jp', 
      '秋草直大': 'akikusa_naota@memorylab.handai.jp',
      '藤田 克昌': 'katsumasa_fujita@memorylab.handai.jp',
      '飯塚 崇文': 'iizuka_takafumi@memorylab.handai.jp',
      '石川　篤': 'atsushi_ishikawa@memorylab.handai.jp'
      // 他の研究者も必要に応じて追加
    }
    
    const email = emailMapping[researcher.name]
    const hasEmail = !!email
    const isPublic = email ? publicEmails.has(email) : false  // ★変更: デフォルトをfalseに
    
    console.log('🔍 Researcher:', researcher.name, '-> Email:', email, 'HasEmail:', hasEmail, 'IsPublic:', isPublic)
    
    if (email) {
      // メールマッピングがある場合は、公開ユーザーリストに含まれている場合のみ表示
      return publicEmails.has(email)
    }
    
    // ★変更: メールマッピングがない場合は表示しない（プライバシー保護のため）
    console.log('🔍 No email mapping found for researcher:', researcher.name, '-> HIDDEN')
    return false
  })
  
  console.log('🔍 After privacy filter:', beforePrivacyFilter, '->', filtered.length)
  
  updateDebugInfo({ 
    step: 'privacy_filtering_applied',
    originalCount: originalCount,
    afterPrivacyFilter: filtered.length,
    publicUsersCount: publicUsers.value.length,
    publicEmails: [...publicEmails],
    emailMappingUsed: Object.keys({
      '池田和司': 'kazushi_ikeda@memorylab.handai.jp',
      '泉　真祐子': 'mayuko_izumi@memorylab.handai.jp', 
      '秋草直大': 'akikusa_naota@memorylab.handai.jp',
      '藤田 克昌': 'katsumasa_fujita@memorylab.handai.jp',
      '飯塚 崇文': 'iizuka_takafumi@memorylab.handai.jp',
      '石川　篤': 'atsushi_ishikawa@memorylab.handai.jp'
    })
  })
  
  // 検索フィルター
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    const beforeSearchFilter = filtered.length
    
    filtered = filtered.filter(researcher => 
      researcher.name.toLowerCase().includes(query) ||
      (researcher.name_en && researcher.name_en.toLowerCase().includes(query)) ||
      (researcher.affiliation && researcher.affiliation.toLowerCase().includes(query)) ||
      (researcher.keywords && researcher.keywords.some(keyword => 
        keyword.toLowerCase().includes(query)
      ))
    )
    
    console.log('🔍 After search filter:', beforeSearchFilter, '->', filtered.length)
    updateDebugInfo({ 
      step: 'search_filtering_applied',
      afterSearchFilter: filtered.length,
      searchQuery: query
    })
  }
  
  // ソート
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'similarity':
        return (b.max_similarity || 0) - (a.max_similarity || 0)
      case 'matches':
        return b.total_matches - a.total_matches
      default: // name
        return a.name.localeCompare(b.name, 'ja')
    }
  })
  
  console.log('🔍 Final filtered count:', filtered.length)
  updateDebugInfo({ 
    step: 'filtering_completed',
    filteredCount: filtered.length
  })
  
  return filtered
})

// メソッド
const navigateToResearcher = (researcher) => {
  if (!researcher.has_data) return
  console.log('Navigating to researcher ID:', researcher.researcher_id)
  navigateTo(`/researcher/${researcher.researcher_id}`)
}

// Firebase準備待ち
watch(firebaseReady, (ready) => {
  console.log('📋 Researchers: Firebase ready status changed:', ready)
  updateDebugInfo({ 
    step: 'firebase_ready_changed',
    firebaseReady: ready 
  })
  
  if (ready && publicUsers.value.length === 0) {
    console.log('📋 Researchers: Firebase ready, loading public users...')
    loadPublicUsers()
  }
})

// 初期化
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  loadData()
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', checkMobile)
  }
})
</script>