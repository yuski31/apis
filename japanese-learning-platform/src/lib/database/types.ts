// User Profile Types
export interface UserProfile {
  id: string
  email: string
  username: string
  full_name: string | null
  avatar_url: string | null
  preferred_language: string
  created_at: string
  updated_at: string
  last_active: string
  timezone: string | null
  jlpt_level: number | null
  learning_goals: string[] | null
  interests: string[] | null
}

// Character Types
export interface Character {
  id: number
  character: string
  type: 'hiragana' | 'katakana' | 'kanji'
  meaning: string[]
  readings: {
    onyomi?: string[]
    kunyomi?: string[]
  }
  stroke_count: number | null
  stroke_diagram_url: string | null
  jlpt_level: number | null
  frequency_rank: number | null
  created_at: string
}

// Word Types
export interface Word {
  id: number
  word: string
  reading: string | null
  meanings: Array<{
    meaning: string
    example_sentences?: Array<{
      japanese: string
      english: string
    }>
  }>
  jlpt_level: number | null
  frequency_rank: number | null
  part_of_speech: string[]
  created_at: string
}

// Grammar Point Types
export interface GrammarPoint {
  id: number
  title: string
  structure: string
  meaning: string
  usage_notes: string | null
  examples: Array<{
    japanese: string
    english: string
  }> | null
  jlpt_level: number | null
  related_grammar: number[]
  created_at: string
}

// SRS Card Types
export interface SRSCard {
  id: number
  user_id: string
  content_type: 'character' | 'word' | 'grammar'
  content_id: number
  ease_factor: number
  interval: number
  repetitions: number
  next_review: string | null
  last_reviewed: string | null
  created_at: string
  updated_at: string
}

// User Performance Types
export interface UserPerformance {
  id: number
  user_id: string
  content_type: 'character' | 'word' | 'grammar'
  content_id: number
  attempts: number
  correct_attempts: number
  last_attempt: string | null
  accuracy_rate: number | null
  avg_response_time: number | null
  created_at: string
  updated_at: string
}

// Lesson Module Types
export interface LessonModule {
  id: number
  title: string
  description: string | null
  jlpt_level: number | null
  estimated_duration: number | null
  prerequisites: number[]
  is_active: boolean
  sort_order: number | null
  created_at: string
  updated_at: string
}

// Lesson Item Types
export interface LessonItem {
  id: number
  lesson_module_id: number
  content_type: 'character' | 'word' | 'grammar'
  content_id: number
  sort_order: number | null
  created_at: string
}

// User Lesson Progress Types
export interface UserLessonProgress {
  id: number
  user_id: string
  lesson_module_id: number
  started_at: string | null
  completed_at: string | null
  completion_percentage: number | null
  quiz_score: number | null
  created_at: string
  updated_at: string
}

// AI Generated Content Types
export interface AIGeneratedContent {
  id: number
  title: string | null
  content_type: 'story' | 'dialogue' | 'exercise' | 'explanation'
  content: any // JSONB content
  jlpt_level: number | null
  topics: string[]
  estimated_reading_time: number | null
  generated_by: string | null
  generated_at: string
  version: number
  is_published: boolean
}

// Book Types
export interface Book {
  id: number
  title: string
  author: string | null
  description: string | null
  cover_image_url: string | null
  jlpt_level: number | null
  total_pages: number | null
  content: any // JSONB content
  created_at: string
  updated_at: string
  is_published: boolean
}

// Book Reading Progress Types
export interface BookReadingProgress {
  id: number
  user_id: string
  book_id: number
  current_page: number | null
  last_read: string
  completed_at: string | null
  created_at: string
  updated_at: string
}

// Study Session Types
export interface StudySession {
  id: number
  user_id: string
  start_time: string
  end_time: string | null
  duration: number | null
  activities: any // JSONB activities
  created_at: string
}

// Achievement Types
export interface Achievement {
  id: number
  name: string
  description: string | null
  icon_url: string | null
  criteria: any // JSONB criteria
  category: string | null
  created_at: string
}

// User Achievement Types
export interface UserAchievement {
  id: number
  user_id: string
  achievement_id: number
  unlocked_at: string
  created_at: string
}

// Conversation Types
export interface Conversation {
  id: number
  user_id: string
  title: string | null
  conversation_type: 'free_chat' | 'roleplay' | 'pronunciation' | 'grammar'
  started_at: string
  ended_at: string | null
  created_at: string
}

// Message Types
export interface Message {
  id: number
  conversation_id: number
  sender_type: 'user' | 'ai'
  content: string
  translated_content: {
    [language: string]: string
  } | null
  audio_url: string | null
  sentiment_score: number | null
  created_at: string
}