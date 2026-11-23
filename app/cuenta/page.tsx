import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2, Download, LogOut, Monitor, ShoppingCart, Trash2 } from "lucide-react"
import { AccountShell, NotConfigured, Notice, primaryButtonClass, secondaryButtonClass } from "@/components/account-shell"
import { createClient } from "@/lib/supabase/server"
import { removeDevice, signOut } from "./actions"

export const metadata: Metadata = { title: "Mi cuenta — GestIA", robots: { index: false } }

const dateFormat = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Lima" })

export default async function CuentaPage({ searchParams }: { searchParams: Promise<{ compra?: string; descarga?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  if (!supabase) {
    return (
      <AccountShell title="Mi cuenta">
        <NotConfigured />
      </AccountShell>
    )
  }

  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/cuenta/ingresar?next=/cuenta")
  const email = typeof data.claims.email === "string" ? data.claims.email : ""

  const [{ data: purchase }, { data: devices }] = await Promise.all([
    supabase.from("purchases").select("created_at, amount_pen").maybeSingle(),
    supabase.from("devices").select("id, label, activated_at, last_validated_at").order("activated_at"),
  ])

  return (
    <AccountShell title="Mi cuenta" intro={<>Sesión iniciada como <strong className="text-foreground">{email}</strong>.</>}>
      <div className="flex flex-col gap-6">
        {params.compra === "ok" && <Notice tone="ok">¡Listo! Tu licencia está activa. Ya puedes descargar GestIA.</Notice>}
        {params.descarga === "pronto" && <Notice>El instalador para tu sistema aún no está publicado.</Notice>}

        <section aria-labelledby="licencia" className="rounded-2xl border border-border bg-card p-6">
          <h2 id="licencia" className="text-xl font-bold">Licencia</h2>
          {purchase ? (
            <>
              <p className="mt-3 flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
                Activa desde el {dateFormat.format(new Date(purchase.created_at))} · S/ {Number(purchase.amount_pen).toFixed(2)} (compra simulada)
              </p>
              <a href="/api/descargar?plataforma=windows" className={`${primaryButtonClass} mt-5`}>
                <Download className="size-5" aria-hidden="true" />
                Descargar para Windows
              </a>
              <p className="mt-3 text-sm text-muted-foreground">
                Al abrir la app, inicia sesión con esta cuenta. Después funciona sin internet y solo pide
                validar la licencia una vez cada 30 días.
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                Aún no tienes licencia. La compra es única (S/ 39) y sirve para hasta 3 computadoras.
              </p>
              <Link href="/cuenta/comprar" className={`${primaryButtonClass} mt-5`}>
                <ShoppingCart className="size-5" aria-hidden="true" />
                Comprar GestIA · S/ 39
              </Link>
            </>
          )}
        </section>

        <section aria-labelledby="equipos" className="rounded-2xl border border-border bg-card p-6">
          <h2 id="equipos" className="text-xl font-bold">Computadoras activadas</h2>
          {devices && devices.length > 0 ? (
            <ul className="mt-4 flex flex-col divide-y divide-border">
              {devices.map((device) => (
                <li key={device.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <span className="flex items-start gap-3 text-sm">
                    <Monitor className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      <strong className="block">{device.label || "Computadora"}</strong>
                      <span className="text-muted-foreground">
                        Última validación: {dateFormat.format(new Date(device.last_validated_at))}
                      </span>
                    </span>
                  </span>
                  <form action={removeDevice}>
                    <input type="hidden" name="id" value={device.id} />
                    <button type="submit" className={secondaryButtonClass} aria-label={`Quitar ${device.label || "computadora"}`}>
                      <Trash2 className="size-4" aria-hidden="true" />
                      Quitar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Ninguna todavía. Aparecerán aquí cuando inicies sesión en la app (máximo 3).
            </p>
          )}
        </section>

        <form action={signOut}>
          <button type="submit" className={secondaryButtonClass}>
            <LogOut className="size-4" aria-hidden="true" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </AccountShell>
  )
}
