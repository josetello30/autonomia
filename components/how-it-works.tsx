import { Camera, BrainCircuit, Sparkles } from "lucide-react"

const STEPS = [
  {
    icon: Camera,
    title: "1. Detección facial",
    text: "La cámara captura tus gestos faciales en tiempo real mediante un modelo de reconocimiento óptico.",
  },
  {
    icon: BrainCircuit,
    title: "2. Análisis con IA",
    text: "La IA interpreta la intención detrás del gesto y la traduce a una acción concreta del sistema.",
  },
  {
    icon: Sparkles,
    title: "3. Acción ejecutada",
    text: "El dispositivo responde al instante: navegar, comunicar, reproducir o pedir ayuda, sin usar las manos.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-24">
      <div className="mb-8 flex flex-col gap-2 text-center">
        <h2 className="text-3xl font-bold text-foreground">Cómo Funciona</h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Tres pasos para controlar tus dispositivos con total autonomía usando solo tu rostro.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
