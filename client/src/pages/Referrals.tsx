import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'
import { Users, Copy, Check, Gift, Loader2 } from 'lucide-react'

export default function Referrals() {
  const { token } = useAppStore()
  const [referralData, setReferralData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReferrals()
  }, [token])

  const fetchReferrals = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/user/referrals', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setReferralData(data)
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (referralData?.referralLink) {
      await navigator.clipboard.writeText(referralData.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
      {/* Referral Link Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white"
      >
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-6 h-6" />
          <span className="font-semibold">{t('inviteLink', 'ru')}</span>
        </div>
        <div className="bg-white/20 rounded-xl p-3 mb-4 break-all text-sm">
          {referralData?.referralLink || 'Loading...'}
        </div>
        <button
          onClick={handleCopyLink}
          className="w-full bg-white/20 hover:bg-white/30 transition-colors py-3 rounded-xl font-medium flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Скопировано!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              {t('copyLink', 'ru')}
            </>
          )}
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <Users className="w-8 h-8 mx-auto mb-2 text-telegram-accent" />
          <div className="text-2xl font-bold">{referralData?.referrals?.length || 0}</div>
          <div className="text-sm text-telegram-secondary">{t('invitedUsers', 'ru')}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <Gift className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl font-bold">{referralData?.totalEarned || 0}</div>
          <div className="text-sm text-telegram-secondary">{t('totalEarned', 'ru')}</div>
        </motion.div>
      </div>

      {/* Referral Info */}
      <div className="card">
        <h3 className="font-semibold mb-2">Как это работает?</h3>
        <ul className="space-y-2 text-sm text-telegram-secondary">
          <li className="flex items-start gap-2">
            <span className="text-telegram-accent">1.</span>
            Поделитесь ссылкой с друзьями
          </li>
          <li className="flex items-start gap-2">
            <span className="text-telegram-accent">2.</span>
            Другие получают 5 токенов бонуса при регистрации
          </li>
          <li className="flex items-start gap-2">
            <span className="text-telegram-accent">3.</span>
            Вы получаете 10% от их покупок в токенах
          </li>
        </ul>
      </div>

      {/* Referrals List */}
      {Array.isArray(referralData?.referrals) && referralData.referrals.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t('invitedUsers', 'ru')}
          </h3>
          <div className="space-y-2">
            {referralData.referrals.map((ref: any, index: number) => (
              <motion.div
                key={ref.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">
                    {ref.username || ref.first_name || 'User'}
                  </div>
                  <div className="text-xs text-telegram-secondary">
                    {new Date(ref.joined_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
                <div className="text-green-400 font-semibold">
                  +{ref.tokens_earned}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
