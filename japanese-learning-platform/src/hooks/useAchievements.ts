import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Achievement, UserAchievement } from '@/lib/database/types'
import {
  getAchievements,
  getAchievementsByCategory,
  getUserAchievements,
  hasUserUnlockedAchievement,
  unlockAchievement,
  getUserAchievementStats
} from '@/lib/database/functions/achievements'

export const useAchievements = (userId: string | undefined) => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [achievementStats, setAchievementStats] = useState<{
    total: number
    unlocked: number
    percentage: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true)
      try {
        const fetchedAchievements = await getAchievements()
        if (fetchedAchievements) {
          setAchievements(fetchedAchievements)
        }

        if (userId) {
          const userAchievements = await getUserAchievements(userId)
          if (userAchievements) {
            setUserAchievements(userAchievements)
          }

          const stats = await getUserAchievementStats(userId)
          if (stats) {
            setAchievementStats(stats)
          }
        }
      } catch (err) {
        setError('Failed to fetch achievements')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [userId])

  const unlockUserAchievement = async (achievementId: number) => {
    if (!userId) return null

    try {
      const unlocked = await unlockAchievement(userId, achievementId)
      if (unlocked) {
        // Update local state
        setUserAchievements(prev => [...prev, unlocked])

        // Update stats
        if (achievementStats) {
          setAchievementStats({
            ...achievementStats,
            unlocked: achievementStats.unlocked + 1,
            percentage: Math.round(((achievementStats.unlocked + 1) / achievementStats.total) * 100)
          })
        }

        return unlocked
      }
      return null
    } catch (err) {
      setError('Failed to unlock achievement')
      console.error(err)
      return null
    }
  }

  const checkAndUnlockAchievement = async (
    achievementId: number,
    condition: () => boolean | Promise<boolean>
  ) => {
    if (!userId) return false

    try {
      // Check if user already has this achievement
      const alreadyUnlocked = await hasUserUnlockedAchievement(userId, achievementId)
      if (alreadyUnlocked) return true

      // Check condition
      const conditionMet = await condition()
      if (conditionMet) {
        const unlocked = await unlockUserAchievement(achievementId)
        return !!unlocked
      }
      return false
    } catch (err) {
      console.error('Error checking and unlocking achievement:', err)
      return false
    }
  }

  const getAchievementsByCategoryFiltered = async (category: string) => {
    try {
      const categoryAchievements = await getAchievementsByCategory(category)
      return categoryAchievements
    } catch (err) {
      console.error('Error fetching achievements by category:', err)
      return null
    }
  }

  const isAchievementUnlocked = (achievementId: number): boolean => {
    return userAchievements.some(ua => ua.achievement_id === achievementId)
  }

  return {
    achievements,
    userAchievements,
    achievementStats,
    loading,
    error,
    unlockUserAchievement,
    checkAndUnlockAchievement,
    getAchievementsByCategoryFiltered,
    isAchievementUnlocked
  }
}