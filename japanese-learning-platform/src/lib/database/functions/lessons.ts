import { supabase } from '../../supabase/client'
import { LessonModule, LessonItem, UserLessonProgress } from '../types'

// Get all lesson modules
export const getLessonModules = async (): Promise<LessonModule[] | null> => {
  try {
    const { data, error } = await supabase
      .from('lesson_modules')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('jlpt_level', { ascending: true })

    if (error) {
      console.error('Error fetching lesson modules:', error)
      return null
    }

    return data as LessonModule[]
  } catch (error) {
    console.error('Error fetching lesson modules:', error)
    return null
  }
}

// Get lesson modules by JLPT level
export const getLessonModulesByJLPTLevel = async (level: number): Promise<LessonModule[] | null> => {
  try {
    const { data, error } = await supabase
      .from('lesson_modules')
      .select('*')
      .eq('jlpt_level', level)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error(`Error fetching JLPT N${level} lesson modules:`, error)
      return null
    }

    return data as LessonModule[]
  } catch (error) {
    console.error(`Error fetching JLPT N${level} lesson modules:`, error)
    return null
  }
}

// Get lesson module by ID
export const getLessonModuleById = async (id: number): Promise<LessonModule | null> => {
  try {
    const { data, error } = await supabase
      .from('lesson_modules')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching lesson module:', error)
      return null
    }

    return data as LessonModule
  } catch (error) {
    console.error('Error fetching lesson module:', error)
    return null
  }
}

// Create a new lesson module
export const createLessonModule = async (
  lessonModule: Omit<LessonModule, 'id' | 'created_at' | 'updated_at'>
): Promise<LessonModule | null> => {
  try {
    const { data, error } = await supabase
      .from('lesson_modules')
      .insert([
        {
          ...lessonModule,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating lesson module:', error)
      return null
    }

    return data as LessonModule
  } catch (error) {
    console.error('Error creating lesson module:', error)
    return null
  }
}

// Update a lesson module
export const updateLessonModule = async (
  id: number,
  updates: Partial<LessonModule>
): Promise<LessonModule | null> => {
  try {
    const { data, error } = await supabase
      .from('lesson_modules')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lesson module:', error)
      return null
    }

    return data as LessonModule
  } catch (error) {
    console.error('Error updating lesson module:', error)
    return null
  }
}

// Delete a lesson module
export const deleteLessonModule = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lesson_modules')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting lesson module:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting lesson module:', error)
    return false
  }
}

// Get lesson items for a module
export const getLessonItemsByModule = async (moduleId: number): Promise<LessonItem[] | null> => {
  try {
    const { data, error } = await supabase
      .from('lesson_items')
      .select('*')
      .eq('lesson_module_id', moduleId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching lesson items:', error)
      return null
    }

    return data as LessonItem[]
  } catch (error) {
    console.error('Error fetching lesson items:', error)
    return null
  }
}

// Get lesson item by ID
export const getLessonItemById = async (id: number): Promise<LessonItem | null> => {
  try {
    const { data, error } = await supabase
      .from('lesson_items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching lesson item:', error)
      return null
    }

    return data as LessonItem
  } catch (error) {
    console.error('Error fetching lesson item:', error)
    return null
  }
}

// Create a new lesson item
export const createLessonItem = async (
  lessonItem: Omit<LessonItem, 'id' | 'created_at'>
): Promise<LessonItem | null> => {
  try {
    const { data, error } = await supabase
      .from('lesson_items')
      .insert([
        {
          ...lessonItem,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating lesson item:', error)
      return null
    }

    return data as LessonItem
  } catch (error) {
    console.error('Error creating lesson item:', error)
    return null
  }
}

// Update a lesson item
export const updateLessonItem = async (
  id: number,
  updates: Partial<LessonItem>
): Promise<LessonItem | null> => {
  try {
    const { data, error } = await supabase
      .from('lesson_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lesson item:', error)
      return null
    }

    return data as LessonItem
  } catch (error) {
    console.error('Error updating lesson item:', error)
    return null
  }
}

// Delete a lesson item
export const deleteLessonItem = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lesson_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting lesson item:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting lesson item:', error)
    return false
  }
}

// Get user lesson progress
export const getUserLessonProgress = async (
  userId: string,
  moduleId?: number
): Promise<UserLessonProgress[] | null> => {
  try {
    let query = supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)

    if (moduleId) {
      query = query.eq('lesson_module_id', moduleId)
    }

    const { data, error } = await query.order('started_at', { ascending: false })

    if (error) {
      console.error('Error fetching user lesson progress:', error)
      return null
    }

    return data as UserLessonProgress[]
  } catch (error) {
    console.error('Error fetching user lesson progress:', error)
    return null
  }
}

// Get user progress for a specific module
export const getUserProgressForModule = async (
  userId: string,
  moduleId: number
): Promise<UserLessonProgress | null> => {
  try {
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_module_id', moduleId)
      .single()

    if (error) {
      console.error('Error fetching user progress for module:', error)
      return null
    }

    return data as UserLessonProgress
  } catch (error) {
    console.error('Error fetching user progress for module:', error)
    return null
  }
}

// Create or update user lesson progress
export const updateUserLessonProgress = async (
  userId: string,
  moduleId: number,
  updates: Partial<UserLessonProgress>
): Promise<UserLessonProgress | null> => {
  try {
    // Check if progress record exists
    const existingProgress = await getUserProgressForModule(userId, moduleId)

    let progressRecord: UserLessonProgress

    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user lesson progress:', error)
        return null
      }

      progressRecord = data as UserLessonProgress
    } else {
      // Create new progress record
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .insert([
          {
            user_id: userId,
            lesson_module_id: moduleId,
            started_at: new Date().toISOString(),
            ...updates,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating user lesson progress:', error)
        return null
      }

      progressRecord = data as UserLessonProgress
    }

    return progressRecord
  } catch (error) {
    console.error('Error updating user lesson progress:', error)
    return null
  }
}

// Mark lesson module as completed
export const completeLessonModule = async (
  userId: string,
  moduleId: number,
  quizScore?: number
): Promise<UserLessonProgress | null> => {
  try {
    const completionTime = new Date().toISOString()

    const progress = await updateUserLessonProgress(userId, moduleId, {
      completed_at: completionTime,
      completion_percentage: 100,
      quiz_score: quizScore
    })

    return progress
  } catch (error) {
    console.error('Error completing lesson module:', error)
    return null
  }
}