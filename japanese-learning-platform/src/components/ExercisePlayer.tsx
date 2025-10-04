'use client'

import React, { useState, useEffect } from 'react'
import { Exercise, UserExerciseAttempt } from '@/lib/database/types'
import { getExerciseById } from '@/lib/database/functions/exercises'

interface ExercisePlayerProps {
  exerciseId: number
  userId: string
  onAttemptComplete: (attempt: UserExerciseAttempt) => void
  onBack: () => void
}

export const ExercisePlayer: React.FC<ExercisePlayerProps> = ({
  exerciseId,
  userId,
  onAttemptComplete,
  onBack
}) => {
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [attempt, setAttempt] = useState<UserExerciseAttempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const exerciseData = await getExerciseById(exerciseId)
        if (exerciseData) {
          setExercise(exerciseData)

          // Set timer if exercise has time limit
          if (exerciseData.time_limit) {
            setTimeRemaining(exerciseData.time_limit)
          }
        } else {
          setError('Exercise not found')
        }
      } catch (err) {
        setError('Failed to load exercise')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchExercise()
  }, [exerciseId])

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || submitted) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev !== null && prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev !== null ? prev - 1 : null
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, submitted])

  const handleSubmit = async () => {
    if (!exercise || !selectedAnswer) return

    setSubmitted(true)

    // In a real implementation, you would check the answer here
    // For now, we'll simulate a random correctness check
    const isCorrect = Math.random() > 0.5
    const score = isCorrect ? 100 : 0

    // Calculate time taken
    const timeTaken = exercise.time_limit
      ? (exercise.time_limit - (timeRemaining || 0))
      : Math.floor(Math.random() * 60) + 30 // Random time if no limit

    // Create attempt object
    const attemptData: UserExerciseAttempt = {
      id: Date.now(), // Temporary ID
      user_id: userId,
      exercise_id: exerciseId,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      time_taken: timeTaken,
      score: score,
      is_correct: isCorrect,
      user_answer: selectedAnswer,
      created_at: new Date().toISOString()
    }

    onAttemptComplete(attemptData)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Exercise Player</h2>
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Exercise Player</h2>
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Exercise not found</p>
        </div>
      </div>
    )
  }

  // Sample exercise content structure
  const sampleQuestions = [
    {
      question: "What is the meaning of ありがとう?",
      options: ["Thank you", "Hello", "Goodbye", "Sorry"],
      correctAnswer: "Thank you"
    },
    {
      question: "How do you say 'water' in Japanese?",
      options: ["みず", "たべもの", "のりもの", "いえ"],
      correctAnswer: "みず"
    }
  ]

  const currentQuestion = sampleQuestions[0] // In a real app, this would come from exercise.content

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Exercise: {exercise.exercise_type?.name}</h2>
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          {exercise.jlpt_level && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              JLPT N{exercise.jlpt_level}
            </span>
          )}
          {exercise.difficulty_level && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Difficulty:</span>
              {[1, 2, 3, 4, 5].map(star => (
                <svg
                  key={star}
                  className={`h-4 w-4 ${
                    star <= exercise.difficulty_level!
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
          {timeRemaining !== null && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{timeRemaining}s remaining</span>
            </div>
          )}
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswer(option)}
                disabled={submitted}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedAnswer === option
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border mr-3 ${
                    selectedAnswer === option
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswer === option && (
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-700">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Exercises
          </button>

          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer || submitted}
            className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              selectedAnswer && !submitted
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {submitted ? 'Submitted' : 'Submit Answer'}
          </button>
        </div>
      </div>
    </div>
  )
}