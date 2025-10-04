import React from 'react'

interface ProgressIndicatorProps {
  title: string
  current: number
  total: number
  color?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function ProgressIndicator({
  title,
  current,
  total,
  color = 'indigo',
  size = 'md'
}: ProgressIndicatorProps) {
  const percentage = Math.round((current / total) * 100)

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  }

  const colorClasses = {
    indigo: 'bg-indigo-600',
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <span className="text-sm font-medium text-gray-700">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full">
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">{current} completed</span>
        <span className="text-xs text-gray-500">{total} total</span>
      </div>
    </div>
  )
}