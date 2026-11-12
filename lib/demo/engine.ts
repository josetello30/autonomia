/**
 * Lógica de la demo web (P3-49), sin dependencias del navegador para poder probarla aislada.
 *
 * Recibe por cada fotograma unos pocos datos del rostro y devuelve dónde está el puntero dentro
 * del recuadro de práctica y si hubo un clic. Reproduce, en pequeño, lo que hace la app de
 * escritorio: puntero con la cabeza (P3-46) y suavizado (P3-38), clic al abrir la boca (P3-33),
 * clic por permanencia (P3-35) y pausa al perder el rostro (P3-14).
 */

export type ClickMode = "boca" | "permanencia" | "ambos"

export interface DemoSettings {
  /** Cuánto se mueve el puntero por cada grado de giro de la cabeza (1 = normal). */
  speed: number
  /** 0 = sin suavizado, valores altos = puntero más estable pero más lento. */
  smoothing: number
  clickMode: ClickMode
  sound: boolean
}

export const DEFAULT_SETTINGS: DemoSettings = {
  speed: 1,
  smoothing: 0.6,
  clickMode: "ambos",
  sound: true,
}

/** Datos mínimos que se extraen de cada fotograma; nunca se guarda la imagen. */
export interface FaceSample {
  /** Punta de la nariz relativa al centro de los ojos, en distancias entre ojos. */
  yaw: number
  pitch: number
  /** Apertura de la boca de 0 a 1 (blendshape «jawOpen» de MediaPipe). */
  mouthOpen: number
}

export type ClickSource = "boca" | "permanencia"

export interface FrameResult {
  face: boolean
  /** Posición del puntero de 0 a 1 en cada eje del recuadro. */
  x: number
  y: number
  click: ClickSource | null
  /** Progreso de 0 a 1 del clic por permanencia, para dibujar el anillo. */
  dwell: number
  mouthOpen: number
}

const FACE_LOST_MS = 400
const RANGE = 0.32 // giro (en distancias entre ojos) que recorre medio recuadro con velocidad 1
const MOUTH_OPEN = 0.45
const MOUTH_CLOSED = 0.25
const MOUTH_HOLD_MS = 180 // abrir la boca un instante, no al hablar
const DWELL_MS = 1500
const DWELL_RADIUS = 0.035
const CLICK_COOLDOWN_MS = 600

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

export class DemoEngine {
  settings: DemoSettings
  private neutral: { yaw: number; pitch: number } | null = null
  private x = 0.5
  private y = 0.5
  private lastFaceAt = -Infinity
  private mouthSince: number | null = null
  private mouthArmed = true
  private dwellAnchor: { x: number; y: number; since: number } | null = null
  private dwellArmed = true
  private lastClickAt = -Infinity

  constructor(settings: DemoSettings = DEFAULT_SETTINGS) {
    this.settings = { ...settings }
  }

  /** Toma la postura actual como centro del recuadro en el siguiente fotograma. */
  recenter() {
    this.neutral = null
  }

  reset() {
    this.recenter()
    this.x = 0.5
    this.y = 0.5
    this.lastFaceAt = -Infinity
    this.mouthSince = null
    this.mouthArmed = true
    this.dwellAnchor = null
    this.dwellArmed = true
  }

  update(sample: FaceSample | null, now: number): FrameResult {
    if (!sample) {
      // Sin rostro: el puntero se queda quieto y no hay clics (pausa automática).
      this.mouthSince = null
      this.dwellAnchor = null
      return {
        face: now - this.lastFaceAt < FACE_LOST_MS,
        x: this.x,
        y: this.y,
        click: null,
        dwell: 0,
        mouthOpen: 0,
      }
    }

    if (now - this.lastFaceAt >= FACE_LOST_MS) this.neutral = null // al volver, recentrar
    this.lastFaceAt = now
    if (!this.neutral) this.neutral = { yaw: sample.yaw, pitch: sample.pitch }

    const reach = RANGE / this.settings.speed
    const targetX = clamp(0.5 + (sample.yaw - this.neutral.yaw) / (2 * reach))
    const targetY = clamp(0.5 + (sample.pitch - this.neutral.pitch) / (2 * reach))
    const follow = 1 - clamp(this.settings.smoothing, 0, 0.95)
    this.x += (targetX - this.x) * follow
    this.y += (targetY - this.y) * follow

    const click = this.detectMouth(sample.mouthOpen, now) ?? this.detectDwell(now)
    if (click) this.lastClickAt = now
    return {
      face: true,
      x: this.x,
      y: this.y,
      click,
      dwell: this.dwellProgress(now),
      mouthOpen: sample.mouthOpen,
    }
  }

  private canClick(now: number) {
    return now - this.lastClickAt >= CLICK_COOLDOWN_MS
  }

  private detectMouth(open: number, now: number): ClickSource | null {
    if (this.settings.clickMode === "permanencia") return null
    if (open < MOUTH_CLOSED) {
      this.mouthArmed = true
      this.mouthSince = null
      return null
    }
    if (open < MOUTH_OPEN || !this.mouthArmed) return null
    this.mouthSince ??= now
    if (now - this.mouthSince < MOUTH_HOLD_MS || !this.canClick(now)) return null
    this.mouthArmed = false // un clic por gesto: hay que cerrar la boca para el siguiente
    this.dwellAnchor = null
    return "boca"
  }

  private detectDwell(now: number): ClickSource | null {
    if (this.settings.clickMode === "boca") return null
    const anchor = this.dwellAnchor
    if (!anchor || Math.hypot(this.x - anchor.x, this.y - anchor.y) > DWELL_RADIUS) {
      if (anchor) this.dwellArmed = true // moverse rearma la permanencia
      this.dwellAnchor = { x: this.x, y: this.y, since: now }
      return null
    }
    if (!this.dwellArmed || now - anchor.since < DWELL_MS || !this.canClick(now)) return null
    this.dwellArmed = false
    return "permanencia"
  }

  private dwellProgress(now: number) {
    if (this.settings.clickMode === "boca" || !this.dwellArmed || !this.dwellAnchor) return 0
    return clamp((now - this.dwellAnchor.since) / DWELL_MS)
  }
}

/** Índices de la malla de MediaPipe Face Landmarker. */
const NOSE_TIP = 1
const LEFT_EYE_OUTER = 33
const RIGHT_EYE_OUTER = 263

interface Point {
  x: number
  y: number
}

/**
 * Convierte los puntos de la malla en un {@link FaceSample}. La imagen de la cámara se muestra
 * como espejo, así que el giro horizontal se invierte para que el puntero siga a la cabeza.
 */
export function sampleFromLandmarks(landmarks: Point[], mouthOpen: number): FaceSample | null {
  const nose = landmarks[NOSE_TIP]
  const left = landmarks[LEFT_EYE_OUTER]
  const right = landmarks[RIGHT_EYE_OUTER]
  if (!nose || !left || !right) return null
  const eyeDistance = Math.hypot(right.x - left.x, right.y - left.y)
  if (eyeDistance < 1e-3) return null
  const midX = (left.x + right.x) / 2
  const midY = (left.y + right.y) / 2
  return {
    yaw: -(nose.x - midX) / eyeDistance,
    pitch: (nose.y - midY) / eyeDistance,
    mouthOpen: clamp(mouthOpen),
  }
}
