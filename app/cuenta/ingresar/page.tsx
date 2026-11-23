import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AccountShell, NotConfigured, Notice } from "@/components/account-shell"
import { createClient, safeNext } from "@/lib/supabase/server"
import { AuthForm } from "./auth-form"

export const metadata: Metadata = { title: "Inicia sesión — GestIA", robots: { index: false } }

export default async function IngresarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; modo?: string; aviso?: string }>
}) {
  const params = await searchParams
  const next = safeNext(params.next)
  const supabase = await createClient()
  if (supabase) {
    const { data } = await supabase.auth.getClaims()
    if (data?.claims) redirect(next)
  }

  const fromDownload = next === "/api/descargar"
  return (
    <AccountShell
      title={fromDownload ? "Para descargar GestIA, entra a tu cuenta" : "Tu cuenta de GestIA"}
      intro={
        fromDownload
          ? "Si aún no tienes cuenta, créala en un minuto. Después podrás comprar la licencia y descargar el instalador."
          : "Con tu cuenta compras la licencia, descargas el instalador y activas la app en tu computadora."
      }
    >
      {params.aviso === "enlace" && (
        <div className="mb-6 max-w-md">
          <Notice tone="error">
            El enlace del correo no es válido o ya se usó. Inicia sesión con tu correo y contraseña.
          </Notice>
        </div>
      )}
      {supabase ? <AuthForm next={next} initialMode={params.modo === "registro" ? "registro" : "ingresar"} /> : <NotConfigured />}
    </AccountShell>
  )
}
