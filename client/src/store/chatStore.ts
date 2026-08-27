import { create } from 'zustand'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatState {
  messages: Message[]
  currentModel: string
  isLoading: boolean
  
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  setCurrentModel: (model: string) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  currentModel: 'gpt-4o',
  isLoading: false,

  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  setMessages: (messages) => set({ messages }),
  setCurrentModel: (currentModel) => set({ currentModel }),
  setLoading: (isLoading) => set({ isLoading }),
  clearMessages: () => set({ messages: [] }),
}))
