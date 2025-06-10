// Firebase Web SDK プラグイン（クライアント側のみ）
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'

export default defineNuxtPlugin(() => {
  console.log('🔥 Firebase plugin: Starting initialization...')
  console.log('🔥 Firebase plugin: process.server =', process.server)
  console.log('🔥 Firebase plugin: process.client =', process.client)
  
  // クライアント側のみで実行
  if (process.server) {
    console.log('🔥 Firebase plugin: Skipping server-side initialization')
    return {
      provide: {
        firebase: null,
        firebaseDB: null,
        firebaseAuth: null
      }
    }
  }

  try {
    console.log('🔥 Firebase plugin: Getting runtime config...')
    const config = useRuntimeConfig()
    console.log('🔥 Firebase plugin: Runtime config loaded:', !!config)
    console.log('🔥 Firebase plugin: Public config:', !!config.public)
    console.log('🔥 Firebase plugin: Firebase config:', !!config.public?.firebaseConfig)
    
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
    
    console.log('🔥 Firebase plugin: Initializing Firebase app...', config.public.firebaseConfig.projectId)
    
    // Firebase初期化
    const firebaseApp = initializeApp(config.public.firebaseConfig)
    console.log('🔥 Firebase plugin: Firebase app created:', !!firebaseApp)
    
    // Firebase services
    console.log('🔥 Firebase plugin: Creating database service...')
    const database = getDatabase(firebaseApp)
    console.log('🔥 Firebase plugin: Database service created:', !!database)
    
    console.log('🔥 Firebase plugin: Creating auth service...')
    const auth = getAuth(firebaseApp)
    console.log('🔥 Firebase plugin: Auth service created:', !!auth)
    
    console.log('🔥 Firebase plugin: All services initialized successfully')
    
    // 認証状態監視
    try {
      auth.onAuthStateChanged((user) => {
        console.log('🔥 Firebase plugin: Auth state changed:', user?.email || 'No user')
      })
      console.log('🔥 Firebase plugin: Auth state listener attached')
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
    
    console.log('🔥 Firebase plugin: Returning services:', {
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