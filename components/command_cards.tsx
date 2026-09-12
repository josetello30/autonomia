import { Hand, Tag, Activity, Gauge } from "lucide-react"
import type { Command, Effort } from "@/data/commands"
import { toPercent } from "@/lib/semantic-Bm25"

const EFFORT_STYLES: Record<Effort, string> = {
  Bajo: "bg-success/15 text-success border-success/30",
  Medio: "bg-primary/15 text-primary border-primary/30",
  Alto: "bg-destructive/15 text-destructive border-destructive/30",
}

const EFFORT_BARS: Record<Effort, number> = {
  Bajo: 1,
  Medio: 2,
  Alto: 3,
}

interface CommandCardProps {
  command: Command
  score?: number
}

export function CommandCard({ command, score }: CommandCardProps) {
  const percent = score !== undefined ? toPercent(score) : undefined

  return (
    <article className="group relative rounded-2xl bg-gradient-to-br from-primary via-accent to-primary p-px transition-transform duration-200 hover:-translate-y-1">
      <div className="flex h-full flex-col gap-4 rounded-[calc(1rem-1px)] bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-tight text-card-foreground">{command.action}</h3>
          {percent !== undefined && (
            <span
              className="shrink-0 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent"
              title="Puntaje de coincidencia semántica"
            >
              {percent}%
            </span>
          )}
        </div>

        <dl className="flex flex-col gap-2.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Hand className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <dt className="sr-only">Gesto asignado</dt>
            <dd className="font-medium text-foreground">{command.gesture}</dd>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Tag className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <dt className="sr-only">Categoría</dt>
            <dd>{command.category}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <dt className="sr-only">Nivel de esfuerzo físico</dt>
            <dd className="flex items-center gap-2">
              <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${EFFORT_STYLES[command.effort]}`}>
                Esfuerzo {command.effort}
              </span>
              <span className="flex items-center gap-0.5" aria-hidden="true">
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-3.5 w-1.5 rounded-full ${
                      i <= EFFORT_BARS[command.effort] ? "bg-primary" : "bg-secondary"
                    }`}
                  />
                ))}
              </span>
            </dd>
          </div>
        </dl>

        <p className="mt-auto text-sm leading-relaxed text-muted-foreground">{command.description}</p>

        {percent !== undefined && (
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">{percent}% semantic</span>
          </div>
        )}
      </div>
    </article>
  )
}

interface CommandGridProps {
  results: { command: Command; score: number }[]
}

export function CommandGrid({ results }: CommandGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {results.map(({ command, score }) => (
        <CommandCard key={command.id} command={command} score={score} />
      ))}
    </div>
  )
}
