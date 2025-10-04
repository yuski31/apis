import { supabase } from '../../supabase/client'
import { Book, BookReadingProgress } from '../types'

// Get all published books
export const getBooks = async (): Promise<Book[] | null> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('is_published', true)
      .order('jlpt_level', { ascending: true })
      .order('title', { ascending: true })

    if (error) {
      console.error('Error fetching books:', error)
      return null
    }

    return data as Book[]
  } catch (error) {
    console.error('Error fetching books:', error)
    return null
  }
}

// Get books by JLPT level
export const getBooksByJLPTLevel = async (level: number): Promise<Book[] | null> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('jlpt_level', level)
      .eq('is_published', true)
      .order('title', { ascending: true })

    if (error) {
      console.error(`Error fetching JLPT N${level} books:`, error)
      return null
    }

    return data as Book[]
  } catch (error) {
    console.error(`Error fetching JLPT N${level} books:`, error)
    return null
  }
}

// Get book by ID
export const getBookById = async (id: number): Promise<Book | null> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching book:', error)
      return null
    }

    return data as Book
  } catch (error) {
    console.error('Error fetching book:', error)
    return null
  }
}

// Search books by title or author
export const searchBooks = async (searchTerm: string): Promise<Book[] | null> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('is_published', true)
      .or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`)
      .order('title', { ascending: true })

    if (error) {
      console.error('Error searching books:', error)
      return null
    }

    return data as Book[]
  } catch (error) {
    console.error('Error searching books:', error)
    return null
  }
}

// Create a new book
export const createBook = async (book: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<Book | null> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .insert([
        {
          ...book,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating book:', error)
      return null
    }

    return data as Book
  } catch (error) {
    console.error('Error creating book:', error)
    return null
  }
}

// Update a book
export const updateBook = async (id: number, updates: Partial<Book>): Promise<Book | null> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating book:', error)
      return null
    }

    return data as Book
  } catch (error) {
    console.error('Error updating book:', error)
    return null
  }
}

// Delete a book
export const deleteBook = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting book:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting book:', error)
    return false
  }
}

// Get user's reading progress for all books
export const getUserReadingProgress = async (userId: string): Promise<BookReadingProgress[] | null> => {
  try {
    const { data, error } = await supabase
      .from('book_reading_progress')
      .select('*')
      .eq('user_id', userId)
      .order('last_read', { ascending: false })

    if (error) {
      console.error('Error fetching user reading progress:', error)
      return null
    }

    return data as BookReadingProgress[]
  } catch (error) {
    console.error('Error fetching user reading progress:', error)
    return null
  }
}

// Get user's reading progress for a specific book
export const getUserProgressForBook = async (userId: string, bookId: number): Promise<BookReadingProgress | null> => {
  try {
    const { data, error } = await supabase
      .from('book_reading_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single()

    if (error) {
      console.error('Error fetching user progress for book:', error)
      return null
    }

    return data as BookReadingProgress
  } catch (error) {
    console.error('Error fetching user progress for book:', error)
    return null
  }
}

// Update user's reading progress for a book
export const updateUserReadingProgress = async (
  userId: string,
  bookId: number,
  updates: Partial<BookReadingProgress>
): Promise<BookReadingProgress | null> => {
  try {
    // Check if progress record exists
    const existingProgress = await getUserProgressForBook(userId, bookId)

    let progressRecord: BookReadingProgress

    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from('book_reading_progress')
        .update({
          ...updates,
          last_read: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating book reading progress:', error)
        return null
      }

      progressRecord = data as BookReadingProgress
    } else {
      // Create new progress record
      const { data, error } = await supabase
        .from('book_reading_progress')
        .insert([
          {
            user_id: userId,
            book_id: bookId,
            current_page: 0,
            last_read: new Date().toISOString(),
            ...updates,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating book reading progress:', error)
        return null
      }

      progressRecord = data as BookReadingProgress
    }

    return progressRecord
  } catch (error) {
    console.error('Error updating user reading progress:', error)
    return null
  }
}

// Mark book as completed
export const completeBook = async (userId: string, bookId: number): Promise<BookReadingProgress | null> => {
  try {
    const completionTime = new Date().toISOString()

    const progress = await updateUserReadingProgress(userId, bookId, {
      completed_at: completionTime,
      current_page: null // Assuming we don't track pages for completed books
    })

    return progress
  } catch (error) {
    console.error('Error completing book:', error)
    return null
  }
}