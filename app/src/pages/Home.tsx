import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUpDown,
  BookMarked,
  Download,
  BookOpen,
  Bookmark,
  CheckCircle2,
  LibraryBig,
  Loader2,
  NotebookPen,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Trash2,
  Undo2,
} from 'lucide-react'

import { fetchRemoteBooks, fetchRemoteShelf, syncRemoteShelf } from '@/lib/library-store'
import type { Book, NoteItem } from '@/types/library'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ProgressFilter = 'all' | 'unread' | 'reading' | 'finished'
type SortOption = 'featured' | 'rating' | 'title' | 'newest' | 'oldest'

const BOOKS: Book[] = [
  {
    id: 'ponder-on-this',
    title: 'Ponder on This',
    author: 'Alice A. Bailey & The Tibetan',
    genre: 'Spirituality',
    year: 1950,
    pages: 544,
    rating: 4.9,
    description: 'A compilation from the writings of Alice A. Bailey and the Tibetan Master Djwhal Khul on discipleship, meditation, service, and the spiritual path.',
    cover: 'linear-gradient(145deg, #123c3c 0%, #4a8585 52%, #d9f0ee 100%)',
    accent: '#4a8585',
    readerUrl: '/ponder-on-this.html',
  },
  {
    id: 'the-shape-of-things-to-come',
    title: 'The Shape of Things to Come',
    author: 'H. G. Wells',
    genre: 'Fiction',
    year: 1933,
    pages: 5,
    rating: 4.6,
    description: 'H. G. Wells’ future-history framed as Dr. Philip Raven’s dream book, tracing the collapse of the old order and the emergence of a world state.',
    cover: 'linear-gradient(145deg, #111827 0%, #334155 48%, #93c5fd 100%)',
    accent: '#93c5fd',
    readerUrl: '/the-shape-of-things-to-come.html',
  },
  {
    id: 'hp-blavatsky-the-light-bringer',
    title: 'H. P. Blavatsky: The Light-Bringer',
    author: 'Geoffrey A. Barborka',
    genre: 'Spirituality',
    year: 1970,
    pages: 76,
    rating: 4.8,
    description: 'The 1970 Blavatsky Lecture — Geoffrey A. Barborka’s portrait of Helena Petrovna Blavatsky, her life, her mission, and the founding of the Theosophical Society.',
    cover: 'linear-gradient(145deg, #2b1a3d 0%, #6d4a8f 48%, #e9d5ff 100%)',
    accent: '#6d4a8f',
    readerUrl: '/hp-blavatsky-the-light-bringer.html',
  },
  {
    id: 'mahatma-letters',
    title: 'The Mahatma Letters to A. P. Sinnett',
    author: 'A. Trevor Barker (compiler)',
    genre: 'Spirituality',
    year: 1923,
    pages: 650,
    rating: 4.9,
    description: 'The private letters written between 1880 and 1890 by the Mahatmas Koot Hoomi and Morya to A. P. Sinnett and A. O. Hume — transcribed and compiled by A. Trevor Barker.',
    cover: 'linear-gradient(145deg, #3d2b12 0%, #a67c2e 52%, #f5e6c4 100%)',
    accent: '#a67c2e',
    readerUrl: '/mahatma-letters.html',
  },
  {
    id: 'thought-forms',
    title: 'Thought-Forms',
    author: 'Annie Besant & C. W. Leadbeater',
    genre: 'Spirituality',
    year: 1901,
    pages: 46,
    rating: 4.7,
    description: 'Besant and Leadbeater’s clairvoyant study of how thoughts and emotions take shape and colour in the subtle worlds, with the classic illustrated plates.',
    cover: 'linear-gradient(145deg, #3f1d38 0%, #c1567b 52%, #f7e8ef 100%)',
    accent: '#c1567b',
    readerUrl: '/thought-forms.html',
  },
  {
    id: 'wisdom-of-the-heavens',
    title: 'Wisdom of the Heavens',
    author: 'Master E.K. (Kulapati E. Krishnamacharya)',
    genre: 'Spirituality',
    year: 1987,
    pages: 151,
    rating: 4.8,
    description: 'Master E.K.’s eleven-chapter guide to spiritual astrology — the astrology of the scriptures, the validity of the zodiac, the measures of time, and the principles governed by the planets.',
    cover: 'linear-gradient(145deg, #0c1445 0%, #2b4c8c 52%, #ffd97a 100%)',
    accent: '#2b4c8c',
    readerUrl: '/wisdom-of-the-heavens.html',
  },
  {
    id: 'the-divine-plan',
    title: 'The Divine Plan (Excerpt)',
    author: 'Geoffrey A. Barborka',
    genre: 'Spirituality',
    year: 1961,
    pages: 49,
    rating: 4.7,
    description: 'Chapters IX–X of Barborka’s The Divine Plan — the Doctrine of the Rounds and the After-Death States — as a full text edition, with the original diagrams preserved.',
    cover: 'linear-gradient(145deg, #1a2332 0%, #4a6fa5 52%, #d4e2f5 100%)',
    accent: '#4a6fa5',
    readerUrl: '/the-divine-plan.html',
  },
  {
    id: 'power-of-now',
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    genre: 'Spirituality',
    year: 1997,
    pages: 242,
    rating: 4.8,
    description: 'Eckhart Tolle’s modern classic on spiritual awakening — leaving identification with the mind, entering the present moment, and living from presence.',
    cover: 'linear-gradient(145deg, #14261d 0%, #2e7d5b 52%, #cfe8dc 100%)',
    accent: '#2e7d5b',
    readerUrl: '/power-of-now.html',
  },
  {
    id: 'a-new-earth',
    title: 'A New Earth',
    author: 'Eckhart Tolle',
    genre: 'Spirituality',
    year: 2005,
    pages: 189,
    rating: 4.8,
    description: 'Tolle’s follow-up to The Power of Now — the flowering of human consciousness, the anatomy of the ego and the pain-body, and awakened living as the seed of a new earth.',
    cover: 'linear-gradient(145deg, #101d2b 0%, #2b6cb0 52%, #cfe3f5 100%)',
    accent: '#2b6cb0',
    readerUrl: '/a-new-earth.html',
  },
  {
    id: 'shape-of-things-study-companion',
    title: 'The Shape of Things to Come — Topic Consolidation',
    author: 'H. G. Wells',
    genre: 'Study Guide',
    year: 1933,
    pages: 6,
    rating: 4.5,
    description: 'A complete topic consolidation of Wells’ future-history — structure, themes, and predictions organized as study notes.',
    cover: 'linear-gradient(145deg, #14251c 0%, #3f6b4f 52%, #cfe8d8 100%)',
    accent: '#3f6b4f',
    readerUrl: '/shape-of-things-study-companion.html',
  },
  {
    id: 'the-ocean-of-theosophy',
    title: 'The Ocean of Theosophy',
    author: 'William Q. Judge',
    genre: 'Spirituality',
    year: 1893,
    pages: 215,
    rating: 4.9,
    description: 'William Q. Judge’s lucid classic — the complete 1893 text: the Masters, the Earth Chain, the septenary constitution of man, reincarnation, karma, devachan, cycles, and psychic laws.',
    cover: 'linear-gradient(145deg, #0b2e4f 0%, #1e6f8e 52%, #bfe8f0 100%)',
    accent: '#1e6f8e',
    readerUrl: '/the-ocean-of-theosophy.html',
  },
  {
    id: 'the-ancient-wisdom',
    title: 'The Ancient Wisdom',
    author: 'Annie Besant',
    genre: 'Spirituality',
    year: 1897,
    pages: 434,
    rating: 4.8,
    description: 'Annie Besant’s clear outline of the Ancient Wisdom — the planes of nature, kamaloka, devachan, reincarnation, karma, and the building of a cosmos.',
    cover: 'linear-gradient(145deg, #10321f 0%, #2f7a4f 52%, #d9f2e2 100%)',
    accent: '#2f7a4f',
    readerUrl: '/the-ancient-wisdom.html',
  },
  {
    id: 'man-visible-and-invisible',
    title: 'Man Visible and Invisible',
    author: 'C. W. Leadbeater',
    genre: 'Spirituality',
    year: 1902,
    pages: 150,
    rating: 4.8,
    description: 'Leadbeater’s clairvoyant study of the human aura and subtle bodies, with the celebrated colour plates of the astral and mental bodies.',
    cover: 'linear-gradient(145deg, #33134d 0%, #7a3fa0 45%, #f2b8c6 100%)',
    accent: '#7a3fa0',
    readerUrl: '/man-visible-and-invisible.html',
  },
  {
    id: 'the-secret-teachings-of-all-ages',
    title: 'The Secret Teachings of All Ages',
    author: 'Manly P. Hall',
    genre: 'Spirituality',
    year: 1928,
    pages: 1655,
    rating: 4.9,
    description: 'Manly P. Hall’s monumental encyclopedia of esoteric wisdom — mysteries, symbolism, alchemy, and the secret doctrines of antiquity, with over 200 original illustrations.',
    cover: 'linear-gradient(145deg, #2b0f0f 0%, #7a2a1e 50%, #e8c88a 100%)',
    accent: '#7a2a1e',
    readerUrl: '/the-secret-teachings-of-all-ages.html',
  },
  {
    id: 'the-inner-life',
    title: 'The Inner Life',
    author: 'C. W. Leadbeater',
    genre: 'Spirituality',
    year: 1910,
    pages: 1071,
    rating: 4.7,
    description: 'Leadbeater’s Adyar talks on the inner side of the spiritual life — the Great Ones, religion, the theosophical attitude, and the unseen worlds.',
    cover: 'linear-gradient(145deg, #1d1b4b 0%, #5451a8 52%, #dcd9f7 100%)',
    accent: '#5451a8',
    readerUrl: '/the-inner-life.html',
  },
  {
    id: 'secret-doctrine-vol-1',
    title: 'The Secret Doctrine — Vol. I: Cosmogenesis',
    author: 'H. P. Blavatsky',
    genre: 'Secret Doctrine',
    year: 1888,
    pages: 1491,
    rating: 4.9,
    description: 'Volume I of Blavatsky’s masterwork — Cosmogenesis: the stanzas of Dzyan, the evolution of the cosmos, and the symbolism of world scriptures, with original diagrams.',
    cover: 'linear-gradient(145deg, #12082b 0%, #43287a 50%, #c9a86a 100%)',
    accent: '#43287a',
    readerUrl: '/secret-doctrine-vol-1.html',
  },
  {
    id: 'secret-doctrine-vol-2',
    title: 'The Secret Doctrine — Vol. II: Anthropogenesis',
    author: 'H. P. Blavatsky',
    genre: 'Secret Doctrine',
    year: 1888,
    pages: 1812,
    rating: 4.9,
    description: 'Volume II — Anthropogenesis: the stanzas on the evolution of humanity, the Root-Races, and the esoteric history of man and the earth.',
    cover: 'linear-gradient(145deg, #0f2027 0%, #2c5364 55%, #d8c3a5 100%)',
    accent: '#2c5364',
    readerUrl: '/secret-doctrine-vol-2.html',
  },
  {
    id: 'secret-doctrine-vol-3',
    title: 'The Secret Doctrine — Vol. III',
    author: 'H. P. Blavatsky',
    genre: 'Secret Doctrine',
    year: 1897,
    pages: 1137,
    rating: 4.8,
    description: 'The posthumous third volume — further esoteric teachings, commentaries on Eastern scriptures, occult science, and the mystery-language of the initiates.',
    cover: 'linear-gradient(145deg, #1f0a0a 0%, #6b2d5c 50%, #e0bfb0 100%)',
    accent: '#6b2d5c',
    readerUrl: '/secret-doctrine-vol-3.html',
  },
  {
    id: 'clairvoyance',
    title: 'Clairvoyance',
    author: 'C. W. Leadbeater',
    genre: 'Spirituality',
    year: 1899,
    pages: 203,
    rating: 4.7,
    description: 'Leadbeater’s concise manual on clairvoyance — what it is, the kinds of clear-seeing, and how the faculty may be developed safely and sensibly.',
    cover: 'linear-gradient(145deg, #101d42 0%, #3a6ea5 55%, #c9dcef 100%)',
    accent: '#3a6ea5',
    readerUrl: '/clairvoyance.html',
  },
  {
    id: 'isis-unveiled',
    title: 'Isis Unveiled',
    author: 'H. P. Blavatsky',
    genre: 'Spirituality',
    year: 1877,
    pages: 2787,
    rating: 4.9,
    description: 'Blavatsky’s first great work — a master-key to the mysteries of ancient and modern science and theology, with the original symbolic illustrations.',
    cover: 'linear-gradient(145deg, #2b1608 0%, #8a5a2a 50%, #f0d9a8 100%)',
    accent: '#8a5a2a',
    readerUrl: '/isis-unveiled.html',
  },
  {
    id: 'the-key-to-theosophy',
    title: 'The Key to Theosophy',
    author: 'H. P. Blavatsky',
    genre: 'Spirituality',
    year: 1889,
    pages: 405,
    rating: 4.8,
    description: 'Blavatsky’s classic question-and-answer exposition — the Theosophical Society, its teachings, karma, reincarnation, and the nature of man.',
    cover: 'linear-gradient(145deg, #0d2818 0%, #1e6f5c 55%, #cde8d8 100%)',
    accent: '#1e6f5c',
    readerUrl: '/the-key-to-theosophy.html',
  },
  {
    id: 'the-voice-of-the-silence',
    title: 'The Voice of the Silence',
    author: 'H. P. Blavatsky',
    genre: 'Spirituality',
    year: 1889,
    pages: 67,
    rating: 4.9,
    description: 'The beloved devotional classic translated from the Book of the Golden Precepts — three fragments on the path of the heart and the wisdom of the silence.',
    cover: 'linear-gradient(145deg, #3d0c11 0%, #a8385d 55%, #f6d9e0 100%)',
    accent: '#a8385d',
    readerUrl: '/the-voice-of-the-silence.html',
  },
  {
    id: 'the-hidden-side-of-things',
    title: 'The Hidden Side of Things',
    author: 'C. W. Leadbeater',
    genre: 'Spirituality',
    year: 1913,
    pages: 808,
    rating: 4.7,
    description: 'Leadbeater’s wide-ranging study of the unseen side of everyday life — the occult effects of places, people, objects, ceremonies, and nature.',
    cover: 'linear-gradient(145deg, #1a1428 0%, #5c4a8a 55%, #d9d0ee 100%)',
    accent: '#5c4a8a',
    readerUrl: '/the-hidden-side-of-things.html',
  },
  {
    id: 'collected-fruits-of-occult-teaching',
    title: 'Collected Fruits of Occult Teaching',
    author: 'A. P. Sinnett',
    genre: 'Spirituality',
    year: 1919,
    pages: 343,
    rating: 4.7,
    description: 'Sinnett’s mature essays gathering the fruits of a lifetime in theosophy — the Masters, the planetary chain, the higher self, and the future of occult teaching.',
    cover: 'linear-gradient(145deg, #241a08 0%, #7a5c1e 55%, #ecd9a8 100%)',
    accent: '#7a5c1e',
    readerUrl: '/collected-fruits-of-occult-teaching.html',
  },
  {
    id: 'in-the-outer-court',
    title: 'In the Outer Court',
    author: 'Annie Besant',
    genre: 'Spirituality',
    year: 1895,
    pages: 95,
    rating: 4.8,
    description: 'Besant’s talks on the probationary path — purification, thought-control, the building of character, and service in the outer court of the Mysteries.',
    cover: 'linear-gradient(145deg, #08202b 0%, #2a7a8a 55%, #cfeef2 100%)',
    accent: '#2a7a8a',
    readerUrl: '/in-the-outer-court.html',
  },
  {
    id: 'letters-that-have-helped-me',
    title: 'Letters That Have Helped Me',
    author: 'William Q. Judge',
    genre: 'Spirituality',
    year: 1891,
    pages: 462,
    rating: 4.8,
    description: 'William Q. Judge’s warm letters of counsel to students — practical encouragement on the path, the inner life, and the everyday trials of the theosophist.',
    cover: 'linear-gradient(145deg, #1c0f24 0%, #6a3a8a 55%, #e2d3f2 100%)',
    accent: '#6a3a8a',
    readerUrl: '/letters-that-have-helped-me.html',
  },
]

