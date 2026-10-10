export type Book = {
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
  readerUrl?: string
}

export type NoteItem = {
  id: string
  book: string
  page: string
  text: string
  url: string
  ts: number
}
