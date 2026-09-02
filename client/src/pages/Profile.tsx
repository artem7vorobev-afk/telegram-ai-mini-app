import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { User, Settings, Globe, Bell, LogOut, Loader2, Copy, History, Wallet, Users, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export default function Profile() {
  const { user, token, language, setLanguage, logout } = useAppStore()
  const [profileData, setProfileData] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [deposits, setDeposits] = useState<any[]>([])
  const [referralData, setReferralData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState<'transactions' | 'deposits' | 'referrals'>('transactions')

  useEffect(() => {
    fetchAllData()
  }, [token])

  const fetchAllData = async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const apiUrl = (import.meta as any).env.VITE_API_URL || ''
      console.log('Fetching data from:', apiUrl)
      
      const fetchWithTimeout = (url: string, options: RequestInit, timeout = 10000) => {
        return Promise.race([
          fetch(url, options),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ])
      }

      const [profileRes, transactionsRes, depositsRes, referralsRes] = await Promise.allSettled([
        fetchWithTimeout(`${apiUrl}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetchWithTimeout(`${apiUrl}/api/user/transactions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetchWithTimeout(`${apiUrl}/api/user/deposits`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetchWithTimeout(`${apiUrl}/api/user/referrals`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
        const data = await (profileRes.value as Response).json()
        setProfileData(data.user)
      }

      if (transactionsRes.status === 'fulfilled' && transactionsRes.value.ok) {
        const data = await (transactionsRes.value as Response).json()
        setTransactions(data.transactions)
      }

      if (depositsRes.status === 'fulfilled' && depositsRes.value.ok) {
        const data = await (depositsRes.value as Response).json()
        setDeposits(data.deposits)
      }

      if (referralsRes.status === 'fulfilled' && referralsRes.value.ok) {
        const data = await (referralsRes.value as Response).json()
        // Generate referral link with start_param
        const botUsername = 'AIServicessbot'
        const referralCode = data.referralCode || profileData?.referralCode || ''
        const referralLink = `https://t.me/${botUsername}/aiservices?startapp=${referralCode}`
        setReferralData({
          ...data,
          referralLink,
          referralCode
        })
      } else {
        // Fallback if referral endpoint fails
        const referralCode = profileData?.referralCode || user?.referralCode || ''
        const botUsername = 'AIServicessbot'
        const referralLink = `https://t.me/${botUsername}/aiservices?startapp=${referralCode}`
        setReferralData({
          referralCode,
          referralLink,
          referrals: [],
          totalEarned: 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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
          <div className="flex-1">
            <h2 className="text-xl font-bold">
              {displayUser?.firstName || displayUser?.username || 'User'}
            </h2>
            <p className="text-telegram-secondary">
              @{displayUser?.username || 'unknown'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-telegram-accent">{displayUser?.tokensBalance || 0}</div>
            <div className="text-xs text-telegram-secondary">токенов</div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'transactions'
              ? 'bg-telegram-accent text-white'
              : 'bg-telegram-surface text-telegram-secondary'
          }`}
        >
          <History className="w-4 h-4 inline mr-1" />
          Операции
        </button>
        <button
          onClick={() => setActiveTab('deposits')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'deposits'
              ? 'bg-telegram-accent text-white'
              : 'bg-telegram-surface text-telegram-secondary'
          }`}
        >
          <Wallet className="w-4 h-4 inline mr-1" />
          Пополнения
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'referrals'
              ? 'bg-telegram-accent text-white'
              : 'bg-telegram-surface text-telegram-secondary'
          }`}
        >
          <Users className="w-4 h-4 inline mr-1" />
          Рефералы
        </button>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {transactions.length === 0 ? (
            <div className="card text-center py-8 text-telegram-secondary">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>История операций пуста</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-medium">{tx.description || tx.type}</div>
                      <div className="text-xs text-telegram-secondary">
                        {new Date(tx.created_at).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* Deposits Tab */}
      {activeTab === 'deposits' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {deposits.length === 0 ? (
            <div className="card text-center py-8 text-telegram-secondary">
              <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>История пополнений пуста</p>
            </div>
          ) : (
            deposits.map((deposit) => (
              <div key={deposit.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                      <ArrowDownLeft className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium">{deposit.description || 'Пополнение'}</div>
                      <div className="text-xs text-telegram-secondary">
                        {new Date(deposit.created_at).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold text-green-400">
                    +{deposit.amount}
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* Referrals Tab */}
      {activeTab === 'referrals' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Referral Link */}
          <div className="card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-telegram-accent" />
              Реферальная ссылка
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralData?.referralLink || ''}
                readOnly
                className="input flex-1 text-sm"
              />
              <button
                onClick={() => copyToClipboard(referralData?.referralLink || '')}
                className="btn px-3"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 text-sm text-telegram-secondary">
              Заработано: <span className="font-semibold text-telegram-accent">{referralData?.totalEarned || 0}</span> токенов
            </div>
          </div>

          {/* Referrals List */}
          <div>
            <h3 className="font-semibold mb-3">Приглашенные ({referralData?.referrals?.length || 0})</h3>
            {referralData?.referrals?.length === 0 ? (
              <div className="card text-center py-8 text-telegram-secondary">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Вы еще никого не пригласили</p>
              </div>
            ) : (
              <div className="space-y-2">
                {referralData.referrals.map((ref: any) => (
                  <div key={ref.id} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">@{ref.username || 'User'}</div>
                        <div className="text-xs text-telegram-secondary">
                          {new Date(ref.joined_at).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                      <div className="text-sm text-green-400">
                        +{ref.tokens_earned}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Settings */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Настройки
        </h3>
        
        <div className="space-y-3">
          {/* Language */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-telegram-accent" />
                <span>Язык</span>
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
                <span>Уведомления</span>
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
