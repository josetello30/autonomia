"use client"

import { useMemo, useState } from "react"
import { Search, MousePointerClick, ArrowDownUp, Keyboard, AppWindow, SearchX } from "lucide-react"
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
  { label: "Puntero y clic", icon: MousePointerClick, query: "mover el mouse y hacer clic" },
  { label: "Navegación", icon: ArrowDownUp, query: "bajar y leer una pagina web" },
  { label: "Escritura", icon: Keyboard, query: "escribir un mensaje o pedir ayuda" },
  { label: "Ventanas y apps", icon: AppWindow, query: "abrir el navegador y cambiar de ventana" },
]

export function CommandExplorer() {
  const [query, setQuery] = useState("")
  const engine = useMemo(() => new Bm25Engine(commands), [])
  // La búsqueda BM25 corre en el navegador al instante: no hace falta simular esperas.
  const results = useMemo<SearchResult[] | null>(() => (query.trim() ? engine.search(query.trim()) : null), [engine, query])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
          onChange={(e) => setQuery(e.target.value)}
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
              onClick={() => setQuery(q)}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <ResultsArea query={query} results={results} />
    </div>
  )
}

function ResultsArea({ query, results }: { query: string; results: SearchResult[] | null }) {
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
