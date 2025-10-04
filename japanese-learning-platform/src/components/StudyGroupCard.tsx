'use client'

import React from 'react'
import Link from 'next/link'
import { StudyGroup } from '@/lib/database/types'

interface StudyGroupCardProps {
  group: StudyGroup
  isMember?: boolean
  onJoin?: (groupId: number) => void
  onLeave?: (groupId: number) => void
}

export const StudyGroupCard: React.FC<StudyGroupCardProps> = ({
  group,
  isMember = false,
  onJoin,
  onLeave
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
            {group.description && (
              <p className="mt-2 text-gray-600 line-clamp-2">{group.description}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-500">
          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>{group.member_count} members</span>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Link
            href={`/groups/${group.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Group
          </Link>

          {isMember ? (
            <button
              onClick={() => onLeave && onLeave(group.id)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Leave Group
            </button>
          ) : (
            <button
              onClick={() => onJoin && onJoin(group.id)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Join Group
            </button>
          )}
        </div>
      </div>
    </div>
  )
}