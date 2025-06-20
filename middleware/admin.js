// 管理者権限チェックミドルウェア
export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log('🔒 Admin middleware: Called for route:', to.path)
  
  const { currentUser, isAuthenticated, authInitialized } = useFirebase()
  
  console.log('🔒 Admin middleware: Initial auth state:', {
    authInitialized: authInitialized.value,
    isAuthenticated: isAuthenticated.value,
    currentUser: currentUser.value
  })
  
  // 認証状態の初期化を待つ
  if (!authInitialized.value) {
    console.log('🔒 Admin middleware: Waiting for auth initialization...')
    
    // 最大5秒間認証状態の初期化を待つ
    const timeout = 5000
    const startTime = Date.now()
    
    while (!authInitialized.value && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('🔒 Admin middleware: Auth initialization completed:', {
      authInitialized: authInitialized.value,
      isAuthenticated: isAuthenticated.value,
      currentUser: currentUser.value
    })
  }
  
  // 認証チェック
  if (!isAuthenticated.value) {
    console.log('🔒 Admin middleware: Not authenticated, redirecting to login')
    return navigateTo('/auth/login')
  }
  
  // 管理者権限チェック
  const userEmail = currentUser.value?.email
  const isAdminFlag = currentUser.value?.isAdmin === true
  const isAdminEmail = userEmail === 'admin@memorylab.jp'
  const isAdmin = isAdminEmail || isAdminFlag
  
  console.log('🔒 Admin middleware: Permission check:', {
    userEmail,
    isAdminFlag,
    isAdminEmail,
    isAdmin
  })
  
  if (!isAdmin) {
    console.log('🔒 Admin middleware: Access denied')
    throw createError({
      statusCode: 403,
      statusMessage: 'アクセス権限がありません'
    })
  }
  
  console.log('🔒 Admin middleware: Access granted')
})