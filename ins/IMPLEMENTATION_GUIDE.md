# AI-Powered Japanese Learning Platform - Implementation Guide

## Overview
This guide provides step-by-step instructions for implementing the complete Japanese learning platform. Each section contains detailed specifications, code examples, and implementation requirements.

## 1. Project Setup and Initialization

### 1.1 Environment Configuration
```bash
# Create project directory
mkdir japanese-learning-platform
cd japanese-learning-platform

# Initialize Next.js 15+ project with TypeScript
npx create-next-app@latest . --typescript --app --eslint --tailwind --src-dir --import-alias "@/*"

# Install core dependencies
npm install next-auth@beta @supabase/supabase-js zustand framer-motion react-three-fiber react-three/drei @react-three/fiber three @headlessui/react
```

### 1.2 Environment Variables Setup
Create `.env.local` file:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Services
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
AZURE_COGNITIVE_KEY=your_azure_key
AZURE_COGNITIVE_ENDPOINT=your_azure_endpoint

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 2. Database Implementation

### 2.1 Supabase Setup
1. Create Supabase project at https://app.supabase.com
2. Execute the SQL schema from `DATABASE_SCHEMA.md` in the Supabase SQL editor
3. Configure Row Level Security policies
4. Set up authentication triggers

### 2.2 Database Connection
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handle cookie setting error
          }
        },
      },
    }
  )
}
```

## 3. Authentication System Implementation

### 3.1 NextAuth Configuration
```typescript
// auth.config.ts
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { getUserByEmail } from '@/lib/database/users'

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string
          password: string
        }

        const user = await getUserByEmail(email)
        if (!user || !user.password_hash) return null

        const isValid = await bcrypt.compare(password, user.password_hash)
        if (!isValid) return null

        return user
      }
    })
  ],
} satisfies NextAuthConfig
```

```typescript
// auth.ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'
import authConfig from '@/auth.config'

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
})
```

### 3.2 Authentication Components
```tsx
// components/auth/login-form.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login } from '@/actions/login'

export function LoginForm() {
  const [errorMessage, dispatch] = useFormState(login, undefined)

  return (
    <form action={dispatch} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      {errorMessage && (
        <div className="text-red-500 text-sm">{errorMessage}</div>
      )}
      <LoginButton />
    </form>
  )
}

function LoginButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
    >
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  )
}
```

## 4. Core UI Components

### 4.1 Layout Structure
```tsx
// components/layout/main-layout.tsx
'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { useStore } from '@/stores/useStore'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useStore((state) => state.sidebarOpen)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-20'
          }`}
        >
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
```

### 4.2 Dashboard Components
```tsx
// components/dashboard/progress-card.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface ProgressCardProps {
  title: string
  value: number
  max: number
  unit: string
  description: string
}

export function ProgressCard({
  title,
  value,
  max,
  unit,
  description,
}: ProgressCardProps) {
  const percentage = Math.round((value / max) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value} {unit}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Progress value={percentage} className="mt-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {percentage}% complete
        </p>
      </CardContent>
    </Card>
  )
}
```

## 5. AI Integration Implementation

### 5.1 AI Service Manager
```typescript
// lib/ai/service-manager.ts
import OpenAI from 'openai'
import speech from '@google-cloud/speech'
import { TTSClient } from '@azure/cognitiveservices-texttospeech'

class AIServiceManager {
  private openai: OpenAI
  private googleSpeech: speech.SpeechClient
  private azureTTS: TTSClient

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Google Speech client initialization
    this.googleSpeech = new speech.SpeechClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    })

    // Azure TTS client initialization
    this.azureTTS = new TTSClient(
      process.env.AZURE_TTS_ENDPOINT!,
      new speechsdk.SpeechConfig(
        process.env.AZURE_SUBSCRIPTION_KEY,
        process.env.AZURE_REGION
      )
    )
  }

  async generateContent(prompt: string, options?: any) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 1000,
      response_format: { type: 'json_object' },
    })

    return JSON.parse(response.choices[0].message.content || '{}')
  }

  async textToSpeech(text: string, options?: any) {
    // Implementation for text-to-speech using ElevenLabs or Azure
  }

  async speechToText(audioBuffer: Buffer, options?: any) {
    // Implementation for speech recognition
  }
}

export const aiServiceManager = new AIServiceManager()
```

