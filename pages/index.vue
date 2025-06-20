<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-14 sm:h-16">
          <div class="flex-1 min-w-0">
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 truncate">研究者ダッシュボード</h1>
          </div>
          <div class="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <span class="text-xs sm:text-sm text-gray-600 hidden sm:block truncate max-w-32 sm:max-w-none">{{ currentUser?.displayName || currentUser?.email }}</span>
            <span class="text-xs text-gray-600 sm:hidden">{{ (currentUser?.displayName || currentUser?.email || '').split('@')[0] }}</span>
            <button
              @click="handleLogout"
              class="bg-red-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-red-700 transition-colors"
            >
              <span class="hidden sm:inline">ログアウト</span>
              <span class="sm:hidden">出</span>
            </button>
          </div>
        </div>
      </div>
    </header>
    

    <!-- メインコンテンツ -->
    <main class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div class="grid grid-cols-1 gap-4 sm:gap-8">
        
        <!-- マッチング結果表示 -->
        <div>
          <!-- マッチングデータがない場合の警告 -->
          <div v-if="matchingDataError" class="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <div class="flex items-start">
              <svg class="w-6 h-6 text-amber-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 class="text-lg font-medium text-amber-800">マッチングデータが登録されていません</h3>
                <p class="mt-2 text-sm text-amber-700">
                  あなたのマッチング結果がまだ生成されていません。管理者にお問い合わせください。
                </p>
                <div class="mt-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    メールアドレス: {{ currentUser?.email }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- マッチング結果が見つかった場合 -->
          <div v-else-if="matchingData" class="space-y-6">
            <!-- ユーザー研究情報 -->
            <div class="bg-white rounded-lg shadow">
              <!-- ヘッダーセクション -->
              <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h2 class="text-lg sm:text-xl font-bold text-gray-900 break-words">{{ matchingData.target_researcher?.name || 'Loading...' }}</h2>
                      <!-- KAKEN情報活用済みバッジ -->
                      <span v-if="matchingData.kaken_trend_analysis?.summary" class="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 self-start">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="hidden sm:inline">KAKEN情報活用済み</span>
                        <span class="sm:hidden">KAKEN</span>
                      </span>
                    </div>
                    <p v-if="matchingData.target_researcher?.name_en" class="text-sm sm:text-lg text-gray-600 mb-2 break-words">{{ matchingData.target_researcher.name_en }}</p>
                    <p v-if="matchingData.target_researcher?.affiliation" class="text-sm sm:text-base text-gray-600 break-words">{{ matchingData.target_researcher.affiliation }}</p>
                  </div>
                  
                  <!-- 統計カード -->
                  <div class="flex-shrink-0 lg:ml-6 w-full lg:w-auto">
                    <div class="bg-gray-50 rounded-lg p-3 sm:p-4 lg:min-w-48">
                      <h3 class="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">マッチング統計</h3>
                      <dl class="grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3">
                        <div class="text-center lg:text-left">
                          <dt class="text-xs text-gray-600">マッチング数</dt>
                          <dd class="text-lg sm:text-2xl font-bold text-gray-900">{{ matchingData?.analysis_summary?.total_candidates_analyzed || matches?.length || 0 }}</dd>
                        </div>
                        <div class="text-center lg:text-left">
                          <dt class="text-xs text-gray-600">最高マッチ度</dt>
                          <dd class="text-lg sm:text-2xl font-bold text-green-600">{{ Math.round((matchingData?.analysis_summary?.max_similarity_score || maxSimilarity || 0) * 100) }}%</dd>
                        </div>
                        <div class="text-center lg:text-left">
                          <dt class="text-xs text-gray-600">平均マッチ度</dt>
                          <dd class="text-base sm:text-lg font-semibold text-gray-700">{{ Math.round((matchingData?.analysis_summary?.average_similarity_score || avgSimilarity || 0) * 100) }}%</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <!-- キーワード -->
                <div v-if="matchingData.target_researcher?.keywords?.length">
                  <h3 class="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3">研究キーワード</h3>
                  <div class="flex flex-wrap gap-1 sm:gap-2">
                    <span
                      v-for="keyword in matchingData.target_researcher.keywords.slice(0, showAllKeywords ? undefined : (isMobile ? 6 : 10))"
                      :key="keyword"
                      class="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm bg-blue-100 text-blue-800 rounded-full break-all"
                    >
                      {{ keyword }}
                    </span>
                    <button
                      v-if="matchingData.target_researcher.keywords.length > (isMobile ? 6 : 10)"
                      @click="showAllKeywords = !showAllKeywords"
                      class="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                    >
                      {{ showAllKeywords ? '閉じる' : `+${matchingData.target_researcher.keywords.length - (isMobile ? 6 : 10)}個` }}
                    </button>
                  </div>
                </div>

                <!-- 研究概要 -->
                <div v-if="matchingData.target_researcher?.abstract">
                  <h3 class="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3">研究概要</h3>
                  <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">{{ matchingData.target_researcher.abstract }}</p>
                </div>

                <!-- 最新の科研費動向 -->
                <div v-if="matchingData.kaken_trend_analysis?.summary">
                  <h3 class="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3 flex items-center">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    最新の科研費動向
                  </h3>
                  
                  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-6">
                    <!-- 統計サマリー -->
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-3 sm:space-y-0">
                      <div class="flex items-center justify-center sm:justify-start space-x-4 sm:space-x-6">
                        <div class="text-center">
                          <div class="text-xl sm:text-2xl font-bold text-blue-600">{{ matchingData.kaken_trend_analysis.grant_count }}</div>
                          <div class="text-xs text-gray-600">助成金件数</div>
                        </div>
                        <div v-if="matchingData.kaken_trend_analysis.total_funding > 0" class="text-center">
                          <div class="text-xl sm:text-2xl font-bold text-green-600">{{ formatFunding(matchingData.kaken_trend_analysis.total_funding) }}</div>
                          <div class="text-xs text-gray-600">総配分額</div>
                        </div>
                      </div>
                      <span class="inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 self-center sm:self-auto">
                        <svg class="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        AI要約済み
                      </span>
                    </div>
                    
                    <!-- 動向要約 -->
                    <div class="bg-white bg-opacity-70 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                      <h4 class="text-xs sm:text-sm font-medium text-gray-800 mb-1 sm:mb-2">研究動向分析</h4>
                      <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">{{ matchingData.kaken_trend_analysis.summary }}</p>
                    </div>
                    
                    <!-- 主要テーマ -->
                    <div v-if="matchingData.kaken_trend_analysis.key_themes?.length" class="mb-3 sm:mb-4">
                      <h4 class="text-xs sm:text-sm font-medium text-gray-800 mb-1 sm:mb-2">主要研究テーマ</h4>
                      <div class="flex flex-wrap gap-1 sm:gap-2">
                        <span
                          v-for="theme in matchingData.kaken_trend_analysis.key_themes.slice(0, showAllThemes ? undefined : (isMobile ? 3 : 5))"
                          :key="theme"
                          class="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-xs bg-white bg-opacity-80 text-blue-800 rounded-full border border-blue-200 break-all"
                        >
                          {{ theme }}
                        </span>
                        <button
                          v-if="matchingData.kaken_trend_analysis.key_themes.length > (isMobile ? 3 : 5)"
                          @click="showAllThemes = !showAllThemes"
                          class="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                        >
                          {{ showAllThemes ? '閉じる' : `+${matchingData.kaken_trend_analysis.key_themes.length - (isMobile ? 3 : 5)}個` }}
                        </button>
                      </div>
                    </div>
                    
                    <!-- 詳細展開ボタン -->
                    <div class="pt-3 sm:pt-4 border-t border-blue-200">
                      <button 
                        @click="showKakenDetails = !showKakenDetails"
                        class="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center sm:justify-start w-full sm:w-auto"
                      >
                        <span>{{ showKakenDetails ? '詳細を閉じる' : '助成金詳細を表示' }}</span>
                        <svg class="w-3 h-3 sm:w-4 sm:h-4 ml-1 transform transition-transform" :class="{ 'rotate-180': showKakenDetails }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <!-- 詳細情報（展開時のみ表示） -->
                  <div v-if="showKakenDetails && matchingData.kaken_info?.length" class="mt-4 space-y-3">
                    <div 
                      v-for="(grant, index) in matchingData.kaken_info.slice(0, 3)"
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
                <div v-if="hasResearchInterests">
                  <h3 class="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3">研究関心事</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div v-if="matchingData.target_researcher?.research_interests?.collaboration" class="bg-blue-50 p-3 sm:p-4 rounded-lg">
                      <h4 class="text-xs sm:text-sm font-medium text-blue-900 mb-1 sm:mb-2">共同研究への関心</h4>
                      <p class="text-xs sm:text-sm text-blue-800 leading-relaxed">{{ matchingData.target_researcher.research_interests.collaboration }}</p>
                    </div>
                    <div v-if="matchingData.target_researcher?.research_interests?.technology" class="bg-green-50 p-3 sm:p-4 rounded-lg">
                      <h4 class="text-xs sm:text-sm font-medium text-green-900 mb-1 sm:mb-2">技術的関心</h4>
                      <p class="text-xs sm:text-sm text-green-800 leading-relaxed">{{ matchingData.target_researcher.research_interests.technology }}</p>
                    </div>
                    <div v-if="matchingData.target_researcher?.research_interests?.market" class="bg-purple-50 p-3 sm:p-4 rounded-lg">
                      <h4 class="text-xs sm:text-sm font-medium text-purple-900 mb-1 sm:mb-2">市場への関心</h4>
                      <p class="text-xs sm:text-sm text-purple-800 leading-relaxed">{{ matchingData.target_researcher.research_interests.market }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- マッチング結果一覧 -->
            <div class="bg-white rounded-lg shadow p-4 sm:p-6">
              <div class="mb-4 sm:mb-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h2 class="text-lg sm:text-xl font-bold text-gray-900">研究マッチング結果</h2>
                  <span v-if="matchingData.kaken_trend_analysis?.summary" class="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 self-start sm:self-auto">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="hidden sm:inline">KAKEN情報活用済み</span>
                    <span class="sm:hidden">KAKEN</span>
                  </span>
                </div>
                <p class="text-xs sm:text-sm text-gray-600">
                  AI分析により推薦された{{ matches?.length || 0 }}件の研究コラボレーション提案
                </p>
              </div>

              <div v-if="matches?.length" class="space-y-6 sm:space-y-8">
                <div
                  v-for="(match, index) in matches.slice(0, showAllMatches ? undefined : 15)"
                  :key="index"
                  class="border border-gray-200 rounded-lg"
                >
                  <!-- マッチした研究者情報 -->
                  <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 sm:p-6 border-b border-gray-200">
                    <div class="flex-1 min-w-0 mb-3 sm:mb-0">
                      <div class="relative">
                        <h3 
                          class="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1 break-words cursor-pointer hover:text-blue-600 transition-colors" 
                          @mouseenter="showResearcherPopover(match.researcher, index)"
                          @mouseleave="hideResearcherPopover"
                          :class="{ 'text-blue-600': isResearcherPublic(match.researcher) }"
                        >
                          {{ match.researcher.name }}
                          <span v-if="isResearcherPublic(match.researcher)" class="ml-1 text-xs text-blue-500">👤</span>
                        </h3>
                        
                        <!-- Research Popover -->
                        <div 
                          v-if="activePopover === index && isResearcherPublic(match.researcher)"
                          class="absolute z-50 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-4 left-0 top-full"
                          @mouseenter="keepPopoverOpen"
                          @mouseleave="hideResearcherPopover"
                        >
                          <div class="space-y-3">
                            <!-- Researcher Name -->
                            <div class="border-b border-gray-100 pb-2">
                              <h4 class="font-semibold text-gray-900 text-base">{{ match.researcher.name }}</h4>
                              <p v-if="match.researcher.name_en" class="text-sm text-gray-600">{{ match.researcher.name_en }}</p>
                            </div>
                            
                            <!-- Classification Tags -->
                            <div v-if="match.researcher.field_tag || match.researcher.affiliation_tag" class="mb-2">
                              <h5 class="text-xs font-medium text-gray-700 mb-1">分類</h5>
                              <div class="flex flex-wrap gap-1">
                                <span
                                  v-if="match.researcher.field_tag"
                                  :class="getFieldTagClass(match.researcher.field_tag)"
                                  class="inline-block px-2 py-1 text-xs rounded-full font-medium"
                                >
                                  {{ match.researcher.field_tag }}
                                </span>
                                <span
                                  v-if="match.researcher.affiliation_tag"
                                  :class="getAffiliationTagClass(match.researcher.affiliation_tag)"
                                  class="inline-block px-2 py-1 text-xs rounded-full font-medium"
                                >
                                  {{ match.researcher.affiliation_tag }}
                                </span>
                              </div>
                            </div>
                            
                            <!-- Affiliation -->
                            <div v-if="match.researcher.affiliation">
                              <h5 class="text-xs font-medium text-gray-700 mb-1">所属</h5>
                              <p class="text-sm text-gray-600">{{ match.researcher.affiliation }}</p>
                            </div>
                            
                            <!-- Keywords -->
                            <div v-if="match.researcher.keywords?.length">
                              <h5 class="text-xs font-medium text-gray-700 mb-2">研究キーワード</h5>
                              <div class="flex flex-wrap gap-1">
                                <span
                                  v-for="keyword in match.researcher.keywords.slice(0, 8)"
                                  :key="keyword"
                                  class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                >
                                  {{ keyword }}
                                </span>
                                <span
                                  v-if="match.researcher.keywords.length > 8"
                                  class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                                >
                                  +{{ match.researcher.keywords.length - 8 }}個
                                </span>
                              </div>
                            </div>
                            
                            <!-- Abstract -->
                            <div v-if="match.researcher.abstract">
                              <h5 class="text-xs font-medium text-gray-700 mb-1">研究概要</h5>
                              <p class="text-sm text-gray-600 leading-relaxed line-clamp-4">
                                {{ match.researcher.abstract.length > 200 ? match.researcher.abstract.substring(0, 200) + '...' : match.researcher.abstract }}
                              </p>
                            </div>
                            
                            <!-- Privacy indicator -->
                            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                              <span class="text-xs text-green-600 flex items-center">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                プロフィール公開中
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p v-if="match.researcher.affiliation" class="text-xs sm:text-sm lg:text-base text-gray-600 mb-2 sm:mb-3 break-words">{{ match.researcher.affiliation }}</p>
                      
                      <!-- 共通キーワード -->
                      <div v-if="match.researcher.keywords?.length">
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
                    <div class="flex-shrink-0 text-center self-center sm:self-start">
                      <div class="text-xl sm:text-2xl font-bold text-green-600">
                        {{ Math.round((match.researcher.similarity_score || 0) * 100) }}%
                      </div>
                      <div class="text-xs sm:text-sm text-gray-500">マッチ度</div>
                    </div>
                  </div>

                  <!-- 研究テーマ提案 -->
                  <div class="bg-gray-50 p-4 sm:p-6">
                    <h4 class="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 break-words">
                      🔬 {{ match.theme_proposal.title }}
                    </h4>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <!-- 左カラム -->
                      <div class="space-y-3 sm:space-y-4">
                        <div>
                          <h5 class="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">研究目的</h5>
                          <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">{{ match.theme_proposal.purpose }}</p>
                        </div>
                        
                        <div>
                          <h5 class="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">研究手法</h5>
                          <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">{{ match.theme_proposal.methodology }}</p>
                        </div>
                        
                        <div v-if="match.theme_proposal.keywords?.length">
                          <h5 class="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">関連キーワード</h5>
                          <div class="flex flex-wrap gap-1">
                            <span
                              v-for="keyword in match.theme_proposal.keywords.slice(0, showAllProposalKeywords[index] ? undefined : (isMobile ? 3 : 4))"
                              :key="keyword"
                              class="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full break-all"
                            >
                              {{ keyword }}
                            </span>
                            <button
                              v-if="match.theme_proposal.keywords.length > (isMobile ? 3 : 4)"
                              @click="showAllProposalKeywords[index] = !showAllProposalKeywords[index]"
                              class="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                            >
                              {{ showAllProposalKeywords[index] ? '閉じる' : `+${match.theme_proposal.keywords.length - (isMobile ? 3 : 4)}個` }}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <!-- 右カラム -->
                      <div class="space-y-3 sm:space-y-4">
                        <div>
                          <h5 class="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">社会的インパクト</h5>
                          <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">{{ match.theme_proposal.social_impact }}</p>
                        </div>
                        
                        <div>
                          <h5 class="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">期待される成果</h5>
                          <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">{{ match.theme_proposal.expected_outcomes }}</p>
                        </div>
                        
                        <div>
                          <h5 class="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">協力の根拠</h5>
                          <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">{{ match.theme_proposal.collaboration_rationale }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- もっと見るボタン -->
                <div v-if="matches.length > (isMobile ? 3 : 5)" class="text-center">
                  <button
                    @click="showAllMatches = !showAllMatches"
                    class="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {{ showAllMatches ? '折りたたむ' : `さらに${matches.length - (isMobile ? 3 : 5)}件の結果を表示` }}
                  </button>
                </div>
              </div>

              <div v-else class="text-center py-8">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">マッチング結果がありません</h3>
                <p class="text-gray-600">あなたのマッチングデータが見つかりませんでした。</p>
              </div>
            </div>
          </div>

          <!-- ローディング中 -->
          <div v-else class="bg-white rounded-lg shadow p-6">
            <div class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-2 text-sm text-gray-600">マッチングデータを読み込み中...</p>
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
  getUserProfile,
  getPublicUsers
} = useFirebase()
const router = useRouter()

