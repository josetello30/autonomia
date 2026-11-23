import "server-only"
import download from "@/data/download.json"

/**
 * Enlaces de los instaladores (P3-63). Solo los lee el servidor: la página muestra si un sistema
 * está disponible, pero el enlace real lo entrega /api/descargar a cuentas con compra.
 */
export interface PublicPlatform {
  id: string
  label: string
  size: string | null
  available: boolean
}

export interface PublicDownload {
  version: string
  releaseDate: string | null
  price: string | null
  requirements: string[]
  platforms: PublicPlatform[]
}

/** Lo que la sección de descarga puede mostrar en el navegador (sin enlaces). */
export function publicDownload(): PublicDownload {
  const { version, releaseDate, price, requirements } = download
  return { version, releaseDate, price, requirements, platforms: publicPlatforms() }
}

export function publicPlatforms(): PublicPlatform[] {
  return download.platforms.map(({ id, label, size, url }) => ({ id, label, size, available: Boolean(url) }))
}

export function installerUrl(platformId: string | null): string | null {
  const platform = download.platforms.find((p) => p.id === platformId) ?? download.platforms[0]
  return platform?.url ?? null
}
