<template>
  <div>
    <!-- ヘッダーセクション -->
    <section class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">統計情報</h1>
        <p class="text-sm sm:text-base text-gray-600">研究マッチングシステムの全体統計とデータ分析結果</p>
      </div>
    </section>

    <!-- ローディング状態 -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">統計データを読み込み中...</p>
      </div>
    </div>

    <!-- エラー状態 -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <div class="text-red-600 mb-4">
          <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-medium">データの読み込みに失敗しました</h3>
          <p class="text-gray-600 mt-2">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div v-else-if="statsData" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <!-- 全体統計 -->
      <section class="mb-8 sm:mb-12">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">全体サマリー</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div class="card text-center p-4 sm:p-6">
            <div class="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{{ statsData.total_researchers || 0 }}</div>
            <div class="text-xs sm:text-sm text-gray-600">登録研究者数</div>
          </div>
          <div class="card text-center p-4 sm:p-6">
            <div class="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">{{ statsData.total_proposals || 0 }}</div>
            <div class="text-xs sm:text-sm text-gray-600">研究テーマ提案数</div>
          </div>
          <div class="card text-center p-4 sm:p-6">
            <div class="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">{{ Math.round((statsData.similarity_scores?.mean || 0) * 100) }}%</div>
            <div class="text-xs sm:text-sm text-gray-600">平均類似度</div>
          </div>
          <div class="card text-center p-4 sm:p-6">
            <div class="text-2xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">{{ Object.keys(statsData.top_keywords || {}).length }}</div>
            <div class="text-xs sm:text-sm text-gray-600">ユニークキーワード数</div>
          </div>
        </div>
      </section>

      <!-- 類似度統計 -->
      <section class="mb-8 sm:mb-12">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">類似度スコア分析</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <!-- 統計値 -->
          <div class="card">
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">統計値</h3>
            <dl class="space-y-2 sm:space-y-3">
              <div class="flex justify-between">
                <dt class="text-sm sm:text-base text-gray-600">平均値</dt>
                <dd class="text-sm sm:text-base font-semibold">{{ ((statsData.similarity_scores?.mean || 0) * 100).toFixed(2) }}%</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm sm:text-base text-gray-600">中央値</dt>
                <dd class="text-sm sm:text-base font-semibold">{{ ((statsData.similarity_scores?.median || 0) * 100).toFixed(2) }}%</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm sm:text-base text-gray-600">標準偏差</dt>
                <dd class="text-sm sm:text-base font-semibold">{{ ((statsData.similarity_scores?.std || 0) * 100).toFixed(2) }}%</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm sm:text-base text-gray-600">最小値</dt>
                <dd class="text-sm sm:text-base font-semibold">{{ ((statsData.similarity_scores?.min || 0) * 100).toFixed(2) }}%</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm sm:text-base text-gray-600">最大値</dt>
                <dd class="text-sm sm:text-base font-semibold text-green-600">{{ ((statsData.similarity_scores?.max || 0) * 100).toFixed(2) }}%</dd>
              </div>
            </dl>
          </div>

          <!-- 分布可視化（簡易版） -->
          <div class="card">
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">類似度分布</h3>
            <div class="space-y-2 sm:space-y-3">
              <div class="flex items-center">
                <div class="w-16 sm:w-20 text-xs sm:text-sm text-gray-600">90-100%</div>
                <div class="flex-1 bg-gray-200 rounded-full h-3 sm:h-4 ml-2 sm:ml-3">
                  <div class="bg-green-500 h-3 sm:h-4 rounded-full" :style="{ width: '15%' }"></div>
                </div>
                <div class="w-8 sm:w-12 text-xs sm:text-sm text-gray-600 text-right">15%</div>
              </div>
              <div class="flex items-center">
                <div class="w-16 sm:w-20 text-xs sm:text-sm text-gray-600">80-90%</div>
                <div class="flex-1 bg-gray-200 rounded-full h-3 sm:h-4 ml-2 sm:ml-3">
                  <div class="bg-blue-500 h-3 sm:h-4 rounded-full" :style="{ width: '25%' }"></div>
                </div>
                <div class="w-8 sm:w-12 text-xs sm:text-sm text-gray-600 text-right">25%</div>
              </div>
              <div class="flex items-center">
                <div class="w-16 sm:w-20 text-xs sm:text-sm text-gray-600">70-80%</div>
                <div class="flex-1 bg-gray-200 rounded-full h-3 sm:h-4 ml-2 sm:ml-3">
                  <div class="bg-yellow-500 h-3 sm:h-4 rounded-full" :style="{ width: '35%' }"></div>
                </div>
                <div class="w-8 sm:w-12 text-xs sm:text-sm text-gray-600 text-right">35%</div>
              </div>
              <div class="flex items-center">
                <div class="w-16 sm:w-20 text-xs sm:text-sm text-gray-600">60-70%</div>
                <div class="flex-1 bg-gray-200 rounded-full h-3 sm:h-4 ml-2 sm:ml-3">
                  <div class="bg-orange-500 h-3 sm:h-4 rounded-full" :style="{ width: '20%' }"></div>
                </div>
                <div class="w-8 sm:w-12 text-xs sm:text-sm text-gray-600 text-right">20%</div>
              </div>
              <div class="flex items-center">
                <div class="w-16 sm:w-20 text-xs sm:text-sm text-gray-600">50-60%</div>
                <div class="flex-1 bg-gray-200 rounded-full h-3 sm:h-4 ml-2 sm:ml-3">
                  <div class="bg-red-500 h-3 sm:h-4 rounded-full" :style="{ width: '5%' }"></div>
                </div>
                <div class="w-8 sm:w-12 text-xs sm:text-sm text-gray-600 text-right">5%</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <!-- コミュニティ可視化 -->
      <section class="mb-8 sm:mb-12">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">研究者コミュニティ可視化</h2>
        <div class="card">
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-4">
              研究者間の関係性とコミュニティ構造をインタラクティブに可視化します。
            </p>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-yellow-800">
                    大容量ファイルの読み込み注意
                  </h3>
                  <div class="mt-2 text-sm text-yellow-700">
                    <p>コミュニティ可視化ファイルは約4.7MBと大容量です。読み込みに時間がかかる場合があります。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="text-center">
            <button 
              @click="loadCommunityVisualization"
              :disabled="isLoadingVisualization"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isLoadingVisualization" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoadingVisualization ? '読み込み中...' : 'コミュニティ可視化を表示' }}
            </button>
          </div>

          <!-- 可視化コンテンツ -->
          <div v-if="showVisualization" class="mt-6">
            <div class="border rounded-lg overflow-hidden">
              <iframe 
                ref="visualizationFrame"
                :src="baseURL + 'data/community_visualization.html'"
                class="w-full h-96 md:h-[600px] lg:h-[800px]"
                frameborder="0"
                @load="onVisualizationLoad"
              ></iframe>
            </div>
            <div class="mt-4 text-center">
              <button 
                @click="openVisualizationFullscreen"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                </svg>
                フルスクリーンで表示
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
// メタデータ設定
useHead({
  title: '統計情報 - 大阪大学研究マッチングシステム',
  meta: [
    { name: 'description', content: '研究マッチングシステムの統計情報とデータ分析結果' }
  ]
})

