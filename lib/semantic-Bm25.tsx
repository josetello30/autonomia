import type { Command } from "@/data/commands"

/**
 * Búsqueda semántica ligera basada en el algoritmo BM25.
 *
 * BM25 puntúa cada documento según la frecuencia de los términos de la consulta,
 * penalizando términos muy comunes y normalizando por la longitud del documento.
 * No requiere red ni modelos externos: todo corre en el cliente.
 */

const STOPWORDS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "a", "al",
  "y", "o", "que", "en", "con", "por", "para", "mi", "mis", "me", "quiero",
  "abrir", "buscar", "como", "cómo", "hacer", "es", "se", "su", "lo", "le",
])

/** Normaliza texto: minúsculas y sin acentos. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

/** Divide el texto en tokens útiles, descartando stopwords. */
function tokenize(text: string): string[] {
  return normalize(text)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
}

/** Texto searchable de un comando, ponderando campos importantes. */
function docText(cmd: Command): string {
  return [
    cmd.action,
    cmd.action,
    cmd.category,
    cmd.gesture,
    cmd.description,
    cmd.keywords.join(" "),
    cmd.keywords.join(" "),
  ].join(" ")
}

export interface SearchResult {
  command: Command
  /** Puntaje semántico normalizado entre 0 y 1. */
  score: number
}

interface IndexedDoc {
  command: Command
  tokens: string[]
  termFreq: Map<string, number>
  length: number
}

export class Bm25Engine {
  private readonly k1 = 1.5
  private readonly b = 0.75
  private docs: IndexedDoc[] = []
  private df = new Map<string, number>()
  private avgDocLength = 0

  constructor(commands: Command[]) {
    this.build(commands)
  }

  private build(commands: Command[]) {
    let totalLength = 0
    for (const command of commands) {
      const tokens = tokenize(docText(command))
      const termFreq = new Map<string, number>()
      for (const token of tokens) {
        termFreq.set(token, (termFreq.get(token) ?? 0) + 1)
      }
      for (const term of termFreq.keys()) {
        this.df.set(term, (this.df.get(term) ?? 0) + 1)
      }
      totalLength += tokens.length
      this.docs.push({ command, tokens, termFreq, length: tokens.length })
    }
    this.avgDocLength = this.docs.length ? totalLength / this.docs.length : 0
  }

  private idf(term: string): number {
    const n = this.docs.length
    const df = this.df.get(term) ?? 0
    // IDF de BM25 con suavizado; nunca negativo.
    return Math.max(0, Math.log(1 + (n - df + 0.5) / (df + 0.5)))
  }

  search(query: string): SearchResult[] {
    const queryTokens = tokenize(query)
    if (queryTokens.length === 0) return []

    const scored = this.docs.map((doc) => {
      let score = 0
      for (const term of queryTokens) {
        const tf = doc.termFreq.get(term)
        if (!tf) continue
        const idf = this.idf(term)
        const numerator = tf * (this.k1 + 1)
        const denominator =
          tf + this.k1 * (1 - this.b + (this.b * doc.length) / (this.avgDocLength || 1))
        score += idf * (numerator / denominator)
      }
      return { command: doc.command, rawScore: score }
    })

    const relevant = scored.filter((s) => s.rawScore > 0)
    if (relevant.length === 0) return []

    const maxScore = Math.max(...relevant.map((s) => s.rawScore))
    return relevant
      .map((s) => ({
        command: s.command,
        // Normalizamos a 0-1 respecto al mejor match para un "semantic score" legible.
        score: maxScore > 0 ? s.rawScore / maxScore : 0,
      }))
      .sort((a, b) => b.score - a.score)
  }
}

/** Convierte el score 0-1 a porcentaje entero. */
export function toPercent(score: number): number {
  return Math.round(score * 100)
}
