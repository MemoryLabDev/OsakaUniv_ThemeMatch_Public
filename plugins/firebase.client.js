// Firebase Web SDK プラグイン（クライアント側のみ）
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'

export default defineNuxtPlugin(() => {
  // プリレンダリング時のログを削減
  const isDev = process.env.NODE_ENV !== 'production'
  const log = isDev ? console.log : () => {}
  
  log('🔥 Firebase plugin: Starting initialization...')
  log('🔥 Firebase plugin: process.server =', process.server)
  log('🔥 Firebase plugin: process.client =', process.client)
  
  // サーバーサイドまたはプリレンダリング時はスキップ
  if (process.server) {
    log('🔥 Firebase plugin: Skipping server-side initialization')
    return {
      provide: {
        firebase: null,
        firebaseDB: null,
        firebaseAuth: null
      }
    }
  }

  try {
    log('🔥 Firebase plugin: Getting runtime config...')
    const config = useRuntimeConfig()
    log('🔥 Firebase plugin: Runtime config loaded:', !!config)
    log('🔥 Firebase plugin: Public config:', !!config.public)
    log('🔥 Firebase plugin: Firebase config:', !!config.public?.firebaseConfig)
    
    // Firebase設定の検証
    if (!config.public?.firebaseConfig || !config.public.firebaseConfig.apiKey) {
      console.error('🔥 Firebase plugin: Firebase configuration is missing or invalid')
      console.log('🔥 Firebase plugin: Config details:', config.public)
      return {
        provide: {
          firebase: null,
          firebaseDB: null,
          firebaseAuth: null
        }
      }
    }
    
    log('🔥 Firebase plugin: Initializing Firebase app...', config.public.firebaseConfig.projectId)
    
    // Firebase初期化
    const firebaseApp = initializeApp(config.public.firebaseConfig)
    log('🔥 Firebase plugin: Firebase app created:', !!firebaseApp)
    
    // Firebase services
    log('🔥 Firebase plugin: Creating database service...')
    const database = getDatabase(firebaseApp)
    log('🔥 Firebase plugin: Database service created:', !!database)
    
    log('🔥 Firebase plugin: Creating auth service...')
    const auth = getAuth(firebaseApp)
    log('🔥 Firebase plugin: Auth service created:', !!auth)
    
    log('🔥 Firebase plugin: All services initialized successfully')
    
    // 認証状態監視
    try {
      auth.onAuthStateChanged((user) => {
        log('🔥 Firebase plugin: Auth state changed:', user?.email || 'No user')
      })
      log('🔥 Firebase plugin: Auth state listener attached')
    } catch (authError) {
      console.error('🔥 Firebase plugin: Auth listener error:', authError)
    }
    
    const result = {
      provide: {
        firebase: firebaseApp,
        firebaseDB: database,
        firebaseAuth: auth
      }
    }
    
    log('🔥 Firebase plugin: Returning services:', {
      firebase: !!result.provide.firebase,
      firebaseDB: !!result.provide.firebaseDB,
      firebaseAuth: !!result.provide.firebaseAuth
    })
    
    return result
    
  } catch (error) {
    console.error('🔥 Firebase plugin: Initialization error:', error)
    console.error('🔥 Firebase plugin: Error stack:', error.stack)
    return {
      provide: {
        firebase: null,
        firebaseDB: null,
        firebaseAuth: null
      }
    }
  }
})