/**
 * Conexión a Supabase (P3-62). Solo se usan la URL del proyecto y la clave publicable, que son
 * públicas por diseño: RLS decide qué puede ver cada cuenta. La clave service_role NO se usa en
 * la landing ni debe estar en Vercel.
 *
 * Vercel: Settings → Environment Variables
 *   NEXT_PUBLIC_SUPABASE_URL              https://<proyecto>.supabase.co
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  sb_publishable_...  (o NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */
export function supabaseConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key ? { url, key } : null
}
