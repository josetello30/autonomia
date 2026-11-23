"use server"

import { headers } from "next/headers"
import { createClient, safeNext } from "@/lib/supabase/server"

export interface AuthState {
  error?: string
  info?: string
  email?: string
  /** Ruta a la que ir con una navegación completa (puede ser /api/descargar, que redirige). */
  goTo?: string
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8

/** Mensajes de Supabase Auth en español claro; lo desconocido no se muestra tal cual. */
function friendly(message: string, code?: string): string {
  const text = `${code ?? ""} ${message}`.toLowerCase()
  if (text.includes("invalid login credentials") || text.includes("invalid_credentials"))
    return "El correo o la contraseña no son correctos."
  if (text.includes("email not confirmed") || text.includes("email_not_confirmed"))
    return "Todavía no confirmaste tu correo. Abre el enlace que te enviamos y vuelve a intentarlo."
  if (text.includes("already registered") || text.includes("user_already_exists"))
    return "Ya existe una cuenta con ese correo. Inicia sesión."
  if (text.includes("weak") || text.includes("password should"))
    return `La contraseña es muy débil. Usa al menos ${MIN_PASSWORD} caracteres, con letras y números.`
  if (text.includes("rate limit") || text.includes("over_email_send_rate_limit") || text.includes("too many"))
    return "Demasiados intentos seguidos. Espera unos minutos y vuelve a probar."
  return "No pudimos completar la operación. Inténtalo de nuevo en unos minutos."
}

function readForm(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    next: safeNext(formData.get("next")),
  }
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password, next } = readForm(formData)
  if (!EMAIL.test(email) || !password) return { error: "Escribe tu correo y tu contraseña.", email }

  const supabase = await createClient()
  if (!supabase) return { error: "Las cuentas aún no están disponibles.", email }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: friendly(error.message, error.code), email }
  return { goTo: next }
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password, next } = readForm(formData)
  const confirm = String(formData.get("confirm") ?? "")
  if (!EMAIL.test(email)) return { error: "Escribe un correo válido.", email }
  if (password.length < MIN_PASSWORD || !/[a-zA-Z]/.test(password) || !/\d/.test(password))
    return { error: `La contraseña necesita al menos ${MIN_PASSWORD} caracteres, con letras y números.`, email }
  if (password !== confirm) return { error: "Las contraseñas no coinciden.", email }

  const supabase = await createClient()
  if (!supabase) return { error: "Las cuentas aún no están disponibles.", email }

  const h = await headers()
  const origin = h.get("origin") ?? `https://${h.get("host")}`
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  })
  if (error) return { error: friendly(error.message, error.code), email }
  // Con la confirmación de correo desactivada en Supabase, la sesión ya está abierta.
  if (data.session) return { goTo: next }
  return {
    info: "Te enviamos un correo para confirmar la cuenta. Abre el enlace y continuarás donde lo dejaste.",
    email,
  }
}
