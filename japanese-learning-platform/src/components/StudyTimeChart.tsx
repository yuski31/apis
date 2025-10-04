'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface StudyTimeChartProps {
  data: Array<{ date: string; minutes: number }>
}

export const StudyTimeChart: React.FC<StudyTimeChartProps> = ({ data }) => {
  // Format date for display
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value) => [`${value} minutes`, 'Study Time']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Bar dataKey="minutes" fill="#4f46e5" name="Study Time" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}