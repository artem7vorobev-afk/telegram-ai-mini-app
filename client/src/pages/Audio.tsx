import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'
import { Mic, Play, Download, Loader2, Volume2 } from 'lucide-react'

const voices = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'Female' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'Female' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'Female' },
  { id: 'ErXwobaYiN0q3qGqXgE3', name: 'Antoni', gender: 'Male' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'Male' },
]

export default function Audio() {
  const navigate = useNavigate()
  const { token, language } = useAppStore()
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!text.trim() || !token) return

    setIsGenerating(true)
    setError(null)
    setGeneratedAudio(null)

    try {
      const response = await fetch('/api/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          model: 'elevenlabs'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (error.error === 'Insufficient tokens') {
          navigate('/wallet')
          return
        }
        throw new Error(error.error || 'Failed to generate audio')
      }

      const data = await response.json()
      setGeneratedAudio(data.audioUrl)
    } catch (error) {
      console.error('Audio generation error:', error)
      setError('Произошла ошибка при генерации')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedAudio) {
      const link = document.createElement('a')
      link.href = generatedAudio
      link.download = 'generated-audio.mp3'
      link.click()
    }
  }

  return (
    <div className="space-y-6">
      {/* Voice Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Голос</label>
        <div className="grid grid-cols-2 gap-2">
          {voices.map((voice) => (
            <button
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              className={`card flex items-center gap-3 transition-colors ${
                selectedVoice === voice.id ? 'border-telegram-accent' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-telegram-surface flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-telegram-secondary" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{voice.name}</div>
                <div className="text-xs text-telegram-secondary">{voice.gender}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Текст для озвучки</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите текст, который нужно озвучить..."
          className="input w-full h-40 resize-none"
          disabled={isGenerating}
          maxLength={5000}
        />
        <div className="text-xs text-telegram-secondary mt-1">
          {text.length} / 5000
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!text.trim() || isGenerating}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Генерация...
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            Озвучить
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="card bg-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Generated Audio */}
      {generatedAudio && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="card">
            <audio controls className="w-full" src={generatedAudio}>
              Ваш браузер не поддерживает аудио
            </audio>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Скачать MP3
            </button>
          </div>
        </motion.div>
      )}

      {/* Placeholder */}
      {!generatedAudio && !isGenerating && (
        <div className="card flex flex-col items-center justify-center py-12 text-telegram-secondary">
          <Mic className="w-16 h-16 mb-4 opacity-50" />
          <p>Ваше аудио появится здесь</p>
        </div>
      )}
    </div>
  )
}
