<template>
  <div>
    <!-- ヒーローセクション -->
    <section class="gradient-bg py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl font-bold text-white mb-4 fade-in-up">
          研究マッチングシステム
        </h1>
        <p class="text-xl text-blue-100 mb-8 fade-in-up" style="animation-delay: 0.2s">
          AI技術を活用した研究者間のコラボレーション提案
        </p>
        
        <!-- 統計サマリー -->
        <div v-if="indexData" class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div class="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-white fade-in-up" style="animation-delay: 0.4s">
            <div class="text-3xl font-bold">{{ indexData.total_researchers }}</div>
            <div class="text-blue-100">研究者</div>
          </div>
          <div class="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-white fade-in-up" style="animation-delay: 0.6s">
            <div class="text-3xl font-bold">{{ totalMatches }}</div>
            <div class="text-blue-100">マッチング結果</div>
          </div>
          <div class="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-white fade-in-up" style="animation-delay: 0.8s">
            <div class="text-3xl font-bold">{{ avgSimilarity }}%</div>
            <div class="text-blue-100">平均マッチ度</div>
          </div>
        </div>
      </div>
    </section>

    <!-- メインコンテンツ -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 検索・フィルター -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <!-- 検索ボックス -->
          <div class="flex-1 relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="研究者名、所属、キーワードで検索..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <!-- ソート -->
          <select
            v-model="sortBy"
            class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">名前順</option>
            <option value="similarity">マッチ度順</option>
            <option value="matches">マッチング数順</option>
          </select>
        </div>
        
        <!-- 結果件数 -->
        <p class="text-gray-600">
          {{ filteredResearchers.length }}件の研究者が見つかりました
        </p>
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

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="researcher in filteredResearchers"
          :key="researcher.name"
          class="card-hover fade-in-up"
          @click="navigateToResearcher(researcher)"
        >
          <!-- 研究者情報 -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">
                {{ researcher.name }}
              </h3>
              <p v-if="researcher.name_en" class="text-sm text-gray-500 mb-2">
                {{ researcher.name_en }}
              </p>
              <p v-if="researcher.affiliation" class="text-sm text-gray-600">
                {{ researcher.affiliation }}
              </p>
            </div>
            
            <!-- ステータスアイコン -->
            <div v-if="researcher.has_data" class="flex-shrink-0">
              <div class="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>

          <!-- キーワード -->
          <div v-if="researcher.keywords && researcher.keywords.length" class="mb-4">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="keyword in researcher.keywords.slice(0, 5)"
                :key="keyword"
                class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {{ keyword }}
              </span>
              <span
                v-if="researcher.keywords.length > 5"
                class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                +{{ researcher.keywords.length - 5 }}個
              </span>
            </div>
          </div>

          <!-- 統計情報 -->
          <div class="flex justify-between items-center text-sm text-gray-600">
            <span>マッチング: {{ researcher.total_matches }}件</span>
            <span v-if="researcher.max_similarity">
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
  title: '研究者一覧 - 大阪大学研究マッチングシステム',
  meta: [
    { name: 'description', content: 'AI技術を活用した研究者マッチングシステムの研究者一覧ページ' }
  ]
})

// リアクティブデータ
const indexData = ref(null)
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const sortBy = ref('name')

// データ読み込み
const loadData = async () => {
  try {
    loading.value = true
    const data = await $fetch('/data/researchers_index.json')
    indexData.value = data
  } catch (err) {
    error.value = 'データの読み込みに失敗しました: ' + err.message
  } finally {
    loading.value = false
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
  if (!indexData.value?.researchers) return []
  
  let filtered = indexData.value.researchers
  
  // 検索フィルター
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
  console.log('Navigating to researcher ID:', researcher.researcher_id)
  navigateTo(`/researcher/${researcher.researcher_id}`)
}

// 初期化
onMounted(() => {
  loadData()
})
</script>