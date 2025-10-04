import { supabase } from '../../supabase/client'
import { AIGeneratedContent, AIContentInteractions } from '../types'

// Get all AI generated content
export const getAIContent = async (): Promise<AIGeneratedContent[] | null> => {
  try {
    const { data, error } = await supabase
      .from('ai_generated_content')
      .select('*')
      .eq('is_published', true)
      .order('generated_at', { ascending: false })

    if (error) {
      console.error('Error fetching AI content:', error)
      return null
    }

    return data as AIGeneratedContent[]
  } catch (error) {
    console.error('Error fetching AI content:', error)
    return null
  }
}

// Get AI content by ID
export const getAIContentById = async (id: number): Promise<AIGeneratedContent | null> => {
  try {
    const { data, error } = await supabase
      .from('ai_generated_content')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching AI content by ID:', error)
      return null
    }

    return data as AIGeneratedContent
  } catch (error) {
    console.error('Error fetching AI content by ID:', error)
    return null
  }
}

// Get AI content by type
export const getAIContentByType = async (
  type: 'story' | 'dialogue' | 'exercise' | 'explanation'
): Promise<AIGeneratedContent[] | null> => {
  try {
    const { data, error } = await supabase
      .from('ai_generated_content')
      .select('*')
      .eq('content_type', type)
      .eq('is_published', true)
      .order('generated_at', { ascending: false })

    if (error) {
      console.error('Error fetching AI content by type:', error)
      return null
    }

    return data as AIGeneratedContent[]
  } catch (error) {
    console.error('Error fetching AI content by type:', error)
    return null
  }
}

// Get AI content by JLPT level
export const getAIContentByJLPTLevel = async (level: number): Promise<AIGeneratedContent[] | null> => {
  try {
    const { data, error } = await supabase
      .from('ai_generated_content')
      .select('*')
      .eq('jlpt_level', level)
      .eq('is_published', true)
      .order('generated_at', { ascending: false })

    if (error) {
      console.error('Error fetching AI content by JLPT level:', error)
      return null
    }

    return data as AIGeneratedContent[]
  } catch (error) {
    console.error('Error fetching AI content by JLPT level:', error)
    return null
  }
}

// Create new AI generated content
export const createAIContent = async (
  content: Omit<AIGeneratedContent, 'id' | 'generated_at'>
): Promise<AIGeneratedContent | null> => {
  try {
    const { data, error } = await supabase
      .from('ai_generated_content')
      .insert([
        {
          ...content,
          generated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating AI content:', error)
      return null
    }

    return data as AIGeneratedContent
  } catch (error) {
    console.error('Error creating AI content:', error)
    return null
  }
}

// Update AI generated content
export const updateAIContent = async (
  id: number,
  updates: Partial<AIGeneratedContent>
): Promise<AIGeneratedContent | null> => {
  try {
    const { data, error } = await supabase
      .from('ai_generated_content')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating AI content:', error)
      return null
    }

    return data as AIGeneratedContent
  } catch (error) {
    console.error('Error updating AI content:', error)
    return null
  }
}

// Delete AI generated content
export const deleteAIContent = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('ai_generated_content')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting AI content:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting AI content:', error)
    return false
  }
}

// Get user interactions with AI content
export const getUserAIInteractions = async (
  userId: string,
  contentId?: number
): Promise<AIContentInteractions[] | null> => {
  try {
    let query = supabase
      .from('ai_content_interactions')
      .select('*')
      .eq('user_id', userId)

    if (contentId) {
      query = query.eq('content_id', contentId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user AI interactions:', error)
      return null
    }

    return data as AIContentInteractions[]
  } catch (error) {
    console.error('Error fetching user AI interactions:', error)
    return null
  }
}

// Record user interaction with AI content
export const recordAIInteraction = async (
  interaction: Omit<AIContentInteractions, 'id' | 'created_at'>
): Promise<AIContentInteractions | null> => {
  try {
    const { data, error } = await supabase
      .from('ai_content_interactions')
      .insert([
        {
          ...interaction,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error recording AI interaction:', error)
      return null
    }

    return data as AIContentInteractions
  } catch (error) {
    console.error('Error recording AI interaction:', error)
    return null
  }
}

// Update user interaction with AI content
export const updateAIInteraction = async (
  id: number,
  updates: Partial<AIContentInteractions>
): Promise<AIContentInteractions | null> => {
  try {
    const { data, error } = await supabase
      .from('ai_content_interactions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating AI interaction:', error)
      return null
    }

    return data as AIContentInteractions
  } catch (error) {
    console.error('Error updating AI interaction:', error)
    return null
  }
}