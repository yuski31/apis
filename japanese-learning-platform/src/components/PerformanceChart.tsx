'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface PerformanceChartProps {
  data: Array<{ date: string; averageAccuracy: number }>
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  // Format date for display
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
          <YAxis
            domain={[0, 100]}
            label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Accuracy']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="averageAccuracy"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Accuracy"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}