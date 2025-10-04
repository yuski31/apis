import { supabase } from '../../supabase/client'
import { StudySession, UserPerformance } from '../types'
import { getUserLessonProgress } from './lessons'
import { getUserReadingProgress } from './books'
import { getUserAchievements } from './achievements'

// --- Study Sessions ---

// Get study sessions for a user
export const getStudySessions = async (
  userId: string,
  limit: number = 30
): Promise<StudySession[] | null> => {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching study sessions:', error)
      return null
    }

    return data as StudySession[]
  } catch (error) {
    console.error('Error fetching study sessions:', error)
    return null
  }
}

// Get study sessions for a user within a date range
export const getStudySessionsInRange = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<StudySession[] | null> => {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: false })

    if (error) {
      console.error('Error fetching study sessions in range:', error)
      return null
    }

    return data as StudySession[]
  } catch (error) {
    console.error('Error fetching study sessions in range:', error)
    return null
  }
}

// Create a new study session
export const createStudySession = async (
  session: Omit<StudySession, 'id' | 'created_at'>
): Promise<StudySession | null> => {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert([
        {
          ...session,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating study session:', error)
      return null
    }

    return data as StudySession
  } catch (error) {
    console.error('Error creating study session:', error)
    return null
  }
}

// End a study session
export const endStudySession = async (
  sessionId: number,
  endTime: string,
  duration: number,
  activities: any
): Promise<StudySession | null> => {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .update({
        end_time: endTime,
        duration: duration,
        activities: activities,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      console.error('Error ending study session:', error)
      return null
    }

    return data as StudySession
  } catch (error) {
    console.error('Error ending study session:', error)
    return null
  }
}

// --- Analytics Dashboard Data ---

// Get user's overall learning statistics
export const getUserLearningStats = async (userId: string) => {
  try {
    // Get lesson progress
    const lessonProgress = await getUserLessonProgress(userId)

    // Get reading progress
    const readingProgress = await getUserReadingProgress(userId)

    // Get achievements
    const achievements = await getUserAchievements(userId)

    // Get recent study sessions
    const recentSessions = await getStudySessions(userId, 10)

    // Calculate statistics
    const totalLessons = lessonProgress?.length || 0
    const completedLessons = lessonProgress?.filter(lp => lp.completed_at).length || 0

    const totalBooks = readingProgress?.length || 0
    const completedBooks = readingProgress?.filter(rp => rp.completed_at).length || 0

    const totalAchievements = achievements?.length || 0

    // Calculate study time (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentStudyTime = recentSessions
      ?.filter(session => new Date(session.start_time) >= sevenDaysAgo)
      .reduce((total, session) => total + (session.duration || 0), 0) || 0

    return {
      lessons: {
        total: totalLessons,
        completed: completedLessons,
        completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      },
      reading: {
        total: totalBooks,
        completed: completedBooks,
        completionRate: totalBooks > 0 ? Math.round((completedBooks / totalBooks) * 100) : 0
      },
      achievements: {
        total: totalAchievements,
        unlocked: achievements?.filter(a => a.unlocked_at).length || 0
      },
      studyTime: {
        last7Days: Math.round(recentStudyTime / 60) // Convert to minutes
      }
    }
  } catch (error) {
    console.error('Error fetching user learning stats:', error)
    return null
  }
}

// Get daily study time for chart
export const getDailyStudyTime = async (userId: string, days: number = 30) => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const sessions = await getStudySessionsInRange(
      userId,
      startDate.toISOString(),
      endDate.toISOString()
    )

    // Group sessions by day and sum durations
    const dailyData: Record<string, number> = {}

    sessions?.forEach(session => {
      if (session.duration) {
        const date = new Date(session.start_time).toISOString().split('T')[0]
        dailyData[date] = (dailyData[date] || 0) + session.duration
      }
    })

    // Convert to array format for charting
    const result = Object.entries(dailyData).map(([date, seconds]) => ({
      date,
      minutes: Math.round(seconds / 60)
    }))

    // Sort by date
    result.sort((a, b) => a.date.localeCompare(b.date))

    return result
  } catch (error) {
    console.error('Error fetching daily study time:', error)
    return null
  }
}

// Get performance trends
export const getPerformanceTrends = async (userId: string, limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('user_performance')
      .select('*')
      .eq('user_id', userId)
      .order('last_attempt', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching performance trends:', error)
      return null
    }

    // Group by date and calculate average accuracy
    const dailyPerformance: Record<string, { count: number; totalAccuracy: number }> = {}

    data.forEach(performance => {
      if (performance.accuracy_rate !== null && performance.last_attempt) {
        const date = new Date(performance.last_attempt).toISOString().split('T')[0]
        if (!dailyPerformance[date]) {
          dailyPerformance[date] = { count: 0, totalAccuracy: 0 }
        }
        dailyPerformance[date].count += 1
        dailyPerformance[date].totalAccuracy += performance.accuracy_rate
      }
    })

    // Calculate averages
    const result = Object.entries(dailyPerformance).map(([date, stats]) => ({
      date,
      averageAccuracy: Math.round(stats.totalAccuracy / stats.count)
    }))

    // Sort by date
    result.sort((a, b) => a.date.localeCompare(b.date))

    return result
  } catch (error) {
    console.error('Error fetching performance trends:', error)
    return null
  }
}

// Get JLPT level progress
export const getJLPTProgress = async (userId: string) => {
  try {
    // This would typically aggregate data from multiple sources
    // For now, we'll return a placeholder structure
    return {
      n5: { progress: 50, total: 100 },
      n4: { progress: 30, total: 100 },
      n3: { progress: 10, total: 100 },
      n2: { progress: 5, total: 100 },
      n1: { progress: 0, total: 100 }
    }
  } catch (error) {
    console.error('Error fetching JLPT progress:', error)
    return null
  }
}