const SAVED_KEY = 'spiritual-library-saved'
const PROGRESS_KEY = 'spiritual-library-progress'
const NOTES_KEY = 'sl_my_notes'

function readStoredNotes(): NoteItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(NOTES_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as NoteItem[]) : []
  } catch {
    return []
  }
}

function formatNoteDate(ts: number) {
  try {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

function readStoredSaved(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(SAVED_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function readStoredProgress(): Record<string, number> {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch {
    return {}
  }
}

function getInitials(title: string) {
  return title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function clampProgress(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function Home() {
  const [books, setBooks] = useState<Book[]>(BOOKS)
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('All genres')
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>('all')
  const [sort, setSort] = useState<SortOption>('featured')
  const [progress, setProgress] = useState<Record<string, number>>(readStoredProgress)
  const [saved, setSaved] = useState<string[]>(readStoredSaved)
  const [remoteReady, setRemoteReady] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [readingBookId, setReadingBookId] = useState<string | null>(null)
  const [notes, setNotes] = useState<NoteItem[]>(readStoredNotes)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function refreshNotes() {
      setNotes(readStoredNotes())
    }

    function onStorage(event: StorageEvent) {
      if (event.key === null || event.key === NOTES_KEY) refreshNotes()
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', refreshNotes)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', refreshNotes)
    }
  }, [])



  function deleteNote(noteId: string) {
    const next = notes.filter((note) => note.id !== noteId)
    setNotes(next)
    window.localStorage.setItem(NOTES_KEY, JSON.stringify(next))
  }

  function clearNotes() {
    setNotes([])
    window.localStorage.setItem(NOTES_KEY, JSON.stringify([]))
  }

  useEffect(() => {
    let active = true

    async function hydrateFromSupabase() {
      const [remoteBooks, remoteShelf] = await Promise.all([fetchRemoteBooks(), fetchRemoteShelf()])

      if (!active) return

      if (remoteBooks && remoteBooks.length > 0) {
        // Merge: local catalog is the base so newly added books always appear;
        // remote rows (edited in Supabase) override matching ids, and any
        // remote-only custom rows are appended.
        const remoteById = new Map(remoteBooks.map((book) => [book.id, book]))
        const merged = BOOKS.map((book) => remoteById.get(book.id) ?? book)
        const localIds = new Set(BOOKS.map((book) => book.id))
        const remoteOnly = remoteBooks.filter((book) => !localIds.has(book.id))
        setBooks([...merged, ...remoteOnly])
      }

      if (remoteShelf) {
        setSaved(remoteShelf.saved)
        setProgress(remoteShelf.progress)
      }

      setRemoteReady(true)
    }

    void hydrateFromSupabase()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!remoteReady) return

    window.localStorage.setItem(SAVED_KEY, JSON.stringify(saved))
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))

    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      setSyncing(true)
      void syncRemoteShelf(saved, progress).finally(() => setSyncing(false))
    }, 800)

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current)
    }
  }, [progress, remoteReady, saved])

  const genreOptions = useMemo(
    () => ['All genres', ...Array.from(new Set(books.map((book) => book.genre)))],
    [books],
  )

  const savedIds = useMemo(() => new Set(saved), [saved])

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const matches = books.filter((book) => {
      const value = progress[book.id] ?? 0
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [book.title, book.author, book.genre, book.description]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      const matchesGenre = genre === 'All genres' || book.genre === genre
      const matchesProgress =
        progressFilter === 'all' ||
        (progressFilter === 'unread' && value === 0) ||
        (progressFilter === 'reading' && value > 0 && value < 100) ||
        (progressFilter === 'finished' && value >= 100)

      return matchesQuery && matchesGenre && matchesProgress
    })

    return [...matches].sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'title') return a.title.localeCompare(b.title)
      if (sort === 'newest') return b.year - a.year
      if (sort === 'oldest') return a.year - b.year
      return books.findIndex((book) => book.id === a.id) - books.findIndex((book) => book.id === b.id)
    })
  }, [books, genre, progress, progressFilter, query, sort])

  const readingCount = books.filter((book) => {
    const value = progress[book.id] ?? 0
    return value > 0 && value < 100
  }).length
  const finishedCount = books.filter((book) => (progress[book.id] ?? 0) >= 100).length
  const averageProgress = books.length
    ? Math.round(books.reduce((sum, book) => sum + (progress[book.id] ?? 0), 0) / books.length)
    : 0
  const savedBooks = books.filter((book) => savedIds.has(book.id))
  const continueBooks = books.filter((book) => {
    const value = progress[book.id] ?? 0
    return value > 0 && value < 100
  })
  const readingBook = books.find((book) => book.id === readingBookId) ?? null

  function toggleSaved(bookId: string) {
    setSaved((current) =>
      current.includes(bookId) ? current.filter((id) => id !== bookId) : [...current, bookId],
    )
  }

  function setBookProgress(bookId: string, value: number) {
    setProgress((current) => ({
      ...current,
      [bookId]: clampProgress(value),
    }))
  }

  function advanceProgress(bookId: string) {
    const current = progress[bookId] ?? 0
    setBookProgress(bookId, current >= 100 ? 0 : current + 10)
  }

  function resetLibrary() {
    setProgress({})
    setSaved([])
    setQuery('')
    setGenre('All genres')
    setProgressFilter('all')
    setSort('featured')
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6efe3] text-stone-950">
      <section className="relative border-b border-stone-200/80 bg-[radial-gradient(circle_at_top_left,#d9f0ee,transparent_32%),linear-gradient(135deg,#fff7ed_0%,#f5ead6_45%,#e7dcc5_100%)]">
        <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(90deg,rgba(18,60,60,0.08)_1px,transparent_1px)] bg-[size:56px_100%]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-teal-100 shadow-lg shadow-stone-900/20">
                <LibraryBig className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-800">Sacred collection</p>
                <h1 className="text-2xl font-semibold tracking-tight">Spiritual Library</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {syncing && (
                <Badge variant="outline" className="border-stone-300 bg-white/70 text-stone-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Syncing…
                </Badge>
              )}
              <Button variant="outline" className="border-stone-300 bg-white/70" onClick={resetLibrary}>
                <RotateCcw className="h-4 w-4" />
                Reset reading
              </Button>
            </div>
          </header>

          <div className="grid items-end gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <Badge className="w-fit border-teal-300 bg-teal-50 px-3 py-1 text-teal-900 hover:bg-teal-50" variant="outline">
                <Sparkles className="h-3.5 w-3.5" />
                Built for reading, not just shelving
              </Badge>
              <div className="space-y-4">
                <h2 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-stone-950 sm:text-6xl lg:text-7xl">
                  Open a book and keep going.
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-stone-700">
                  Track progress, save books for later, and continue reading in a focused reader. Your reading state syncs to Supabase after setup.
                </p>
              </div>
            </div>

            <Card className="overflow-hidden rounded-[32px] border-stone-200 bg-white/75 py-0 shadow-[0_24px_80px_rgba(18,60,60,0.16)] backdrop-blur">
              <CardContent className="grid gap-0 p-0 sm:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-64 overflow-hidden bg-stone-950 p-6 text-white">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(74,133,133,0.5),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(147,197,253,0.28),transparent_32%)]" />
                  <div className="relative flex h-full flex-col justify-between">
                    <Badge className="w-fit bg-white/15 text-white hover:bg-white/15">Now reading</Badge>
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-teal-200">Featured book</p>
                      <h3 className="mt-3 text-3xl font-semibold leading-tight">Ponder on This</h3>
                      <p className="mt-3 max-w-xs text-sm leading-6 text-stone-200">
                        Ageless Wisdom teachings with topics, key points, summaries, notes, and bookmarks.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 p-6">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-teal-50 p-4">
                      <p className="text-2xl font-semibold">{books.length}</p>
                      <p className="text-xs text-stone-500">Books</p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-4">
                      <p className="text-2xl font-semibold">{readingCount}</p>
                      <p className="text-xs text-stone-500">Reading</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 p-4">
                      <p className="text-2xl font-semibold">{finishedCount}</p>
                      <p className="text-xs text-stone-500">Finished</p>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-teal-700" />
                        <p className="font-medium">Library progress</p>
                      </div>
                      <p className="text-sm font-semibold text-teal-800">{averageProgress}%</p>
                    </div>
                    <Progress value={averageProgress} className="mt-4 h-3 bg-teal-100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-10">
        <div className="space-y-6">
          <Card className="rounded-[28px] border-stone-200 bg-white/85 shadow-sm">
            <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_180px_190px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search title, author, genre, or theme..."
                  className="h-12 rounded-2xl border-stone-200 bg-white pl-10"
                />
              </label>

              <Select value={progressFilter} onValueChange={(value) => setProgressFilter(value as ProgressFilter)}>
                <SelectTrigger className="h-12 w-full rounded-2xl border-stone-200 bg-white">
                  <SelectValue placeholder="Reading state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All books</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
                <SelectTrigger className="h-12 w-full rounded-2xl border-stone-200 bg-white">
                  <ArrowUpDown className="h-4 w-4" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="rating">Highest rated</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {genreOptions.map((option) => (
              <Button
                key={option}
                variant={genre === option ? 'default' : 'outline'}
                className={
                  genre === option
                    ? 'rounded-full bg-stone-950 text-white hover:bg-stone-800'
                    : 'rounded-full border-stone-300 bg-white/80 text-stone-700 hover:bg-white'
                }
                onClick={() => setGenre(option)}
              >
                {option}
              </Button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Books</h2>
              <p className="text-sm text-stone-600">
                Showing {filteredBooks.length} of {books.length} books
              </p>
            </div>
            {readingCount > 0 && (
              <Badge variant="outline" className="border-teal-300 bg-teal-50 text-teal-900">
                <BookOpen className="h-3.5 w-3.5" />
                {readingCount} in progress
              </Badge>
            )}
          </div>

          {filteredBooks.length === 0 ? (
            <Card className="rounded-[28px] border-dashed border-stone-300 bg-white/70">
              <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 p-10 text-center">
                <BookOpen className="h-10 w-10 text-stone-400" />
                <h3 className="text-xl font-semibold">No books matched</h3>
                <p className="max-w-md text-sm leading-6 text-stone-600">
                  Try clearing the search or choosing a different reading state.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredBooks.map((book) => {
                const value = progress[book.id] ?? 0
                const isFinished = value >= 100
                const isReading = value > 0 && !isFinished
                const isSaved = savedIds.has(book.id)

                return (
                  <Card
                    key={book.id}
                    className="group overflow-hidden rounded-[28px] border-stone-200 bg-white py-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(18,60,60,0.14)]"
                  >
                    <div className="relative h-56 overflow-hidden" style={{ background: book.cover }}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.34),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_40%)]" />
                      <div className="absolute left-5 top-5 flex h-24 w-20 rotate-[-4deg] items-center justify-center rounded-md border border-white/30 bg-white/15 text-3xl font-semibold text-white shadow-2xl backdrop-blur-sm transition duration-300 group-hover:rotate-0">
                        {getInitials(book.title)}
                      </div>
                      <div className="absolute bottom-4 left-5 right-5 text-white">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/75">{book.genre}</p>
                        <h3 className="mt-1 line-clamp-2 text-2xl font-semibold leading-tight">{book.title}</h3>
                      </div>
                    </div>

                    <CardContent className="flex flex-1 flex-col gap-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-stone-900">{book.author}</p>
                          <p className="text-sm text-stone-500">
                            {book.year} · {book.pages} pages
                          </p>
                        </div>
                        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {book.rating.toFixed(1)}
                        </Badge>
                      </div>

                      <p className="line-clamp-3 text-sm leading-6 text-stone-600">{book.description}</p>

                      <div className="space-y-2 rounded-2xl bg-stone-50 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-stone-700">
                            {isFinished ? 'Finished' : isReading ? 'Reading' : 'Unread'}
                          </span>
                          <span className="text-stone-500">{value}%</span>
                        </div>
                        <Progress value={value} className="h-2 bg-teal-100" />
                      </div>

                      <div className="mt-auto flex gap-2">
                        <Button
                          className="flex-1 rounded-2xl bg-teal-800 text-white hover:bg-teal-900"
                          onClick={() => setReadingBookId(book.id)}
                          aria-label={`Open ${book.title} in reader`}
                        >
                          <BookOpen className="h-4 w-4" />
                          Read
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-2xl border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                          onClick={() => advanceProgress(book.id)}
                          aria-label={isFinished ? `Restart ${book.title}` : `Advance ${book.title} progress`}
                        >
                          {isFinished ? (
                            <>
                              <Undo2 className="h-4 w-4" />
                              Restart
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              {value === 0 ? 'Start' : '+10%'}
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          aria-label={`Download ${book.title}`}
                          className="rounded-2xl border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                        >
                          <a href={book.id === 'ponder-on-this' ? book.readerUrl : (book.readerUrl ?? '').replace(/\.html$/, '.pdf')} download title={`Download ${book.title} as PDF`}>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={isSaved ? `Remove ${book.title} from saved books` : `Save ${book.title}`}
                          className={
                            isSaved
                              ? 'rounded-2xl border-teal-300 bg-teal-100 text-teal-900 hover:bg-teal-200'
                              : 'rounded-2xl border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                          }
                          onClick={() => toggleSaved(book.id)}
                        >
                          {isSaved ? <BookMarked className="h-4 w-4 fill-current" /> : <Bookmark className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <Card className="rounded-[28px] border-stone-200 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BookMarked className="h-5 w-5 text-teal-700" />
                My reading
              </CardTitle>
              <CardDescription>Saved books and progress, synced to Supabase after setup.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Continue reading</p>
                  <Badge variant="secondary">{continueBooks.length}</Badge>
                </div>
                {continueBooks.length === 0 ? (
                  <p className="rounded-2xl bg-stone-50 p-4 text-sm leading-6 text-stone-600">
                    Start a book and it will appear here with your progress.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {continueBooks.map((book) => (
                      <div key={book.id} className="rounded-2xl border border-teal-200 bg-teal-50 p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-10 rounded-md" style={{ background: book.cover }} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{book.title}</p>
                            <p className="text-xs text-teal-800">{progress[book.id] ?? 0}% complete</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="mt-3 w-full rounded-xl border-teal-300 bg-white/70 text-teal-900 hover:bg-white"
                          onClick={() => setReadingBookId(book.id)}
                        >
                          Continue
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Saved for later</p>
                  <Badge variant="secondary">{savedBooks.length}</Badge>
                </div>
                {savedBooks.length === 0 ? (
                  <p className="rounded-2xl bg-stone-50 p-4 text-sm leading-6 text-stone-600">
                    Tap the bookmark on any book to keep it here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {savedBooks.map((book) => (
                      <div key={book.id} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-3">
                        <div className="h-12 w-10 rounded-md" style={{ background: book.cover }} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{book.title}</p>
                          <p className="truncate text-xs text-stone-500">{book.author}</p>
                        </div>
                        <Button variant="ghost" size="icon-sm" aria-label={`Remove ${book.title}`} onClick={() => toggleSaved(book.id)}>
                          <Undo2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-stone-200 bg-white/90 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <NotebookPen className="h-5 w-5 text-teal-700" />
                  My notes
                </CardTitle>
                {notes.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-stone-500 hover:text-stone-800"
                    onClick={clearNotes}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear all
                  </Button>
                )}
              </div>
              <CardDescription>
                Passages you save while reading. Select any text inside a book and tap “Add to my note”.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <p className="rounded-2xl bg-stone-50 p-4 text-sm leading-6 text-stone-600">
                  No notes yet. Open any book, highlight a passage, and choose{' '}
                  <span className="font-medium text-stone-800">📝 Add to my note</span> from the selection tooltip — it will appear here.
                </p>
              ) : (
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {notes.map((note) => (
                    <div key={note.id} className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-stone-900">{note.book}</p>
                          <p className="truncate text-xs text-amber-800">
                            {note.page ? `${note.page} · ` : ''}{formatNoteDate(note.ts)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete note from ${note.book}`}
                          className="shrink-0 text-stone-400 hover:text-stone-700"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="mt-2 line-clamp-4 border-l-2 border-amber-300 pl-3 text-sm italic leading-6 text-stone-700">
                        “{note.text}”
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-stone-200 bg-stone-950 text-white shadow-sm">
            <CardContent className="space-y-3 p-6">
              <Badge className="bg-teal-300 text-stone-950 hover:bg-teal-300">Reader tip</Badge>
              <h3 className="text-2xl font-semibold">Highlight as you read.</h3>
              <p className="text-sm leading-6 text-stone-300">
                Select any passage inside a book to ask the AI assistant about it, or save it to My notes. Notes are kept in this browser.
              </p>
            </CardContent>
          </Card>
        </aside>
      </section>

      <Dialog
        open={readingBookId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setReadingBookId(null)
            setNotes(readStoredNotes())
          }
        }}
      >
        <DialogContent className="h-[90vh] max-w-6xl gap-0 overflow-hidden rounded-[28px] border-stone-200 bg-white p-0 sm:max-w-6xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{readingBook ? `Read ${readingBook.title}` : 'Read book'}</DialogTitle>
          </DialogHeader>
          <iframe
            src={readingBook?.readerUrl ?? '/ponder-on-this.html'}
            title={readingBook ? `${readingBook.title} reader` : 'Book reader'}
            className="block h-full w-full border-0"
          />
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default Home