// リアクティブデータ
const userProfile = ref(null)

// マッチングデータ関連
const matchingData = ref(null)
const matchingDataError = ref(false)
const showAllKeywords = ref(false)
const showAllMatches = ref(false)
const showAllThemes = ref(false)
const showKakenDetails = ref(false)
const showAllProposalKeywords = ref({})
const isMobile = ref(false)

// ポップオーバー関連
const activePopover = ref(null)
const popoverTimeout = ref(null)
const publicUsers = ref([])


// ページメタ設定
useHead({
  title: 'ダッシュボード - 大阪大学研究マッチングシステム'
})

// 未認証ユーザーをログインページにリダイレクト（認証初期化後）
watch(authInitialized, (initialized) => {
  
  if (initialized && !isAuthenticated.value) {
    console.log('🏠 Home: Auth initialized but user not authenticated, redirecting to login')
    router.push('/auth/login')
  }
}, { immediate: true })

// ユーザー情報読み込み
watch(currentUser, async (user) => {
  console.log('🏠 Dashboard: User changed:', user?.email || 'null')
  
  if (user) {
    try {
      console.log('🏠 Dashboard: Loading user profile...')
      console.log('🏠 Dashboard: User UID:', user.uid)
      console.log('🏠 Dashboard: User email:', user.email)
      
      const profile = await getUserProfile(user.uid)
      console.log('🏠 Dashboard: getUserProfile result:', profile)
      
      if (profile) {
        console.log('🏠 Dashboard: User profile loaded:', profile.name || 'no name')
        console.log('🏠 Dashboard: Profile data:', {
          name: profile.name,
          display_name: profile.display_name,
          email: profile.email,
          privacy_settings: profile.privacy_settings
        })
        userProfile.value = profile
      } else {
        console.log('🏠 Dashboard: No user profile found - profile is null/undefined')
        console.log('🏠 Dashboard: Attempting to create default profile...')
        
        // デフォルトプロフィールを作成
        const defaultProfile = {
          uid: user.uid,
          email: user.email,
          display_name: user.displayName || user.email.split('@')[0],
          created_at: Date.now(),
          updated_at: Date.now(),
          privacy_settings: {
            public_profile: false,
            show_in_search: false,
            allow_collaboration: true
          }
        }
        
        try {
          // Firebase composableから createUserProfile 関数を取得
          const { createUserProfile } = useFirebase()
          const createResult = await createUserProfile(user.uid, defaultProfile)
          
          if (createResult.success) {
            console.log('🏠 Dashboard: Default profile created successfully')
            userProfile.value = defaultProfile
          } else {
            console.log('🏠 Dashboard: Failed to create default profile:', createResult.error)
          }
        } catch (createError) {
          console.error('🏠 Dashboard: Error creating default profile:', createError)
        }
      }
      
      // マッチングデータも読み込み
      console.log('🏠 Dashboard: Starting matching data load...')
      await loadMatchingData(user)
      console.log('🏠 Dashboard: Matching data load completed')
    } catch (error) {
      console.error('🏠 Dashboard: Error in user data loading:', error)
      console.error('🏠 Dashboard: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
  }
}, { immediate: true })

// 初期化
onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // 公開ユーザー一覧を取得
  try {
    publicUsers.value = await getPublicUsers()
    console.log('Public users loaded:', publicUsers.value.length)
  } catch (error) {
    console.error('Failed to load public users:', error)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', checkMobile)
  }
  
  // ポップオーバーのタイムアウトをクリア
  if (popoverTimeout.value) {
    clearTimeout(popoverTimeout.value)
  }
})