### 5.2 Content Generation Service
```typescript
// lib/ai/content-generator.ts
import { aiServiceManager } from './service-manager'

interface LessonContentParams {
  jlptLevel: number
  interests: string[]
  objectives: string[]
  weakAreas: string[]
}

export class ContentGenerator {
  async generateLessonContent(params: LessonContentParams) {
    const prompt = `
      Generate a Japanese language lesson for JLPT N${params.jlptLevel} level.
      Student interests: ${params.interests.join(', ')}
      Learning objectives: ${params.objectives.join(', ')}
      Areas needing improvement: ${params.weakAreas.join(', ')}

      Return JSON with the following structure:
      {
        "title": "Lesson title",
        "introduction": "Brief introduction to the topic",
        "vocabulary": [
          {
            "word": "Japanese word",
            "reading": "Furigana reading",
            "meaning": "English meaning",
            "example_sentence": "Example sentence in Japanese",
            "sentence_meaning": "English translation"
          }
        ],
        "grammar": {
          "point": "Grammar point name",
          "explanation": "Detailed explanation",
          "examples": ["Example 1", "Example 2"]
        },
        "practice_exercises": [
          {
            "type": "fill_in_blank|multiple_choice|translation",
            "question": "Question text",
            "options": ["Option 1", "Option 2"], // For multiple choice
            "correct_answer": "Correct answer"
          }
        ]
      }
    `

    return await aiServiceManager.generateContent(prompt)
  }

  async generateStory(storyParams: {
    level: number
    theme: string
    wordCount: number
  }) {
    const prompt = `
      Write a short story in Japanese at JLPT N${storyParams.level} level.
      Theme: ${storyParams.theme}
      Length: ${storyParams.wordCount} words
      Include furigana for kanji
      Provide English translation

      Return JSON:
      {
        "title": "Story title",
        "japanese_text": "Story with furigana markup",
        "english_translation": "English translation",
        "vocabulary_list": [...],
        "grammar_points": [...]
      }
    `

    return await aiServiceManager.generateContent(prompt)
  }
}
```

## 6. Progressive Learning Engine

### 6.1 Spaced Repetition System
```typescript
// lib/learning/srs/sm2-algorithm.ts
export interface SRSItem {
  id: string
  contentType: 'character' | 'word' | 'grammar'
  contentId: number
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewDate: Date
  lastReviewed: Date
}

export class SM2Algorithm {
  calculateNextReview(
    quality: number,
    repetitions: number,
    previousInterval: number,
    easeFactor: number
  ): Pick<SRSItem, 'interval' | 'repetitions' | 'easeFactor' | 'nextReviewDate'> {
    let newInterval: number
    let newRepetitions: number
    let newEaseFactor: number

    if (quality < 3) {
      newRepetitions = 0
      newInterval = 1
    } else {
      newRepetitions = repetitions + 1

      if (newRepetitions === 1) {
        newInterval = 1
      } else if (newRepetitions === 2) {
        newInterval = 6
      } else {
        newInterval = Math.round(previousInterval * easeFactor)
      }
    }

    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

    if (newEaseFactor < 1.3) {
      newEaseFactor = 1.3
    }

    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

    return {
      interval: newInterval,
      repetitions: newRepetitions,
      easeFactor: newEaseFactor,
      nextReviewDate,
    }
  }
}
```

### 6.2 Learning Session Manager
```typescript
// lib/learning/session-manager.ts
import { SM2Algorithm } from './srs/sm2-algorithm'
import { contentMetadataManager } from './metadata/content-metadata'

interface UserResponse {
  itemId: string
  quality: number // 0-5
  responseTime: number // milliseconds
  wasCorrect: boolean
}

export class LearningSessionManager {
  private srs = new SM2Algorithm()

  async processUserResponse(
    userId: string,
    response: UserResponse
  ): Promise<void> {
    // Get current item data
    const item = await this.getLearningItem(response.itemId)

    // Calculate next review using SM-2
    const updatedParams = this.srs.calculateNextReview(
      response.quality,
      item.repetitions,
      item.interval,
      item.easeFactor
    )

    // Update item in database
    await this.updateLearningItem(response.itemId, {
      ...updatedParams,
      lastReviewed: new Date(),
    })

    // Update user performance statistics
    await this.updateUserPerformance(userId, response)
  }

  async getRecommendedItems(userId: string, count: number = 10) {
    // Implementation for selecting items based on due reviews and user needs
  }

  private async getLearningItem(itemId: string) {
    // Database query to get item
  }

  private async updateLearningItem(
    itemId: string,
    updates: Partial<SRSItem>
  ) {
    // Database update
  }

  private async updateUserPerformance(
    userId: string,
    response: UserResponse
  ) {
    // Update user performance tracking
  }
}
```

