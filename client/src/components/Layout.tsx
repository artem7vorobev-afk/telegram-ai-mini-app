import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'
import { 
  Home, MessageSquare, Image, 
  Wallet, User, Coins 
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, language } = useAppStore()

  const navItems = [
    { path: '/', icon: Home, label: t('home', language) },
    { path: '/chat', icon: MessageSquare, label: t('chat', language) },
    { path: '/image', icon: Image, label: t('image', language) },
    { path: '/wallet', icon: Wallet, label: t('wallet', language) },
    { path: '/profile', icon: User, label: t('profile', language) },
  ]

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-telegram-bg/80 backdrop-blur-lg border-b border-telegram-surface">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">AI Services</h1>
          {user && (
            <div className="flex items-center gap-2 bg-telegram-surface rounded-full px-3 py-1">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{user.tokensBalance}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-telegram-bg/90 backdrop-blur-lg border-t border-telegram-surface">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive ? 'text-telegram-accent' : 'text-telegram-secondary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
