import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'
import { Coins, ArrowUpRight, History, Loader2 } from 'lucide-react'

export default function Wallet() {
  const navigate = useNavigate()
  const { token } = useAppStore()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [token])

  const fetchData = async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const apiUrl = (import.meta as any).env.VITE_API_URL || ''
      const [balanceRes, transactionsRes] = await Promise.all([
        fetch(`${apiUrl}/api/user/balance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/user/transactions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json()
        setBalance(balanceData.balance)
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(Array.isArray(transactionsData.transactions) ? transactionsData.transactions : [])
      } else {
        setTransactions([])
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-telegram-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card bg-gradient-to-br from-telegram-accent to-blue-600 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm opacity-80">{t('balance', 'ru')}</span>
          <Coins className="w-6 h-6" />
        </div>
        <div className="text-4xl font-bold mb-2">{balance}</div>
        <div className="text-sm opacity-80">{t('tokens', 'ru')}</div>
        <button
          onClick={() => navigate('/topup')}
          className="mt-4 w-full bg-white/20 hover:bg-white/30 transition-colors py-3 rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <ArrowUpRight className="w-5 h-5" />
          {t('topup', 'ru')}
        </button>
      </motion.div>

      {/* Transactions */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          {t('history', 'ru')}
        </h2>
        
        {transactions.length === 0 ? (
          <div className="card text-center py-8 text-telegram-secondary">
            <p>История транзакций пуста</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{tx.description}</div>
                  <div className="text-xs text-telegram-secondary">
                    {formatDate(tx.created_at)}
                  </div>
                </div>
                <div className={`font-semibold ${
                  tx.type === 'topup' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {tx.type === 'topup' ? '+' : '-'}{tx.amount}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
