"use client"

/**
 * Cámara + MediaPipe Face Landmarker para la demo (P3-49).
 *
 * Todo se procesa en el navegador: los fotogramas van del <video> al modelo y solo se conservan
 * unos números por fotograma (giro de cabeza y apertura de boca). Nada se graba ni se envía.
 * Solo se descargan el motor y el modelo de MediaPipe la primera vez.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import type { FaceLandmarker } from "@mediapipe/tasks-vision"
import { DemoEngine, sampleFromLandmarks, type FaceSample, type FrameResult } from "./engine"

const MEDIAPIPE_VERSION = "1.1.1" // debe coincidir con package.json
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"

export type TrackerStatus = "idle" | "loading" | "running" | "error"

let landmarkerPromise: Promise<FaceLandmarker> | null = null

async function createLandmarker(delegate: "GPU" | "CPU") {
  const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision")
  const fileset = await FilesetResolver.forVisionTasks(WASM_URL)
  return FaceLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: true,
  })
}

/** El modelo se carga una sola vez por página; si la GPU falla se usa la CPU. */
function loadLandmarker() {
  landmarkerPromise ??= createLandmarker("GPU").catch(() => createLandmarker("CPU"))
  landmarkerPromise.catch(() => {
    landmarkerPromise = null // permitir reintentar
  })
  return landmarkerPromise
}

function cameraErrorMessage(error: unknown) {
  const name = error instanceof DOMException ? error.name : ""
  if (name === "NotAllowedError" || name === "SecurityError")
    return "No diste permiso para usar la cámara. Puedes permitirlo desde el candado de la barra de direcciones y volver a intentarlo."
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "No encontramos una cámara conectada a este equipo."
  if (name === "NotReadableError")
    return "La cámara está en uso por otra aplicación. Ciérrala y vuelve a intentarlo."
  return "No se pudo iniciar la demo. Revisa tu conexión a internet (la primera vez se descarga el modelo) y vuelve a intentarlo."
}

/** Solo en desarrollo: permite alimentar la demo sin cámara para probarla (ver README). */
interface DevFeed {
  enabled: boolean
  sample: FaceSample | null
}
declare global {
  interface Window {
    __gestiaDemo?: DevFeed
  }
}
const devFeed = () =>
  process.env.NODE_ENV === "development" && typeof window !== "undefined" && window.__gestiaDemo?.enabled
    ? window.__gestiaDemo
    : null

export function useFaceTracker(engine: DemoEngine, onFrame: (frame: FrameResult) => void) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const loopRef = useRef<number | null>(null)
  const runRef = useRef(0)
  const onFrameRef = useRef(onFrame)
  onFrameRef.current = onFrame
  const [status, setStatus] = useState<TrackerStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    runRef.current += 1 // invalida un arranque que siga en curso
    if (loopRef.current !== null) cancelAnimationFrame(loopRef.current)
    loopRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setStatus((current) => (current === "error" ? current : "idle"))
  }, [])

  const start = useCallback(async () => {
    stop()
    const run = runRef.current
    setStatus("loading")
    setError(null)
    engine.reset()
    try {
      const fake = devFeed()
      let landmarker: FaceLandmarker | null = null
      if (!fake) {
        if (!navigator.mediaDevices?.getUserMedia) throw new DOMException("", "NotFoundError")
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        })
        if (run !== runRef.current) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) throw new Error("Sin elemento de video")
        video.srcObject = stream
        await video.play()
        landmarker = await loadLandmarker()
        if (run !== runRef.current) return
      }
      setStatus("running")

      let lastVideoTime = -1
      const tick = () => {
        if (run !== runRef.current) return
        const now = performance.now()
        const video = videoRef.current
        if (fake) {
          onFrameRef.current(engine.update(fake.sample, now))
        } else if (landmarker && video && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime
          const result = landmarker.detectForVideo(video, now)
          const landmarks = result.faceLandmarks[0]
          const jaw = result.faceBlendshapes[0]?.categories.find((c) => c.categoryName === "jawOpen")
          const sample = landmarks ? sampleFromLandmarks(landmarks, jaw?.score ?? 0) : null
          onFrameRef.current(engine.update(sample, now))
        }
        loopRef.current = requestAnimationFrame(tick)
      }
      loopRef.current = requestAnimationFrame(tick)
    } catch (cause) {
      if (run !== runRef.current) return
      console.error("Demo GestIA:", cause)
      stop()
      setError(cameraErrorMessage(cause))
      setStatus("error")
    }
  }, [engine, stop])

  // Liberar la cámara si la pestaña se oculta y al desmontar.
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden") stop()
    }
    document.addEventListener("visibilitychange", onHidden)
    return () => {
      document.removeEventListener("visibilitychange", onHidden)
      stop()
    }
  }, [stop])

  return { videoRef, status, error, start, stop }
}
