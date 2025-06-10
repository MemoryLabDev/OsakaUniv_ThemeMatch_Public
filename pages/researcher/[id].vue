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
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-6 lg:space-y-0">
            <div class="flex-1 min-w-0">
              <!-- パンくずリスト -->
              <nav class="flex mb-3 sm:mb-4" aria-label="Breadcrumb">
                <ol class="flex items-center space-x-1 sm:space-x-2 text-sm">
                  <li>
                    <NuxtLink to="/" class="text-gray-500 hover:text-gray-700 truncate">
                      研究者一覧
                    </NuxtLink>
                  </li>
                  <li>
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </li>
                  <li class="text-gray-900 font-medium truncate">
                    {{ researcherData?.target_researcher?.name || 'Loading...' }}
                  </li>
                </ol>
              </nav>

              <!-- 研究者情報 -->
              <div class="mb-4 sm:mb-6">
                <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 break-words">
                  {{ researcherData?.target_researcher?.name || 'Loading...' }}
                </h1>
                <p v-if="researcherData?.target_researcher?.name_en" class="text-base sm:text-lg text-gray-600 mb-2 break-words">
                  {{ researcherData.target_researcher.name_en }}
                </p>
                <p v-if="researcherData?.target_researcher?.affiliation" class="text-sm sm:text-base text-gray-600 break-words">
                  {{ researcherData.target_researcher.affiliation }}
                </p>
              </div>

              <!-- キーワード -->
              <div v-if="researcherData?.target_researcher?.keywords?.length" class="mb-4 sm:mb-6">
                <h3 class="text-sm font-medium text-gray-700 mb-2">研究キーワード</h3>
                <div class="flex flex-wrap gap-1 sm:gap-2">
                  <span
                    v-for="keyword in researcherData.target_researcher.keywords.slice(0, showAllKeywords ? undefined : (isMobile ? 6 : 10))"
                    :key="keyword"
                    class="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm bg-blue-100 text-blue-800 rounded-full break-all"
                  >
                    {{ keyword }}
                  </span>
                  <button
                    v-if="researcherData.target_researcher.keywords.length > (isMobile ? 6 : 10)"
                    @click="showAllKeywords = !showAllKeywords"
                    class="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                  >
                    {{ showAllKeywords ? '閉じる' : `+${researcherData.target_researcher.keywords.length - (isMobile ? 6 : 10)}個` }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 統計カード -->
            <div class="flex-shrink-0 lg:ml-8 w-full lg:w-auto">
              <div class="bg-gray-50 rounded-lg p-4 sm:p-6 lg:min-w-48">
                <h3 class="text-sm font-medium text-gray-700 mb-3 sm:mb-4">マッチング統計</h3>
                <dl class="grid grid-cols-3 lg:grid-cols-1 gap-4 lg:gap-3">
                  <div class="text-center lg:text-left">
                    <dt class="text-xs sm:text-sm text-gray-600">マッチング数</dt>
                    <dd class="text-lg sm:text-2xl font-bold text-gray-900">{{ researcherData?.analysis_summary?.total_candidates_analyzed || researcherData?.matches?.length || 0 }}</dd>
                  </div>
                  <div class="text-center lg:text-left">
                    <dt class="text-xs sm:text-sm text-gray-600">最高マッチ度</dt>
                    <dd class="text-lg sm:text-2xl font-bold text-green-600">{{ Math.round((researcherData?.analysis_summary?.max_similarity_score || 0) * 100) }}%</dd>
                  </div>
                  <div class="text-center lg:text-left">
                    <dt class="text-xs sm:text-sm text-gray-600">平均マッチ度</dt>
                    <dd class="text-base sm:text-lg font-semibold text-gray-700">{{ Math.round((researcherData?.analysis_summary?.average_similarity_score || 0) * 100) }}%</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <!-- 研究概要 -->
          <div v-if="researcherData?.target_researcher?.abstract" class="mt-4 sm:mt-6">
            <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">研究概要</h3>
            <p class="text-sm sm:text-base text-gray-700 leading-relaxed">
              {{ researcherData.target_researcher.abstract }}
            </p>
          </div>

          <!-- 最新の科研費動向 -->
          <div v-if="researcherData?.kaken_trend_analysis?.summary" class="mt-4 sm:mt-6">
            <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">
              <span class="inline-flex items-center">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                最新の科研費動向
              </span>
            </h3>
            
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <!-- 統計サマリー -->
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div class="flex items-center justify-center sm:justify-start space-x-6 sm:space-x-4 mb-3 sm:mb-0">
                  <div class="text-center">
                    <div class="text-xl sm:text-2xl font-bold text-blue-600">{{ researcherData.kaken_trend_analysis.grant_count }}</div>
                    <div class="text-xs text-gray-600">助成金件数</div>
                  </div>
                  <div v-if="researcherData.kaken_trend_analysis.total_funding > 0" class="text-center">
                    <div class="text-xl sm:text-2xl font-bold text-green-600">{{ formatFunding(researcherData.kaken_trend_analysis.total_funding) }}</div>
                    <div class="text-xs text-gray-600">総配分額</div>
                  </div>
                </div>
                <span class="inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                  <svg class="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  AI要約済み
                </span>
              </div>
              
              <!-- 動向要約 -->
              <div class="bg-white bg-opacity-70 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <h4 class="text-sm font-medium text-gray-800 mb-2">研究動向分析</h4>
                <p class="text-sm sm:text-base text-gray-700 leading-relaxed">{{ researcherData.kaken_trend_analysis.summary }}</p>
              </div>
              
              <!-- 主要テーマ -->
              <div v-if="researcherData.kaken_trend_analysis.key_themes?.length" class="mb-3 sm:mb-4">
                <h4 class="text-sm font-medium text-gray-800 mb-2">主要研究テーマ</h4>
                <div class="flex flex-wrap gap-1 sm:gap-2">
                  <span
                    v-for="theme in researcherData.kaken_trend_analysis.key_themes.slice(0, isMobile ? 3 : 5)"
                    :key="theme"
                    class="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-xs bg-white bg-opacity-80 text-blue-800 rounded-full border border-blue-200 break-all"
                  >
                    {{ theme }}
                  </span>
                  <button
                    v-if="researcherData.kaken_trend_analysis.key_themes.length > (isMobile ? 3 : 5)"
                    @click="showAllThemes = !showAllThemes"
                    class="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                  >
                    {{ showAllThemes ? '閉じる' : `+${researcherData.kaken_trend_analysis.key_themes.length - (isMobile ? 3 : 5)}個` }}
                  </button>
                </div>
                <div v-if="showAllThemes" class="flex flex-wrap gap-1 sm:gap-2 mt-2">
                  <span
                    v-for="theme in researcherData.kaken_trend_analysis.key_themes.slice(isMobile ? 3 : 5)"
                    :key="theme"
                    class="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-xs bg-white bg-opacity-80 text-blue-800 rounded-full border border-blue-200 break-all"
                  >
                    {{ theme }}
                  </span>
                </div>
              </div>
              
              <!-- 詳細展開ボタン（オプション） -->
              <div class="mt-3 sm:mt-4 pt-3 border-t border-blue-200">
                <button 
                  @click="showKakenDetails = !showKakenDetails"
                  class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center sm:justify-start w-full sm:w-auto"
                >
                  <span>{{ showKakenDetails ? '詳細を閉じる' : '助成金詳細を表示' }}</span>
                  <svg class="w-4 h-4 ml-1 transform transition-transform" :class="{ 'rotate-180': showKakenDetails }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- 詳細情報（展開時のみ表示） -->
            <div v-if="showKakenDetails && researcherData?.kaken_info?.length" class="mt-4 space-y-3">
              <div 
                v-for="(grant, index) in researcherData.kaken_info.slice(0, 3)"
                :key="index"
                class="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-center space-x-2 mb-2">
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700">
                    助成金 {{ index + 1 }}
                  </span>
                  <span v-if="grant.period" class="text-sm text-gray-600">{{ grant.period }}</span>
                  <span v-if="grant.amount" class="text-sm text-gray-600">{{ grant.amount }}</span>
                </div>
                
                <div v-if="grant.keywords" class="mb-2">
                  <span class="text-sm font-medium text-gray-700">キーワード:</span>
                  <span class="text-sm text-gray-600 ml-1">{{ grant.keywords }}</span>
                </div>
                
                <div v-if="grant.research_overview" class="text-sm text-gray-700">
                  <span class="font-medium">研究概要:</span>
                  <span class="ml-1">{{ grant.research_overview.length > 200 ? grant.research_overview.substring(0, 200) + '...' : grant.research_overview }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 研究関心事 -->
          <div v-if="hasResearchInterests" class="mt-4 sm:mt-6">
            <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">研究関心事</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div v-if="researcherData?.target_researcher?.research_interests?.collaboration" class="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <h4 class="text-sm font-medium text-blue-900 mb-1 sm:mb-2">共同研究への関心</h4>
                <p class="text-xs sm:text-sm text-blue-800 leading-relaxed">{{ researcherData.target_researcher.research_interests.collaboration }}</p>
              </div>
              <div v-if="researcherData?.target_researcher?.research_interests?.technology" class="bg-green-50 p-3 sm:p-4 rounded-lg">
                <h4 class="text-sm font-medium text-green-900 mb-1 sm:mb-2">技術的関心</h4>
                <p class="text-xs sm:text-sm text-green-800 leading-relaxed">{{ researcherData.target_researcher.research_interests.technology }}</p>
              </div>
              <div v-if="researcherData?.target_researcher?.research_interests?.market" class="bg-purple-50 p-3 sm:p-4 rounded-lg">
                <h4 class="text-sm font-medium text-purple-900 mb-1 sm:mb-2">市場への関心</h4>
                <p class="text-xs sm:text-sm text-purple-800 leading-relaxed">{{ researcherData.target_researcher.research_interests.market }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- マッチング結果セクション -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div class="mb-6 sm:mb-8">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">研究マッチング結果</h2>
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <p class="text-sm sm:text-base text-gray-600">
              AI分析により推薦された{{ researcherData?.matches?.length || 0 }}件の研究コラボレーション提案
            </p>
            <span v-if="researcherData?.kaken_trend_analysis?.summary" class="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 self-start sm:self-auto">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              KAKEN情報活用済み
            </span>
          </div>
        </div>

        <!-- マッチング結果一覧 -->
        <div class="space-y-6 sm:space-y-8">
          <div
            v-for="(match, index) in researcherData?.matches || []"
            :key="index"
            class="card"
          >
            <!-- マッチした研究者情報 -->
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
              <div class="flex-1 min-w-0 mb-3 sm:mb-0">
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-1 break-words">
                  {{ match.researcher.name }}
                </h3>
                <p v-if="match.researcher.affiliation" class="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3 break-words">
                  {{ match.researcher.affiliation }}
                </p>
                
                <!-- 共通キーワード -->
                <div v-if="match.researcher.keywords?.length" class="mb-0 sm:mb-3">
                  <span class="text-xs sm:text-sm text-gray-500 mr-1 sm:mr-2">共通キーワード:</span>
                  <div class="inline-flex flex-wrap gap-1">
                    <span
                      v-for="keyword in match.researcher.keywords.slice(0, isMobile ? 2 : 3)"
                      :key="keyword"
                      class="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-orange-100 text-orange-800 rounded-full break-all"
                    >
                      {{ keyword }}
                    </span>
                    <span
                      v-if="match.researcher.keywords.length > (isMobile ? 2 : 3)"
                      class="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      +{{ match.researcher.keywords.length - (isMobile ? 2 : 3) }}個
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- マッチ度スコア -->
              <div class="flex-shrink-0 text-center sm:text-right self-center sm:self-start">
                <div class="text-xl sm:text-2xl font-bold text-green-600">
                  {{ Math.round(match.researcher.similarity_score * 100) }}%
                </div>
                <div class="text-xs sm:text-sm text-gray-500">マッチ度</div>
              </div>
            </div>

            <!-- 研究テーマ提案 -->
            <div class="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h4 class="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 break-words">
                🔬 {{ match.theme_proposal.title }}
              </h4>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <!-- 左カラム -->
                <div class="space-y-3 sm:space-y-4">
                  <div>
                    <h5 class="text-sm font-medium text-gray-700 mb-1 sm:mb-2">研究目的</h5>
                    <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">{{ match.theme_proposal.purpose }}</p>
                  </div>
                  
                  <div>
                    <h5 class="text-sm font-medium text-gray-700 mb-1 sm:mb-2">研究手法</h5>
                    <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">{{ match.theme_proposal.methodology }}</p>
                  </div>
                  
                  <div v-if="match.theme_proposal.keywords?.length">
                    <h5 class="text-sm font-medium text-gray-700 mb-1 sm:mb-2">関連キーワード</h5>
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="keyword in match.theme_proposal.keywords.slice(0, isMobile ? 4 : undefined)"
                        :key="keyword"
                        class="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full break-all"
                      >
                        {{ keyword }}
                      </span>
                      <button
                        v-if="isMobile && match.theme_proposal.keywords.length > 4"
                        @click="showAllProposalKeywords[index] = !showAllProposalKeywords[index]"
                        class="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        {{ showAllProposalKeywords[index] ? '閉じる' : `+${match.theme_proposal.keywords.length - 4}個` }}
                      </button>
                    </div>
                    <div v-if="isMobile && showAllProposalKeywords[index]" class="flex flex-wrap gap-1 mt-2">
                      <span
                        v-for="keyword in match.theme_proposal.keywords.slice(4)"
                        :key="keyword"
                        class="inline-block px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full break-all"
                      >
                        {{ keyword }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- 右カラム -->
                <div class="space-y-3 sm:space-y-4">
                  <div>
                    <h5 class="text-sm font-medium text-gray-700 mb-1 sm:mb-2">社会的インパクト</h5>
                    <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">{{ match.theme_proposal.social_impact }}</p>
                  </div>
                  
                  <div>
                    <h5 class="text-sm font-medium text-gray-700 mb-1 sm:mb-2">期待される成果</h5>
                    <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">{{ match.theme_proposal.expected_outcomes }}</p>
                  </div>
                  
                  <div>
                    <h5 class="text-sm font-medium text-gray-700 mb-1 sm:mb-2">協力の根拠</h5>
                    <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">{{ match.theme_proposal.collaboration_rationale }}</p>
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
const showKakenDetails = ref(false)
const showAllKeywords = ref(false)
const showAllThemes = ref(false)
const showAllProposalKeywords = ref({})
const isMobile = ref(false)

// モバイル検知
const checkMobile = () => {
  if (process.client) {
    isMobile.value = window.innerWidth < 640
  }
}

// データ読み込み
const loadResearcherData = async () => {
  try {
    console.log('Starting data load for ID:', researcherId)
    loading.value = true
    
    const config = useRuntimeConfig()
    const baseURL = config.public.baseURL || '/'
    
    // IDを3桁ゼロパディングしてファイル名を構築
    const paddedId = String(researcherId).padStart(3, '0')
    const filename = `researcher_${paddedId}`
    // baseURLを含む絶対パスを構築
    const requestUrl = baseURL + `data/researchers/${filename}.json`
    
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

// ユーティリティ関数
const formatFunding = (amount) => {
  if (amount >= 1000) {
    return Math.round(amount / 100) / 10 + '万円'
  }
  return Math.round(amount) + '千円'
}

// 初期化
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  loadResearcherData()
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', checkMobile)
  }
})
</script>