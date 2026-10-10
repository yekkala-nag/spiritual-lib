import type { Book } from '@/types/library'

import { getDeviceId, isSupabaseConfigured, supabase } from './supabase'

type BookRow = {
  id: string
  title: string
  author: string
  genre: string
  year: number
  pages: number
  rating: number
  description: string
  cover: string
  accent: string
  reader_url?: string | null
  sort_order: number
}

type SavedRow = {
  book_id: string
}

type ProgressRow = {
  book_id: string
  progress: number
}

function mapBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    genre: row.genre,
    year: row.year,
    pages: row.pages,
    rating: Number(row.rating),
    description: row.description,
    cover: row.cover,
    accent: row.accent,
    readerUrl: row.reader_url ?? undefined,
  }
}

export async function fetchRemoteBooks(): Promise<Book[] | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn('Unable to load books from Supabase:', error.message)
    return null
  }

  return ((data ?? []) as BookRow[]).map(mapBook)
}

export async function fetchRemoteShelf(): Promise<{
  saved: string[]
  progress: Record<string, number>
} | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const deviceId = getDeviceId()
  const [savedResult, progressResult] = await Promise.all([
    supabase.from('saved_books').select('book_id').eq('device_id', deviceId),
    supabase.from('reading_progress').select('book_id, progress').eq('device_id', deviceId),
  ])

  if (savedResult.error || progressResult.error) {
    console.warn(
      'Unable to load reading state from Supabase:',
      savedResult.error?.message ?? progressResult.error?.message,
    )
    return null
  }

  const saved = ((savedResult.data ?? []) as SavedRow[]).map((row) => row.book_id)
  const progress = Object.fromEntries(
    ((progressResult.data ?? []) as ProgressRow[]).map((row) => [row.book_id, Number(row.progress)]),
  )

  return { saved, progress }
}

export async function syncRemoteShelf(
  saved: string[],
  progress: Record<string, number>,
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return

  const deviceId = getDeviceId()

  try {
    // Sync saved_books: upsert current set, then remove any that were deselected.
    const savedRows = saved.map((bookId) => ({ device_id: deviceId, book_id: bookId }))

    if (savedRows.length > 0) {
      const { error } = await supabase
        .from('saved_books')
        .upsert(savedRows, { onConflict: 'device_id,book_id', ignoreDuplicates: false })
      if (error) throw error
    }

    // Remove saved_books no longer in the list
    if (saved.length > 0) {
      const { error } = await supabase
        .from('saved_books')
        .delete()
        .eq('device_id', deviceId)
        .not('book_id', 'in', `(${saved.join(',')})`)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('saved_books')
        .delete()
        .eq('device_id', deviceId)
      if (error) throw error
    }

    // Sync reading_progress: upsert active progress, then clean up zeroed entries.
    const progressRows = Object.entries(progress)
      .filter(([, value]) => value > 0)
      .map(([bookId, value]) => ({
        device_id: deviceId,
        book_id: bookId,
        progress: value,
        updated_at: new Date().toISOString(),
      }))

    if (progressRows.length > 0) {
      const { error } = await supabase
        .from('reading_progress')
        .upsert(progressRows, { onConflict: 'device_id,book_id', ignoreDuplicates: false })
      if (error) throw error
    }

    // Remove progress entries that were reset to zero
    const activeBookIds = progressRows.map((r) => r.book_id)
    if (activeBookIds.length > 0) {
      const { error } = await supabase
        .from('reading_progress')
        .delete()
        .eq('device_id', deviceId)
        .not('book_id', 'in', `(${activeBookIds.join(',')})`)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('reading_progress')
        .delete()
        .eq('device_id', deviceId)
      if (error) throw error
    }
  } catch (error) {
    console.warn('Unable to sync reading state to Supabase:', error)
  }
}
