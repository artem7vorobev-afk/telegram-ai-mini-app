import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { Music2, Wand2, Loader2, Download } from 'lucide-react'

const musicStyles = [
  'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Classical', 'Jazz',
  'Country', 'R&B', 'Reggae', 'Blues', 'Lo-Fi', 'Ambient'
]

export default function Music() {
  const navigate = useNavigate()
  const { token } = useAppStore()
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('Pop')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMusic, setGeneratedMusic] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim() || !token) return

    setIsGenerating(true)
    setError(null)
    setGeneratedMusic(null)

    try {
      const response = await fetch('/api/music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: 'suno',
          prompt,
          style: selectedStyle
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (error.error === 'Insufficient tokens') {
          navigate('/wallet')
          return
        }
        throw new Error(error.error || 'Failed to generate music')
      }

      const data = await response.json()
      setGeneratedMusic(data.audioUrl)
    } catch (error) {
      console.error('Music generation error:', error)
      setError('Произошла ошибка при генерации')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedMusic) {
      const link = document.createElement('a')
      link.href = generatedMusic
      link.download = 'generated-music.mp3'
      link.click()
    }
  }

  return (
    <div className="space-y-6">
      {/* Style Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Жанр</label>
        <div className="flex flex-wrap gap-2">
          {musicStyles.map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedStyle === style
                  ? 'bg-telegram-accent text-white'
                  : 'bg-telegram-surface text-telegram-secondary'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Описание трека</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Опишите музыку, которую хотите создать..."
          className="input w-full h-32 resize-none"
          disabled={isGenerating}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Генерация...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            Сгенерировать
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="card bg-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Generated Music */}
      {generatedMusic && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="card">
            <audio controls className="w-full" src={generatedMusic}>
              Ваш браузер не поддерживает аудио
            </audio>
          </div>
          <button
            onClick={handleDownload}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Скачать MP3
          </button>
        </motion.div>
      )}

      {/* Placeholder */}
      {!generatedMusic && !isGenerating && (
        <div className="card flex flex-col items-center justify-center py-12 text-telegram-secondary">
          <Music2 className="w-16 h-16 mb-4 opacity-50" />
          <p>Ваш трек появится здесь</p>
          <p className="text-xs mt-2">Генерация музыки может занять несколько минут</p>
        </div>
      )}
    </div>
  )
}
