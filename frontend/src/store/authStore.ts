import { create } from 'zustand'
import type { UserProfile } from '@/types/auth'
import * as authService from '@/services/auth.service'

interface AuthState {
  token: string | null
  user: UserProfile | null
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
  updateProfile: (name: string) => Promise<void>
  init: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('streakforge_token'),
  user: null,
  isLoading: false,
  isInitialized: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res = await authService.login({ email, password })
      localStorage.setItem('streakforge_token', res.access_token)
      set({ token: res.access_token })
      await get().fetchProfile()
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true })
    try {
      const res = await authService.register({ name, email, password })
      localStorage.setItem('streakforge_token', res.access_token)
      set({ token: res.access_token })
      await get().fetchProfile()
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    localStorage.removeItem('streakforge_token')
    set({ token: null, user: null })
  },

  fetchProfile: async () => {
    const profile = await authService.getProfile()
    set({ user: profile })
  },

  updateProfile: async (name: string) => {
    set({ isLoading: true })
    try {
      const profile = await authService.updateProfile({ name })
      set({ user: profile })
    } finally {
      set({ isLoading: false })
    }
  },

  init: async () => {
    const token = localStorage.getItem('streakforge_token')
    if (token) {
      try {
        await get().fetchProfile()
      } catch {
        localStorage.removeItem('streakforge_token')
        set({ token: null, user: null })
      }
    }
    set({ isInitialized: true })
  },
}))
