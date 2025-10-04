import { supabase } from '../../supabase/client'
import { SRSCard, UserPerformance } from '../types'

// Get SRS cards for a user
export const getUserSRSCards = async (userId: string): Promise<SRSCard[] | null> => {
  try {
    const { data, error } = await supabase
      .from('srs_cards')
      .select('*')
      .eq('user_id', userId)
      .order('next_review', { ascending: true })

    if (error) {
      console.error('Error fetching SRS cards:', error)
      return null
    }

    return data as SRSCard[]
  } catch (error) {
    console.error('Error fetching SRS cards:', error)
    return null
  }
}

// Get due SRS cards for a user (cards that need review now)
export const getDueSRSCards = async (userId: string): Promise<SRSCard[] | null> => {
  try {
    const { data, error } = await supabase
      .from('srs_cards')
      .select('*')
      .eq('user_id', userId)
      .lte('next_review', new Date().toISOString())
      .order('next_review', { ascending: true })

    if (error) {
      console.error('Error fetching due SRS cards:', error)
      return null
    }

    return data as SRSCard[]
  } catch (error) {
    console.error('Error fetching due SRS cards:', error)
    return null
  }
}

// Get SRS card by ID
export const getSRSCardById = async (id: number): Promise<SRSCard | null> => {
  try {
    const { data, error } = await supabase
      .from('srs_cards')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching SRS card:', error)
      return null
    }

    return data as SRSCard
  } catch (error) {
    console.error('Error fetching SRS card:', error)
    return null
  }
}

// Get SRS card by user, content type, and content ID
export const getSRSCardByContent = async (
  userId: string,
  contentType: 'character' | 'word' | 'grammar',
  contentId: number
): Promise<SRSCard | null> => {
  try {
    const { data, error } = await supabase
      .from('srs_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single()

    if (error) {
      console.error('Error fetching SRS card by content:', error)
      return null
    }

    return data as SRSCard
  } catch (error) {
    console.error('Error fetching SRS card by content:', error)
    return null
  }
}

// Create a new SRS card
export const createSRSCard = async (
  card: Omit<SRSCard, 'id' | 'created_at' | 'updated_at'>
): Promise<SRSCard | null> => {
  try {
    const { data, error } = await supabase
      .from('srs_cards')
      .insert([
        {
          ...card,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating SRS card:', error)
      return null
    }

    return data as SRSCard
  } catch (error) {
    console.error('Error creating SRS card:', error)
    return null
  }
}

// Update an SRS card (used when reviewing items)
export const updateSRSCard = async (
  id: number,
  updates: Partial<SRSCard>
): Promise<SRSCard | null> => {
  try {
    const { data, error } = await supabase
      .from('srs_cards')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating SRS card:', error)
      return null
    }

    return data as SRSCard
  } catch (error) {
    console.error('Error updating SRS card:', error)
    return null
  }
}

// Delete an SRS card
export const deleteSRSCard = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('srs_cards')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting SRS card:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting SRS card:', error)
    return false
  }
}

// SRS Algorithm Implementation (Modified SM-2)
export const calculateSM2 = (
  quality: number, // 0-5 rating from user
  repetitions: number,
  easeFactor: number,
  interval: number
): { interval: number; repetitions: number; easeFactor: number } => {
  // Quality rating:
  // 0 - Complete blackout
  // 1 - Incorrect response
  // 2 - Incorrect response with hesitation
  // 3 - Correct response with difficulty
  // 4 - Correct response with slight hesitation
  // 5 - Perfect response

  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  // Ensure ease factor doesn't drop below 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3
  }

  let newRepetitions = repetitions
  let newInterval = interval

  if (quality < 3) {
    // Review again today if quality is poor
    newRepetitions = 0
    newInterval = 1
  } else {
    newRepetitions = repetitions + 1

    if (newRepetitions === 1) {
      newInterval = 1
    } else if (newRepetitions === 2) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * newEaseFactor)
    }
  }

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor
  }
}

// Get user performance data
export const getUserPerformance = async (
  userId: string,
  contentType?: 'character' | 'word' | 'grammar',
  contentId?: number
): Promise<UserPerformance[] | null> => {
  try {
    let query = supabase
      .from('user_performance')
      .select('*')
      .eq('user_id', userId)

    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    if (contentId !== undefined) {
      query = query.eq('content_id', contentId)
    }

    const { data, error } = await query.order('last_attempt', { ascending: false })

    if (error) {
      console.error('Error fetching user performance:', error)
      return null
    }

    return data as UserPerformance[]
  } catch (error) {
    console.error('Error fetching user performance:', error)
    return null
  }
}

// Update user performance data
export const updateUserPerformance = async (
  userId: string,
  contentType: 'character' | 'word' | 'grammar',
  contentId: number,
  isCorrect: boolean,
  responseTime: number
): Promise<UserPerformance | null> => {
  try {
    // First, check if performance record exists
    const { data: existingData, error: fetchError } = await supabase
      .from('user_performance')
      .select('*')
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single()

    let performanceRecord: UserPerformance

    if (fetchError || !existingData) {
      // Create new performance record
      const { data, error } = await supabase
        .from('user_performance')
        .insert([
          {
            user_id: userId,
            content_type: contentType,
            content_id: contentId,
            attempts: 1,
            correct_attempts: isCorrect ? 1 : 0,
            last_attempt: new Date().toISOString(),
            accuracy_rate: isCorrect ? 100 : 0,
            avg_response_time: responseTime,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating user performance record:', error)
        return null
      }

      performanceRecord = data as UserPerformance
    } else {
      // Update existing performance record
      const attempts = existingData.attempts + 1
      const correctAttempts = existingData.correct_attempts + (isCorrect ? 1 : 0)
      const accuracyRate = (correctAttempts / attempts) * 100
      const totalResponseTime = (existingData.avg_response_time * existingData.attempts) + responseTime
      const avgResponseTime = totalResponseTime / attempts

      const { data, error } = await supabase
        .from('user_performance')
        .update({
          attempts,
          correct_attempts: correctAttempts,
          last_attempt: new Date().toISOString(),
          accuracy_rate: parseFloat(accuracyRate.toFixed(2)),
          avg_response_time: parseFloat(avgResponseTime.toFixed(2)),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user performance record:', error)
        return null
      }

      performanceRecord = data as UserPerformance
    }

    return performanceRecord
  } catch (error) {
    console.error('Error updating user performance:', error)
    return null
  }
}