import React from 'react'
import Link from 'next/link'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  linkHref: string
  linkText: string
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
  linkHref,
  linkText
}: StatsCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${color} rounded-md p-3`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <Link href={linkHref} className="font-medium text-indigo-600 hover:text-indigo-500">
            {linkText}<span className="sr-only"> {title.toLowerCase()}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}