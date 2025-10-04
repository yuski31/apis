import { supabase } from '../../supabase/client'
import { Character } from '../types'

// Get all characters
export const getCharacters = async (): Promise<Character[] | null> => {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .order('jlpt_level', { ascending: true })
      .order('frequency_rank', { ascending: true })

    if (error) {
      console.error('Error fetching characters:', error)
      return null
    }

    return data as Character[]
  } catch (error) {
    console.error('Error fetching characters:', error)
    return null
  }
}

// Get characters by type
export const getCharactersByType = async (type: 'hiragana' | 'katakana' | 'kanji'): Promise<Character[] | null> => {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('type', type)
      .order('jlpt_level', { ascending: true })
      .order('frequency_rank', { ascending: true })

    if (error) {
      console.error(`Error fetching ${type}:`, error)
      return null
    }

    return data as Character[]
  } catch (error) {
    console.error(`Error fetching ${type}:`, error)
    return null
  }
}

// Get characters by JLPT level
export const getCharactersByJLPTLevel = async (level: number): Promise<Character[] | null> => {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('jlpt_level', level)
      .order('frequency_rank', { ascending: true })

    if (error) {
      console.error(`Error fetching JLPT N${level} characters:`, error)
      return null
    }

    return data as Character[]
  } catch (error) {
    console.error(`Error fetching JLPT N${level} characters:`, error)
    return null
  }
}

// Get character by ID
export const getCharacterById = async (id: number): Promise<Character | null> => {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching character:', error)
      return null
    }

    return data as Character
  } catch (error) {
    console.error('Error fetching character:', error)
    return null
  }
}

// Search characters by character string
export const searchCharacters = async (searchTerm: string): Promise<Character[] | null> => {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .ilike('character', `%${searchTerm}%`)
      .order('jlpt_level', { ascending: true })

    if (error) {
      console.error('Error searching characters:', error)
      return null
    }

    return data as Character[]
  } catch (error) {
    console.error('Error searching characters:', error)
    return null
  }
}

// Create a new character
export const createCharacter = async (character: Omit<Character, 'id' | 'created_at'>): Promise<Character | null> => {
  try {
    const { data, error } = await supabase
      .from('characters')
      .insert([
        {
          ...character,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating character:', error)
      return null
    }

    return data as Character
  } catch (error) {
    console.error('Error creating character:', error)
    return null
  }
}

// Update a character
export const updateCharacter = async (id: number, updates: Partial<Character>): Promise<Character | null> => {
  try {
    const { data, error } = await supabase
      .from('characters')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating character:', error)
      return null
    }

    return data as Character
  } catch (error) {
    console.error('Error updating character:', error)
    return null
  }
}

// Delete a character
export const deleteCharacter = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting character:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting character:', error)
    return false
  }
}