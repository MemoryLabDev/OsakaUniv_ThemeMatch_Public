<template>
  <div>
    <!-- ヘッダーセクション -->
    <section class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">統計情報</h1>
        <p class="text-gray-600">研究マッチングシステムの全体統計とデータ分析結果</p>
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
    <div v-else-if="statsData" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 全体統計 -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">全体サマリー</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="card text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ statsData.total_researchers }}</div>
            <div class="text-gray-600">登録研究者数</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-green-600 mb-2">{{ statsData.total_proposals }}</div>
            <div class="text-gray-600">研究テーマ提案数</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-purple-600 mb-2">{{ Math.round(statsData.similarity_scores.mean * 100) }}%</div>
            <div class="text-gray-600">平均類似度</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-orange-600 mb-2">{{ Object.keys(statsData.top_keywords).length }}</div>
            <div class="text-gray-600">ユニークキーワード数</div>
          </div>
        </div>
      </section>

      <!-- 類似度統計 -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">類似度スコア分析</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- 統計値 -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">統計値</h3>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-gray-600">平均値</dt>
                <dd class="font-semibold">{{ (statsData.similarity_scores.mean * 100).toFixed(2) }}%</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600">中央値</dt>
                <dd class="font-semibold">{{ (statsData.similarity_scores.median * 100).toFixed(2) }}%</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600">標準偏差</dt>
                <dd class="font-semibold">{{ (statsData.similarity_scores.std * 100).toFixed(2) }}%</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600">最小値</dt>
                <dd class="font-semibold">{{ (statsData.similarity_scores.min * 100).toFixed(2) }}%</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600">最大値</dt>
                <dd class="font-semibold text-green-600">{{ (statsData.similarity_scores.max * 100).toFixed(2) }}%</dd>
              </div>
            </dl>
          </div>

          <!-- 分布可視化（簡易版） -->
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">類似度分布</h3>
            <div class="space-y-3">
              <div class="flex items-center">
                <div class="w-20 text-sm text-gray-600">90-100%</div>
                <div class="flex-1 bg-gray-200 rounded-full h-4 ml-3">
                  <div class="bg-green-500 h-4 rounded-full" :style="{ width: '15%' }"></div>
                </div>
                <div class="w-12 text-sm text-gray-600 text-right">15%</div>
              </div>
              <div class="flex items-center">
                <div class="w-20 text-sm text-gray-600">80-90%</div>
                <div class="flex-1 bg-gray-200 rounded-full h-4 ml-3">
                  <div class="bg-blue-500 h-4 rounded-full" :style="{ width: '25%' }"></div>
                </div>
                <div class="w-12 text-sm text-gray-600 text-right">25%</div>
              </div>
              <div class="flex items-center">
                <div class="w-20 text-sm text-gray-600">70-80%</div>
                <div class="flex-1 bg-gray-200 rounded-full h-4 ml-3">
                  <div class="bg-yellow-500 h-4 rounded-full" :style="{ width: '35%' }"></div>
                </div>
                <div class="w-12 text-sm text-gray-600 text-right">35%</div>
              </div>
              <div class="flex items-center">
                <div class="w-20 text-sm text-gray-600">60-70%</div>
                <div class="flex-1 bg-gray-200 rounded-full h-4 ml-3">
                  <div class="bg-orange-500 h-4 rounded-full" :style="{ width: '20%' }"></div>
                </div>
                <div class="w-12 text-sm text-gray-600 text-right">20%</div>
              </div>
              <div class="flex items-center">
                <div class="w-20 text-sm text-gray-600">50-60%</div>
                <div class="flex-1 bg-gray-200 rounded-full h-4 ml-3">
                  <div class="bg-red-500 h-4 rounded-full" :style="{ width: '5%' }"></div>
                </div>
                <div class="w-12 text-sm text-gray-600 text-right">5%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 人気キーワード -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">人気研究キーワード</h2>
        <div class="card">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="[keyword, count] in topKeywordsList"
              :key="keyword"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span class="font-medium text-gray-900">{{ keyword }}</span>
              <div class="flex items-center">
                <span class="text-sm text-gray-600 mr-2">{{ count }}件</span>
                <div class="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full" 
                    :style="{ width: (count / maxKeywordCount * 100) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- システム情報 -->
      <section>
        <h2 class="text-2xl font-bold text-gray-900 mb-6">システム情報</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">データ更新情報</h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm text-gray-600">最終ビルド日時</dt>
                <dd class="font-medium">{{ formatDate(statsData.last_build) }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-600">データ処理方式</dt>
                <dd class="font-medium">AI埋め込みベクトル + キーワード重複分析</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-600">システムバージョン</dt>
                <dd class="font-medium">v2.0.0</dd>
              </div>
            </dl>
          </div>

          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">技術スタック</h3>
            <div class="space-y-2">
              <div class="flex items-center">
                <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">Frontend</span>
                <span class="text-sm text-gray-700">Nuxt.js 3 + Tailwind CSS</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded mr-2">Backend</span>
                <span class="text-sm text-gray-700">Python + OpenAI API</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded mr-2">Deploy</span>
                <span class="text-sm text-gray-700">GitHub Pages (静的サイト)</span>
              </div>
              <div class="flex items-center">
                <span class="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded mr-2">Data</span>
                <span class="text-sm text-gray-700">OpenAlex Research API</span>
              </div>
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

// データ読み込み
const loadStatsData = async () => {
  try {
    loading.value = true
    const data = await $fetch('/data/stats.json')
    statsData.value = data
  } catch (err) {
    error.value = 'データの読み込みに失敗しました: ' + err.message
  } finally {
    loading.value = false
  }
}

// 計算プロパティ
const topKeywordsList = computed(() => {
  if (!statsData.value?.top_keywords) return []
  return Object.entries(statsData.value.top_keywords)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
})

const maxKeywordCount = computed(() => {
  if (topKeywordsList.value.length === 0) return 1
  return Math.max(...topKeywordsList.value.map(([, count]) => count))
})

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

// 初期化
onMounted(() => {
  loadStatsData()
})
</script>