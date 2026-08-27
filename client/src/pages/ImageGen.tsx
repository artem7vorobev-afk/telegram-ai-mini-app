import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { Wand2, Download, Loader2, Image as ImageIcon } from 'lucide-react'

const imageModels = [
  { id: 'midjourney', name: 'Midjourney', cost: 3 },
  { id: 'stable-diffusion', name: 'Stable Diffusion', cost: 2 },
  { id: 'flux', name: 'Flux', cost: 3 },
]

const styles = ['Реалистичный', 'Аниме', 'Киберпанк', 'Масло', 'Акварель', '3D']

export default function ImageGen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useAppStore()
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('stable-diffusion')
  const [selectedStyle, setSelectedStyle] = useState('Реалистичный')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (location.state?.model) {
      setSelectedModel(location.state.model)
    }
  }, [location.state])

  const handleGenerate = async () => {
    if (!prompt.trim() || !token) return

    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `${prompt}, ${selectedStyle} style`,
          style: selectedStyle
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (error.error === 'Insufficient tokens') {
          navigate('/wallet')
          return
        }
        throw new Error(error.error || 'Failed to generate image')
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
    } catch (error) {
      console.error('Image generation error:', error)
      setError('Произошла ошибка при генерации')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = 'generated-image.png'
      link.click()
    }
  }

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Модель</label>
        <div className="grid grid-cols-3 gap-2">
          {imageModels.map((model) => (
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

      {/* Style Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Стиль</label>
        <div className="flex flex-wrap gap-2">
          {styles.map((style) => (
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
        <label className="block text-sm font-medium mb-2">Описание</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Опишите изображение, которое хотите создать..."
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

      {/* Generated Image */}
      {generatedImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="card overflow-hidden">
            <img
              src={generatedImage}
              alt="Generated"
              className="w-full rounded-lg"
            />
          </div>
          <button
            onClick={handleDownload}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Скачать
          </button>
        </motion.div>
      )}

      {/* Placeholder */}
      {!generatedImage && !isGenerating && (
        <div className="card flex flex-col items-center justify-center py-12 text-telegram-secondary">
          <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
          <p>Ваше изображение появится здесь</p>
        </div>
      )}
    </div>
  )
}
