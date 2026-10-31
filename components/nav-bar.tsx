"use client"

import { useState } from "react"
import { Menu, X, ScanFace, Hand, Search, HelpCircle, Play, Download } from "lucide-react"

const LINKS = [
  { label: "Simulador", href: "#simulador", icon: Play },
  { label: "Mis Gestos", href: "#mis-gestos", icon: Hand },
  { label: "Búsqueda de Comandos", href: "#busqueda", icon: Search },
  { label: "Cómo Funciona", href: "#como-funciona", icon: HelpCircle },
]

export function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-ring">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <ScanFace className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Gest<span className="text-primary">IA</span>
          </span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map(({ label, href, icon: Icon }) => (
            <li key={href}>
              <a
                href={href}
                className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="/descargar"
            className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-ring sm:flex"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Descargar
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="border-t border-border px-4 py-2 md:hidden">
          {LINKS.map(({ label, href, icon: Icon }) => (
            <li key={href}>
              <a
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
