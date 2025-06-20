// Firebase操作用コンポーザブル
import { ref as dbRef, set, get, child, push, update, onValue } from 'firebase/database'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

export const useFirebase = () => {
  console.log('🚀 useFirebase: Starting composable...')
  console.log('🚀 useFirebase: process.server =', process.server)
  console.log('🚀 useFirebase: process.client =', process.client)
  
  // 現在のユーザー状態
  const currentUser = ref(null)
  const authInitialized = ref(false)  // 認証状態の初期化完了フラグ
  const isAuthenticated = computed(() => authInitialized.value && !!currentUser.value)
  const firebaseReady = ref(false)
  
  // Firebase インスタンス
  let $firebaseDB = null
  let $firebaseAuth = null
  
  // Firebase初期化状態チェック
  const firebaseAvailable = computed(() => {
    const available = process.client && firebaseReady.value && $firebaseDB !== null && $firebaseAuth !== null
    console.log('🚀 useFirebase: firebaseAvailable computed =', available, {
      processClient: process.client,
      firebaseReady: firebaseReady.value,
      hasDB: $firebaseDB !== null,
      hasAuth: $firebaseAuth !== null
    })
    return available
  })
  
  // Firebase初期化処理
  const initializeFirebase = () => {
    console.log('🚀 useFirebase: initializeFirebase called')
    if (process.server) {
      console.log('🚀 useFirebase: Skipping server-side initialization')
      return
    }
    
    try {
      console.log('🚀 useFirebase: Getting NuxtApp...')
      const nuxtApp = useNuxtApp()
      console.log('🚀 useFirebase: NuxtApp obtained:', !!nuxtApp)
      
      console.log('🚀 useFirebase: Checking provided services...')
      console.log('🚀 useFirebase: nuxtApp.$firebaseDB =', !!nuxtApp.$firebaseDB)
      console.log('🚀 useFirebase: nuxtApp.$firebaseAuth =', !!nuxtApp.$firebaseAuth)
      
      $firebaseDB = nuxtApp.$firebaseDB
      $firebaseAuth = nuxtApp.$firebaseAuth
      
      console.log('🚀 useFirebase: Firebase instances assigned:', {
        hasDB: $firebaseDB !== null,
        hasAuth: $firebaseAuth !== null
      })
      
      if ($firebaseDB && $firebaseAuth) {
        console.log('🚀 useFirebase: Both services available, setting ready=true')
        firebaseReady.value = true
        
        // 認証状態監視を設定
        console.log('🚀 useFirebase: Setting up auth state listener...')
        try {
          $firebaseAuth.onAuthStateChanged((user) => {
            currentUser.value = user
            // 初回の認証状態確認後にフラグを立てる
            if (!authInitialized.value) {
              authInitialized.value = true
              console.log('🚀 useFirebase: Auth state initialized with user:', user?.email || 'No user')
            } else {
              console.log('🚀 useFirebase: Auth state changed:', user?.email || 'No user')
            }
          })
          console.log('🚀 useFirebase: Auth state listener setup completed')
        } catch (authError) {
          console.error('🚀 useFirebase: Auth listener setup error:', authError)
        }
        
        console.log('🚀 useFirebase: Firebase composable initialized successfully')
      } else {
        console.warn('🚀 useFirebase: Firebase instances not available yet')
        console.log('🚀 useFirebase: Missing services:', {
          needsDB: !$firebaseDB,
          needsAuth: !$firebaseAuth
        })
      }
    } catch (error) {
      console.error('🚀 useFirebase: Firebase composable initialization error:', error)
      console.error('🚀 useFirebase: Error stack:', error.stack)
    }
  }
  
  // クライアント側でのみ初期化
  if (process.client) {
    console.log('🚀 useFirebase: Client-side initialization starting...')
    
    // 即座に初期化を試行
    initializeFirebase()
    
    // プラグインの初期化が遅れる場合のために再試行
    if (!firebaseReady.value) {
      console.log('🚀 useFirebase: Firebase not ready, scheduling retries...')
      setTimeout(() => {
        console.log('🚀 useFirebase: Retry 1 (100ms)')
        initializeFirebase()
      }, 100)
      setTimeout(() => {
        console.log('🚀 useFirebase: Retry 2 (500ms)')
        initializeFirebase()
      }, 500)
      setTimeout(() => {
        console.log('🚀 useFirebase: Retry 3 (1000ms)')
        initializeFirebase()
      }, 1000)
    }
  } else {
    console.log('🚀 useFirebase: Server-side, skipping initialization')
  }
  
  // ログイン
  const login = async (email, password) => {
    if (!firebaseAvailable.value || !$firebaseAuth) {
      return { success: false, error: 'Firebase is not available' }
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword($firebaseAuth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }
  
  // ログアウト
  const logout = async () => {
    if (!firebaseAvailable.value || !$firebaseAuth) {
      return { success: false, error: 'Firebase is not available' }
    }
    
    try {
      await signOut($firebaseAuth)
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }
  
  // プライバシー設定更新
  const updatePrivacySettings = async (uid, settings) => {
    if (!firebaseAvailable.value || !$firebaseDB) {
      return { success: false, error: 'Firebase is not available' }
    }
    
    if (!uid || !settings) return { success: false, error: 'Invalid parameters' }
    
    try {
      const userRef = dbRef($firebaseDB, `users/${uid}/privacy_settings`)
      await update(userRef, {
        ...settings,
        updated_at: Date.now()
      })
      
      // 更新日時も更新
      const updatedAtRef = dbRef($firebaseDB, `users/${uid}/updated_at`)
      await set(updatedAtRef, Date.now())
      
      return { success: true }
    } catch (error) {
      console.error('Privacy settings update error:', error)
      return { success: false, error: error.message }
    }
  }
  
  // ユーザープロフィール取得
  const getUserProfile = async (uid) => {
    console.log('👤 getUserProfile: Called with UID:', uid)
    console.log('👤 getUserProfile: firebaseAvailable:', firebaseAvailable.value)
    console.log('👤 getUserProfile: $firebaseDB exists:', !!$firebaseDB)
    
    if (!firebaseAvailable.value || !$firebaseDB || !uid) {
      console.log('👤 getUserProfile: Early return - missing requirements:', {
        firebaseAvailable: firebaseAvailable.value,
        hasDB: !!$firebaseDB,
        hasUID: !!uid
      })
      return null
    }
    
    try {
      console.log('👤 getUserProfile: Creating database reference...')
      const userRef = dbRef($firebaseDB, `users/${uid}`)
      console.log('👤 getUserProfile: Database reference created, fetching data...')
      
      const snapshot = await get(userRef)
      console.log('👤 getUserProfile: Snapshot received:', {
        exists: snapshot.exists(),
        hasVal: snapshot.exists() ? 'yes' : 'no'
      })
      
      if (snapshot.exists()) {
        const data = snapshot.val()
        console.log('👤 getUserProfile: User data found:', {
          hasData: !!data,
          email: data?.email,
          display_name: data?.display_name,
          privacy_settings: data?.privacy_settings
        })
        return data
      } else {
        console.log('👤 getUserProfile: No user data found in database')
        return null
      }
    } catch (error) {
      console.error('👤 getUserProfile: Error occurred:', error)
      console.error('👤 getUserProfile: Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      })
      return null
    }
  }
  
  // 公開ユーザー一覧取得
  const getPublicUsers = async () => {
    console.log('🔍 getPublicUsers: Starting...')
    
    if (!firebaseAvailable.value || !$firebaseDB) {
      console.log('🔍 getPublicUsers: Firebase not available')
      return []
    }
    
    try {
      console.log('🔍 getPublicUsers: Fetching users from database...')
      const usersRef = dbRef($firebaseDB, 'users')
      const snapshot = await get(usersRef)
      
      if (!snapshot.exists()) {
        console.log('🔍 getPublicUsers: No users found in database')
        return []
      }
      
      const users = snapshot.val()
      const allUsers = Object.entries(users)
      console.log('🔍 getPublicUsers: Total users in database:', allUsers.length)
      
      const publicUsers = []
      
      for (const [uid, userData] of allUsers) {
        console.log('🔍 getPublicUsers: Checking user:', {
          uid,
          email: userData.email,
          display_name: userData.display_name,
          has_privacy_settings: !!userData.privacy_settings,
          public_profile: userData.privacy_settings?.public_profile,
          show_in_search: userData.privacy_settings?.show_in_search
        })
        
        if (userData.privacy_settings?.public_profile && userData.privacy_settings?.show_in_search) {
          console.log('🔍 getPublicUsers: ✅ User qualifies for public list:', userData.email)
          publicUsers.push({
            uid,
            email: userData.email,
            display_name: userData.display_name,
            privacy_settings: userData.privacy_settings
          })
        } else {
          console.log('🔍 getPublicUsers: ❌ User does not qualify:', userData.email, {
            public_profile: userData.privacy_settings?.public_profile,
            show_in_search: userData.privacy_settings?.show_in_search
          })
        }
      }
      
      console.log('🔍 getPublicUsers: Final public users count:', publicUsers.length)
      console.log('🔍 getPublicUsers: Public users emails:', publicUsers.map(u => u.email))
      
      return publicUsers
    } catch (error) {
      console.error('🔍 getPublicUsers: Error occurred:', error)
      return []
    }
  }
  
  // リアルタイム公開ユーザー監視
  const watchPublicUsers = (callback) => {
    if (!firebaseAvailable.value || !$firebaseDB) return
    
    const usersRef = dbRef($firebaseDB, 'users')
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([])
        return
      }
      
      const users = snapshot.val()
      const publicUsers = []
      
      for (const [uid, userData] of Object.entries(users)) {
        if (userData.privacy_settings?.public_profile && userData.privacy_settings?.show_in_search) {
          publicUsers.push({
            uid,
            email: userData.email,
            display_name: userData.display_name,
            privacy_settings: userData.privacy_settings
          })
        }
      }
      
      callback(publicUsers)
    })
    
    return unsubscribe
  }
  
  // ユーザープロフィール作成
  const createUserProfile = async (uid, profileData) => {
    console.log('👤 createUserProfile: Called with UID:', uid)
    console.log('👤 createUserProfile: Profile data:', profileData)
    
    if (!firebaseAvailable.value || !$firebaseDB) {
      console.log('👤 createUserProfile: Firebase not available')
      return { success: false, error: 'Firebase is not available' }
    }
    
    if (!uid || !profileData) {
      console.log('👤 createUserProfile: Invalid parameters')
      return { success: false, error: 'Invalid parameters' }
    }
    
    try {
      console.log('👤 createUserProfile: Creating database reference...')
      const userRef = dbRef($firebaseDB, `users/${uid}`)
      console.log('👤 createUserProfile: Setting profile data...')
      
      await set(userRef, profileData)
      console.log('👤 createUserProfile: Profile created successfully')
      
      return { success: true }
    } catch (error) {
      console.error('👤 createUserProfile: Error occurred:', error)
      return { success: false, error: error.message }
    }
  }
  
  // データベース参照取得
  const getDatabaseRef = (path) => {
    if (!firebaseAvailable.value || !$firebaseDB) return null
    return dbRef($firebaseDB, path)
  }
  
  // UID マッピング取得: Firebase UID から deterministic UID への変換
  const getUserMatchingUID = async (firebaseUID) => {
    console.log('🔗 getUserMatchingUID: Looking up matching UID for Firebase UID:', firebaseUID)
    
    if (!firebaseUID) {
      console.warn('🔗 getUserMatchingUID: No Firebase UID provided')
      return null
    }
    
    try {
      // uid_index.json から全ての研究者データを取得
      const config = useRuntimeConfig()
      const baseURL = config.public.baseURL || '/'
      const uidIndexUrl = baseURL + 'data/uid_index.json'
      const uidIndex = await $fetch(uidIndexUrl)
      
      // user_profiles.json から Firebase UID に対応するユーザー情報を取得
      const userProfilesUrl = baseURL + 'auth/user_profiles.json'
      const userProfiles = await $fetch(userProfilesUrl)
      
      // Firebase UID からユーザー情報を取得
      const userProfile = userProfiles[firebaseUID]
      if (!userProfile) {
        console.warn('🔗 getUserMatchingUID: User profile not found for Firebase UID:', firebaseUID)
        return null
      }
      
      const userEmail = userProfile.email
      const userName = userProfile.display_name
      
      console.log('🔗 getUserMatchingUID: Found user profile:', { email: userEmail, name: userName })
      
      // uid_index.json から研究者名またはメールでマッチング
      for (const [deterministicUID, researcherData] of Object.entries(uidIndex)) {
        // 研究者名での照合
        if (researcherData.name === userName) {
          console.log('🔗 getUserMatchingUID: Found match by name:', { deterministicUID, name: researcherData.name })
          return deterministicUID
        }
        
        // メールアドレスでの照合 (もし今後メールアドレスがuid_indexに追加される場合)
        if (researcherData.email && researcherData.email.includes(userName)) {
          console.log('🔗 getUserMatchingUID: Found match by email pattern:', { deterministicUID, email: researcherData.email })
          return deterministicUID
        }
      }
      
      console.warn('🔗 getUserMatchingUID: No matching researcher found for user:', { email: userEmail, name: userName })
      return null
      
    } catch (error) {
      console.error('🔗 getUserMatchingUID: Error occurred:', error)
      return null
    }
  }
  
  // ユーザーのマッチングデータを取得
  const getUserMatchingData = async (firebaseUID) => {
    console.log('📊 getUserMatchingData: Getting matching data for Firebase UID:', firebaseUID)
    
    try {
      // 直接 Firebase UID でマッチングファイルを取得
      const config = useRuntimeConfig()
      const baseURL = config.public.baseURL || '/'
      // キャッシュバスターを追加して強制的に新しいファイルを読み込み
      const cacheBuster = Date.now()
      const matchingDataUrl = `${baseURL}data/matching_results_${firebaseUID}.json?v=${cacheBuster}`
      
      console.log('📊 getUserMatchingData: Fetching matching data from:', matchingDataUrl)
      console.log('🔥 CACHE BUSTER: Force reload with timestamp:', cacheBuster)
      
      const matchingData = await $fetch(matchingDataUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      // matched_researchers と theme_proposals を matches 形式にマッピング
      if (matchingData.matched_researchers && matchingData.theme_proposals) {
        matchingData.matches = matchingData.matched_researchers.map((researcher, index) => {
          const theme_proposal = matchingData.theme_proposals[index] || {}
          return {
            researcher: researcher,
            theme_proposal: theme_proposal
          }
        })
        console.log('📊 getUserMatchingData: Mapped data to matches format:', matchingData.matches.length, 'matches')
      }
      
      console.log('🔥 CRITICAL DEBUG: Raw matched_researchers count:', matchingData.matched_researchers?.length || 0)
      console.log('🔥 CRITICAL DEBUG: Raw theme_proposals count:', matchingData.theme_proposals?.length || 0)
      console.log('🔥 CRITICAL DEBUG: Final matches count:', matchingData.matches?.length || 0)
      console.log('🔥 CRITICAL DEBUG: File size estimate:', JSON.stringify(matchingData).length, 'characters')
      
      console.log('📊 getUserMatchingData: Successfully loaded matching data')
      return matchingData
      
    } catch (error) {
      console.error('📊 getUserMatchingData: Error occurred:', error)
      return null
    }
  }
  
  return {
    // 状態
    currentUser: readonly(currentUser),
    isAuthenticated,
    authInitialized: readonly(authInitialized),
    firebaseAvailable,
    firebaseReady: readonly(firebaseReady),
    
    // 認証
    login,
    logout,
    
    // ユーザー管理
    updatePrivacySettings,
    getUserProfile,
    createUserProfile,
    getPublicUsers,
    watchPublicUsers,
    
    // マッチングデータ
    getUserMatchingUID,
    getUserMatchingData,
    
    // 汎用
    getDatabaseRef
  }
}