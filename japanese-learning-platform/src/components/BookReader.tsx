'use client'

import React, { useState } from 'react'
import { Book, BookChapter } from '@/lib/database/types'
import { useBookReader } from '@/hooks/useBookReader'

interface BookReaderProps {
  userId: string | undefined
  bookId: number
}

export const BookReader: React.FC<BookReaderProps> = ({ userId, bookId }) => {
  const {
    book,
    chapters,
    currentChapterIndex,
    readingProgress,
    loading,
    error,
    getCurrentChapter,
    goToChapter,
    nextChapter,
    previousChapter,
    completeReading
  } = useBookReader(userId, bookId)

  const [showFurigana, setShowFurigana] = useState(true)
  const [fontSize, setFontSize] = useState(16)

  const currentChapter = getCurrentChapter()

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

  if (!book || !currentChapter) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p>Book or chapter not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Reader Controls */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={previousChapter}
              disabled={currentChapterIndex === 0}
              className={`px-4 py-2 rounded-md ${
                currentChapterIndex === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            <button
              onClick={nextChapter}
              disabled={currentChapterIndex === chapters.length - 1}
              className={`px-4 py-2 rounded-md ${
                currentChapterIndex === chapters.length - 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showFurigana}
                onChange={(e) => setShowFurigana(e.target.checked)}
                className="mr-2"
              />
              Show Furigana
            </label>

            <div className="flex items-center space-x-2">
              <span>Font Size:</span>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="border rounded p-1"
              >
                <option value="14">Small</option>
                <option value="16">Medium</option>
                <option value="18">Large</option>
                <option value="20">X-Large</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chapter Navigation */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {chapters.map((_, index) => (
              <button
                key={index}
                onClick={() => goToChapter(index)}
                className={`px-3 py-1 rounded-full text-sm ${
                  index === currentChapterIndex
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Chapter {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Book Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
        {book.author && (
          <p className="text-lg text-gray-600 mb-4">by {book.author}</p>
        )}
        {book.description && (
          <p className="text-gray-700 mb-4">{book.description}</p>
        )}
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-4">JLPT Level: N{book.jlpt_level}</span>
          <span>
            Progress: {currentChapterIndex + 1} of {chapters.length} chapters
          </span>
        </div>
      </div>

      {/* Chapter Content */}
      <div className="bg-white shadow rounded-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {currentChapter.title}
        </h2>
        <div
          className="prose prose-lg max-w-none"
          style={{ fontSize: `${fontSize}px` }}
        >
          {renderChapterContent(currentChapter, showFurigana)}
        </div>
      </div>

      {/* Chapter Navigation Footer */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={previousChapter}
            disabled={currentChapterIndex === 0}
            className={`px-4 py-2 rounded-md ${
              currentChapterIndex === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Previous Chapter
          </button>

          {currentChapterIndex === chapters.length - 1 ? (
            <button
              onClick={completeReading}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Complete Book
            </button>
          ) : (
            <button
              onClick={nextChapter}
              disabled={currentChapterIndex === chapters.length - 1}
              className={`px-4 py-2 rounded-md ${
                currentChapterIndex === chapters.length - 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Next Chapter →
            </button>
          )}

          <div className="text-sm text-gray-500">
            {currentChapterIndex + 1} / {chapters.length}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to render chapter content with furigana
const renderChapterContent = (chapter: BookChapter, showFurigana: boolean) => {
  if (!chapter.furigana || !showFurigana) {
    return <p className="leading-relaxed whitespace-pre-line">{chapter.content}</p>
  }

  // This is a simplified implementation
  // In a real application, you would want to properly parse and render furigana
  return (
    <div className="leading-relaxed">
      {chapter.furigana.map((furigana, index) => (
        <ruby key={index} className="ruby-text">
          <rb>{furigana.text}</rb>
          <rt className="text-xs">{furigana.reading}</rt>
        </ruby>
      ))}
    </div>
  )
}