import React from 'react'

interface ProgressChartProps {
  title: string
  data: Array<{
    name: string
    value: number
    color: string
  }>
  height?: number
}

export default function ProgressChart({
  title,
  data,
  height = 200
}: ProgressChartProps) {
  const maxValue = Math.max(...data.map(item => item.value), 1)

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="flex items-end h-48 space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="text-xs text-gray-500 mb-1">{item.value}</div>
            <div
              className="w-full rounded-t flex items-end justify-center"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color,
                minHeight: '4px'
              }}
            >
              <span className="text-xs text-white font-medium transform -rotate-90 origin-center whitespace-nowrap mb-2">
                {item.name}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <div className="flex space-x-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}