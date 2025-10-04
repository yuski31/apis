import { supabase } from '../../supabase/client'
import { ExerciseType, Exercise, UserExerciseAttempt } from '../types'

// --- Exercise Types ---

// Get all exercise types
export const getExerciseTypes = async (): Promise<ExerciseType[] | null> => {
  try {
    const { data, error } = await supabase
      .from('exercise_types')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching exercise types:', error)
      return null
    }

    return data as ExerciseType[]
  } catch (error) {
    console.error('Error fetching exercise types:', error)
    return null
  }
}

// Get exercise type by ID
export const getExerciseTypeById = async (id: number): Promise<ExerciseType | null> => {
  try {
    const { data, error } = await supabase
      .from('exercise_types')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching exercise type:', error)
      return null
    }

    return data as ExerciseType
  } catch (error) {
    console.error('Error fetching exercise type:', error)
    return null
  }
}

// Create a new exercise type
export const createExerciseType = async (
  exerciseType: Omit<ExerciseType, 'id' | 'created_at'>
): Promise<ExerciseType | null> => {
  try {
    const { data, error } = await supabase
      .from('exercise_types')
      .insert([
        {
          ...exerciseType,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating exercise type:', error)
      return null
    }

    return data as ExerciseType
  } catch (error) {
    console.error('Error creating exercise type:', error)
    return null
  }
}

// --- Exercises ---

// Get all exercises
export const getExercises = async (): Promise<Exercise[] | null> => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select(`
        *,
        exercise_type:exercise_types(name, description)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching exercises:', error)
      return null
    }

    return data as Exercise[]
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return null
  }
}

// Get exercises by type
export const getExercisesByType = async (typeId: number): Promise<Exercise[] | null> => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select(`
        *,
        exercise_type:exercise_types(name, description)
      `)
      .eq('exercise_type_id', typeId)
      .order('difficulty_level', { ascending: true })

    if (error) {
      console.error('Error fetching exercises by type:', error)
      return null
    }

    return data as Exercise[]
  } catch (error) {
    console.error('Error fetching exercises by type:', error)
    return null
  }
}

// Get exercises by JLPT level
export const getExercisesByJLPTLevel = async (level: number): Promise<Exercise[] | null> => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select(`
        *,
        exercise_type:exercise_types(name, description)
      `)
      .eq('jlpt_level', level)
      .order('difficulty_level', { ascending: true })

    if (error) {
      console.error('Error fetching exercises by JLPT level:', error)
      return null
    }

    return data as Exercise[]
  } catch (error) {
    console.error('Error fetching exercises by JLPT level:', error)
    return null
  }
}

// Get exercise by ID
export const getExerciseById = async (id: number): Promise<Exercise | null> => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select(`
        *,
        exercise_type:exercise_types(name, description)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching exercise:', error)
      return null
    }

    return data as Exercise
  } catch (error) {
    console.error('Error fetching exercise:', error)
    return null
  }
}

// Create a new exercise
export const createExercise = async (
  exercise: Omit<Exercise, 'id' | 'created_at'>
): Promise<Exercise | null> => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .insert([
        {
          ...exercise,
          created_at: new Date().toISOString()
        }
      ])
      .select(`
        *,
        exercise_type:exercise_types(name, description)
      `)
      .single()

    if (error) {
      console.error('Error creating exercise:', error)
      return null
    }

    return data as Exercise
  } catch (error) {
    console.error('Error creating exercise:', error)
    return null
  }
}

