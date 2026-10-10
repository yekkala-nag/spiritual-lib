import { useEffect, useRef, useState, useCallback } from 'react'
import { MessageCircle, X, Send, Settings, BookOpen, Globe, Sparkles, Trash2, Loader2 } from 'lucide-react'

type LlmConfig = { endpoint: string; key: string; model: string }
type ChatMsg = { role: 'user' | 'assistant'; text: string; refs?: SearchRef[] }
type SearchRef = { book: string; title: string; reader: string; chapter: string; snippet: string }
type NoteEntry = { book: string; title: string; author: string; reader: string; chapter: string; s: string; p: string[] }

const CFG_KEY = 'sl_llm_config'
const DEFAULT_CFG: LlmConfig = {
  endpoint: 'https://api.openai.com/v1/chat/completions',
  key: '',
  model: 'gpt-4o-mini',
}

function loadCfg(): LlmConfig {
  try {
    const raw = localStorage.getItem(CFG_KEY)
    if (raw) return { ...DEFAULT_CFG, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { ...DEFAULT_CFG }
}

let indexCache: NoteEntry[] | null = null
async function loadIndex(): Promise<NoteEntry[]> {
  if (indexCache) return indexCache
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
  const res = await fetch(`${basePath}/notes-index.json`)
  if (!res.ok) {
    throw new Error(`Failed to load index: ${res.statusText}`)
  }
  indexCache = (await res.json()) as NoteEntry[]
  return indexCache
}

function searchIndex(entries: NoteEntry[], query: string, limit = 6): SearchRef[] {
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2)
  if (terms.length === 0) return []
  const scored: { e: NoteEntry; score: number }[] = []
  for (const e of entries) {
    const hay = `${e.title} ${e.author} ${e.chapter} ${e.s} ${e.p.join(' ')}`.toLowerCase()
    let score = 0
    for (const t of terms) {
      const hits = hay.split(t).length - 1
      if (hits > 0) score += hits * (e.chapter.toLowerCase().includes(t) ? 3 : 1)
    }
    if (score > 0) scored.push({ e, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(({ e }) => ({
    book: e.book,
    title: e.title,
    reader: e.reader,
    chapter: e.chapter,
    snippet: e.s.length > 180 ? e.s.slice(0, 180) + '…' : e.s,
  }))
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [cfg, setCfg] = useState<LlmConfig>(loadCfg)
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      text: 'Namaste. I can search inside the library (chapter summaries of every book), answer with an LLM you configure, or run an external DuckDuckGo search. Ask me anything.',
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [testStatus, setTestStatus] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const saveCfg = (next: LlmConfig) => {
    setCfg(next)
    localStorage.setItem(CFG_KEY, JSON.stringify(next))
  }

  const pushMsg = (m: ChatMsg) => setMessages((prev) => [...prev, m])

  async function callLlm(question: string, context: string, signal?: AbortSignal): Promise<string> {
    const res = await fetch(cfg.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cfg.key ? { Authorization: `Bearer ${cfg.key}` } : {}),
      },
      signal,
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          {
            role: 'system',
            content:
              'You are the Spiritual Library assistant. Answer clearly and concisely. When library context is provided, ground your answer in it and name the book and chapter. If the question needs current external facts beyond the context, say what you know and suggest an external search.',
          },
          { role: 'user', content: context ? `Library context:\n${context}\n\nQuestion: ${question}` : question },
        ],
        temperature: 0.4,
      }),
    })
    if (!res.ok) throw new Error(`LLM error ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || '(empty response)'
  }

  const handleSend = useCallback(async () => {
    const q = input.trim()
    if (!q || busy) return
    setInput('')
    pushMsg({ role: 'user', text: q })
    setBusy(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const entries = await loadIndex().catch(() => [] as NoteEntry[])
      const refs = searchIndex(entries, q)
      const wantsExternal = /\b(search the web|external|google|duckduckgo|latest|news)\b/i.test(q)

      if (cfg.key) {
        const context = refs
          .slice(0, 4)
          .map((r) => `- ${r.title} — ${r.chapter}: ${r.snippet}`)
          .join('\n')
        const answer = await callLlm(q, context, controller.signal)
        pushMsg({ role: 'assistant', text: answer, refs: refs.length ? refs : undefined })
      } else if (refs.length > 0 && !wantsExternal) {
        pushMsg({
          role: 'assistant',
          text: `I found ${refs.length} relevant passage${refs.length > 1 ? 's' : ''} in the library. Open a reference below to read the chapter, or configure an LLM in Settings for a synthesized answer.`,
          refs,
        })
      } else {
        pushMsg({
          role: 'assistant',
          text: `Nothing strong in the library for that. You can search the web for "${q}" with DuckDuckGo, or add an LLM API key in Settings and I will answer directly.`,
          refs: undefined,
        })
        pushMsg({
          role: 'assistant',
          text: `[Open DuckDuckGo search](https://duckduckgo.com/?q=${encodeURIComponent(q)})`,
        })
      }
    } catch (err) {
      if (controller.signal.aborted) return
      pushMsg({ role: 'assistant', text: `Something went wrong: ${err instanceof Error ? err.message : String(err)}` })
    } finally {
      abortRef.current = null
      setBusy(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, busy, cfg])

  async function testConnection() {
    setTestStatus('Testing…')
    try {
      const res = await fetch(cfg.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(cfg.key ? { Authorization: `Bearer ${cfg.key}` } : {}) },
        body: JSON.stringify({ model: cfg.model, messages: [{ role: 'user', content: 'Say OK' }], max_tokens: 5 }),
      })
      setTestStatus(res.ok ? 'Connected successfully.' : `Failed: HTTP ${res.status}`)
    } catch (err) {
      setTestStatus(`Failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const renderText = (text: string) => {
    const linkMatch = text.match(/^\[(.+?)\]\((.+?)\)$/)
    if (linkMatch) {
      return (
        <a href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-amber-700 underline">
          {linkMatch[1]} ↗
        </a>
      )
    }
    return text
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open library assistant"
        className="fixed bottom-5 right-5 z-50 flex h-13 w-13 items-center justify-center rounded-full bg-stone-800 p-3.5 text-amber-100 shadow-xl transition hover:bg-stone-700"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex h-[560px] w-[380px] max-w-[92vw] flex-col overflow-hidden rounded-3xl border border-stone-200 bg-[#fdfaf3] shadow-2xl">
          <div className="flex items-center justify-between border-b border-stone-200 bg-stone-800 px-4 py-3 text-amber-50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-semibold tracking-wide">Library Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages(messages.slice(0, 1))}
                aria-label="Clear chat"
                className="rounded-lg p-1.5 text-stone-300 hover:bg-stone-700 hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowSettings((v) => !v)}
                aria-label="LLM settings"
                className="rounded-lg p-1.5 text-stone-300 hover:bg-stone-700 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="space-y-2 border-b border-stone-200 bg-amber-50/70 px-4 py-3 text-xs text-stone-700">
              <p className="font-semibold text-stone-800">LLM configuration (any OpenAI-compatible API)</p>
              <input
                value={cfg.endpoint}
                onChange={(e) => saveCfg({ ...cfg, endpoint: e.target.value })}
                placeholder="Endpoint, e.g. https://api.openai.com/v1/chat/completions"
                className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 outline-none focus:border-amber-500"
              />
              <input
                value={cfg.key}
                onChange={(e) => saveCfg({ ...cfg, key: e.target.value })}
                placeholder="API key (stored only in this browser)"
                type="password"
                className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 outline-none focus:border-amber-500"
              />
              <input
                value={cfg.model}
                onChange={(e) => saveCfg({ ...cfg, model: e.target.value })}
                placeholder="Model, e.g. gpt-4o-mini, llama-3.1-70b, mistral-large"
                className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 outline-none focus:border-amber-500"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={testConnection}
                  className="rounded-lg bg-stone-800 px-3 py-1.5 text-amber-50 hover:bg-stone-700"
                >
                  Test connection
                </button>
                <span className="text-stone-600">{testStatus}</span>
              </div>
              <p className="text-[11px] leading-snug text-stone-500">
                Works with OpenAI, OpenRouter, Groq, Together, Mistral, Ollama (http://localhost:11434/v1/chat/completions),
                LM Studio and any compatible endpoint. Without a key I still search the library locally and DuckDuckGo externally.
              </p>
            </div>
          )}

          <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-stone-800 px-3.5 py-2.5 text-sm text-amber-50'
                      : 'max-w-[92%] rounded-2xl rounded-bl-sm border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800'
                  }
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{renderText(m.text)}</div>
                  {m.refs && (
                    <div className="mt-2 space-y-1.5 border-t border-stone-100 pt-2">
                      {m.refs.map((r, j) => (
                        <a
                          key={j}
                          href={r.reader}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-xl bg-amber-50 px-3 py-2 transition hover:bg-amber-100"
                        >
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                            <BookOpen className="h-3 w-3 text-amber-700" />
                            {r.title} — {r.chapter}
                          </div>
                          <div className="mt-0.5 text-[11px] leading-snug text-stone-500">{r.snippet}</div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs italic text-stone-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking…
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-stone-200 bg-white px-3 py-2.5">
            <Globe className="h-4 w-4 shrink-0 text-stone-400" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about any book, topic, or the web…"
              className="flex-1 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
            />
            <button
              onClick={handleSend}
              disabled={busy}
              aria-label="Send"
              className="rounded-full bg-amber-600 p-2 text-white transition hover:bg-amber-700 disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
