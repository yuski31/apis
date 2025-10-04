'use client'

import React from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts'

interface JLPTProgressChartProps {
  data: Record<string, { progress: number; total: number }>
}

export const JLPTProgressChart: React.FC<JLPTProgressChartProps> = ({ data }) => {
  // Format data for radar chart
  const formattedData = Object.entries(data).map(([level, stats]) => ({
    level: level.toUpperCase(),
    progress: stats.progress,
    fullMark: stats.total
  }))

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={formattedData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="level" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Progress"
            dataKey="progress"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.6}
          />
          <Radar
            name="Max"
            dataKey="fullMark"
            stroke="#e5e7eb"
            fill="#e5e7eb"
            fillOpacity={0.1}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}