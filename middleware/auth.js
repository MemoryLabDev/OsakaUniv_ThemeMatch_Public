// 認証ミドルウェア
export default defineNuxtRouteMiddleware((to, from) => {
  // ホーム（ダッシュボード）やその他の保護されたルートのチェック
  const protectedRoutes = ['/settings']
  
  if (protectedRoutes.includes(to.path)) {
    const { isAuthenticated } = useFirebase()
    
    if (!isAuthenticated.value) {
      return navigateTo('/auth/login')
    }
  }
  
  // ログインページへの認証済みユーザーアクセスを防止
  if (to.path === '/auth/login') {
    const { isAuthenticated } = useFirebase()
    
    if (isAuthenticated.value) {
      return navigateTo('/')
    }
  }
})