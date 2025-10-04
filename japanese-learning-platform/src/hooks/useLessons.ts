import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { LessonModule, LessonItem, UserLessonProgress } from '@/lib/database/types'
import {
  getLessonModules,
  getLessonModulesByJLPTLevel,
  getLessonModuleById,
  getLessonItemsByModule,
  getUserLessonProgress,
  getUserProgressForModule,
  updateUserLessonProgress,
  completeLessonModule
} from '@/lib/database/functions/lessons'

export const useLessons = (userId: string | undefined) => {
  const [modules, setModules] = useState<LessonModule[]>([])
  const [selectedModule, setSelectedModule] = useState<LessonModule | null>(null)
  const [moduleItems, setModuleItems] = useState<LessonItem[]>([])
  const [userProgress, setUserProgress] = useState<UserLessonProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true)
      try {
        const fetchedModules = await getLessonModules()
        if (fetchedModules) {
          setModules(fetchedModules)
        }

        if (userId) {
          const progress = await getUserLessonProgress(userId)
          if (progress) {
            setUserProgress(progress)
          }
        }
      } catch (err) {
        setError('Failed to fetch lessons')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [userId])

  const fetchModuleDetails = async (moduleId: number) => {
    try {
      const module = await getLessonModuleById(moduleId)
      if (module) {
        setSelectedModule(module)

        const items = await getLessonItemsByModule(moduleId)
        if (items) {
          setModuleItems(items)
        }

        if (userId) {
          const progress = await getUserProgressForModule(userId, moduleId)
          if (progress) {
            // Update user progress state
            setUserProgress(prev => {
              const existingIndex = prev.findIndex(p => p.lesson_module_id === moduleId)
              if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex] = progress
                return updated
              }
              return [...prev, progress]
            })
          }
        }
      }
    } catch (err) {
      setError('Failed to fetch module details')
      console.error(err)
    }
  }

  const getModuleProgress = (moduleId: number): UserLessonProgress | undefined => {
    return userProgress.find(progress => progress.lesson_module_id === moduleId)
  }

  const updateProgress = async (
    moduleId: number,
    updates: Partial<UserLessonProgress>
  ) => {
    if (!userId) return null

    try {
      const progress = await updateUserLessonProgress(userId, moduleId, updates)
      if (progress) {
        // Update local state
        setUserProgress(prev => {
          const existingIndex = prev.findIndex(p => p.lesson_module_id === moduleId)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = progress
            return updated
          }
          return [...prev, progress]
        })
      }
      return progress
    } catch (err) {
      setError('Failed to update progress')
      console.error(err)
      return null
    }
  }

  const completeModule = async (moduleId: number, quizScore?: number) => {
    if (!userId) return null

    try {
      const progress = await completeLessonModule(userId, moduleId, quizScore)
      if (progress) {
        // Update local state
        setUserProgress(prev => {
          const existingIndex = prev.findIndex(p => p.lesson_module_id === moduleId)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = progress
            return updated
          }
          return [...prev, progress]
        })
      }
      return progress
    } catch (err) {
      setError('Failed to complete module')
      console.error(err)
      return null
    }
  }

  return {
    modules,
    selectedModule,
    moduleItems,
    userProgress,
    loading,
    error,
    fetchModuleDetails,
    getModuleProgress,
    updateProgress,
    completeModule
  }
}