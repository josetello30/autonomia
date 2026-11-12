"use client"

/**
 * Demo web interactiva de gestos (P3-49): un tutorial guiado que usa la cámara del visitante para
 * mover un puntero y hacer clic solo dentro del recuadro de práctica.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Camera,
  Check,
  Crosshair,
  Download,
  Info,
  LogOut,
  Monitor,
  MousePointer2,
  MousePointerClick,
  RotateCcw,
  ScanFace,
  Settings2,
  ShieldCheck,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DEFAULT_SETTINGS, DemoEngine, type ClickMode, type DemoSettings, type FrameResult } from "@/lib/demo/engine"
import { useFaceTracker } from "@/lib/demo/use-face-tracker"

type StepId = "bienvenida" | "rostro" | "mover" | "clic" | "ajustes" | "cierre"

const STEPS: { id: StepId; title: string; short: string }[] = [
  { id: "bienvenida", title: "Bienvenida", short: "Inicio" },
  { id: "rostro", title: "Detectar tu rostro", short: "Rostro" },
  { id: "mover", title: "Mover el puntero", short: "Mover" },
  { id: "clic", title: "Hacer clic", short: "Clic" },
  { id: "ajustes", title: "Ajustar a tu gusto", short: "Ajustes" },
  { id: "cierre", title: "¡Listo!", short: "Fin" },
]

interface Target {
  id: string
  x: number
  y: number
  label: string
}

/** Objetivos en coordenadas de 0 a 1 del recuadro de práctica. */
const TARGETS: Record<"mover" | "clic" | "ajustes", Target[]> = {
  mover: [
    { id: "m1", x: 0.18, y: 0.24, label: "1" },
    { id: "m2", x: 0.82, y: 0.24, label: "2" },
    { id: "m3", x: 0.82, y: 0.76, label: "3" },
    { id: "m4", x: 0.18, y: 0.76, label: "4" },
  ],
  clic: [
    { id: "c1", x: 0.26, y: 0.36, label: "Abrir" },
    { id: "c2", x: 0.74, y: 0.36, label: "Enviar" },
    { id: "c3", x: 0.5, y: 0.72, label: "Guardar" },
  ],
  ajustes: [{ id: "a1", x: 0.5, y: 0.5, label: "Probar" }],
}

const ASPECT = 16 / 10 // ancho / alto del recuadro de práctica
const TARGET_RADIUS = 0.075 // en fracción del ancho
const REACH_MS = 350 // tiempo sobre el objetivo para contarlo en «Mover»

function isOver(target: Target, frame: FrameResult) {
  const dx = frame.x - target.x
  const dy = (frame.y - target.y) / ASPECT
  return Math.hypot(dx, dy) <= TARGET_RADIUS
}

function playBeep(high: boolean) {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = high ? 880 : 620
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.13)
    osc.onended = () => void ctx.close()
  } catch {
    // Sin audio disponible: la señal visual basta.
  }
}

const CLICK_MODES: { value: ClickMode; label: string }[] = [
  { value: "ambos", label: "Boca y permanencia" },
  { value: "boca", label: "Solo abrir la boca" },
  { value: "permanencia", label: "Solo permanencia" },
]

