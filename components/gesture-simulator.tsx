"use client"

import { useEffect, useState } from "react"
import { Camera, Check, CirclePause, Play, RotateCcw, ScanFace } from "lucide-react"
import { Button } from "@/components/ui/button"

const STEPS = [
  { title: "Mira el punto naranja", description: "Mantén la mirada en el objetivo para calibrar tu posición." },
  { title: "Parpadea dos veces", description: "Haz dos pestañeos suaves para probar el clic." },
  { title: "Sonríe", description: "Activa una sonrisa breve para completar la prueba." },
  { title: "Prueba completada", description: "Tu perfil de gestos está listo para usar." },
]

export function GestureSimulator() {
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  const [mode, setMode] = useState("Calibración")

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % STEPS.length)
    }, 2600)
    return () => window.clearInterval(timer)
  }, [running])

  const current = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <section id="simulador" className="scroll-mt-24 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <ScanFace className="size-3.5" aria-hidden="true" />
            Zona de prueba
          </div>
          <h2 className="text-3xl font-bold text-foreground">Simula el seguimiento de rostro</h2>
          <p className="mt-2 text-muted-foreground">
            Explora cómo GestIA detecta tu mirada y convierte tus gestos en acciones, sin activar tu cámara real.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Modo de simulación">
          {["Calibración", "Prueba rápida", "Accesibilidad"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              aria-pressed={mode === option}
              className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
                mode === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl bg-[#13171c] p-3 sm:p-5">
          <div className="flex items-center justify-between border-b border-white/10 px-2 pb-3 text-xs text-white/60">
            <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" /> Simulación activa</span>
            <span>{mode}</span>
          </div>
          <div className="relative mt-4 flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-[#13171c]">
            <span className="absolute left-10 top-8 size-3 rounded-full bg-[#3b4652]" />
            <span className="absolute right-10 top-8 size-3 rounded-full bg-[#3b4652]" />
            <span className="absolute bottom-8 left-10 size-3 rounded-full bg-[#3b4652]" />
            <span className="absolute bottom-8 right-10 size-3 rounded-full bg-[#3b4652]" />
            <div className="relative flex size-24 items-center justify-center rounded-full border border-primary/70">
              <span className="absolute h-px w-32 bg-primary" />
              <span className="absolute h-32 w-px bg-primary" />
              <span className="relative size-5 rounded-full bg-primary shadow-[0_0_22px_rgba(255,106,43,0.8)]" />
            </div>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 text-xs text-white/70">
              <Camera className="size-3.5" aria-hidden="true" /> Vista de cámara simulada
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-white">
            <span>Paso {step + 1} de {STEPS.length} · {current.title}</span>
            <span className="text-white/60">{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15" aria-label={`Progreso ${Math.round(progress)}%`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-border bg-background p-5">
          <div>
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {step === STEPS.length - 1 ? <Check className="size-5" aria-hidden="true" /> : <ScanFace className="size-5" aria-hidden="true" />}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Instrucción actual</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">{current.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{current.description}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <Button onClick={() => setRunning((value) => !value)}>
              {running ? <CirclePause data-icon="inline-start" /> : <Play data-icon="inline-start" />}
              {running ? "Pausar prueba" : "Iniciar prueba"}
            </Button>
            <Button variant="outline" onClick={() => { setStep(0); setRunning(false) }}>
              <RotateCcw data-icon="inline-start" /> Reiniciar
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GestureSimulator
