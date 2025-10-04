import { useState, useEffect } from 'react'
import { Exercise, ExerciseType, UserExerciseAttempt } from '@/lib/database/types'
import {
  getExerciseTypes,
  getExercises,
  getExercisesByType,
  getExercisesByJLPTLevel,
  getExerciseById,
  getUserExerciseAttempts,
  recordExerciseAttempt,
  updateExerciseAttempt,
  getUserExerciseStats
} from '@/lib/database/functions/exercises'

export const useExercises = (userId: string | undefined) => {
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [userAttempts, setUserAttempts] = useState<UserExerciseAttempt[]>([])
  const [exerciseStats, setExerciseStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExercisesData = async () => {
      setLoading(true)
      try {
        const [types, allExercises] = await Promise.all([
          getExerciseTypes(),
          getExercises()
        ])

        if (types) {
          setExerciseTypes(types)
        }

        if (allExercises) {
          setExercises(allExercises)
        }

        if (userId) {
          const [attempts, stats] = await Promise.all([
            getUserExerciseAttempts(userId),
            getUserExerciseStats(userId)
          ])

          if (attempts) {
            setUserAttempts(attempts)
          }

          if (stats) {
            setExerciseStats(stats)
          }
        }
      } catch (err) {
        setError('Failed to fetch exercises data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchExercisesData()
  }, [userId])

  const getExercisesByTypeFiltered = async (typeId: number) => {
    try {
      const exercises = await getExercisesByType(typeId)
      return exercises
    } catch (err) {
      console.error('Error fetching exercises by type:', err)
      return null
    }
  }

  const getExercisesByJLPTLevelFiltered = async (level: number) => {
    try {
      const exercises = await getExercisesByJLPTLevel(level)
      return exercises
    } catch (err) {
      console.error('Error fetching exercises by JLPT level:', err)
      return null
    }
  }

  const startExerciseAttempt = async (exerciseId: number) => {
    if (!userId) return null

    try {
      const attempt = await recordExerciseAttempt({
        user_id: userId,
        exercise_id: exerciseId,
        started_at: new Date().toISOString(),
        time_taken: 0,
        score: 0,
        is_correct: false,
        user_answer: ''
      })

      if (attempt) {
        setUserAttempts(prev => [attempt, ...prev])
        return attempt
      }
      return null
    } catch (err) {
      setError('Failed to start exercise attempt')
      console.error(err)
      return null
    }
  }

  const completeExerciseAttempt = async (
    attemptId: number,
    updates: Partial<UserExerciseAttempt>
  ) => {
    try {
      const updatedAttempt = await updateExerciseAttempt(attemptId, {
        ...updates,
        completed_at: new Date().toISOString()
      })

      if (updatedAttempt) {
        setUserAttempts(prev =>
          prev.map(attempt =>
            attempt.id === attemptId ? updatedAttempt : attempt
          )
        )

        // Refresh stats
        if (userId) {
          const stats = await getUserExerciseStats(userId)
          if (stats) {
            setExerciseStats(stats)
          }
        }

        return updatedAttempt
      }
      return null
    } catch (err) {
      setError('Failed to complete exercise attempt')
      console.error(err)
      return null
    }
  }

  return {
    exerciseTypes,
    exercises,
    userAttempts,
    exerciseStats,
    loading,
    error,
    getExercisesByTypeFiltered,
    getExercisesByJLPTLevelFiltered,
    startExerciseAttempt,
    completeExerciseAttempt
  }
}