// リアクティブデータ
const statsData = ref(null)
const loading = ref(true)
const error = ref(null)
const isMobile = ref(false)
const showVisualization = ref(false)
const isLoadingVisualization = ref(false)
const visualizationFrame = ref(null)

// ランタイム設定
const config = useRuntimeConfig()
const baseURL = computed(() => config.public.baseURL)

// データ読み込み
const loadStatsData = async () => {
  try {
    loading.value = true
    const data = await $fetch(config.public.baseURL + 'data/stats.json')
    statsData.value = data
  } catch (err) {
    error.value = 'データの読み込みに失敗しました: ' + err.message
  } finally {
    loading.value = false
  }
}

// 計算プロパティ

// メソッド
const formatDate = (dateString) => {
  if (!dateString) return '不明'
  return new Date(dateString).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// モバイル検知
const checkMobile = () => {
  if (process.client) {
    isMobile.value = window.innerWidth < 640
  }
}

// コミュニティ可視化関連メソッド
const loadCommunityVisualization = () => {
  isLoadingVisualization.value = true
  showVisualization.value = true
}

const onVisualizationLoad = () => {
  isLoadingVisualization.value = false
}

const openVisualizationFullscreen = () => {
  if (process.client) {
    window.open(config.public.baseURL + 'data/community_visualization.html', '_blank', 'fullscreen=yes')
  }
}

// 初期化
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  loadStatsData()
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', checkMobile)
  }
})
</script>