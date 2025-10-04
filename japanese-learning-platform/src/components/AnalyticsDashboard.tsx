'use client'

import React from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { StatCard } from './StatCard'
import { StudyTimeChart } from './StudyTimeChart'
import { PerformanceChart } from './PerformanceChart'
import { JLPTProgressChart } from './JLPTProgressChart'

interface AnalyticsDashboardProps {
  userId: string
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId }) => {
  const {
    learningStats,
    dailyStudyTime,
    performanceTrends,
    jlptProgress,
    loading,
    error
  } = useAnalytics(userId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Learning Analytics</h1>
        <p className="mt-1 text-gray-600">
          Track your progress and performance over time
        </p>
      </div>

      {/* Stats Overview */}
      {learningStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Lessons Completed"
            value={`${learningStats.lessons.completed}/${learningStats.lessons.total}`}
            subtitle={`${learningStats.lessons.completionRate}% completion`}
            color="blue"
          />
          <StatCard
            title="Books Read"
            value={`${learningStats.reading.completed}/${learningStats.reading.total}`}
            subtitle={`${learningStats.reading.completionRate}% completion`}
            color="green"
          />
          <StatCard
            title="Achievements"
            value={`${learningStats.achievements.unlocked}/${learningStats.achievements.total}`}
            subtitle="Unlocked achievements"
            color="yellow"
          />
          <StatCard
            title="Study Time (7 days)"
            value={`${learningStats.studyTime.last7Days} min`}
            subtitle="Total study time"
            color="purple"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Study Time</h2>
          <StudyTimeChart data={dailyStudyTime} />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Trends</h2>
          <PerformanceChart data={performanceTrends} />
        </div>
      </div>

      {/* JLPT Progress */}
      {jlptProgress && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">JLPT Progress</h2>
          <JLPTProgressChart data={jlptProgress} />
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-gray-500">Recent learning activities will be shown here.</p>
      </div>
    </div>
  )
}