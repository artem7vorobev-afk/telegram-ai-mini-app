import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { useChatStore } from '../store/chatStore'
import { t } from '../lib/i18n'
import { Send, Loader2, Bot, User } from 'lucide-react'

const textModels = [
  { id: 'gpt-4o', name: 'GPT-4o', cost: 5 },
  { id: 'claude-3.5', name: 'Claude 3.5', cost: 5 },
  { id: 'qwen-2.5', name: 'Qwen 2.5', cost: 3 },
  { id: 'gemini-pro', name: 'Gemini Pro', cost: 3 },
  { id: 'llama-3', name: 'Llama 3', cost: 2 },
  { id: 'mistral', name: 'Mistral', cost: 2 },
]

export default function Chat() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, language } = useAppStore()
  const { messages, currentModel, isLoading, addMessage, setCurrentModel, setLoading } = useChatStore()
  const [input, setInput] = useState('')
  const [showModelSelector, setShowModelSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (location.state?.model) {
      setCurrentModel(location.state.model)
    }
  }, [location.state, setCurrentModel])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading || !token) return

    const userMessage = { role: 'user' as const, content: input, timestamp: Date.now() }
    addMessage(userMessage)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (error.error === 'Insufficient tokens') {
          navigate('/wallet')
          return
        }
        throw new Error(error.error || 'Failed to send message')
      }

      const data = await response.json()
      addMessage({
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Chat error:', error)
      addMessage({
        role: 'assistant',
        content: 'Произошла ошибка. Попробуйте снова.',
        timestamp: Date.now()
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedModel = textModels.find(m => m.id === currentModel) || textModels[0]

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Model Selector */}
      <div className="mb-4">
        <button
          onClick={() => setShowModelSelector(!showModelSelector)}
          className="w-full card flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-telegram-accent" />
            <span className="font-medium">{selectedModel.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-telegram-secondary">
            <span>{selectedModel.cost} токенов</span>
          </div>
        </button>

        <AnimatePresence>
          {showModelSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-2"
            >
              {textModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setCurrentModel(model.id)
                    setShowModelSelector(false)
                  }}
                  className={`w-full card flex items-center justify-between ${
                    currentModel === model.id ? 'border-telegram-accent' : ''
                  }`}
                >
                  <span>{model.name}</span>
                  <span className="text-sm text-telegram-secondary">{model.cost} токенов</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-telegram-secondary py-8"
            >
              <Bot className="w-16 h-16 mx-auto mb-4 text-telegram-surface" />
              <p>Начните диалог с AI</p>
            </motion.div>
          )}
          
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' ? 'bg-telegram-accent' : 'bg-telegram-surface'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-telegram-accent" />
                )}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-telegram-accent text-white'
                  : 'bg-telegram-surface'
              }`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-telegram-surface flex items-center justify-center">
                <Bot className="w-4 h-4 text-telegram-accent" />
              </div>
              <div className="bg-telegram-surface rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('typeMessage', language)}
          className="input flex-1"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="btn-primary flex-shrink-0 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}
