import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { supabaseConfig } from "@/lib/supabase/config"

/**
 * Renueva la sesión de Supabase (P3-62) antes de las rutas de cuenta y descarga. El resto de la
 * landing sigue siendo estático y no pasa por aquí.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const config = supabaseConfig()
  if (!config) return response

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options)
        for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value)
      },
    },
  })
  // getClaims valida el token y lo renueva si caducó; no confiar en getSession() en el servidor.
  await supabase.auth.getClaims()
  return response
}

export const config = {
  matcher: ["/cuenta/:path*", "/api/descargar", "/auth/:path*"],
}
