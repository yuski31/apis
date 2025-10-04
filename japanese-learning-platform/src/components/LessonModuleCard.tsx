'use client'

import React from 'react'
import { LessonModule, UserLessonProgress } from '@/lib/database/types'

interface LessonModuleCardProps {
  module: LessonModule
  progress?: UserLessonProgress
  onSelect: (moduleId: number) => void
}

export const LessonModuleCard: React.FC<LessonModuleCardProps> = ({
  module,
  progress,
  onSelect
}) => {
  const isCompleted = progress?.completed_at !== null
  const completionPercentage = progress?.completion_percentage || 0

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => onSelect(module.id)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
            {module.description && (
              <p className="mt-2 text-gray-600">{module.description}</p>
            )}
          </div>
          {module.jlpt_level && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              JLPT N{module.jlpt_level}
            </span>
          )}
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                isCompleted ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          {module.estimated_duration && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {module.estimated_duration} min
            </div>
          )}
          {isCompleted ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Completed
            </span>
          ) : progress?.started_at ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              In Progress
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Not Started
            </span>
          )}
        </div>
      </div>
    </div>
  )
}