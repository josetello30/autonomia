import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Check, ShieldCheck, ShoppingCart } from "lucide-react"
import { AccountShell, NotConfigured, Notice } from "@/components/account-shell"
import { createClient } from "@/lib/supabase/server"
import { purchase } from "../actions"
import { PurchaseButton } from "./purchase-button"

export const metadata: Metadata = { title: "Comprar GestIA", robots: { index: false } }

const INCLUDES = [
  "Licencia de por vida para la versión actual y sus actualizaciones",
  "Hasta 3 computadoras con la misma cuenta",
  "Funciona sin internet: solo valida la licencia una vez cada 30 días",
]

export default async function ComprarPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  if (!supabase) {
    return (
      <AccountShell title="Comprar GestIA">
        <NotConfigured />
      </AccountShell>
    )
  }
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/cuenta/ingresar?next=/cuenta/comprar")
  const { data: existing } = await supabase.from("purchases").select("id").maybeSingle()
  if (existing) redirect("/cuenta")

  return (
    <AccountShell title="Comprar GestIA" intro="Un único pago. Sin suscripciones.">
      <div className="max-w-lg rounded-2xl border border-border bg-card p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-bold">GestIA para Windows</h2>
          <p className="text-3xl font-extrabold">S/ 39</p>
        </div>
        <ul className="mt-5 flex flex-col gap-3 text-sm">
          {INCLUDES.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Notice>
            <ShieldCheck className="mr-1.5 inline size-4 align-text-bottom text-primary" aria-hidden="true" />
            <strong>Compra simulada.</strong> Es un proyecto académico: no se cobra nada y no te pedimos
            datos de tarjeta.
          </Notice>
        </div>

        <form action={purchase} className="mt-6 flex flex-col gap-4">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="acepto" value="si" required className="mt-0.5 size-5 accent-primary" />
            Entiendo que es una compra simulada y quiero activar mi licencia.
          </label>
          {params.error === "acepto" && <Notice tone="error">Marca la casilla para continuar.</Notice>}
          {params.error === "compra" && <Notice tone="error">No pudimos registrar la compra. Inténtalo de nuevo.</Notice>}
          <PurchaseButton>
            <ShoppingCart className="size-5" aria-hidden="true" />
            Confirmar compra · S/ 39
          </PurchaseButton>
        </form>
      </div>
    </AccountShell>
  )
}
