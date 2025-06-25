import { ref } from 'vue'

export const useQRAuth = () => {
  const isProcessingQRAuth = ref(false)
  
  /**
   * URLパラメータからQR認証情報を取得
   */
  const getQRAuthFromURL = () => {
    if (process.client) {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('auth')
    }
    return null
  }
  
  /**
   * Base64エンコードされた認証情報をデコード
   */
  const decodeCredentials = (encodedAuth) => {
    try {
      const decoded = atob(encodedAuth)
      return JSON.parse(decoded)
    } catch (error) {
      console.error('認証情報のデコードに失敗:', error)
      return null
    }
  }
  
  /**
   * QR認証処理
   */
  const processQRAuth = async () => {
    if (!process.client) return false
    
    const encodedAuth = getQRAuthFromURL()
    if (!encodedAuth) return false
    
    isProcessingQRAuth.value = true
    
    try {
      const credentials = decodeCredentials(encodedAuth)
      if (!credentials || !credentials.email || !credentials.password) {
        throw new Error('無効な認証情報')
      }
      
      // Firebase認証を実行
      const { $auth } = useNuxtApp()
      await $auth.signInWithEmailAndPassword(credentials.email, credentials.password)
      
      // 認証情報をローカルストレージに保存
      localStorage.setItem('qr_auth_email', credentials.email)
      localStorage.setItem('qr_auth_timestamp', Date.now().toString())
      
      // URLから認証パラメータを削除
      const url = new URL(window.location)
      url.searchParams.delete('auth')
      window.history.replaceState({}, '', url.toString())
      
      console.log('QR認証成功:', credentials.email)
      return true
      
    } catch (error) {
      console.error('QR認証エラー:', error)
      return false
    } finally {
      isProcessingQRAuth.value = false
    }
  }
  
  /**
   * 保存された認証情報をチェック
   */
  const checkSavedAuth = () => {
    if (!process.client) return null
    
    const savedEmail = localStorage.getItem('qr_auth_email')
    const savedTimestamp = localStorage.getItem('qr_auth_timestamp')
    
    if (savedEmail && savedTimestamp) {
      const timestamp = parseInt(savedTimestamp)
      const now = Date.now()
      const oneDay = 24 * 60 * 60 * 1000
      
      // 24時間以内の認証情報のみ有効
      if (now - timestamp < oneDay) {
        return {
          email: savedEmail,
          timestamp: timestamp
        }
      } else {
        // 期限切れの認証情報を削除
        localStorage.removeItem('qr_auth_email')
        localStorage.removeItem('qr_auth_timestamp')
      }
    }
    
    return null
  }
  
  /**
   * 認証情報をクリア
   */
  const clearAuth = () => {
    if (process.client) {
      localStorage.removeItem('qr_auth_email')
      localStorage.removeItem('qr_auth_timestamp')
    }
  }
  
  return {
    isProcessingQRAuth,
    processQRAuth,
    checkSavedAuth,
    clearAuth
  }
}