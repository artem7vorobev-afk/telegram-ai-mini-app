import { motion } from 'framer-motion'
import { 
  Brain, Image as ImageIcon, Mic, Video, Music2, Sparkles 
} from 'lucide-react'

interface AIServiceCardProps {
  id: string
  name: string
  category: 'text' | 'image' | 'audio' | 'video' | 'music'
  tokenCost: number
  description: string
  onClick: () => void
}

const categoryIcons = {
  text: Brain,
  image: ImageIcon,
  audio: Mic,
  video: Video,
  music: Music2,
}

const categoryColors = {
  text: 'bg-blue-500/20 text-blue-400',
  image: 'bg-purple-500/20 text-purple-400',
  audio: 'bg-green-500/20 text-green-400',
  video: 'bg-red-500/20 text-red-400',
  music: 'bg-yellow-500/20 text-yellow-400',
}

export default function AIServiceCard({ 
  name, category, tokenCost, description, onClick 
}: AIServiceCardProps) {
  const Icon = categoryIcons[category]
  const colorClass = categoryColors[category]

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="card w-full text-left"
    >
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{name}</h3>
          <p className="text-sm text-telegram-secondary mb-2">{description}</p>
          <div className="flex items-center gap-1 text-xs text-telegram-accent">
            <Sparkles className="w-3 h-3" />
            <span>{tokenCost} токенов</span>
          </div>
        </div>
      </div>
    </motion.button>
  )
}
