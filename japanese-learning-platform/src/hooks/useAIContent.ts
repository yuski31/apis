import { useState } from 'react'
import { AIGeneratedContent } from '@/lib/database/types'
import { generateAIContent, AIContentRequest } from '@/lib/ai/openai'

export const useAIContent = () => {
  const [content, setContent] = useState<AIGeneratedContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateContent = async (request: AIContentRequest) => {
    setLoading(true)
    setError(null)

    try {
      const generatedContent = await generateAIContent(request)
      if (generatedContent) {
        setContent(generatedContent)
        return generatedContent
      } else {
        setError('Failed to generate content')
        return null
      }
    } catch (err) {
      setError('Error generating content')
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const clearContent = () => {
    setContent(null)
    setError(null)
  }

  return {
    content,
    loading,
    error,
    generateContent,
    clearContent
  }
}