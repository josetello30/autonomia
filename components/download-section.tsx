"use client"

/**
 * Sección de descarga (P3-50, P3-63). La versión y los tamaños vienen de data/download.json;
 * mientras un sistema no tenga `url`, su botón dice «Próximamente». El enlace real no llega al
 * navegador: el botón va a /api/descargar, que pide iniciar sesión y la compra antes de entregarlo.
 */

import { useEffect, useState } from "react"
import { Camera, Check, Copy, Cpu, Download, MemoryStick, Monitor, Play, ShieldCheck, Smartphone } from "lucide-react"
import type { PublicDownload, PublicPlatform as Platform } from "@/lib/download"
import { cn } from "@/lib/utils"

const OS_NAMES: Record<string, string> = { windows: "Windows", macos: "macOS", linux: "Linux" }
const REQUIREMENT_ICONS = [Camera, MemoryStick, Cpu]

type Device = { kind: "desktop"; os: string | null } | { kind: "mobile" }

function detectDevice(): Device {
  const agent = navigator.userAgent
  const hint = (navigator as Navigator & { userAgentData?: { platform?: string; mobile?: boolean } }).userAgentData
  if (hint?.mobile || /Android|iPhone|iPad|iPod|Mobile/i.test(agent)) return { kind: "mobile" }
  const platform = `${hint?.platform ?? ""} ${agent}`
  if (/Win/i.test(platform)) return { kind: "desktop", os: "windows" }
  if (/Mac/i.test(platform)) return { kind: "desktop", os: "macos" }
  if (/Linux|X11|CrOS/i.test(platform)) return { kind: "desktop", os: "linux" }
  return { kind: "desktop", os: null }
}

function formatDate(iso: string | null) {
  if (!iso) return "Por anunciar"
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })
}

function DownloadButton({ platform, primary }: { platform: Platform; primary?: boolean }) {
  const base = cn(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-bold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring",
    primary ? "w-full sm:w-auto" : "min-h-10 px-4 py-2 text-sm",
  )
  if (!platform.available) {
    return (
      <button
        type="button"
        aria-disabled="true"
        onClick={(event) => event.preventDefault()}
        className={cn(base, "cursor-not-allowed bg-[#13171c] text-white")}
      >
        <Download className="size-5" aria-hidden="true" />
        {primary ? `Descargar para ${platform.label.split(" ")[0]}` : platform.label}
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">Próximamente</span>
      </button>
    )
  }
  return (
    <a href={`/api/descargar?plataforma=${platform.id}`} className={cn(base, "bg-primary text-primary-foreground hover:brightness-110")}>
      <Download className="size-5" aria-hidden="true" />
      {primary ? `Descargar para ${platform.label.split(" ")[0]}` : platform.label}
    </a>
  )
}

