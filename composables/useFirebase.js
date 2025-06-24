// Firebase操作用コンポーザブル
import { ref as dbRef, set, get, child, push, update, onValue } from 'firebase/database'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

export const useFirebase = () => {
  
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
    return available
  })
  
  // Firebase初期化処理
  const initializeFirebase = () => {
    if (process.server) {
      return
    }
    
    try {
      const nuxtApp = useNuxtApp()
      
      $firebaseDB = nuxtApp.$firebaseDB
      $firebaseAuth = nuxtApp.$firebaseAuth
      
      if ($firebaseDB && $firebaseAuth) {
        firebaseReady.value = true
        
        // 認証状態監視を設定
        try {
          $firebaseAuth.onAuthStateChanged((user) => {
            currentUser.value = user
            // 初回の認証状態確認後にフラグを立てる
            if (!authInitialized.value) {
              authInitialized.value = true
            }
          })
        } catch (authError) {
          // Error handling without console
        }
      }
    } catch (error) {
      // Error handling without console
    }
  }
  
  // クライアント側でのみ初期化
  if (process.client) {
    // 即座に初期化を試行
    initializeFirebase()
    
    // プラグインの初期化が遅れる場合のために再試行
    if (!firebaseReady.value) {
      setTimeout(() => {
        initializeFirebase()
      }, 100)
      setTimeout(() => {
        initializeFirebase()
      }, 500)
      setTimeout(() => {
        initializeFirebase()
      }, 1000)
    }
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
      return { success: false, error: error.message }
    }
  }
  
  // ユーザープロフィール取得
  const getUserProfile = async (uid) => {
    if (!firebaseAvailable.value || !$firebaseDB || !uid) {
      return null
    }
    
    try {
      const userRef = dbRef($firebaseDB, `users/${uid}`)
      const snapshot = await get(userRef)
      
      if (snapshot.exists()) {
        const data = snapshot.val()
        return data
      } else {
        return null
      }
    } catch (error) {
      return null
    }
  }
  
  // 公開ユーザー一覧取得
  const getPublicUsers = async () => {
    if (!firebaseAvailable.value || !$firebaseDB) {
      return []
    }
    
    try {
      const usersRef = dbRef($firebaseDB, 'users')
      const snapshot = await get(usersRef)
      
      if (!snapshot.exists()) {
        return []
      }
      
      const users = snapshot.val()
      const allUsers = Object.entries(users)
      const publicUsers = []
      
      for (const [uid, userData] of allUsers) {
        if (userData.privacy_settings?.public_profile && userData.privacy_settings?.show_in_search) {
          publicUsers.push({
            uid,
            email: userData.email,
            display_name: userData.display_name,
            privacy_settings: userData.privacy_settings
          })
        }
      }
      
      return publicUsers
    } catch (error) {
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
    if (!firebaseAvailable.value || !$firebaseDB) {
      return { success: false, error: 'Firebase is not available' }
    }
    
    if (!uid || !profileData) {
      return { success: false, error: 'Invalid parameters' }
    }
    
    try {
      const userRef = dbRef($firebaseDB, `users/${uid}`)
      await set(userRef, profileData)
      
      return { success: true }
    } catch (error) {
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
    if (!firebaseUID) {
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
        return null
      }
      
      const userEmail = userProfile.email
      const userName = userProfile.display_name
      
      // uid_index.json から研究者名またはメールでマッチング
      for (const [deterministicUID, researcherData] of Object.entries(uidIndex)) {
        // 研究者名での照合
        if (researcherData.name === userName) {
          return deterministicUID
        }
        
        // メールアドレスでの照合 (もし今後メールアドレスがuid_indexに追加される場合)
        if (researcherData.email && researcherData.email.includes(userName)) {
          return deterministicUID
        }
      }
      
      return null
      
    } catch (error) {
      return null
    }
  }
  
  // ユーザーのマッチングデータを取得
  const getUserMatchingData = async (firebaseUID) => {
    try {
      // 直接 Firebase UID でマッチングファイルを取得
      const config = useRuntimeConfig()
      const baseURL = config.public.baseURL || '/'
      // キャッシュバスターを追加して強制的に新しいファイルを読み込み
      const cacheBuster = Date.now()
      const matchingDataUrl = `${baseURL}data/matching_results_${firebaseUID}.json?v=${cacheBuster}`
      
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
      }
      
      return matchingData
      
    } catch (error) {
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