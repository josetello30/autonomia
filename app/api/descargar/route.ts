import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { installerUrl } from "@/lib/download"

/**
 * Descarga protegida (P3-63): sin sesión → iniciar sesión; sin compra → comprar; con compra →
 * el instalador. La licencia la vuelve a exigir la app al iniciar sesión (P3-62).
 */
export async function GET(request: NextRequest) {
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url), 303)
  const supabase = await createClient()
  if (!supabase) return to("/cuenta")

  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) return to("/cuenta/ingresar?next=/api/descargar")

  const { data: purchase } = await supabase.from("purchases").select("id").maybeSingle()
  if (!purchase) return to("/cuenta/comprar")

  const url = installerUrl(request.nextUrl.searchParams.get("plataforma"))
  if (!url) return to("/cuenta?descarga=pronto")
  const response = NextResponse.redirect(url, 303)
  response.headers.set("Cache-Control", "private, no-store")
  return response
}
