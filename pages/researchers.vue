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
        
        <!-- 結果件数 -->
        <div class="flex items-center justify-between">
          <p class="text-gray-600 text-sm sm:text-base">
            {{ filteredResearchers.length }}件の研究者が見つかりました
          </p>
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

          <!-- 分類タグ -->
          <div v-if="researcher.field_tag || researcher.affiliation_tag" class="mb-3 sm:mb-4">
            <div class="flex flex-wrap gap-1">
              <span
                v-if="researcher.field_tag"
                :class="getFieldTagClass(researcher.field_tag)"
                class="inline-block px-2 py-0.5 sm:py-1 text-xs rounded-full font-medium"
              >
                {{ researcher.field_tag }}
              </span>
              <span
                v-if="researcher.affiliation_tag"
                :class="getAffiliationTagClass(researcher.affiliation_tag)"
                class="inline-block px-2 py-0.5 sm:py-1 text-xs rounded-full font-medium"
              >
                {{ researcher.affiliation_tag }}
              </span>
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


// モバイル検知
const checkMobile = () => {
  if (process.client) {
    isMobile.value = window.innerWidth < 640
  }
}

// Firebase composable
const { getPublicUsers, firebaseReady } = useFirebase()

// データ読み込み (UID管理システム使用)
const loadData = async () => {
  try {
    loading.value = true
    
    const config = useRuntimeConfig()
    const baseURL = config.public.baseURL || '/'
    
    // 1. まず公開ユーザー設定を読み込み（必須）
    await loadPublicUsers()
    
    // 2. UID インデックスを読み込み
    const uidIndexUrl = baseURL + 'data/uid_index.json'
    const uidData = await $fetch(uidIndexUrl)
    
    // 3. 公開ユーザーの研究者データのみ読み込み（最適化）
    await loadResearcherDataFromUIDs(uidData)
    
  } catch (err) {
    error.value = 'データの読み込みに失敗しました: ' + err.message
  } finally {
    loading.value = false
  }
}

// UID から研究者データを読み込み（最適化版：公開ユーザーのみ）
const loadResearcherDataFromUIDs = async (uidData) => {
  try {
    const config = useRuntimeConfig()
    const baseURL = config.public.baseURL || '/'
    const researchers = []
    
    // 公開ユーザーのメールアドレスセットを作成
    const publicEmails = new Set(publicUsers.value.map(user => user.email))
    
    // 各UIDについて、公開設定のユーザーのみ処理
    for (const [uid, userData] of Object.entries(uidData)) {
      try {
        // 最適化：公開ユーザーでない場合はスキップ
        if (!publicEmails.has(userData.email)) {
          continue
        }
        
        // UIDベースのマッチング結果ファイルを読み込み
        const matchingResultsUrl = `${baseURL}data/matching_results_${uid}.json`
        const matchingData = await $fetch(matchingResultsUrl)
        
        if (matchingData && matchingData.target_researcher) {
          const researcher = {
            uid: uid,
            researcher_id: matchingData.target_researcher.researcher_id || uid,
            openalex_id: matchingData.target_researcher.openalex_id || '',
            name: userData.name || matchingData.target_researcher.name,
            name_en: matchingData.target_researcher.name_en || userData.name,
            affiliation: matchingData.target_researcher.affiliation || userData.affiliation || '',
            keywords: matchingData.target_researcher.keywords || [],
            field_tag: matchingData.target_researcher.field_tag || userData.field_tag || '工学',
            affiliation_tag: matchingData.target_researcher.affiliation_tag || userData.affiliation_tag || 'アカデミア',
            total_matches: matchingData.matched_researchers?.length || 0,
            max_similarity: Math.max(...(matchingData.matched_researchers?.map(r => r.similarity_score) || [0])),
            has_data: true,
            email: userData.email || '',
            matching_data: matchingData
          }
          
          researchers.push(researcher)
        }
      } catch (fileErr) {
        // 公開ユーザーの場合、UIDデータのみでも追加
        if (publicEmails.has(userData.email)) {
          researchers.push({
            uid: uid,
            researcher_id: uid,
            name: userData.name,
            name_en: userData.name,
            affiliation: userData.affiliation || '',
            email: userData.email || '',
            field_tag: userData.field_tag || '工学',
            affiliation_tag: userData.affiliation_tag || 'アカデミア',
            keywords: [],
            total_matches: 0,
            max_similarity: 0,
            has_data: false
          })
        }
      }
    }
    
    // 古い indexData 形式に合わせる
    indexData.value = {
      researchers: researchers,
      last_updated: new Date().toISOString(),
      total_researchers: researchers.length,
      public_count: researchers.length
    }
    
  } catch (err) {
    // Error handling without console
  }
}

// 公開ユーザー設定読み込み (キャッシュ機能付き)
const loadPublicUsers = async () => {
  try {
    // まず静的ファイルから読み込み (高速)
    try {
      const config = useRuntimeConfig()
      const baseURL = config.public.baseURL || '/'
      const userProfilesUrl = baseURL + 'auth/user_profiles.json'
      
      const userProfiles = await $fetch(userProfilesUrl)
      
      // 公開設定のユーザーをフィルタ
      const users = []
      for (const [uid, userData] of Object.entries(userProfiles)) {
        if (userData.privacy_settings?.public_profile && userData.privacy_settings?.show_in_search) {
          users.push({
            uid,
            email: userData.email,
            display_name: userData.display_name,
            privacy_settings: userData.privacy_settings
          })
        }
      }
      
      publicUsers.value = users
      
      return // 静的ファイルから読み込み成功
      
    } catch (staticError) {
      // フォールバック: Firebase から読み込み
      if (firebaseReady.value) {
        const users = await getPublicUsers()
        publicUsers.value = users
      }
    }
  } catch (err) {
    // Error handling without console
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
    return []
  }
  
  let filtered = indexData.value.researchers
  
  // 検索フィルター（プライバシーフィルターは既に適用済み）
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    
    filtered = filtered.filter(researcher => 
      researcher.name.toLowerCase().includes(query) ||
      (researcher.name_en && researcher.name_en.toLowerCase().includes(query)) ||
      (researcher.affiliation && researcher.affiliation.toLowerCase().includes(query)) ||
      (researcher.keywords && researcher.keywords.some(keyword => 
        keyword.toLowerCase().includes(query)
      ))
    )
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
  
  return filtered
})

// メソッド
const navigateToResearcher = (researcher) => {
  if (!researcher.has_data) return
  navigateTo(`/researcher/${researcher.researcher_id}`)
}

// タグのスタイリング関数
const getFieldTagClass = (fieldTag) => {
  if (fieldTag === '医学') {
    return 'bg-red-100 text-red-800'
  } else if (fieldTag === '工学') {
    return 'bg-blue-100 text-blue-800'
  }
  return 'bg-gray-100 text-gray-800'
}

const getAffiliationTagClass = (affiliationTag) => {
  if (affiliationTag === 'アカデミア') {
    return 'bg-green-100 text-green-800'
  } else if (affiliationTag === '企業') {
    return 'bg-purple-100 text-purple-800'
  }
  return 'bg-gray-100 text-gray-800'
}

// Firebase準備待ち
watch(firebaseReady, (ready) => {
  if (ready && publicUsers.value.length === 0) {
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