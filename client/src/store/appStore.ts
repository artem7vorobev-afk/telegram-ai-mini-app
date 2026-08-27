import { create } from 'zustand'

interface User {
  id: number
  telegramId: string
  username: string | null
  firstName: string | null
  lastName: string | null
  languageCode: string
  tokensBalance: number
  referralCode: string
}

interface AppState {
  user: User | null
  token: string | null
  isLoading: boolean
  language: string
  
  setUser: (user: User) => void
  setToken: (token: string) => void
  setLoading: (loading: boolean) => void
  setLanguage: (lang: string) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  language: 'ru',

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setLanguage: (language) => set({ language }),
  logout: () => set({ user: null, token: null }),
}))
