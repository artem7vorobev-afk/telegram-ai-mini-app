import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { t } from '../lib/i18n'
import AIServiceCard from '../components/AIServiceCard'
import { Brain, Image as ImageIcon, Mic, Video, Music2 } from 'lucide-react'

type Category = 'text' | 'image' | 'audio' | 'video' | 'music'

const aiServices = [
  // Text Models
  { id: 'gpt-4o', name: 'GPT-4o', category: 'text' as Category, tokenCost: 5, description: 'Самая мощная модель от OpenAI' },
  { id: 'claude-3.5', name: 'Claude 3.5', category: 'text' as Category, tokenCost: 5, description: 'Модель от Anthropic' },
  { id: 'qwen-2.5', name: 'Qwen 2.5', category: 'text' as Category, tokenCost: 3, description: 'Модель от Alibaba' },
  { id: 'gemini-pro', name: 'Gemini Pro', category: 'text' as Category, tokenCost: 3, description: 'Модель от Google' },
  { id: 'llama-3', name: 'Llama 3', category: 'text' as Category, tokenCost: 2, description: 'Open-source модель Meta' },
  { id: 'mistral', name: 'Mistral', category: 'text' as Category, tokenCost: 2, description: 'Европейская AI модель' },
  
  // Image Models
  { id: 'midjourney', name: 'Midjourney', category: 'image' as Category, tokenCost: 3, description: 'Лучшее качество картинок' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', category: 'image' as Category, tokenCost: 2, description: 'Популярный генератор' },
  { id: 'flux', name: 'Flux', category: 'image' as Category, tokenCost: 3, description: 'Новая модель генерации' },
  
  // Audio Models
  { id: 'elevenlabs', name: 'ElevenLabs', category: 'audio' as Category, tokenCost: 2, description: 'Реалистичная озвучка' },
  
  // Video Models
  { id: 'runway', name: 'Runway', category: 'video' as Category, tokenCost: 20, description: 'Генерация видео' },
  { id: 'klings', name: 'Kling', category: 'video' as Category, tokenCost: 20, description: 'AI видео генератор' },
  
  // Music Models
  { id: 'suno', name: 'Suno', category: 'music' as Category, tokenCost: 5, description: 'Генерация музыки' },
]

const categories = [
  { key: 'text', label: t('textModels', 'ru'), icon: Brain },
  { key: 'image', label: t('imageModels', 'ru'), icon: ImageIcon },
  { key: 'audio', label: t('audioModels', 'ru'), icon: Mic },
  { key: 'video', label: t('videoModels', 'ru'), icon: Video },
  { key: 'music', label: t('musicModels', 'ru'), icon: Music2 },
]

export default function Home() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)

  const filteredServices = selectedCategory
    ? aiServices.filter(s => s.category === selectedCategory)
    : aiServices

  const handleServiceClick = (service: typeof aiServices[0]) => {
    switch (service.category) {
      case 'text':
        navigate('/chat', { state: { model: service.id } })
        break
      case 'image':
        navigate('/image', { state: { model: service.id } })
        break
      case 'audio':
        navigate('/audio', { state: { model: service.id } })
        break
      case 'video':
        navigate('/video', { state: { model: service.id } })
        break
      case 'music':
        navigate('/music', { state: { model: service.id } })
        break
    }
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-telegram-accent text-white'
              : 'bg-telegram-surface text-telegram-secondary'
          }`}
        >
          Все
        </button>
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.key
                  ? 'bg-telegram-accent text-white'
                  : 'bg-telegram-surface text-telegram-secondary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Services Grid */}
      <motion.div
        layout
        className="grid gap-3"
      >
        {filteredServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <AIServiceCard
              {...service}
              onClick={() => handleServiceClick(service)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
