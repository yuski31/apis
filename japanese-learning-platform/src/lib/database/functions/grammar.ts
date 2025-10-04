import { supabase } from '../../supabase/client'
import { GrammarPoint } from '../types'

// Get all grammar points
export const getGrammarPoints = async (): Promise<GrammarPoint[] | null> => {
  try {
    const { data, error } = await supabase
      .from('grammar_points')
      .select('*')
      .order('jlpt_level', { ascending: true })

    if (error) {
      console.error('Error fetching grammar points:', error)
      return null
    }

    return data as GrammarPoint[]
  } catch (error) {
    console.error('Error fetching grammar points:', error)
    return null
  }
}

// Get grammar points by JLPT level
export const getGrammarPointsByJLPTLevel = async (level: number): Promise<GrammarPoint[] | null> => {
  try {
    const { data, error } = await supabase
      .from('grammar_points')
      .select('*')
      .eq('jlpt_level', level)
      .order('id', { ascending: true })

    if (error) {
      console.error(`Error fetching JLPT N${level} grammar points:`, error)
      return null
    }

    return data as GrammarPoint[]
  } catch (error) {
    console.error(`Error fetching JLPT N${level} grammar points:`, error)
    return null
  }
}

// Get grammar point by ID
export const getGrammarPointById = async (id: number): Promise<GrammarPoint | null> => {
  try {
    const { data, error } = await supabase
      .from('grammar_points')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching grammar point:', error)
      return null
    }

    return data as GrammarPoint
  } catch (error) {
    console.error('Error fetching grammar point:', error)
    return null
  }
}

// Search grammar points by title or structure
export const searchGrammarPoints = async (searchTerm: string): Promise<GrammarPoint[] | null> => {
  try {
    const { data, error } = await supabase
      .from('grammar_points')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,structure.ilike.%${searchTerm}%`)
      .order('jlpt_level', { ascending: true })

    if (error) {
      console.error('Error searching grammar points:', error)
      return null
    }

    return data as GrammarPoint[]
  } catch (error) {
    console.error('Error searching grammar points:', error)
    return null
  }
}

// Create a new grammar point
export const createGrammarPoint = async (grammarPoint: Omit<GrammarPoint, 'id' | 'created_at'>): Promise<GrammarPoint | null> => {
  try {
    const { data, error } = await supabase
      .from('grammar_points')
      .insert([
        {
          ...grammarPoint,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating grammar point:', error)
      return null
    }

    return data as GrammarPoint
  } catch (error) {
    console.error('Error creating grammar point:', error)
    return null
  }
}

// Update a grammar point
export const updateGrammarPoint = async (id: number, updates: Partial<GrammarPoint>): Promise<GrammarPoint | null> => {
  try {
    const { data, error } = await supabase
      .from('grammar_points')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating grammar point:', error)
      return null
    }

    return data as GrammarPoint
  } catch (error) {
    console.error('Error updating grammar point:', error)
    return null
  }
}

// Delete a grammar point
export const deleteGrammarPoint = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('grammar_points')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting grammar point:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting grammar point:', error)
    return false
  }
}