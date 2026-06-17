import { create } from 'zustand'

type Page = 'dashboard' | 'certs' | 'syncs' | 'help' | 'config'

interface AppState {
  currentPage: Page
  setPage: (page: Page) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'dashboard',
  setPage: (page) => set({ currentPage: page })
}))
