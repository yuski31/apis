import { useState, useEffect } from 'react'
import {
  getUserLearningStats,
  getDailyStudyTime,
  getPerformanceTrends,
  getJLPTProgress,
  createStudySession,
  endStudySession
} from '@/lib/database/functions/analytics'

export const useAnalytics = (userId: string | undefined) => {
  const [learningStats, setLearningStats] = useState<any>(null)
  const [dailyStudyTime, setDailyStudyTime] = useState<any[]>([])
  const [performanceTrends, setPerformanceTrends] = useState<any[]>([])
  const [jlptProgress, setJlptProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const [stats, dailyTime, trends, jlpt] = await Promise.all([
          getUserLearningStats(userId),
          getDailyStudyTime(userId),
          getPerformanceTrends(userId),
          getJLPTProgress(userId)
        ])

        setLearningStats(stats)
        setDailyStudyTime(dailyTime || [])
        setPerformanceTrends(trends || [])
        setJlptProgress(jlpt)
      } catch (err) {
        setError('Failed to fetch analytics data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [userId])

  // Study session tracking
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [sessionActivities, setSessionActivities] = useState<any[]>([])

  const startStudySession = async () => {
    if (!userId) return

    try {
      const session = await createStudySession({
        user_id: userId,
        start_time: new Date().toISOString(),
        activities: []
      })

      if (session) {
        setCurrentSessionId(session.id)
        setSessionStartTime(new Date(session.start_time))
        setSessionActivities([])
      }
    } catch (err) {
      console.error('Error starting study session:', err)
    }
  }

  const endStudySessionTracking = async () => {
    if (!currentSessionId || !sessionStartTime) return

    try {
      const endTime = new Date()
      const duration = Math.floor((endTime.getTime() - sessionStartTime.getTime()) / 1000) // in seconds

      await endStudySession(
        currentSessionId,
        endTime.toISOString(),
        duration,
        sessionActivities
      )

      setCurrentSessionId(null)
      setSessionStartTime(null)
      setSessionActivities([])
    } catch (err) {
      console.error('Error ending study session:', err)
    }
  }

  const addActivityToSession = (activity: any) => {
    setSessionActivities(prev => [...prev, activity])
  }

  return {
    learningStats,
    dailyStudyTime,
    performanceTrends,
    jlptProgress,
    loading,
    error,
    startStudySession,
    endStudySessionTracking,
    addActivityToSession,
    isInStudySession: !!currentSessionId
  }
}