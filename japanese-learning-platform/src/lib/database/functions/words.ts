import { supabase } from '../../supabase/client'
import { Word } from '../types'

// Get all words
export const getWords = async (): Promise<Word[] | null> => {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .order('jlpt_level', { ascending: true })
      .order('frequency_rank', { ascending: true })

    if (error) {
      console.error('Error fetching words:', error)
      return null
    }

    return data as Word[]
  } catch (error) {
    console.error('Error fetching words:', error)
    return null
  }
}

// Get words by JLPT level
export const getWordsByJLPTLevel = async (level: number): Promise<Word[] | null> => {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('jlpt_level', level)
      .order('frequency_rank', { ascending: true })

    if (error) {
      console.error(`Error fetching JLPT N${level} words:`, error)
      return null
    }

    return data as Word[]
  } catch (error) {
    console.error(`Error fetching JLPT N${level} words:`, error)
    return null
  }
}

// Get word by ID
export const getWordById = async (id: number): Promise<Word | null> => {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching word:', error)
      return null
    }

    return data as Word
  } catch (error) {
    console.error('Error fetching word:', error)
    return null
  }
}

// Search words by word string
export const searchWords = async (searchTerm: string): Promise<Word[] | null> => {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .ilike('word', `%${searchTerm}%`)
      .order('jlpt_level', { ascending: true })

    if (error) {
      console.error('Error searching words:', error)
      return null
    }

    return data as Word[]
  } catch (error) {
    console.error('Error searching words:', error)
    return null
  }
}

// Search words by reading
export const searchWordsByReading = async (reading: string): Promise<Word[] | null> => {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .ilike('reading', `%${reading}%`)
      .order('jlpt_level', { ascending: true })

    if (error) {
      console.error('Error searching words by reading:', error)
      return null
    }

    return data as Word[]
  } catch (error) {
    console.error('Error searching words by reading:', error)
    return null
  }
}

// Create a new word
export const createWord = async (word: Omit<Word, 'id' | 'created_at'>): Promise<Word | null> => {
  try {
    const { data, error } = await supabase
      .from('words')
      .insert([
        {
          ...word,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating word:', error)
      return null
    }

    return data as Word
  } catch (error) {
    console.error('Error creating word:', error)
    return null
  }
}

// Update a word
export const updateWord = async (id: number, updates: Partial<Word>): Promise<Word | null> => {
  try {
    const { data, error } = await supabase
      .from('words')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating word:', error)
      return null
    }

    return data as Word
  } catch (error) {
    console.error('Error updating word:', error)
    return null
  }
}

// Delete a word
export const deleteWord = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting word:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting word:', error)
    return false
  }
}