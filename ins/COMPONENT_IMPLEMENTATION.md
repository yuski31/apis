# Component Implementation Guide

## Overview
This guide provides detailed implementation instructions for each major component of the Japanese learning platform.

## 1. User Authentication System

### 1.1 Authentication Flow Implementation

#### Sign Up Component
```tsx
// components/auth/signup-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signup } from '@/actions/signup'

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(undefined)

    const formData = new FormData(e.currentTarget)
    const result = await signup(formData)

    if (result.error) {
      setError(result.error)
    } else {
      router.push('/dashboard')
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
          minLength={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="jlptLevel" className="block text-sm font-medium">
          Current JLPT Level
        </label>
        <select
          id="jlptLevel"
          name="jlptLevel"
          defaultValue="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="5">N5 (Beginner)</option>
          <option value="4">N4 (Elementary)</option>
          <option value="3">N3 (Intermediate)</option>
          <option value="2">N2 (Upper Intermediate)</option>
          <option value="1">N1 (Advanced)</option>
        </select>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Creating account...' : 'Sign up'}
      </button>
    </form>
  )
}
```

#### Server Action for Signup
```typescript
// actions/signup.ts
'use server'

import { db } from '@/lib/db'
import { hash } from 'bcryptjs'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const jlptLevel = parseInt(formData.get('jlptLevel') as string)

  // Validate input
  if (!email || !username || !password) {
    return { error: 'Missing required fields' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { error: 'User already exists with this email' }
  }

  // Hash password
  const hashedPassword = await hash(password, 12)

  // Create user
  try {
    const user = await db.user.create({
      data: {
        email,
        username,
        password_hash: hashedPassword,
        jlpt_level: jlptLevel
      }
    })

    return { success: true, userId: user.id }
  } catch (error) {
    return { error: 'Failed to create user' }
  }
}
```

## 2. Dashboard Implementation

### 2.1 Main Dashboard Layout
```tsx
// app/dashboard/page.tsx
import { DashboardHeader } from '@/components/dashboard/header'
import { StatsGrid } from '@/components/dashboard/stats-grid'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { LearningProgress } from '@/components/dashboard/learning-progress'
import { QuickActions } from '@/components/dashboard/quick-actions'

export default async function DashboardPage() {
  // Fetch user data and stats
  const userData = await getUserDashboardData()

  return (
    <div className="space-y-6">
      <DashboardHeader
        userName={userData.name}
        jlptLevel={userData.jlptLevel}
        streak={userData.streak}
      />

      <StatsGrid stats={userData.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LearningProgress
          progressData={userData.progress}
          onCompleteLesson={() => {}}
        />
        <RecentActivity activities={userData.activities} />
      </div>

      <QuickActions
        onContinueLearning={() => {}}
        onStartNewLesson={() => {}}
      />
    </div>
  )
}
```

### 2.2 Stats Grid Component
```tsx
// components/dashboard/stats-grid.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookOpen,
  Trophy,
  Target,
  Calendar
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

interface StatsGridProps {
  stats: {
    totalWords: number
    lessonsCompleted: number
    currentStreak: number
    studyTime: number
  }
}

export function StatsGrid({ stats }: StatsGridProps) {
  const statCards = [
    {
      title: "Words Mastered",
      value: stats.totalWords,
      description: "Vocabulary items learned",
      icon: <BookOpen className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Lessons Completed",
      value: stats.lessonsCompleted,
      description: "Learning modules finished",
      icon: <Target className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Day Streak",
      value: stats.currentStreak,
      description: "Consecutive days studied",
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Study Time",
      value: `${Math.round(stats.studyTime / 60)}h`,
      description: "Total time spent learning",
      icon: <Trophy className="h-4 w-4 text-muted-foreground" />
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}
```

## 3. Lesson System Implementation