## 7. API Routes Implementation

### 7.1 Authentication APIs
```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

### 7.2 Learning APIs
```typescript
// app/api/learning/review/route.ts
import { NextResponse } from 'next/server'
import { learningSessionManager } from '@/lib/learning/session-manager'

export async function POST(request: Request) {
  try {
    const { userId, response } = await request.json()

    await learningSessionManager.processUserResponse(userId, response)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process response' },
      { status: 500 }
    )
  }
}
```

## 8. State Management

### 8.1 Zustand Store
```typescript
// stores/useStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  userPreferences: {
    theme: 'light' | 'dark'
    jlptLevel: number
    autoPlayAudio: boolean
  }
  setUserPreferences: (preferences: Partial<AppState['userPreferences']>) => void
  learningSession: {
    currentItems: any[]
    currentIndex: number
  }
  setLearningSession: (session: AppState['learningSession']) => void
  nextItem: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      userPreferences: {
        theme: 'light',
        jlptLevel: 3,
        autoPlayAudio: true,
      },
      setUserPreferences: (preferences) =>
        set((state) => ({
          userPreferences: { ...state.userPreferences, ...preferences },
        })),
      learningSession: {
        currentItems: [],
        currentIndex: 0,
      },
      setLearningSession: (session) => set({ learningSession: session }),
      nextItem: () =>
        set((state) => ({
          learningSession: {
            ...state.learningSession,
            currentIndex: state.learningSession.currentIndex + 1,
          },
        })),
    }),
    {
      name: 'japanese-learning-storage',
    }
  )
)
```

## 9. Deployment Configuration

### 9.1 Vercel Configuration
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

## 10. Testing Strategy

### 10.1 Unit Testing Setup
```typescript
// jest.config.ts
import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
}

export default config
```

### 10.2 Component Testing
```tsx
// components/__tests__/progress-card.test.tsx
import { render, screen } from '@testing-library/react'
import { ProgressCard } from '../dashboard/progress-card'

describe('ProgressCard', () => {
  it('renders progress information correctly', () => {
    render(
      <ProgressCard
        title="Vocabulary"
        value={50}
        max={100}
        unit="words"
        description="Words mastered"
      />
    )

    expect(screen.getByText('Vocabulary')).toBeInTheDocument()
    expect(screen.getByText('50 words')).toBeInTheDocument()
    expect(screen.getByText('Words mastered')).toBeInTheDocument()
  })
})
```

## Implementation Checklist

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup with Next.js 15+
- [ ] Supabase database configuration
- [ ] Authentication system implementation
- [ ] Core UI components
- [ ] State management setup

### Phase 2: Learning Core (Weeks 3-4)
- [ ] Spaced repetition algorithm
- [ ] Content management system
- [ ] Basic lesson creation
- [ ] Progress tracking
- [ ] User dashboard

### Phase 3: AI Integration (Weeks 5-6)
- [ ] OpenAI content generation
- [ ] Speech recognition integration
- [ ] Text-to-speech implementation
- [ ] Conversation partner
- [ ] Pronunciation analysis

### Phase 4: Advanced Features (Weeks 7-8)
- [ ] Social features
- [ ] Gamification system
- [ ] Analytics dashboard
- [ ] Mobile responsiveness
- [ ] Performance optimization

### Phase 5: Polish & Launch (Weeks 9-10)
- [ ] Testing and QA
- [ ] Documentation
- [ ] Deployment preparation
- [ ] Performance monitoring
- [ ] User feedback integration

This implementation guide provides detailed instructions for building the complete platform. Each component includes specific code examples and implementation requirements to ensure successful development.