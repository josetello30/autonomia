"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Search, Loader2, ScanFace, Globe, MessageCircle, Play, Siren, SearchX } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { commands, type Category } from "@/data/commands"
import { Bm25Engine, type SearchResult } from "@/lib/semantic-Bm25"
import { CommandGrid } from "@/components/command_cards"

interface QuickExample {
  label: Category
  icon: LucideIcon
  query: string
}

const QUICK_EXAMPLES: QuickExample[] = [
  { label: "Navegación Web", icon: Globe, query: "navegar por internet y hacer clic" },
  { label: "Comunicación", icon: MessageCircle, query: "quiero enviar un mensaje o llamar" },
  { label: "Entretenimiento", icon: Play, query: "reproducir musica y ver videos" },
  { label: "Emergencia", icon: Siren, query: "necesito ayuda urgente de emergencia" },
]

export function CommandExplorer() {
  const [modelReady, setModelReady] = useState(false)
  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const engine = useMemo(() => new Bm25Engine(commands), [])

  // Simula la carga del modelo de reconocimiento facial e IA.
  useEffect(() => {
    const t = setTimeout(() => setModelReady(true), 2200)
    return () => clearTimeout(t)
  }, [])

  function runSearch(rawQuery: string) {
    const q = rawQuery.trim()
    setQuery(rawQuery)
    if (searchTimer.current) clearTimeout(searchTimer.current)

    if (!q) {
      setSearching(false)
      setResults(null)
      return
    }

    setSearching(true)
    // Simula el análisis de intención con IA.
    searchTimer.current = setTimeout(() => {
      setResults(engine.search(q))
      setSearching(false)
    }, 1200)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    runSearch(query)
  }

  if (!modelReady) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-border bg-card px-6 py-16 text-center">
        <span className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <ScanFace className="h-8 w-8" aria-hidden="true" />
          </span>
        </span>
        <p className="text-lg font-semibold text-foreground" role="status" aria-live="polite">
          Cargando modelo de reconocimiento facial e IA....
        </p>
        <p className="text-sm text-muted-foreground">Preparando el motor de gestos y detección de intención.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="command-search" className="sr-only">
          Buscar comando
        </label>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          id="command-search"
          type="search"
          value={query}
          onChange={(e) => runSearch(e.target.value)}
          placeholder="Ej: quiero abrir mi correo   ·   buscar comando"
          className="w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-32 text-base text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring"
        >
          Buscar
        </button>
      </form>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ejemplos rápidos
        </span>
        <div className="flex flex-wrap gap-2.5">
          {QUICK_EXAMPLES.map(({ label, icon: Icon, query: q }) => (
            <button
              key={label}
              type="button"
              onClick={() => runSearch(q)}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <ResultsArea searching={searching} query={query} results={results} />
    </div>
  )
}

function ResultsArea({
  searching,
  query,
  results,
}: {
  searching: boolean
  query: string
  results: SearchResult[] | null
}) {
  if (searching) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card px-6 py-14 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <p className="text-lg font-semibold text-foreground" role="status" aria-live="polite">
          Analizando intención del usuario........
        </p>
        <p className="text-sm text-muted-foreground">Aplicando búsqueda semántica BM25 sobre los comandos.</p>
      </div>
    )
  }

  if (results === null) {
    // Estado inicial: mostramos todos los comandos disponibles.
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-foreground">Todos los comandos</h2>
          <span className="text-sm text-muted-foreground">{commands.length} disponibles</span>
        </div>
        <CommandGrid results={commands.map((command) => ({ command, score: 1 }))} />
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-14 text-center">
        <SearchX className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-lg font-semibold text-foreground">Sin coincidencias</p>
        <p className="text-sm text-muted-foreground">
          No encontramos comandos para {'"'}
          {query}
          {'"'}. Intenta describir la acción de otra forma.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-bold text-foreground">Resultados</h2>
        <span className="text-sm text-muted-foreground">
          {results.length} coincidencia{results.length !== 1 ? "s" : ""}
        </span>
      </div>
      <CommandGrid results={results} />
    </div>
  )
}