// マッチングデータ読み込み関数
const loadMatchingData = async (user) => {
  if (!user?.uid) {
    console.warn('🔍 loadMatchingData: No user UID provided')
    return
  }
  
  try {
    console.log('🔍 Loading matching data for Firebase UID:', user.uid)
    matchingDataError.value = false
    
    // Firebase composable から新しいマッチングデータ取得関数を使用
    const { getUserMatchingData } = useFirebase()
    
    const data = await getUserMatchingData(user.uid)
    
    if (data) {
      console.log('✅ Successfully loaded matching data for user:', user.uid)
      matchingData.value = data
    } else {
      console.warn('❌ No matching data found for user:', user.uid)
      matchingDataError.value = true
    }
    
  } catch (err) {
    console.error('❌ Matching data loading error:', err)
    console.error('❌ Error details:', {
      message: err.message,
      stack: err.stack
    })
    
    matchingDataError.value = true
  }
}

// マッチング統計計算
const maxSimilarity = computed(() => {
  if (!matchingData.value?.matched_researchers?.length) return 0
  return Math.max(...matchingData.value.matched_researchers.map(m => m.similarity_score || 0))
})

const avgSimilarity = computed(() => {
  if (!matchingData.value?.matched_researchers?.length) return 0
  const sum = matchingData.value.matched_researchers.reduce((acc, m) => acc + (m.similarity_score || 0), 0)
  return sum / matchingData.value.matched_researchers.length
})

