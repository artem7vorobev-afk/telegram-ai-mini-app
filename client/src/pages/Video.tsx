import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { Video as VideoIcon, Wand2, Loader2 } from 'lucide-react'

const videoModels = [
  { id: 'runway', name: 'Runway', cost: 20 },
  { id: 'klings', name: 'Kling', cost: 20 },
]

export default function Video() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useAppStore()
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('runway')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (location.state?.model) {
      setSelectedModel(location.state.model)
    }
  }, [location.state?.model])

  const handleGenerate = async () => {
    if (!prompt.trim() || !token) return

    setIsGenerating(true)
    setError(null)
    setGeneratedVideo(null)

    try {
      const response = await fetch('/api/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (error.error === 'Insufficient tokens') {
          navigate('/wallet')
          return
        }
        throw new Error(error.error || 'Failed to generate video')
      }

      const data = await response.json()
      setGeneratedVideo(data.videoUrl)
    } catch (error) {
      console.error('Video generation error:', error)
      setError('Произошла ошибка при генерации')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Модель</label>
        <div className="grid grid-cols-2 gap-2">
          {videoModels.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`card text-center transition-colors ${
                selectedModel === model.id ? 'border-telegram-accent' : ''
              }`}
            >
              <div className="font-medium text-sm">{model.name}</div>
              <div className="text-xs text-telegram-secondary">{model.cost} токенов</div>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Описание видео</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Опишите видео, которое хотите создать..."
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

      {/* Generated Video */}
      {generatedVideo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="card overflow-hidden">
            <video controls className="w-full rounded-lg">
              <source src={generatedVideo} />
              Ваш браузер не поддерживает видео
            </video>
          </div>
        </motion.div>
      )}

      {/* Placeholder */}
      {!generatedVideo && !isGenerating && (
        <div className="card flex flex-col items-center justify-center py-12 text-telegram-secondary">
          <VideoIcon className="w-16 h-16 mb-4 opacity-50" />
          <p>Ваше видео появится здесь</p>
          <p className="text-xs mt-2">Генерация видео может занять несколько минут</p>
        </div>
      )}
    </div>
  )
}
