import { create } from 'zustand'

interface ProgressState {
  // Stats
  lessonsCompleted: number
  wordsLearned: number
  studyStreak: number

  // Progress tracking
  dailyGoal: number
  todayProgress: number

  // Preferences
  soundEnabled: boolean
  notificationsEnabled: boolean

  // Actions
  setLessonsCompleted: (count: number) => void
  setWordsLearned: (count: number) => void
  setStudyStreak: (days: number) => void
  setDailyGoal: (goal: number) => void
  incrementTodayProgress: () => void
  resetTodayProgress: () => void
  setSoundEnabled: (enabled: boolean) => void
  setNotificationsEnabled: (enabled: boolean) => void
}

export const useProgressStore = create<ProgressState>((set) => ({
  // Initial state
  lessonsCompleted: 12,
  wordsLearned: 342,
  studyStreak: 7,
  dailyGoal: 20,
  todayProgress: 8,
  soundEnabled: true,
  notificationsEnabled: true,

  // Actions
  setLessonsCompleted: (count) => set({ lessonsCompleted: count }),
  setWordsLearned: (count) => set({ wordsLearned: count }),
  setStudyStreak: (days) => set({ studyStreak: days }),
  setDailyGoal: (goal) => set({ dailyGoal: goal }),
  incrementTodayProgress: () => set((state) => ({ todayProgress: state.todayProgress + 1 })),
  resetTodayProgress: () => set({ todayProgress: 0 }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled })
}))