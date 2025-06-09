<template>
  <div>
    <!-- ローディング状態 -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">研究者データを読み込み中...</p>
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
        <NuxtLink to="/" class="btn-primary">
          研究者一覧に戻る
        </NuxtLink>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div v-else-if="researcherData">
      <!-- ヘッダーセクション -->
      <section class="bg-white border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <!-- パンくずリスト -->
              <nav class="flex mb-4" aria-label="Breadcrumb">
                <ol class="flex items-center space-x-2">
                  <li>
                    <NuxtLink to="/" class="text-gray-500 hover:text-gray-700">
                      研究者一覧
                    </NuxtLink>
                  </li>
                  <li>
                    <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </li>
                  <li class="text-gray-900 font-medium">
                    {{ researcherData?.target_researcher?.name || 'Loading...' }}
                  </li>
                </ol>
              </nav>

              <!-- 研究者情報 -->
              <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                  {{ researcherData?.target_researcher?.name || 'Loading...' }}
                </h1>
                <p v-if="researcherData?.target_researcher?.name_en" class="text-lg text-gray-600 mb-2">
                  {{ researcherData.target_researcher.name_en }}
                </p>
                <p v-if="researcherData?.target_researcher?.affiliation" class="text-gray-600">
                  {{ researcherData.target_researcher.affiliation }}
                </p>
              </div>

              <!-- キーワード -->
              <div v-if="researcherData?.target_researcher?.keywords?.length" class="mb-6">
                <h3 class="text-sm font-medium text-gray-700 mb-2">研究キーワード</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="keyword in researcherData.target_researcher.keywords"
                    :key="keyword"
                    class="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                  >
                    {{ keyword }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 統計カード -->
            <div class="flex-shrink-0 ml-8">
              <div class="bg-gray-50 rounded-lg p-6 min-w-48">
                <h3 class="text-sm font-medium text-gray-700 mb-4">マッチング統計</h3>
                <dl class="space-y-3">
                  <div>
                    <dt class="text-sm text-gray-600">マッチング数</dt>
                    <dd class="text-2xl font-bold text-gray-900">{{ researcherData?.analysis_summary?.total_candidates_analyzed || researcherData?.matches?.length || 0 }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm text-gray-600">最高マッチ度</dt>
                    <dd class="text-2xl font-bold text-green-600">{{ Math.round((researcherData?.analysis_summary?.max_similarity_score || 0) * 100) }}%</dd>
                  </div>
                  <div>
                    <dt class="text-sm text-gray-600">平均マッチ度</dt>
                    <dd class="text-lg font-semibold text-gray-700">{{ Math.round((researcherData?.analysis_summary?.average_similarity_score || 0) * 100) }}%</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <!-- 研究概要 -->
          <div v-if="researcherData?.target_researcher?.abstract" class="mt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-3">研究概要</h3>
            <p class="text-gray-700 leading-relaxed">
              {{ researcherData.target_researcher.abstract }}
            </p>
          </div>

          <!-- 研究関心事 -->
          <div v-if="hasResearchInterests" class="mt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-3">研究関心事</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div v-if="researcherData?.target_researcher?.research_interests?.collaboration" class="bg-blue-50 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-blue-900 mb-2">共同研究への関心</h4>
                <p class="text-sm text-blue-800">{{ researcherData.target_researcher.research_interests.collaboration }}</p>
              </div>
              <div v-if="researcherData?.target_researcher?.research_interests?.technology" class="bg-green-50 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-green-900 mb-2">技術的関心</h4>
                <p class="text-sm text-green-800">{{ researcherData.target_researcher.research_interests.technology }}</p>
              </div>
              <div v-if="researcherData?.target_researcher?.research_interests?.market" class="bg-purple-50 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-purple-900 mb-2">市場への関心</h4>
                <p class="text-sm text-purple-800">{{ researcherData.target_researcher.research_interests.market }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- マッチング結果セクション -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">研究マッチング結果</h2>
          <p class="text-gray-600">
            AI分析により推薦された{{ researcherData?.matches?.length || 0 }}件の研究コラボレーション提案
          </p>
        </div>

        <!-- マッチング結果一覧 -->
        <div class="space-y-8">
          <div
            v-for="(match, index) in researcherData?.matches || []"
            :key="index"
            class="card"
          >
            <!-- マッチした研究者情報 -->
            <div class="flex items-start justify-between mb-6">
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-gray-900 mb-1">
                  {{ match.researcher.name }}
                </h3>
                <p v-if="match.researcher.affiliation" class="text-gray-600 mb-3">
                  {{ match.researcher.affiliation }}
                </p>
                
                <!-- 共通キーワード -->
                <div v-if="match.researcher.keywords?.length" class="mb-3">
                  <span class="text-sm text-gray-500 mr-2">共通キーワード:</span>
                  <div class="inline-flex flex-wrap gap-1">
                    <span
                      v-for="keyword in match.researcher.keywords.slice(0, 3)"
                      :key="keyword"
                      class="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full"
                    >
                      {{ keyword }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- マッチ度スコア -->
              <div class="flex-shrink-0 text-right">
                <div class="text-2xl font-bold text-green-600">
                  {{ Math.round(match.researcher.similarity_score * 100) }}%
                </div>
                <div class="text-sm text-gray-500">マッチ度</div>
              </div>
            </div>

            <!-- 研究テーマ提案 -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">
                🔬 {{ match.theme_proposal.title }}
              </h4>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- 左カラム -->
                <div class="space-y-4">
                  <div>
                    <h5 class="text-sm font-medium text-gray-700 mb-2">研究目的</h5>
                    <p class="text-sm text-gray-600">{{ match.theme_proposal.purpose }}</p>
                  </div>
                  
                  <div>
                    <h5 class="text-sm font-medium text-gray-700 mb-2">研究手法</h5>
                    <p class="text-sm text-gray-600">{{ match.theme_proposal.methodology }}</p>
                  </div>
                  
                  <div v-if="match.theme_proposal.keywords?.length">
                    <h5 class="text-sm font-medium text-gray-700 mb-2">関連キーワード</h5>
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="keyword in match.theme_proposal.keywords"
                        :key="keyword"
                        class="inline-block px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full"
                      >
                        {{ keyword }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- 右カラム -->
                <div class="space-y-4">
                  <div>
                    <h5 class="text-sm font-medium text-gray-700 mb-2">社会的インパクト</h5>
                    <p class="text-sm text-gray-600">{{ match.theme_proposal.social_impact }}</p>
                  </div>
                  
                  <div>
                    <h5 class="text-sm font-medium text-gray-700 mb-2">期待される成果</h5>
                    <p class="text-sm text-gray-600">{{ match.theme_proposal.expected_outcomes }}</p>
                  </div>
                  
                  <div>
                    <h5 class="text-sm font-medium text-gray-700 mb-2">協力の根拠</h5>
                    <p class="text-sm text-gray-600">{{ match.theme_proposal.collaboration_rationale }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- データが空の場合 -->
        <div v-if="researcherData && researcherData.matches && researcherData.matches.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">マッチング結果がありません</h3>
          <p class="text-gray-600">この研究者のマッチングデータが見つかりませんでした。</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
// ルートパラメータ取得
const route = useRoute()
const researcherId = route.params.id

// メタデータ設定
useHead({
  title: `研究者詳細 - 大阪大学研究マッチングシステム`,
  meta: [
    { name: 'description', content: '研究者の詳細なマッチング結果と研究テーマ提案' }
  ]
})

// リアクティブデータ
const researcherData = ref(null)
const loading = ref(true)
const error = ref(null)

// データ読み込み
const loadResearcherData = async () => {
  try {
    console.log('Starting data load for ID:', researcherId)
    loading.value = true
    
    // IDを3桁ゼロパディングしてファイル名を構築
    const paddedId = String(researcherId).padStart(3, '0')
    const filename = `researcher_${paddedId}`
    const requestUrl = `/data/researchers/${filename}.json`
    
    console.log('Request URL:', requestUrl)
    const data = await $fetch(requestUrl)
    console.log('Loaded data successfully:', !!data.target_researcher)
    
    researcherData.value = data
    
    // ページタイトルを更新
    if (data?.target_researcher?.name) {
      useHead({
        title: `${data.target_researcher.name} - 研究マッチング結果`
      })
    }
    
  } catch (err) {
    console.error('Data loading error:', err)
    if (err.status === 404) {
      error.value = `研究者データが見つかりません (ID: ${researcherId})`
    } else {
      error.value = 'データの読み込みに失敗しました: ' + err.message
    }
  } finally {
    loading.value = false
  }
}

// 計算プロパティ
const hasResearchInterests = computed(() => {
  if (!researcherData.value?.target_researcher?.research_interests) return false
  const interests = researcherData.value.target_researcher.research_interests
  return interests.collaboration || interests.technology || interests.market
})

// 初期化
onMounted(() => {
  loadResearcherData()
})
</script>