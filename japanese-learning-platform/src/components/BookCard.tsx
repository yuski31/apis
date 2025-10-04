'use client'

import React from 'react'
import Link from 'next/link'
import { Book, BookReadingProgress } from '@/lib/database/types'

interface BookCardProps {
  book: Book
  progress?: BookReadingProgress
}

export const BookCard: React.FC<BookCardProps> = ({ book, progress }) => {
  const isCompleted = progress?.completed_at !== null
  const currentPage = progress?.current_page || 0

  // Calculate progress percentage (simplified)
  const progressPercentage = book.total_pages
    ? Math.min(100, Math.round((currentPage / book.total_pages) * 100))
    : 0

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {book.cover_image_url ? (
        <div className="h-48 overflow-hidden">
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{book.title}</h3>
          {book.jlpt_level && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              N{book.jlpt_level}
            </span>
          )}
        </div>

        {book.author && (
          <p className="text-gray-600 mb-3">by {book.author}</p>
        )}

        {book.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">{book.description}</p>
        )}

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Progress</span>
            <span>
              {isCompleted ? 'Completed' : progressPercentage > 0 ? `${progressPercentage}%` : 'Not started'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                isCompleted ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${isCompleted ? 100 : progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Link
            href={`/books/${book.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isCompleted ? 'Read Again' : progressPercentage > 0 ? 'Continue' : 'Start Reading'}
          </Link>

          {book.total_pages && (
            <span className="text-sm text-gray-500">
              {book.total_pages} pages
            </span>
          )}
        </div>
      </div>
    </div>
  )
}