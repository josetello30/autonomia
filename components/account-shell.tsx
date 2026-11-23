import Link from "next/link"
import { ArrowLeft, ScanFace } from "lucide-react"

/** Marco común de las páginas de cuenta: cabecera simple y una tarjeta centrada. */
export function AccountShell({ title, intro, children }: { title: string; intro?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/90 backdrop-blur-md">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-ring">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <ScanFace className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg">Gest<span className="text-primary">IA</span></span>
          </Link>
          <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver al inicio
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {intro && <div className="mt-3 max-w-2xl leading-7 text-muted-foreground">{intro}</div>}
        <div className="mt-8">{children}</div>
      </main>
    </div>
  )
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "ok"; children: React.ReactNode }) {
  const styles = {
    info: "border-border bg-card text-foreground",
    error: "border-destructive/40 bg-destructive/10 text-foreground",
    ok: "border-primary/40 bg-primary/10 text-foreground",
  }[tone]
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-xl border p-4 text-sm leading-6 ${styles}`}>
      {children}
    </p>
  )
}

export function NotConfigured() {
  return (
    <Notice tone="error">
      Las cuentas aún no están disponibles: faltan las variables de Supabase en el servidor
      (<code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>).
    </Notice>
  )
}

export const fieldClass =
  "mt-1.5 block min-h-12 w-full rounded-xl border border-border bg-card px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"

export const primaryButtonClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground transition hover:brightness-110 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-70"

export const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
