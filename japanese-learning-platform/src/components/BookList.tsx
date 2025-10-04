'use client'

import React, { useState, useEffect } from 'react'
import { Book, BookReadingProgress } from '@/lib/database/types'
import { getBooks, getBooksByJLPTLevel, searchBooks } from '@/lib/database/functions/books'
import { BookCard } from './BookCard'

interface BookListProps {
  userId?: string
  initialBooks?: Book[]
}

export const BookList: React.FC<BookListProps> = ({ userId, initialBooks }) => {
  const [books, setBooks] = useState<Book[]>(initialBooks || [])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(initialBooks || [])
  const [userProgress, setUserProgress] = useState<BookReadingProgress[]>([])
  const [loading, setLoading] = useState(!initialBooks)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [jlptFilter, setJlptFilter] = useState<number | 'all'>('all')

  useEffect(() => {
    if (initialBooks) return

    const fetchBooks = async () => {
      setLoading(true)
      try {
        const fetchedBooks = await getBooks()
        if (fetchedBooks) {
          setBooks(fetchedBooks)
          setFilteredBooks(fetchedBooks)
        }
      } catch (err) {
        setError('Failed to fetch books')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [initialBooks])

  useEffect(() => {
    let result = books

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        book =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply JLPT level filter
    if (jlptFilter !== 'all') {
      result = result.filter(book => book.jlpt_level === jlptFilter)
    }

    setFilteredBooks(result)
  }, [searchTerm, jlptFilter, books])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleJLPTFilter = (level: number | 'all') => {
    setJlptFilter(level)
  }

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
    <div>
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleJLPTFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                jlptFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Levels
            </button>
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                onClick={() => handleJLPTFilter(level)}
                className={`px-3 py-1 rounded-full text-sm ${
                  jlptFilter === level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                N{level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">No books found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              progress={userProgress.find(p => p.book_id === book.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}