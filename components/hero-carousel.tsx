"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Eye, MousePointerClick, Smile, ArrowUp, Mic, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Slide {
  gesture: string
  action: string
  icon: LucideIcon
}

const SLIDES: Slide[] = [
  { gesture: "Pestañeo doble", action: "Clic", icon: MousePointerClick },
  { gesture: "Mirada arriba", action: "Scroll", icon: ArrowUp },
  { gesture: "Sonrisa", action: "Ir al inicio", icon: Smile },
  { gesture: "Seguimiento ocular", action: "Mover cursor", icon: Eye },
  { gesture: "Boca abierta", action: "Dictar mensaje", icon: Mic },
  { gesture: "Pestañeo triple", action: "Emergencia", icon: Zap },
]

export function HeroCarousel() {
  const [index, setIndex] = useState(0)

  const go = useCallback((dir: number) => {
    setIndex((prev) => (prev + dir + SLIDES.length) % SLIDES.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setIndex((p) => (p + 1) % SLIDES.length), 3500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative">
      <div
        className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-muted"
        role="region"
        aria-roledescription="carrusel"
        aria-label="Ejemplos de interacción por gestos"
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {SLIDES.map((slide, i) => {
            const Icon = slide.icon
            return (
              <div
                key={slide.gesture}
                className="flex min-w-full flex-col items-center gap-4 px-6 py-12 text-center sm:py-16"
                aria-hidden={i !== index}
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <Icon className="h-8 w-8" aria-hidden="true" />
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2 text-2xl font-bold sm:text-3xl">
                  <span className="text-foreground">{slide.gesture}</span>
                  <span className="text-primary">{"="}</span>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {slide.action}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ejemplo {i + 1} de {SLIDES.length}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Ejemplo anterior"
        className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Siguiente ejemplo"
        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="mt-4 flex justify-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.gesture}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ir al ejemplo ${i + 1}`}
            aria-current={i === index}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? "w-8 bg-primary" : "w-2.5 bg-secondary hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