// マッチングデータを統合形式に変換
const matches = computed(() => {
  if (!matchingData.value?.matched_researchers?.length || !matchingData.value?.theme_proposals?.length) return []
  
  return matchingData.value.matched_researchers.map((researcher, index) => ({
    researcher: researcher,
    theme_proposal: matchingData.value.theme_proposals[index] || {}
  }))
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

// モバイル検知
const checkMobile = () => {
  if (process.client) {
    isMobile.value = window.innerWidth < 640
  }
}

// 研究関心事があるかチェック
const hasResearchInterests = computed(() => {
  if (!matchingData.value?.target_researcher?.research_interests) return false
  const interests = matchingData.value.target_researcher.research_interests
  return interests.collaboration || interests.technology || interests.market
})

// 資金額フォーマット
const formatFunding = (amount) => {
  if (amount >= 1000) {
    return Math.round(amount / 100) / 10 + '万円'
  }
  return Math.round(amount) + '千円'
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

// 研究者ポップオーバー関連
const showResearcherPopover = (researcher, index) => {
  if (!isResearcherPublic(researcher)) return
  
  // 既存のタイムアウトをクリア
  if (popoverTimeout.value) {
    clearTimeout(popoverTimeout.value)
    popoverTimeout.value = null
  }
  
  activePopover.value = index
}

const hideResearcherPopover = () => {
  // 少し遅延してから非表示にする（マウスが移動する時間を確保）
  popoverTimeout.value = setTimeout(() => {
    activePopover.value = null
  }, 150)
}

const keepPopoverOpen = () => {
  if (popoverTimeout.value) {
    clearTimeout(popoverTimeout.value)
    popoverTimeout.value = null
  }
}

// 研究者がプロフィール公開しているかチェック
const isResearcherPublic = (researcher) => {
  if (!researcher || !researcher.name) return false
  
  // 公開ユーザー一覧から研究者名で直接検索
  return publicUsers.value.some(
    user => user.display_name === researcher.name && 
            user.privacy_settings?.public_profile && 
            user.privacy_settings?.show_in_search
  )
}

// 分類タグのスタイリング関数
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
</script>