import "server-only"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseConfig } from "./config"

/**
 * Cliente de Supabase para páginas, Server Actions y rutas. La sesión vive en cookies httpOnly
 * del propio dominio; el navegador nunca habla directo con Supabase (la CSP no cambia).
 * Devuelve null si el proyecto no está configurado.
 */
export async function createClient() {
  const config = supabaseConfig()
  if (!config) return null
  const cookieStore = await cookies()
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options)
        } catch {
          // Llamado desde un Server Component: no puede escribir cookies. proxy.ts renueva la sesión.
        }
      },
    },
  })
}

/** Rutas internas a las que se puede volver tras iniciar sesión (evita redirecciones abiertas). */
const SAFE_NEXT = new Set(["/cuenta", "/cuenta/comprar", "/api/descargar"])

export function safeNext(value: FormDataEntryValue | string | null | undefined): string {
  return typeof value === "string" && SAFE_NEXT.has(value) ? value : "/cuenta"
}
