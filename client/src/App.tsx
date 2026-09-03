import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import Router from './components/Router'
import { useAppStore } from './store/appStore'

function App() {
  const { setUser, setLanguage, setToken } = useAppStore()

  useEffect(() => {
    // Get Telegram user data
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    const initData = window.Telegram?.WebApp?.initData
    const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param

    console.log('Telegram WebApp data:', {
      telegramUser,
      initData: initData ? 'present' : 'missing',
      startParam
    })

    if (telegramUser) {
      // Set user data from Telegram (temporary, will be updated from backend)
      setUser({
        id: telegramUser.id,
        telegramId: telegramUser.id.toString(),
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name || '',
        username: telegramUser.username || '',
        languageCode: telegramUser.language_code || 'ru',
        tokensBalance: 0,
        referralCode: '',
        createdAt: new Date().toISOString()
      })

      // Set language from Telegram
      if (telegramUser.language_code) {
        setLanguage(telegramUser.language_code === 'ru' ? 'ru' : 'en')
      }

      // Authenticate with backend
      if (initData) {
        authenticateWithBackend(initData, startParam)
      } else {
        console.error('No initData from Telegram WebApp')
      }
    } else {
      console.error('No telegramUser from Telegram WebApp')
    }
  }, [])

  const authenticateWithBackend = async (initData: string, startParam?: string) => {
    try {
      const apiUrl = (import.meta as any).env.VITE_API_URL || ''
      console.log('Authenticating with backend:', apiUrl)
      
      const response = await fetch(`${apiUrl}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ initData, startParam })
      })

      console.log('Auth response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Auth response data:', data)
        
        // Store token in Zustand
        setToken(data.token)
        
        // Update user with backend data
        setUser({
          id: data.user.id,
          telegramId: data.user.telegram_id,
          username: data.user.username,
          firstName: data.user.first_name,
          lastName: data.user.last_name,
          languageCode: data.user.language_code,
          tokensBalance: data.user.tokens_balance,
          referralCode: data.user.referral_code,
          createdAt: data.user.created_at
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Auth failed:', errorData)
      }
    } catch (error) {
      console.error('Authentication error:', error)
    }
  }

  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  )
}

export default App
