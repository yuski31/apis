import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Book, BookReadingProgress } from '@/lib/database/types'
import {
  getBookById,
  getUserReadingProgress,
  getUserProgressForBook,
  updateUserReadingProgress,
  completeBook
} from '@/lib/database/functions/books'

export interface BookChapter {
  id: string
  title: string
  content: string
  furigana?: Array<{
    text: string
    reading: string
    position: number
  }>
}

export const useBookReader = (userId: string | undefined, bookId: number | null) => {
  const [book, setBook] = useState<Book | null>(null)
  const [chapters, setChapters] = useState<BookChapter[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [readingProgress, setReadingProgress] = useState<BookReadingProgress | null>(null)
  const [userProgress, setUserProgress] = useState<BookReadingProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bookId) return

    const fetchBook = async () => {
      setLoading(true)
      try {
        const fetchedBook = await getBookById(bookId)
        if (fetchedBook) {
          setBook(fetchedBook)

          // Parse chapters from book content
          if (fetchedBook.content) {
            const bookContent = fetchedBook.content as {
              chapters: BookChapter[]
            }
            setChapters(bookContent.chapters || [])
          }

          if (userId) {
            const progress = await getUserProgressForBook(userId, bookId)
            if (progress) {
              setReadingProgress(progress)
              // Set current chapter based on progress
              if (progress.current_page !== null && progress.current_page > 0) {
                setCurrentChapterIndex(progress.current_page - 1)
              }
            }
          }
        }
      } catch (err) {
        setError('Failed to fetch book')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [bookId, userId])

  useEffect(() => {
    if (!userId) return

    const fetchUserProgress = async () => {
      try {
        const progress = await getUserReadingProgress(userId)
        if (progress) {
          setUserProgress(progress)
        }
      } catch (err) {
        console.error('Error fetching user reading progress:', err)
      }
    }

    fetchUserProgress()
  }, [userId])

  const goToChapter = async (chapterIndex: number) => {
    if (!bookId || !userId) return

    setCurrentChapterIndex(chapterIndex)

    // Update reading progress
    if (userId) {
      try {
        const progress = await updateUserReadingProgress(userId, bookId, {
          current_page: chapterIndex + 1
        })
        if (progress) {
          setReadingProgress(progress)
        }
      } catch (err) {
        console.error('Error updating reading progress:', err)
      }
    }
  }

  const nextChapter = async () => {
    if (currentChapterIndex < chapters.length - 1) {
      await goToChapter(currentChapterIndex + 1)
    }
  }

  const previousChapter = async () => {
    if (currentChapterIndex > 0) {
      await goToChapter(currentChapterIndex - 1)
    }
  }

  const completeReading = async () => {
    if (!bookId || !userId) return

    try {
      const progress = await completeBook(userId, bookId)
      if (progress) {
        setReadingProgress(progress)
        // Update user progress list
        setUserProgress(prev => {
          const existingIndex = prev.findIndex(p => p.book_id === bookId)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = progress
            return updated
          }
          return [...prev, progress]
        })
      }
    } catch (err) {
      setError('Failed to complete book')
      console.error(err)
    }
  }

  const getCurrentChapter = (): BookChapter | null => {
    if (chapters.length === 0 || currentChapterIndex >= chapters.length) {
      return null
    }
    return chapters[currentChapterIndex]
  }

  const getBookProgress = (bookId: number): BookReadingProgress | undefined => {
    return userProgress.find(progress => progress.book_id === bookId)
  }

  return {
    book,
    chapters,
    currentChapterIndex,
    readingProgress,
    userProgress,
    loading,
    error,
    getCurrentChapter,
    goToChapter,
    nextChapter,
    previousChapter,
    completeReading,
    getBookProgress
  }
}