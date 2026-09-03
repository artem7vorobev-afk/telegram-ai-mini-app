import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'
import { ArrowLeft, Star, Loader2, Check } from 'lucide-react'

const packages = [
  { id: 1, tokens: 100, price: 99, name: 'Starter' },
  { id: 2, tokens: 500, price: 399, name: 'Pro' },
  { id: 3, tokens: 2000, price: 1299, name: 'Premium' },
]

const paymentMethods = [
  { id: 'stars', name: 'Telegram Stars', icon: Star, description: 'Оплата звездами Telegram' },
]

export default function TopUp() {
  const navigate = useNavigate()
  const { token } = useAppStore()
  const [selectedPackage, setSelectedPackage] = useState(packages[1])
  const [selectedMethod, setSelectedMethod] = useState('stars')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    if (!token) return

    setIsProcessing(true)

    try {
      const endpoint = '/api/payment/stars'
      const body: any = { packageId: selectedPackage.id }

      const apiUrl = (import.meta as any).env.VITE_API_URL || ''
      console.log('Payment request to:', `${apiUrl}${endpoint}`)
      
      const fetchWithTimeout = (url: string, options: RequestInit, timeout = 15000) => {
        return Promise.race([
          fetch(url, options),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ])
      }

      const response = await fetchWithTimeout(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }) as Response

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Payment failed:', errorData)
        throw new Error(errorData.error || 'Payment failed')
      }

      const data = await response.json()
      console.log('Payment response:', data)

      if (data.invoiceUrl) {
        window.Telegram.WebApp.openLink(data.invoiceUrl)
      } else {
        console.error('No invoiceUrl in response:', data)
        alert('Не удалось создать ссылку для оплаты. Проверьте консоль для деталей.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert(error instanceof Error ? error.message : 'Произошла ошибка при обработке платежа')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/wallet')}
        className="flex items-center gap-2 text-telegram-secondary mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Назад
      </button>

      {/* Packages */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('packages', 'ru')}</h2>
        <div className="space-y-3">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={`card w-full text-left transition-all ${
                selectedPackage.id === pkg.id ? 'border-telegram-accent border-2' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{pkg.name}</div>
                  <div className="text-sm text-telegram-secondary">{pkg.tokens} токенов</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{pkg.price} ₽</div>
                  {selectedPackage.id === pkg.id && (
                    <Check className="w-5 h-5 text-telegram-accent ml-auto" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Способ оплаты</h2>
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`card w-full text-left transition-all ${
                  selectedMethod === method.id ? 'border-telegram-accent border-2' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedMethod === method.id ? 'bg-telegram-accent/20' : 'bg-telegram-surface'
                  }`}>
                    <Icon className="w-5 h-5 text-telegram-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-xs text-telegram-secondary">{method.description}</div>
                  </div>
                  {selectedMethod === method.id && (
                    <Check className="w-5 h-5 text-telegram-accent" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Обработка...
          </>
        ) : (
          <>
            <Star className="w-5 h-5" />
            Оплатить {selectedPackage.tokens} токенов
          </>
        )}
      </button>
    </div>
  )
}
