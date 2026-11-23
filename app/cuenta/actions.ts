"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signOut() {
  const supabase = await createClient()
  await supabase?.auth.signOut()
  redirect("/")
}

/** Quita un equipo de la licencia (RLS solo deja borrar los de la propia cuenta). */
export async function removeDevice(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const supabase = await createClient()
  if (supabase && /^[0-9a-f-]{36}$/.test(id)) await supabase.from("devices").delete().eq("id", id)
  revalidatePath("/cuenta")
}

/**
 * Compra simulada (P3-63). No pide ni guarda datos de tarjeta: solo registra la compra de la
 * cuenta con sesión mediante la función simulate_purchase() de la base.
 */
export async function purchase(formData: FormData) {
  const supabase = await createClient()
  if (!supabase) redirect("/cuenta")
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/cuenta/ingresar?next=/cuenta/comprar")
  if (formData.get("acepto") !== "si") redirect("/cuenta/comprar?error=acepto")

  const { error } = await supabase.rpc("simulate_purchase")
  if (error) redirect("/cuenta/comprar?error=compra")
  revalidatePath("/cuenta")
  redirect("/cuenta?compra=ok")
}
