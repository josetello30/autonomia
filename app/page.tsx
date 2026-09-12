import { NavBar } from "@/components/nav-bar"
import { HeroCarousel } from "@/components/hero-carousel"
import { CommandExplorer } from "@/components/command-explorer"
import { HowItWorks } from "@/components/how-it-works"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <div id="top" className="flex min-h-screen flex-col bg-background">
      <NavBar />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16">
          <div className="mb-10 flex flex-col items-center gap-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Accesibilidad · Gestos faciales · IA
            </span>
            <h1 className="max-w-3xl text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Controla tus dispositivos con el <span className="text-primary">rostro</span>
            </h1>
            <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
              AutonomIA convierte tus gestos faciales en acciones. Describe lo que quieres hacer y encontramos el gesto
              perfecto para ti.
            </p>
          </div>
          <HeroCarousel />
        </section>

        {/* Búsqueda de comandos */}
        <section id="busqueda" className="scroll-mt-24 border-t border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div id="mis-gestos" className="mb-8 scroll-mt-24 flex flex-col gap-2">
              <h2 className="text-3xl font-bold text-foreground">Búsqueda de Comandos</h2>
              <p className="max-w-2xl text-muted-foreground">
                Escribe tu intención en lenguaje natural y nuestra búsqueda semántica encontrará los gestos más
                relevantes.
              </p>
            </div>
            <CommandExplorer />
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <HowItWorks />
        </section>
      </main>

      <Footer />
    </div>
  )
}
