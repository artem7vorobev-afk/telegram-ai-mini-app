import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import Router from './components/Router'
import { useAppStore } from './store/appStore'

function App() {
  const { setUser, setLanguage } = useAppStore()

  useEffect(() => {
    // Get Telegram user data
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    const initData = window.Telegram?.WebApp?.initData

    if (telegramUser) {
      // Set user data from Telegram
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
        authenticateWithBackend(initData)
      }
    }
  }, [])

  const authenticateWithBackend = async (initData: string) => {
    try {
      const apiUrl = (import.meta as any).env.VITE_API_URL || ''
      const response = await fetch(`${apiUrl}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ initData })
      })

      if (response.ok) {
        const data = await response.json()
        // Store token in Zustand
        useAppStore.getState().setToken(data.token)
        // Update user with backend data
        useAppStore.getState().setUser(data.user)
      }
    } catch (error) {
      console.error('Authentication failed:', error)
    }
  }

  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  )
}

export default App
