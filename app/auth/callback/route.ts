import { NextResponse, type NextRequest } from "next/server"
import { createClient, safeNext } from "@/lib/supabase/server"

/** Enlace del correo de confirmación (P3-62): canjea el código por una sesión. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const next = safeNext(request.nextUrl.searchParams.get("next"))
  const supabase = await createClient()
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(next, request.url), 303)
  }
  return NextResponse.redirect(new URL("/cuenta/ingresar?aviso=enlace", request.url), 303)
}
