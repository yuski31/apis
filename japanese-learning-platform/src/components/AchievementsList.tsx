'use client'

import React, { useState } from 'react'
import { Achievement, UserAchievement } from '@/lib/database/types'
import { AchievementCard } from './AchievementCard'

interface AchievementsListProps {
  achievements: Achievement[]
  userAchievements: UserAchievement[]
  stats: {
    total: number
    unlocked: number
    percentage: number
  } | null
}

export const AchievementsList: React.FC<AchievementsListProps> = ({
  achievements,
  userAchievements,
  stats
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(achievements.map(a => a.category).filter(Boolean)))]

  // Filter achievements based on selected filters
  const filteredAchievements = achievements.filter(achievement => {
    // Category filter
    if (categoryFilter !== 'all' && achievement.category !== categoryFilter) {
      return false
    }

    // Lock status filter
    const isUnlocked = userAchievements.some(ua => ua.achievement_id === achievement.id)
    if (filter === 'unlocked' && !isUnlocked) {
      return false
    }
    if (filter === 'locked' && isUnlocked) {
      return false
    }

    return true
  })

  // Group achievements by category
  const groupedAchievements: Record<string, Achievement[]> = {}
  filteredAchievements.forEach(achievement => {
    const category = achievement.category || 'Uncategorized'
    if (!groupedAchievements[category]) {
      groupedAchievements[category] = []
    }
    groupedAchievements[category].push(achievement)
  })

  return (
    <div>
      {/* Stats Header */}
      {stats && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
              <p className="mt-1 text-gray-600">
                You&apos;ve unlocked {stats.unlocked} of {stats.total} achievements
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-yellow-500 h-4 rounded-full"
                    style={{ width: `${stats.percentage}%` }}
                  ></div>
                </div>
                <span className="ml-3 text-lg font-medium text-gray-900">
                  {stats.percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'unlocked'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Unlocked
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'locked'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Locked
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  categoryFilter === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      {Object.keys(groupedAchievements).length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">No achievements found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
            <div key={category}>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryAchievements.map(achievement => {
                  const userAchievement = userAchievements.find(
                    ua => ua.achievement_id === achievement.id
                  )
                  return (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isUnlocked={!!userAchievement}
                      unlockedAt={userAchievement?.unlocked_at}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}