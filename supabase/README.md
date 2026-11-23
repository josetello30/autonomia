# Base de datos (Supabase)

Un solo proyecto de Supabase para la landing y la app de escritorio: la misma cuenta sirve en ambas.

| Objeto | Para qué |
| --- | --- |
| `purchases` | Compra simulada de S/ 39 (una por cuenta). Es la licencia. Sin datos de pago. |
| `devices` | Equipos donde la app activó la licencia (máximo 3). Solo se guarda un hash SHA-256 del equipo. |
| `simulate_purchase()` | La landing la llama al «comprar». Idempotente. |
| `activate_device(hash, etiqueta)` | La app la llama al iniciar sesión y, como mucho, cada 30 días. |

## Seguridad

- RLS activado: cada cuenta solo ve sus filas. Nadie escribe directo en las tablas; las funciones
  `SECURITY DEFINER` solo actúan sobre `auth.uid()` (el aviso 0029 del asesor de Supabase es intencional).
- `anon` no puede llamar a las funciones ni leer las tablas.
- La clave `service_role` **no** se usa en ningún sitio: ni en el código, ni en la app, ni en Vercel.
  La landing y la app solo usan la clave publicable.

## Aplicar las migraciones

Ya están aplicadas en el proyecto. En otro proyecto: SQL Editor → pegar cada archivo de
`migrations/` en orden, o `supabase db push` con la CLI.

## El instalador

Pesa unos 110 MB y el plan gratuito de Storage acepta archivos de hasta 50 MB, así que sigue en
GitHub Releases. La landing solo muestra el botón de descarga a cuentas con compra, y la licencia
de verdad la exige la app al iniciar sesión.