export function GestureDemo() {
  const engine = useMemo(() => new DemoEngine(DEFAULT_SETTINGS), [])
  const [stepIndex, setStepIndex] = useState(0)
  const [settings, setSettings] = useState<DemoSettings>(DEFAULT_SETTINGS)
  const [frame, setFrame] = useState<FrameResult | null>(null)
  const [done, setDone] = useState<string[]>([])
  const [flash, setFlash] = useState<{ id: string | null; key: number }>({ id: null, key: 0 })
  const [faceSeenMs, setFaceSeenMs] = useState(0)
  const [leftSection, setLeftSection] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)

  const step = STEPS[stepIndex]
  const targets = step.id === "mover" || step.id === "clic" || step.id === "ajustes" ? TARGETS[step.id] : []

  // Estado que lee el bucle de la cámara sin volver a crearlo en cada fotograma.
  const live = useRef({ step: step.id, targets, done, settings, hoverSince: {} as Record<string, number>, lastFace: 0 })
  live.current.step = step.id
  live.current.targets = targets
  live.current.done = done
  live.current.settings = settings

  const feedback = useCallback((id: string | null, success: boolean) => {
    setFlash((current) => ({ id, key: current.key + 1 }))
    if (live.current.settings.sound) playBeep(success)
  }, [])

  const onFrame = useCallback(
    (next: FrameResult) => {
      setFrame(next)
      const state = live.current
      const now = performance.now()
      if (state.step === "rostro") {
        if (next.face) {
          const since = state.lastFace || now
          state.lastFace = since
          setFaceSeenMs(now - since)
        } else {
          state.lastFace = 0
          setFaceSeenMs(0)
        }
      }
      if (!next.face) return
      const over = state.targets.find((target) => isOver(target, next))
      if (state.step === "mover") {
        for (const target of state.targets) {
          if (target !== over) delete state.hoverSince[target.id]
        }
        if (over && !state.done.includes(over.id)) {
          state.hoverSince[over.id] ??= now
          if (now - state.hoverSince[over.id] >= REACH_MS) {
            state.done = [...state.done, over.id]
            setDone(state.done)
            feedback(over.id, true)
          }
        }
      } else if (next.click) {
        if (over && !state.done.includes(over.id)) {
          state.done = [...state.done, over.id]
          setDone(state.done)
          feedback(over.id, true)
        } else {
          feedback(null, false) // el gesto se reconoció aunque no haya objetivo debajo
        }
      }
    },
    [feedback],
  )

  const tracker = useFaceTracker(engine, onFrame)
  const cameraOn = tracker.status === "running" || tracker.status === "loading"

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, index))
    live.current.hoverSince = {}
    live.current.lastFace = 0
    setDone([])
    setFaceSeenMs(0)
    setStepIndex(clamped)
  }, [])

  const start = useCallback(() => {
    setLeftSection(false)
    if (stepIndex === 0) goTo(1)
    void tracker.start()
  }, [goTo, stepIndex, tracker])

  const exit = useCallback(() => {
    tracker.stop()
    setFrame(null)
    setLeftSection(false)
    goTo(0)
  }, [goTo, tracker])

  const restart = useCallback(() => {
    goTo(1)
    engine.reset()
    if (!cameraOn) void tracker.start()
  }, [cameraOn, engine, goTo, tracker])

  const updateSettings = (patch: Partial<DemoSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch }
      engine.settings = next
      return next
    })
  }

  // Apagar la cámara al salir de la sección (P3-49: liberar el stream al cambiar de sección).
  useEffect(() => {
    const node = sectionRef.current
    if (!node || !cameraOn) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          tracker.stop()
          setLeftSection(true)
        }
      },
      { threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [cameraOn, tracker])

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px), (pointer: coarse) and (hover: none)")
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  const faceReady = faceSeenMs >= 1000
  const stepComplete =
    step.id === "rostro" ? faceReady : targets.length > 0 ? targets.every((t) => done.includes(t.id)) : true

  // Al terminar el tutorial ya no hace falta la cámara.
  const { stop: stopTracker } = tracker
  useEffect(() => {
    if (step.id === "cierre") stopTracker()
  }, [step.id, stopTracker])

  // Avance automático cuando se completa un reto, con una pausa para ver el resultado.
  useEffect(() => {
    if (!stepComplete || !["rostro", "mover", "clic"].includes(step.id)) return
    const timer = window.setTimeout(() => goTo(stepIndex + 1), 1400)
    return () => window.clearTimeout(timer)
  }, [goTo, step.id, stepComplete, stepIndex])

  const status = !cameraOn
    ? { label: "Cámara apagada", tone: "bg-white/40" }
    : tracker.status === "loading"
      ? { label: "Cargando…", tone: "bg-amber-400" }
      : frame?.face
        ? { label: "Activo", tone: "bg-emerald-400" }
        : { label: "Sin rostro · en pausa", tone: "bg-red-400" }

  return (
    <section
      id="simulador"
      ref={sectionRef}
      aria-labelledby="demo-title"
      className="scroll-mt-24 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8"
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <ScanFace className="size-3.5" aria-hidden="true" />
            Demo interactiva
          </div>
          <h2 id="demo-title" className="text-3xl font-bold text-foreground">
            Prueba GestIA con tu rostro
          </h2>
          <p className="mt-2 text-muted-foreground">
            Un tutorial de 2 minutos: mueve un puntero con la cabeza y haz clic con un gesto, aquí mismo en el
            navegador.
          </p>
        </div>
        <ol className="flex flex-wrap gap-1.5" aria-label="Pasos de la demo">
          {STEPS.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => (index === 0 ? exit() : cameraOn || index === STEPS.length - 1 ? goTo(index) : undefined)}
                disabled={index !== 0 && index !== STEPS.length - 1 && !cameraOn}
                aria-current={index === stepIndex ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
                  index === stepIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : index < stepIndex
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {index < stepIndex ? <Check className="size-3" aria-hidden="true" /> : <span>{index + 1}</span>}
                {item.short}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {isMobile && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
          <Monitor className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <p>
            GestIA es una aplicación para PC. Para vivir la experiencia completa abre esta demo desde una computadora
            con cámara web.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        {/* Recuadro de práctica */}
        <div className="rounded-2xl bg-[#13171c] p-3 sm:p-4">
          <div className="flex items-center justify-between px-1 pb-3 text-xs text-white/70">
            <span className="flex items-center gap-2" role="status" aria-live="polite">
              <span className={cn("size-2 rounded-full", status.tone)} aria-hidden="true" />
              {status.label}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" aria-hidden="true" /> Video procesado solo en tu navegador
            </span>
          </div>

          <div
            className="relative w-full overflow-hidden rounded-xl border border-white/15 bg-[#1a1f26]"
            style={{ aspectRatio: `${ASPECT}` }}
          >
            {/* Cuadrícula sutil */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                backgroundSize: "10% 16%",
              }}
              aria-hidden="true"
            />

            {/* Vista previa de la cámara (espejo) */}
            <div
              className={cn(
                "absolute right-3 top-3 z-20 overflow-hidden rounded-lg border-2 bg-black transition-all",
                frame?.face ? "border-emerald-400/80" : "border-white/20",
                cameraOn ? "w-[22%]" : "w-0 border-0",
              )}
            >
              <video
                ref={tracker.videoRef}
                className="block aspect-[4/3] w-full -scale-x-100 object-cover"
                muted
                playsInline
                aria-label="Vista previa de tu cámara"
              />
              {cameraOn && frame && (
                <div className="absolute inset-x-1 bottom-1 h-1.5 overflow-hidden rounded-full bg-white/20" title="Apertura de la boca">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-75"
                    style={{ width: `${Math.round(frame.mouthOpen * 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Objetivos */}
            {targets.map((target) => {
              const reached = done.includes(target.id)
              const hovered = frame?.face && isOver(target, frame)
              return (
                <div
                  key={`${target.id}-${flash.id === target.id ? flash.key : 0}`}
                  className={cn(
                    "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                    reached
                      ? "animate-in zoom-in-75 border-emerald-400 bg-emerald-400/20 text-emerald-300"
                      : hovered
                        ? "border-primary bg-primary/30 text-white"
                        : "border-white/30 bg-white/5 text-white/80",
                  )}
                  style={{
                    left: `${target.x * 100}%`,
                    top: `${target.y * 100}%`,
                    width: `${TARGET_RADIUS * 200}%`,
                    aspectRatio: "1",
                  }}
                >
                  {reached ? <Check className="size-6" aria-hidden="true" /> : target.label}
                </div>
              )
            })}

            {/* Puntero */}
            {cameraOn && frame && (
              <div
                className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${frame.x * 100}%`, top: `${frame.y * 100}%` }}
                aria-hidden="true"
              >
                <svg className="absolute -left-6 -top-6 size-12 -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="#ff6a2b"
                    strokeWidth="3"
                    strokeDasharray={`${frame.dwell * 125.6} 125.6`}
                    opacity={frame.dwell > 0.1 ? 1 : 0}
                  />
                </svg>
                <span
                  key={flash.key}
                  className={cn(
                    "block size-5 rounded-full border-2 border-white bg-primary shadow-[0_0_22px_rgba(255,106,43,0.8)]",
                    flash.key > 0 && "animate-in zoom-in-150 duration-300",
                    !frame.face && "opacity-40",
                  )}
                />
              </div>
            )}

            {/* Mensajes sobre el recuadro */}
            {!cameraOn && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 p-6 text-center text-white">
                {tracker.status === "error" ? (
                  <>
                    <Info className="size-8 text-primary" aria-hidden="true" />
                    <p className="max-w-md text-sm text-white/85" role="alert">
                      {tracker.error}
                    </p>
                    <Button size="lg" onClick={start}>
                      <RotateCcw data-icon="inline-start" /> Reintentar
                    </Button>
                  </>
                ) : leftSection ? (
                  <>
                    <Camera className="size-8 text-primary" aria-hidden="true" />
                    <p className="max-w-md text-sm text-white/85">
                      Apagamos la cámara porque saliste de la demo. Continúa cuando quieras.
                    </p>
                    <Button size="lg" onClick={start}>
                      <Camera data-icon="inline-start" /> Reanudar
                    </Button>
                  </>
                ) : step.id === "cierre" ? (
                  <Check className="size-10 text-emerald-400" aria-hidden="true" />
                ) : (
                  <>
                    <span className="flex size-16 items-center justify-center rounded-full border border-primary/60">
                      <ScanFace className="size-8 text-primary" aria-hidden="true" />
                    </span>
                    <p className="max-w-sm text-sm text-white/70">Activa la cámara para empezar la práctica.</p>
                  </>
                )}
              </div>
            )}
            {cameraOn && tracker.status === "running" && frame && !frame.face && (
              <div className="absolute inset-x-0 bottom-4 z-20 mx-auto w-fit rounded-full bg-red-500/90 px-4 py-1.5 text-xs font-semibold text-white">
                No vemos tu rostro: colócate frente a la cámara
              </div>
            )}
            {tracker.status === "loading" && (
              <div className="absolute inset-0 z-20 flex items-center justify-center text-sm text-white/80">
                Preparando la cámara y el modelo…
              </div>
            )}
          </div>
        </div>

        {/* Panel del tutorial */}
        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-border bg-background p-5">
          <div aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Paso {stepIndex + 1} de {STEPS.length}
            </p>
            <h3 className="mt-1.5 text-xl font-bold text-foreground">{step.title}</h3>
            <StepBody
              step={step.id}
              done={done.length}
              total={targets.length}
              faceReady={faceReady}
              cameraOn={cameraOn}
              settings={settings}
              onSettings={updateSettings}
              onRecenter={() => engine.recenter()}
            />
          </div>

          <div className="flex flex-col gap-3">
            {step.id === "bienvenida" && (
              <Button size="lg" className="h-11 text-sm font-bold" onClick={start}>
                <Camera data-icon="inline-start" /> Activar cámara
              </Button>
            )}
            {step.id === "ajustes" && (
              <Button size="lg" className="h-11 text-sm font-bold" onClick={() => goTo(stepIndex + 1)}>
                Terminar <SkipForward data-icon="inline-end" />
              </Button>
            )}
            {step.id === "cierre" && (
              <a
                href="#descarga"
                onClick={() => tracker.stop()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Download className="size-4" aria-hidden="true" /> Ir a la descarga
              </a>
            )}
            <div className="flex flex-wrap gap-2">
              {step.id !== "bienvenida" && step.id !== "cierre" && step.id !== "ajustes" && (
                <Button variant="outline" onClick={() => goTo(stepIndex + 1)}>
                  <SkipForward data-icon="inline-start" /> Saltar paso
                </Button>
              )}
              {step.id !== "bienvenida" && (
                <Button variant="outline" onClick={restart}>
                  <RotateCcw data-icon="inline-start" /> Reiniciar
                </Button>
              )}
              {(step.id !== "bienvenida" || cameraOn) && (
                <Button variant="ghost" onClick={exit}>
                  <LogOut data-icon="inline-start" /> Salir
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

interface StepBodyProps {
  step: StepId
  done: number
  total: number
  faceReady: boolean
  cameraOn: boolean
  settings: DemoSettings
  onSettings: (patch: Partial<DemoSettings>) => void
  onRecenter: () => void
}

function Progress({ done, total, noun }: { done: number; total: number; noun: string }) {
  return (
    <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-foreground">
      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 text-primary">
        {done}/{total}
      </span>
      {noun}
    </p>
  )
}

function StepBody({ step, done, total, faceReady, cameraOn, settings, onSettings, onRecenter }: StepBodyProps) {
  const text = "mt-2 text-sm leading-6 text-muted-foreground"
  switch (step) {
    case "bienvenida":
      return (
        <>
          <p className={text}>
            Vas a probar los gestos básicos de GestIA: mover el puntero con la cabeza y hacer clic abriendo la boca o
            quedándote quieto.
          </p>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-foreground">
            <li className="flex gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              Tu video se procesa en tu navegador y no se envía a ningún lado. Nada se graba.
            </li>
            <li className="flex gap-2.5">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              La demo solo funciona dentro del recuadro; la app controla todo tu equipo.
            </li>
          </ul>
        </>
      )
    case "rostro":
      return (
        <>
          <p className={text}>
            Siéntate frente a la cámara, a unos 50 cm, con buena luz. Cuando te veamos el borde de la vista previa se
            pone verde.
          </p>
          <p
            className={cn(
              "mt-4 flex items-center gap-2 text-sm font-semibold",
              faceReady ? "text-success" : "text-muted-foreground",
            )}
          >
            {faceReady ? <Check className="size-4" aria-hidden="true" /> : <ScanFace className="size-4" aria-hidden="true" />}
            {faceReady ? "Rostro detectado" : cameraOn ? "Buscando tu rostro…" : "Cámara apagada"}
          </p>
        </>
      )
    case "mover":
      return (
        <>
          <p className={text}>
            Gira la cabeza suavemente para llevar el puntero naranja a cada círculo numerado. Mira al centro para volver
            al medio.
          </p>
          <Progress done={done} total={total} noun="objetivos alcanzados" />
        </>
      )
    case "clic":
      return (
        <>
          <p className={text}>
            Pon el puntero sobre cada botón y <strong className="text-foreground">abre la boca</strong> un instante para
            hacer clic. También puedes <strong className="text-foreground">quedarte quieto 1,5 s</strong>: el anillo se
            llena y hace clic solo.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
              <MousePointerClick className="size-3.5" aria-hidden="true" /> Boca abierta = clic
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
              <Crosshair className="size-3.5" aria-hidden="true" /> Quieto = clic
            </span>
          </div>
          <Progress done={done} total={total} noun="clics completados" />
        </>
      )
    case "ajustes":
      return (
        <>
          <p className={text}>
            En la app cada persona adapta los gestos a su comodidad. Cambia estos ajustes y prueba el botón del centro.
          </p>
          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MousePointer2 className="size-4 text-primary" aria-hidden="true" /> Velocidad del puntero
                </span>
                <span className="text-xs text-muted-foreground">{settings.speed.toFixed(1)}×</span>
              </span>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.1}
                value={settings.speed}
                onChange={(event) => onSettings({ speed: Number(event.target.value) })}
                className="accent-primary"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Settings2 className="size-4 text-primary" aria-hidden="true" /> Suavizado
                </span>
                <span className="text-xs text-muted-foreground">
                  {settings.smoothing < 0.4 ? "Rápido" : settings.smoothing < 0.75 ? "Equilibrado" : "Muy estable"}
                </span>
              </span>
              <input
                type="range"
                min={0}
                max={0.9}
                step={0.05}
                value={settings.smoothing}
                onChange={(event) => onSettings({ smoothing: Number(event.target.value) })}
                className="accent-primary"
              />
            </label>
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                <MousePointerClick className="size-4 text-primary" aria-hidden="true" /> Cómo hacer clic
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {CLICK_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    aria-pressed={settings.clickMode === mode.value}
                    onClick={() => onSettings({ clickMode: mode.value })}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                      settings.clickMode === mode.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                aria-pressed={settings.sound}
                onClick={() => onSettings({ sound: !settings.sound })}
              >
                {settings.sound ? <Volume2 data-icon="inline-start" /> : <VolumeX data-icon="inline-start" />}
                Sonido {settings.sound ? "activado" : "desactivado"}
              </Button>
              <Button variant="outline" onClick={onRecenter}>
                <Crosshair data-icon="inline-start" /> Recentrar
              </Button>
            </div>
          </div>
          {done >= total && total > 0 && (
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-success">
              <Check className="size-4" aria-hidden="true" /> ¡Clic con tus ajustes!
            </p>
          )}
        </>
      )
    case "cierre":
      return (
        <>
          <p className={text}>
            Ya probaste mover el puntero y hacer clic con tu rostro. La app de escritorio hace esto en todo tu equipo y
            suma teclado virtual, frases rápidas, perfiles y mapeo de gestos por aplicación.
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-foreground">
            {["Puntero con la cabeza", "Clic con la boca o por permanencia", "Ajustes a tu medida"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </>
      )
  }
}

export default GestureDemo
