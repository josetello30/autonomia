"use client"

import { useFormStatus } from "react-dom"
import { primaryButtonClass } from "@/components/account-shell"

/** Evita la doble compra con dos clics seguidos (la base además es idempotente). */
export function PurchaseButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={primaryButtonClass}>
      {pending ? "Procesando…" : children}
    </button>
  )
}
