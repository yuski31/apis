import OpenAI from 'openai'
import { AIGeneratedContent } from '../database/types'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// Types for AI content generation
export interface AIContentRequest {
  type: 'story' | 'dialogue' | 'exercise' | 'explanation'
  jlptLevel: number
  topic?: string
  keywords?: string[]
  length?: 'short' | 'medium' | 'long'
}

export interface AIStoryContent {
  title: string
  content: string
  vocabulary: Array<{
    word: string
    reading: string
    meaning: string
  }>
  grammarPoints: Array<{
    structure: string
    meaning: string
    example: string
  }>
}

export interface AIDialogueContent {
  title: string
  participants: string[]
  dialogue: Array<{
    speaker: string
    text: string
    translation: string
  }>
  vocabulary: Array<{
    word: string
    reading: string
    meaning: string
  }>
}

export interface AIExerciseContent {
  title: string
  instructions: string
  questions: Array<{
    question: string
    options?: string[]
    correctAnswer: string
    explanation: string
  }>
  difficulty: number
}

export interface AIExplanationContent {
  title: string
  explanation: string
  examples: Array<{
    japanese: string
    english: string
  }>
  relatedTopics: string[]
}

// Generate content using OpenAI
export const generateAIContent = async (
  request: AIContentRequest
): Promise<AIGeneratedContent | null> => {
  try {
    let prompt = ''

    switch (request.type) {
      case 'story':
        prompt = `Create a short Japanese story at JLPT N${request.jlptLevel} level.
        Topic: ${request.topic || 'general'}
        Keywords: ${request.keywords?.join(', ') || 'none'}

        Include:
        1. A title
        2. The story content in Japanese
        3. Key vocabulary with readings and meanings
        4. Important grammar points with examples

        Format the response as JSON with the following structure:
        {
          "title": "Story Title",
          "content": "Story content in Japanese",
          "vocabulary": [
            {"word": "word", "reading": "reading", "meaning": "meaning"}
          ],
          "grammarPoints": [
            {"structure": "grammar structure", "meaning": "meaning", "example": "example sentence"}
          ]
        }`
        break

      case 'dialogue':
        prompt = `Create a Japanese dialogue at JLPT N${request.jlptLevel} level.
        Topic: ${request.topic || 'general'}
        Keywords: ${request.keywords?.join(', ') || 'none'}

        Include:
        1. A title
        2. Participant names
        3. Dialogue with speaker labels
        4. English translations
        5. Key vocabulary with readings and meanings

        Format the response as JSON with the following structure:
        {
          "title": "Dialogue Title",
          "participants": ["Participant 1", "Participant 2"],
          "dialogue": [
            {"speaker": "Participant 1", "text": "Japanese text", "translation": "English translation"}
          ],
          "vocabulary": [
            {"word": "word", "reading": "reading", "meaning": "meaning"}
          ]
        }`
        break

      case 'exercise':
        prompt = `Create a Japanese learning exercise at JLPT N${request.jlptLevel} level.
        Topic: ${request.topic || 'general'}
        Keywords: ${request.keywords?.join(', ') || 'none'}
        Length: ${request.length || 'medium'}

        Include:
        1. A title
        2. Clear instructions
        3. Multiple questions with options and correct answers
        4. Explanations for each answer
        5. Difficulty rating (1-5)

        Format the response as JSON with the following structure:
        {
          "title": "Exercise Title",
          "instructions": "Clear instructions",
          "questions": [
            {
              "question": "Question text",
              "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
              "correctAnswer": "Correct option",
              "explanation": "Explanation of the answer"
            }
          ],
          "difficulty": 3
        }`
        break

      case 'explanation':
        prompt = `Create a detailed explanation of a Japanese language concept at JLPT N${request.jlptLevel} level.
        Topic: ${request.topic || 'general'}
        Keywords: ${request.keywords?.join(', ') || 'none'}

        Include:
        1. A title
        2. Comprehensive explanation
        3. Multiple example sentences with translations
        4. Related topics

        Format the response as JSON with the following structure:
        {
          "title": "Explanation Title",
          "explanation": "Detailed explanation",
          "examples": [
            {"japanese": "Japanese sentence", "english": "English translation"}
          ],
          "relatedTopics": ["Related topic 1", "Related topic 2"]
        }`
        break
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates educational content for Japanese language learners. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const contentText = response.choices[0]?.message?.content || '{}'
    const contentData = JSON.parse(contentText)

    // Create AI generated content record
    const aiContent: AIGeneratedContent = {
      id: 0, // Will be set by database
      title: contentData.title || 'Generated Content',
      content_type: request.type,
      content: contentData,
      jlpt_level: request.jlptLevel,
      topics: request.topic ? [request.topic] : [],
      estimated_reading_time: request.length === 'short' ? 5 : request.length === 'long' ? 20 : 10,
      generated_by: 'OpenAI GPT-4',
      generated_at: new Date().toISOString(),
      version: 1,
      is_published: false
    }

    return aiContent
  } catch (error) {
    console.error('Error generating AI content:', error)
    return null
  }
}

// Save generated content to database
export const saveAIContent = async (content: Omit<AIGeneratedContent, 'id' | 'generated_at'>): Promise<AIGeneratedContent | null> => {
  try {
    // This would typically be implemented with a database function
    // For now, we'll just return the content with a mock ID
    const savedContent: AIGeneratedContent = {
      ...content,
      id: Date.now(), // Mock ID
      generated_at: new Date().toISOString()
    }

    return savedContent
  } catch (error) {
    console.error('Error saving AI content:', error)
    return null
  }
}

export default openai