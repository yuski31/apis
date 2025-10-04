'use client'

import React from 'react'
import { Achievement, UserAchievement } from '@/lib/database/types'

interface AchievementCardProps {
  achievement: Achievement
  isUnlocked?: boolean
  unlockedAt?: string
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isUnlocked = false,
  unlockedAt
}) => {
  return (
    <div
      className={`rounded-lg shadow-md overflow-hidden ${
        isUnlocked ? 'bg-white border-2 border-yellow-400' : 'bg-gray-50'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {achievement.icon_url ? (
              <img
                src={achievement.icon_url}
                alt={achievement.name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{achievement.name}</h3>
              {isUnlocked && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Unlocked
                </span>
              )}
            </div>
            {achievement.description && (
              <p className="mt-1 text-gray-600">{achievement.description}</p>
            )}
            {achievement.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                {achievement.category}
              </span>
            )}
            {isUnlocked && unlockedAt && (
              <p className="mt-2 text-sm text-gray-500">
                Unlocked on {new Date(unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}