export function DownloadSection({ download }: { download: PublicDownload }) {
  const PLATFORMS = download.platforms
  const [device, setDevice] = useState<Device>({ kind: "desktop", os: "windows" })
  const [copied, setCopied] = useState(false)

  useEffect(() => setDevice(detectDevice()), [])

  const match = device.kind === "desktop" ? PLATFORMS.find((p) => p.id === device.os) : undefined
  const main = match ?? PLATFORMS[0]
  const others = PLATFORMS.filter((p) => p !== main)
  const available = PLATFORMS.some((p) => p.available)

  const copyLink = async () => {
    const link = `${window.location.origin}${window.location.pathname}#descarga`
    try {
      if (navigator.share) {
        await navigator.share({ title: "GestIA", text: "Descarga GestIA en tu computadora", url: link })
        return
      }
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      // El visitante canceló o el navegador no lo permite: no hay nada que hacer.
    }
  }

  return (
    <section id="descarga" aria-labelledby="descarga-title" className="scroll-mt-24 bg-[#13171c] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Descarga</p>
          <h2 id="descarga-title" className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Lleva GestIA a tu computadora
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-white/70">
            Instálala sin ayuda técnica y controla todo tu equipo con gestos faciales.
          </p>

          {device.kind === "mobile" ? (
            <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-5">
              <p className="flex items-start gap-3 text-sm leading-6 text-white/85">
                <Smartphone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                GestIA es una aplicación para PC. Envíate el enlace para descargarla desde tu computadora.
              </p>
              <button
                type="button"
                onClick={copyLink}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
              >
                {copied ? <Check className="size-5" aria-hidden="true" /> : <Copy className="size-5" aria-hidden="true" />}
                {copied ? "Enlace copiado" : "Enviar o copiar enlace"}
              </button>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-3">
              {device.os && !match && (
                <p className="flex items-start gap-2 text-sm text-white/80" role="note">
                  <Monitor className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  Aún no hay versión para {OS_NAMES[device.os] ?? "tu sistema"}. Por ahora GestIA está disponible para:
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4">
                <DownloadButton platform={main} primary />
              </div>
              {!available && (
                <p className="text-sm text-white/60">
                  Estamos preparando el instalador. Muy pronto podrás descargarlo desde aquí.
                </p>
              )}
              {available && (
                <p className="max-w-xl text-sm leading-6 text-white/70">
                  Para descargar, inicia sesión o crea tu cuenta y activa la licencia (compra simulada,
                  sin tarjeta). La misma cuenta sirve para entrar en la app.
                </p>
              )}
              {available && (
                <p className="max-w-xl text-sm leading-6 text-white/70">
                  Si Windows muestra «Windows protegió su PC», pulsa <strong className="text-white">Más
                  información</strong> y luego <strong className="text-white">Ejecutar de todas formas</strong>: el
                  instalador aún no tiene firma digital.
                </p>
              )}
            </div>
          )}

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-white/50">Versión</dt>
              <dd className="font-semibold">{download.version}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-white/50">Fecha</dt>
              <dd className="font-semibold">{formatDate(download.releaseDate)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-white/50">Precio</dt>
              <dd className="font-semibold">{download.price ? `${download.price} · pago único` : "Por anunciar"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-white/50">Tamaño</dt>
              <dd className="font-semibold">{main.size ?? "Por anunciar"}</dd>
            </div>
          </dl>

          <details className="mt-4 text-sm text-white/70">
            <summary className="cursor-pointer font-semibold text-white underline-offset-4 hover:underline">
              Otras versiones
            </summary>
            <ul className="mt-3 flex flex-col gap-2">
              {(others.length ? others : PLATFORMS).map((platform) => (
                <li key={platform.id}>
                  <DownloadButton platform={platform} />
                </li>
              ))}
            </ul>
          </details>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            <a
              href="#simulador"
              className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Play className="size-4" aria-hidden="true" /> Probar antes de descargar
            </a>
            <a
              href="/descargar"
              className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Monitor className="size-4" aria-hidden="true" /> Conoce la app por dentro
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="font-bold">Requisitos mínimos</h3>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm text-white/80">
              {download.requirements.map((item, index) => {
                const Icon = REQUIREMENT_ICONS[index] ?? Check
                return (
                  <li key={item} className="flex items-center gap-2.5">
                    <Icon className="size-4 text-primary" aria-hidden="true" /> {item}
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="font-bold">Instálala en 3 pasos</h3>
            <ol className="mt-3 flex flex-col gap-2.5 text-sm text-white/80">
              {[
                "Crea tu cuenta, activa la licencia y descarga el instalador. No necesitas ser administrador.",
                "Ábrelo y sigue el asistente; deja marcado «Iniciar GestIA al encender el equipo».",
                "Inicia sesión en la app, calibra tus gestos y sigue el tutorial: desde entonces GestIA se abre sola.",
              ].map(
                (item, index) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ol>
          </div>

          <p className="flex items-start gap-2.5 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm leading-6 text-white/85">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            Tras activarla funciona sin internet (valida la licencia cada 30 días) y el video de tu cámara nunca sale de tu equipo.
          </p>
        </div>
      </div>
    </section>
  )
}

export default DownloadSection