### 3.1 Lesson Page Structure
```tsx
// app/lessons/[id]/page.tsx
import { LessonHeader } from '@/components/lessons/lesson-header'
import { LessonContent } from '@/components/lessons/lesson-content'
import { LessonNavigation } from '@/components/lessons/lesson-navigation'
import { LessonProgress } from '@/components/lessons/lesson-progress'

export default async function LessonPage({ params }: { params: { id: string } }) {
  const lesson = await getLessonById(params.id)
  const userProgress = await getUserLessonProgress(params.id)

  return (
    <div className="max-w-4xl mx-auto py-8">
      <LessonHeader
        title={lesson.title}
        description={lesson.description}
        jlptLevel={lesson.jlptLevel}
      />

      <LessonProgress
        progress={userProgress.completionPercentage}
        quizScore={userProgress.quizScore}
      />

      <LessonContent
        content={lesson.content}
        onExerciseComplete={(exerciseId, score) => {}}
      />

      <LessonNavigation
        prevLesson={lesson.previousLesson}
        nextLesson={lesson.nextLesson}
        onNext={() => {}}
        onPrevious={() => {}}
      />
    </div>
  )
}
```

### 3.2 Interactive Exercise Component
```tsx
// components/lessons/exercise-card.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface ExerciseCardProps {
  exercise: {
    id: string
    type: 'multiple_choice' | 'fill_in_blank' | 'writing' | 'listening'
    question: string
    options?: string[]
    correctAnswer: string
    explanation: string
  }
  onComplete: (exerciseId: string, score: number, userAnswer: string) => void
}

export function ExerciseCard({ exercise, onComplete }: ExerciseCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [userAnswer, setUserAnswer] = useState<string>('')
  const [showExplanation, setShowExplanation] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!selectedAnswer && !userAnswer) return

    const userResponse = selectedAnswer || userAnswer
    const isCorrect = userResponse.toLowerCase() === exercise.correctAnswer.toLowerCase()
    const score = isCorrect ? 1 : 0

    onComplete(exercise.id, score, userResponse)
    setShowExplanation(true)
    setIsSubmitted(true)
  }

  const renderExerciseContent = () => {
    switch (exercise.type) {
      case 'multiple_choice':
        return (
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            disabled={isSubmitted}
          >
            {exercise.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 py-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'fill_in_blank':
        return (
          <Textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here..."
            disabled={isSubmitted}
            className="min-h-[100px]"
          />
        )

      case 'writing':
        return (
          <Textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Write your answer in Japanese..."
            disabled={isSubmitted}
            className="min-h-[150px] font-japanese"
          />
        )

      default:
        return null
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{exercise.question}</CardTitle>
          <Badge variant="secondary" className="capitalize">
            {exercise.type.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {renderExerciseContent()}

        {showExplanation && (
          <div className={`mt-4 p-4 rounded-md ${isSubmitted && selectedAnswer === exercise.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h4 className="font-medium mb-2">Explanation:</h4>
            <p>{exercise.explanation}</p>
            {!isSubmitted && (
              <p className="mt-2 text-sm">
                <strong>Correct answer:</strong> {exercise.correctAnswer}
              </p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          onClick={handleSubmit}
          disabled={(!selectedAnswer && !userAnswer) || isSubmitted}
        >
          {isSubmitted ? 'Submitted' : 'Submit Answer'}
        </Button>

        {showExplanation && (
          <Button
            variant="outline"
            onClick={() => setShowExplanation(false)}
          >
            Hide Explanation
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
```

## 4. AI Conversation Partner

### 4.1 Chat Interface
```tsx
// components/chat/chat-interface.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Mic, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  audioUrl?: string
}

interface ChatInterfaceProps {
  initialMessages?: Message[]
  onSendMessage: (message: string) => Promise<void>
  isLoading?: boolean
}

export function ChatInterface({
  initialMessages = [],
  onSendMessage,
  isLoading = false
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      await onSendMessage(input)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleVoiceInput = () => {
    // Voice recording implementation
    setIsRecording(!isRecording)
  }

  const handlePlayAudio = (audioUrl?: string) => {
    if (audioUrl) {
      // Play audio implementation
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'ai' && (
                <Avatar>
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  'rounded-lg px-4 py-2 max-w-[80%]',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.audioUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-8 w-8 p-0"
                    onClick={() => handlePlayAudio(message.audioUrl)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {message.role === 'user' && (
                <Avatar>
                  <AvatarFallback>YOU</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar>
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="border-t p-4 flex gap-2 items-end"
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleVoiceInput}
          className={cn(isRecording && 'animate-pulse')}
        >
          <Mic className="h-4 w-4" />
        </Button>

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message in Japanese..."
          className="min-h-[60px] resize-none"
          disabled={isLoading}
        />

        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
```

### 4.2 Conversation API Integration
```typescript
// lib/ai/conversation-service.ts
import { aiServiceManager } from './service-manager'

interface ConversationContext {
  jlptLevel: number
  conversationType: 'free_chat' | 'roleplay' | 'pronunciation' | 'grammar'
  topic?: string
  scenario?: string
}

export class ConversationService {
  async processMessage(
    userId: string,
    message: string,
    context: ConversationContext
  ) {
    // Get conversation history
    const history = await this.getConversationHistory(userId)

    // Build prompt with context
    const prompt = this.buildConversationPrompt(message, history, context)

    // Get AI response
    const response = await aiServiceManager.generateContent(prompt, {
      temperature: 0.7,
      maxTokens: 500
    })

    // Save conversation turn
    await this.saveConversationTurn(userId, message, response.content)

    // Generate audio if needed
    let audioUrl: string | undefined
    if (context.conversationType !== 'text_only') {
      const audioBuffer = await aiServiceManager.textToSpeech(response.content)
      audioUrl = await this.uploadAudio(audioBuffer)
    }

    return {
      message: response.content,
      audioUrl
    }
  }

  private buildConversationPrompt(
    userMessage: string,
    history: Array<{ role: string; content: string }>,
    context: ConversationContext
  ): string {
    const systemPrompt = `
      You are a Japanese conversation partner and tutor.
      JLPT Level: N${context.jlptLevel}
      Conversation Type: ${context.conversationType}
      ${context.topic ? `Topic: ${context.topic}` : ''}
      ${context.scenario ? `Scenario: ${context.scenario}` : ''}

      Provide corrections when appropriate and explain grammar points.
      Respond in Japanese unless the user switches to English.
      Keep responses conversational and natural.
    `

    const conversationMessages = history.map(turn => [
      { role: "user", content: turn.user },
      { role: "assistant", content: turn.ai }
    ]).flat()

    return `
      System: ${systemPrompt}

      Conversation History:
      ${conversationMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

      User: ${userMessage}

      Assistant:
    `
  }

  private async getConversationHistory(userId: string) {
    // Database query to get recent conversation history
    return []
  }

  private async saveConversationTurn(
    userId: string,
    userMessage: string,
    aiMessage: string
  ) {
    // Save to database
  }

  private async uploadAudio(audioBuffer: Buffer): Promise<string> {
    // Upload audio to storage and return URL
    return ''
  }
}
```

## 5. Interactive Book Reader

### 5.1 Book Reader Component
```tsx
// components/books/book-reader.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  BookOpen,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookContent {
  id: string
  title: string
  author: string
  content: string
  furiganaContent: string
  pages: number
  currentPage: number
}

interface BookReaderProps {
  book: BookContent
  onBookmark: (page: number) => void
  onAnnotation: (text: string, position: number) => void
}

export function BookReader({ book, onBookmark, onAnnotation }: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState(book.currentPage)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedText, setSelectedText] = useState<string>('')
  const [showDictionary, setShowDictionary] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString())
      setShowDictionary(true)
    } else {
      setSelectedText('')
      setShowDictionary(false)
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(book.pages, newPage)))
  }

  const handleSpeedChange = (speed: number[]) => {
    setPlaybackSpeed(speed[0])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <h1 className="text-lg font-semibold">{book.title}</h1>
          <span className="text-muted-foreground">by {book.author}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onBookmark(currentPage)}>
            Bookmark
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Book Content */}
        <div className="flex-1 border-r">
          <ScrollArea
            className="h-full p-8"
            onMouseUp={handleTextSelection}
          >
            <div
              ref={contentRef}
              className="prose prose-lg max-w-none font-japanese leading-relaxed"
              dangerouslySetInnerHTML={{ __html: book.furiganaContent }}
            />
          </ScrollArea>
        </div>

        {/* Dictionary Panel */}
        {showDictionary && selectedText && (
          <div className="w-80 border-l bg-muted/10 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Dictionary</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDictionary(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-lg mb-2">{selectedText}</h4>
                <p className="text-sm text-muted-foreground">
                  Loading definition...
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Example Sentences</h4>
                <p className="text-sm italic">
                  Loading examples...
                </p>
              </div>

              <Button
                className="w-full"
                onClick={() => onAnnotation(selectedText, 0)}
              >
                Add to Notebook
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Audio Controls */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)}>
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)}>
              <SkipForward className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 ml-4">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={100}
                step={1}
                className="w-24"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {book.pages}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">Speed:</span>
              <Slider
                value={[playbackSpeed]}
                onValueChange={handleSpeedChange}
                min={0.5}
                max={2}
                step={0.1}
                className="w-24"
              />
              <span className="text-sm w-8">{playbackSpeed}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 6. Gamification System

### 6.1 Achievement Display Component
```tsx
// components/gamification/achievements-display.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, Star, Flame } from 'lucide-react'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockDate?: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface AchievementsDisplayProps {
  achievements: Achievement[]
  xp: number
  level: number
  streak: number
}

export function AchievementsDisplay({
  achievements,
  xp,
  level,
  streak
}: AchievementsDisplayProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalXP = level * 1000 + xp
  const nextLevelXP = (level + 1) * 1000
  const xpProgress = (xp / 1000) * 100

  const rarityColors = {
    common: 'bg-gray-200 text-gray-800',
    rare: 'bg-blue-200 text-blue-800',
    epic: 'bg-purple-200 text-purple-800',
    legendary: 'bg-yellow-200 text-yellow-800'
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{level}</div>
            <Progress value={xpProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {xp} / 1000 XP to next level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak}</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unlockedCount}</div>
            <p className="text-xs text-muted-foreground">
              of {achievements.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalXP}</div>
            <p className="text-xs text-muted-foreground">experience earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border ${
                  achievement.unlocked
                    ? 'bg-muted/50 border-primary/20'
                    : 'bg-muted/30 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{achievement.name}</h3>
                      {achievement.unlocked && (
                        <Badge
                          className={rarityColors[achievement.rarity]}
                          variant="secondary"
                        >
                          {achievement.rarity}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                    {achievement.unlocked && achievement.unlockDate && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Unlocked on {achievement.unlockDate.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

## 7. Analytics Dashboard

### 7.1 Progress Charts Component
```tsx
// components/analytics/progress-charts.tsx
'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProgressData {
  date: string
  accuracy: number
  itemsStudied: number
  studyTime: number
}

interface CategoryPerformance {
  category: string
  accuracy: number
  items: number
}

interface WeeklyActivity {
  day: string
  studySessions: number
  totalTime: number
}

interface ProgressChartsProps {
  progressData: ProgressData[]
  categoryPerformance: CategoryPerformance[]
  weeklyActivity: WeeklyActivity[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function ProgressCharts({
  progressData,
  categoryPerformance,
  weeklyActivity
}: ProgressChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Accuracy Over Time */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Accuracy Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Accuracy']}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Items Studied */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Study Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                formatter={(value) => [value, 'Items']}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Bar dataKey="itemsStudied" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryPerformance}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="accuracy"
                nameKey="category"
              >
                {categoryPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="studySessions" fill="#8884d8" name="Sessions" />
              <Bar yAxisId="right" dataKey="totalTime" fill="#82ca9d" name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
```

## Implementation Priority Order

### Phase 1: Core Infrastructure (Week 1-2)
1. Authentication system
2. Database schema implementation
3. State management
4. Basic UI components

### Phase 2: Learning Core (Week 3-4)
1. Dashboard and user profiles
2. Lesson system and content display
3. Spaced repetition algorithm
4. Basic exercise components

### Phase 3: AI Integration (Week 5-6)
1. AI content generation
2. Conversation partner
3. Pronunciation analysis
4. Text-to-speech integration

### Phase 4: Advanced Features (Week 7-8)
1. Interactive book reader
2. Gamification system
3. Social features
4. Analytics dashboard

### Phase 5: Polish and Launch (Week 9-10)
1. Mobile responsiveness
2. Performance optimization
3. Testing and QA
4. Documentation and deployment

This component implementation guide provides detailed instructions for building each major feature of the platform with specific code examples and implementation patterns.