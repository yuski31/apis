import { create } from 'zustand'

interface UIState {
  // Sidebar
  sidebarOpen: boolean

  // Modals
  isModalOpen: boolean
  modalContent: React.ReactNode | null

  // Loading states
  globalLoading: boolean

  // Theme
  darkMode: boolean

  // Actions
  setSidebarOpen: (open: boolean) => void
  openModal: (content: React.ReactNode) => void
  closeModal: () => void
  setGlobalLoading: (loading: boolean) => void
  toggleDarkMode: () => void
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  sidebarOpen: false,
  isModalOpen: false,
  modalContent: null,
  globalLoading: false,
  darkMode: false,

  // Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode }))
}))