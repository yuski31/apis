import { create } from 'zustand'
import { UserProfile } from '@/lib/database/types'

interface UserState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}))