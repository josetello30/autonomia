// Cabeceras de seguridad de la landing (P3-61). Las usa next.config.mjs para todas las rutas;
// Vercel las envía también con las páginas estáticas.
//
// Orígenes externos permitidos y por qué:
// - cdn.jsdelivr.net: motor WASM de MediaPipe para la demo (lib/demo/use-face-tracker.ts).
// - storage.googleapis.com: modelo Face Landmarker de la demo.
// - va.vercel-scripts.com: script de Vercel Analytics (solo en producción, app/layout.tsx).
// - hebbkx1anhila5yf.public.blob.vercel-storage.com: imágenes de /descargar.
// Si se añade otro origen (un CDN, una fuente), hay que sumarlo aquí o la CSP lo bloqueará.

const MEDIAPIPE_CDN = "https://cdn.jsdelivr.net"
const MEDIAPIPE_MODELS = "https://storage.googleapis.com"
const VERCEL_ANALYTICS = "https://va.vercel-scripts.com"
const IMAGE_HOST = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com"

/**
 * Content-Security-Policy.
 *
 * - 'wasm-unsafe-eval' permite compilar el WebAssembly de MediaPipe sin abrir eval() de JS.
 * - 'unsafe-inline' en script-src: Next.js inserta scripts en línea para hidratar las páginas
 *   estáticas. La alternativa (nonce por petición) obliga a renderizar en cada visita; queda
 *   como mejora futura. React escapa todo el contenido y el sitio no usa
 *   dangerouslySetInnerHTML, así que no hay HTML de usuarios donde inyectar.
 * - En desarrollo, React necesita además 'unsafe-eval' (recarga en caliente).
 */
export function contentSecurityPolicy({ dev = false } = {}) {
  const directives = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "'wasm-unsafe-eval'",
      ...(dev ? ["'unsafe-eval'"] : []),
      MEDIAPIPE_CDN,
      VERCEL_ANALYTICS,
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", IMAGE_HOST],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", MEDIAPIPE_CDN, MEDIAPIPE_MODELS, VERCEL_ANALYTICS],
    "media-src": ["'self'", "blob:"],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": [],
  }
  return Object.entries(directives)
    .map(([name, values]) => [name, ...values].join(" "))
    .join("; ")
}

export function securityHeaders({ dev = false } = {}) {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy({ dev }) },
    // Dos años; el navegador solo usará HTTPS con el dominio y sus subdominios.
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // La demo necesita la cámara de esta misma página; nada más usa sensores ni pagos.
    {
      key: "Permissions-Policy",
      value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    },
    // Para navegadores que no entienden frame-ancestors: no se puede incrustar la landing.
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ]
}
