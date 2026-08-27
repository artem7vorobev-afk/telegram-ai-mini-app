import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'
import { User, Settings, Globe, Bell, LogOut, Loader2 } from 'lucide-react'

export default function Profile() {
  const { user, token, language, setLanguage, logout } = useAppStore()
  const [profileData, setProfileData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [token])

  const fetchProfile = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setProfileData(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLanguageChange = async (newLang: string) => {
    setLanguage(newLang)
    
    if (token) {
      try {
        await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ languageCode: newLang }),
        })
      } catch (error) {
        console.error('Failed to update language:', error)
      }
    }
  }

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-telegram-accent" />
      </div>
    )
  }

  const displayUser = profileData || user

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-telegram-accent flex items-center justify-center text-white text-2xl font-bold">
            {(displayUser?.firstName || displayUser?.username || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {displayUser?.firstName || displayUser?.username || 'User'}
            </h2>
            <p className="text-telegram-secondary">
              @{displayUser?.username || 'unknown'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Settings */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          {t('settings', 'ru')}
        </h3>
        
        <div className="space-y-3">
          {/* Language */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-telegram-accent" />
                <span>{t('language', 'ru')}</span>
              </div>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-telegram-bg border border-telegram-surface rounded-lg px-3 py-2 text-sm"
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-telegram-accent" />
                <span>{t('notifications', 'ru')}</span>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-telegram-accent' : 'bg-telegram-surface'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <User className="w-5 h-5" />
          Информация аккаунта
        </h3>
        
        <div className="card space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-telegram-secondary">Telegram ID</span>
            <span>{displayUser?.telegramId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-telegram-secondary">Реферальный код</span>
            <span className="font-mono">{displayUser?.referralCode}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-telegram-secondary">Баланс токенов</span>
            <span className="font-semibold">{displayUser?.tokensBalance}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-telegram-secondary">Дата регистрации</span>
            <span>
              {displayUser?.createdAt
                ? new Date(displayUser.createdAt).toLocaleDateString('ru-RU')
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="card w-full text-red-400 font-medium flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Выйти
      </button>
    </div>
  )
}
