'use client'

import React from 'react'
import { Exercise } from '@/lib/database/types'

interface ExerciseCardProps {
  exercise: Exercise
  onStart: () => void
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onStart }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">{exercise.exercise_type?.name}</h3>
          {exercise.jlpt_level && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              N{exercise.jlpt_level}
            </span>
          )}
        </div>

        {exercise.time_limit && (
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{exercise.time_limit} seconds</span>
          </div>
        )}

        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map(star => (
              <svg
                key={star}
                className={`h-5 w-5 ${
                  star <= (exercise.difficulty_level || 1)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              Difficulty: {exercise.difficulty_level}/5
            </span>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Start Exercise
        </button>
      </div>
    </div>
  )
}