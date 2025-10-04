'use client'

import React, { useState } from 'react'
import { Exercise, ExerciseType } from '@/lib/database/types'
import { ExerciseCard } from './ExerciseCard'

interface ExerciseListProps {
  exercises: Exercise[]
  exerciseTypes: ExerciseType[]
  onStartExercise: (exerciseId: number) => void
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  exerciseTypes,
  onStartExercise
}) => {
  const [typeFilter, setTypeFilter] = useState<number | 'all'>('all')
  const [jlptFilter, setJlptFilter] = useState<number | 'all'>('all')

  // Filter exercises based on selected filters
  const filteredExercises = exercises.filter(exercise => {
    // Type filter
    if (typeFilter !== 'all' && exercise.exercise_type_id !== typeFilter) {
      return false
    }

    // JLPT level filter
    if (jlptFilter !== 'all' && exercise.jlpt_level !== jlptFilter) {
      return false
    }

    return true
  })

  return (
    <div>
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                typeFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Types
            </button>
            {exerciseTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setTypeFilter(type.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  typeFilter === type.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setJlptFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                jlptFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Levels
            </button>
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                onClick={() => setJlptFilter(level)}
                className={`px-3 py-1 rounded-full text-sm ${
                  jlptFilter === level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                N{level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Grid */}
      {filteredExercises.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">No exercises found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onStart={() => onStartExercise(exercise.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}