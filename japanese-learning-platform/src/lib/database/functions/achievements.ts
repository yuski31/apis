import { supabase } from '../../supabase/client'
import { Achievement, UserAchievement } from '../types'

// Get all achievements
export const getAchievements = async (): Promise<Achievement[] | null> => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching achievements:', error)
      return null
    }

    return data as Achievement[]
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return null
  }
}

// Get achievement by ID
export const getAchievementById = async (id: number): Promise<Achievement | null> => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching achievement:', error)
      return null
    }

    return data as Achievement
  } catch (error) {
    console.error('Error fetching achievement:', error)
    return null
  }
}

// Get achievements by category
export const getAchievementsByCategory = async (category: string): Promise<Achievement[] | null> => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching achievements by category:', error)
      return null
    }

    return data as Achievement[]
  } catch (error) {
    console.error('Error fetching achievements by category:', error)
    return null
  }
}

// Create a new achievement
export const createAchievement = async (
  achievement: Omit<Achievement, 'id' | 'created_at'>
): Promise<Achievement | null> => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .insert([
        {
          ...achievement,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating achievement:', error)
      return null
    }

    return data as Achievement
  } catch (error) {
    console.error('Error creating achievement:', error)
    return null
  }
}

// Update an achievement
export const updateAchievement = async (
  id: number,
  updates: Partial<Achievement>
): Promise<Achievement | null> => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating achievement:', error)
      return null
    }

    return data as Achievement
  } catch (error) {
    console.error('Error updating achievement:', error)
    return null
  }
}

// Delete an achievement
export const deleteAchievement = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting achievement:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting achievement:', error)
    return false
  }
}

// Get user's achievements
export const getUserAchievements = async (userId: string): Promise<UserAchievement[] | null> => {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })

    if (error) {
      console.error('Error fetching user achievements:', error)
      return null
    }

    return data as UserAchievement[]
  } catch (error) {
    console.error('Error fetching user achievements:', error)
    return null
  }
}

// Check if user has unlocked an achievement
export const hasUserUnlockedAchievement = async (
  userId: string,
  achievementId: number
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single()

    if (error) {
      // If error is because no record found, user hasn't unlocked achievement
      if (error.code === 'PGRST116') {
        return false
      }
      console.error('Error checking user achievement:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error checking user achievement:', error)
    return false
  }
}

// Unlock achievement for user
export const unlockAchievement = async (
  userId: string,
  achievementId: number
): Promise<UserAchievement | null> => {
  try {
    // Check if user already has this achievement
    const alreadyUnlocked = await hasUserUnlockedAchievement(userId, achievementId)
    if (alreadyUnlocked) {
      return null // Already unlocked
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .insert([
        {
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ])
      .select(`
        *,
        achievement:achievements(*)
      `)
      .single()

    if (error) {
      console.error('Error unlocking achievement:', error)
      return null
    }

    return data as UserAchievement
  } catch (error) {
    console.error('Error unlocking achievement:', error)
    return null
  }
}

// Get user's achievement statistics
export const getUserAchievementStats = async (userId: string) => {
  try {
    // Get total achievements
    const { count: totalAchievements, error: totalError } = await supabase
      .from('achievements')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('Error fetching total achievements:', totalError)
      return null
    }

    // Get user's unlocked achievements
    const { count: unlockedAchievements, error: unlockedError } = await supabase
      .from('user_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (unlockedError) {
      console.error('Error fetching unlocked achievements:', unlockedError)
      return null
    }

    return {
      total: totalAchievements || 0,
      unlocked: unlockedAchievements || 0,
      percentage: totalAchievements
        ? Math.round(((unlockedAchievements || 0) / totalAchievements) * 100)
        : 0
    }
  } catch (error) {
    console.error('Error fetching user achievement stats:', error)
    return null
  }
}