// Update an exercise
export const updateExercise = async (
  id: number,
  updates: Partial<Exercise>
): Promise<Exercise | null> => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        exercise_type:exercise_types(name, description)
      `)
      .single()

    if (error) {
      console.error('Error updating exercise:', error)
      return null
    }

    return data as Exercise
  } catch (error) {
    console.error('Error updating exercise:', error)
    return null
  }
}

// Delete an exercise
export const deleteExercise = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting exercise:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting exercise:', error)
    return false
  }
}

// --- User Exercise Attempts ---

// Get user's exercise attempts
export const getUserExerciseAttempts = async (
  userId: string,
  exerciseId?: number
): Promise<UserExerciseAttempt[] | null> => {
  try {
    let query = supabase
      .from('user_exercise_attempts')
      .select('*')
      .eq('user_id', userId)

    if (exerciseId) {
      query = query.eq('exercise_id', exerciseId)
    }

    query = query.order('started_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching user exercise attempts:', error)
      return null
    }

    return data as UserExerciseAttempt[]
  } catch (error) {
    console.error('Error fetching user exercise attempts:', error)
    return null
  }
}

// Get user's recent exercise attempts (last N attempts)
export const getRecentUserExerciseAttempts = async (
  userId: string,
  limit: number = 10
): Promise<UserExerciseAttempt[] | null> => {
  try {
    const { data, error } = await supabase
      .from('user_exercise_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent user exercise attempts:', error)
      return null
    }

    return data as UserExerciseAttempt[]
  } catch (error) {
    console.error('Error fetching recent user exercise attempts:', error)
    return null
  }
}

// Record a new exercise attempt
export const recordExerciseAttempt = async (
  attempt: Omit<UserExerciseAttempt, 'id' | 'created_at'>
): Promise<UserExerciseAttempt | null> => {
  try {
    const { data, error } = await supabase
      .from('user_exercise_attempts')
      .insert([
        {
          ...attempt,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error recording exercise attempt:', error)
      return null
    }

    return data as UserExerciseAttempt
  } catch (error) {
    console.error('Error recording exercise attempt:', error)
    return null
  }
}

// Update an exercise attempt (when exercise is completed)
export const updateExerciseAttempt = async (
  id: number,
  updates: Partial<UserExerciseAttempt>
): Promise<UserExerciseAttempt | null> => {
  try {
    const { data, error } = await supabase
      .from('user_exercise_attempts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating exercise attempt:', error)
      return null
    }

    return data as UserExerciseAttempt
  } catch (error) {
    console.error('Error updating exercise attempt:', error)
    return null
  }
}

// Get exercise statistics for a user
export const getUserExerciseStats = async (userId: string) => {
  try {
    // Get total attempts
    const { count: totalAttempts, error: countError } = await supabase
      .from('user_exercise_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) {
      console.error('Error fetching total attempts:', countError)
      return null
    }

    // Get correct attempts
    const { count: correctAttempts, error: correctError } = await supabase
      .from('user_exercise_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_correct', true)

    if (correctError) {
      console.error('Error fetching correct attempts:', correctError)
      return null
    }

    // Get average score
    const { data: scoreData, error: scoreError } = await supabase
      .from('user_exercise_attempts')
      .select('score')
      .eq('user_id', userId)
      .not('score', 'is', null)

    if (scoreError) {
      console.error('Error fetching scores:', scoreError)
      return null
    }

    const averageScore = scoreData.length > 0
      ? scoreData.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / scoreData.length
      : 0

    // Get average time taken
    const { data: timeData, error: timeError } = await supabase
      .from('user_exercise_attempts')
      .select('time_taken')
      .eq('user_id', userId)
      .not('time_taken', 'is', null)

    if (timeError) {
      console.error('Error fetching time data:', timeError)
      return null
    }

    const averageTime = timeData.length > 0
      ? timeData.reduce((sum, attempt) => sum + (attempt.time_taken || 0), 0) / timeData.length
      : 0

    return {
      totalAttempts: totalAttempts || 0,
      correctAttempts: correctAttempts || 0,
      accuracyRate: totalAttempts
        ? Math.round(((correctAttempts || 0) / totalAttempts) * 100)
        : 0,
      averageScore: Math.round(averageScore * 100) / 100,
      averageTime: Math.round(averageTime)
    }
  } catch (error) {
    console.error('Error fetching user exercise stats:', error)
    return null
  }
}