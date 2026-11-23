# GestIA

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

> **Sprint 7 (P3-58):** `main` está protegida: los cambios, también los de v0, llegan solo por
> pull request, con el CI en verde y 1 aprobación. Vercel publica en producción solo desde `main`;
> cada PR genera una vista previa.

[Continue working on v0 →](https://v0.app/chat/projects/prj_2CPASETCLeJX8UHhb0Zz1aQjGkh5)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

## Demo interactiva y descarga (Sprint: P3-49 y P3-50)

- **Demo con cámara** (`components/demo/gesture-demo.tsx`, lógica en `lib/demo/`): tutorial en pasos
  (bienvenida → rostro → mover → clic → ajustes → fin) que usa MediaPipe Face Landmarker en el navegador.
  El video no se graba ni se envía; solo se descargan el motor (jsDelivr) y el modelo (Google) la primera vez.
  La versión de `@mediapipe/tasks-vision` en `package.json` debe coincidir con `MEDIAPIPE_VERSION` en
  `lib/demo/use-face-tracker.ts`.
- **Probar la demo sin cámara (solo `pnpm dev`)**: en la consola del navegador, antes de pulsar «Activar cámara»:

  ```js
  window.__gestiaDemo = { enabled: true, sample: { yaw: 0, pitch: 0, mouthOpen: 0 } }
  // mover: cambia yaw/pitch (±0.3); clic: mouthOpen = 0.7; sin rostro: sample = null
  ```

- **Sección de descarga** (`components/download-section.tsx`): versión, fecha, precio, tamaño y enlaces se editan solo en
  `data/download.json`. Mientras `url` sea `null`, el botón muestra «Próximamente» y no descarga nada.
  Hoy `url` apunta a `releases/latest/download/GestIA-Setup.exe` del repositorio GestIA (P3-24): el
  instalador lo compila y publica el workflow «Instalador» de ese repositorio al subir un tag `vX.Y.Z`.
  Al publicar una versión, actualiza aquí `version`, `releaseDate` y `size`.

## Integración continua y seguridad (Sprint 7)

Cada pull request y cada push a `main` ejecutan el workflow [CI](.github/workflows/ci.yml):

| Control | Herramienta | Qué bloquea |
|---|---|---|
| Dependencias (P3-56) | `pnpm audit --prod --audit-level high` | Vulnerabilidades altas o críticas en dependencias de producción (las medias y bajas solo se reportan) |
| Secretos (P3-57) | `gitleaks` sobre todo el historial | Cualquier clave, token o contraseña |
| Tipos (P3-58) | `tsc --noEmit` | Errores de TypeScript (`next.config.mjs` ya no los ignora al compilar) |
| Código inseguro (SAST, P3-59) | [CodeQL](.github/workflows/codeql.yml), también cada lunes | Alertas altas o críticas (vía el ruleset); las medias y bajas se reportan en *Security → Code scanning* |

**Dependabot** ([.github/dependabot.yml](.github/dependabot.yml)) abre cada lunes PRs con las
actualizaciones de npm y de acciones de GitHub. Una vulnerabilidad sin corrección solo se
acepta documentada en [.github/audit-excepciones.md](.github/audit-excepciones.md) (ID, motivo
y fecha de revisión).

**Secretos en local (P3-57).** Para que gitleaks revise cada commit antes de crearlo, instale
el hook una vez por clon (necesita Python; la primera ejecución descarga gitleaks):

```bash
pip install pre-commit==4.7.0
pre-commit install
```

Las claves van en `.env.local` (Git lo ignora con `.env*.local`) o en las variables de entorno
de Vercel, nunca en el código. Los falsos positivos se documentan en
[.gitleaks.toml](.gitleaks.toml) con su motivo. Si un secreto real llegó a subirse: primero
revóquelo en el servicio y después límpielo del historial.

## Dependencias sin vulnerabilidades altas ni críticas (P3-54)

`pnpm audit --prod` llegó a reportar 4 vulnerabilidades críticas y 36 altas. Se corrigieron así,
sin excepciones en [.github/audit-excepciones.md](.github/audit-excepciones.md):

| Origen | Cambio | Motivo |
|---|---|---|
| `shadcn` | De `dependencies` a `devDependencies` | Es el CLI que genera componentes; solo hace falta al compilar (por `@import 'shadcn/tailwind.css'` en `app/globals.css`). En producción arrastraba un servidor completo (MCP SDK, express, undici…) |
| `next` 16.3.3 | `next` 16.4.6 | Avisos críticos y altos corregidos en 16.4.x |
| `nanoid`, `browserslist`, `source-map-js` (vía `next`) | Actualizados en `pnpm-lock.yaml` dentro de los rangos que pide `next` | Avisos altos |

Resultado: `pnpm audit --prod` → *No known vulnerabilities found*. `pnpm build` compila sin
errores, y la landing, la demo con cámara y `/descargar` funcionan igual que antes (verificado
con Chromium y cámara simulada comparando contra la versión anterior).

Para añadir componentes con el CLI, `pnpm dlx shadcn@latest add <componente>` o
`pnpm exec shadcn add <componente>` siguen funcionando.

## Cabeceras de seguridad y escaneo DAST (P3-61)

[`security-headers.mjs`](security-headers.mjs) define las cabeceras que `next.config.mjs` envía
en todas las rutas (Vercel las aplica también a las páginas estáticas):

| Cabecera | Valor | Protege de |
|---|---|---|
| `Content-Security-Policy` | Solo `'self'` y los orígenes que usa la demo: `cdn.jsdelivr.net` (motor), `storage.googleapis.com` (modelo), Vercel Analytics y las imágenes de `/descargar`; `object-src 'none'`, `frame-ancestors 'none'` | Inyección de scripts y recursos de origen desconocido |
| `Strict-Transport-Security` | 2 años, subdominios, `preload` | Conexiones sin HTTPS |
| `X-Content-Type-Options` | `nosniff` | Ejecutar archivos con un tipo distinto al declarado |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Filtrar la URL completa a otros sitios |
| `Permissions-Policy` | `camera=(self)` y el resto de sensores apagados | Que otro sitio incrustado use la cámara |
| `X-Frame-Options` / `Cross-Origin-Opener-Policy` | `DENY` / `same-origin` | Clickjacking y ventanas de otros orígenes |

Además ya no se envía `X-Powered-By: Next.js`. **Si se añade un origen nuevo** (un CDN, una
fuente, un servicio), hay que sumarlo en `security-headers.mjs`; si no, la CSP lo bloquea y
aparece un error «violates the following Content Security Policy directive» en la consola.

`script-src` incluye `'unsafe-inline'` porque Next.js hidrata las páginas estáticas con scripts
en línea; la alternativa (un *nonce* por petición) obligaría a renderizar en cada visita. ZAP lo
reporta como alerta media. `'wasm-unsafe-eval'` permite el WebAssembly de MediaPipe sin abrir
`eval()`.

El workflow [DAST](.github/workflows/dast.yml) corre en cada PR, en cada push a `main` y cada
lunes:

1. Compila la landing, la inicia y revisa las cabeceras con
   [`scripts/check-security-headers.mjs`](scripts/check-security-headers.mjs).
2. La escanea con **OWASP ZAP baseline** y [`scripts/zap-gate.mjs`](scripts/zap-gate.mjs) falla
   si hay alertas de riesgo **alto**; el resumen aparece en la ejecución.
3. Guarda el reporte de ZAP (HTML, JSON y Markdown) como artefacto (`reporte-zap-build`), 30 días.

Para revisar también el **sitio publicado**, defina la variable del repositorio `LANDING_URL`
(*Settings → Secrets and variables → Actions → Variables*) con la URL de producción: el job
*sitio publicado* repetirá la revisión y el escaneo en cada push a `main`, cada lunes y a mano
(artefacto `reporte-zap-publicada`). Para revisar cabeceras a mano:
`node scripts/check-security-headers.mjs https://<su-dominio>/`.

## Cuentas, licencia y descarga protegida (Sprint 8: P3-62 y P3-63)

- **Supabase** (un solo proyecto para la landing y la app de escritorio): esquema en
  [`supabase/`](supabase/README.md). RLS en todas las tablas; las escrituras van por funciones que
  solo actúan sobre la cuenta con sesión.
- **Rutas nuevas:** `/cuenta/ingresar` (iniciar sesión / crear cuenta), `/cuenta` (licencia,
  computadoras activadas, cerrar sesión), `/cuenta/comprar` (compra simulada de S/ 39, sin datos de
  tarjeta), `/auth/callback` (enlace del correo de confirmación) y `/api/descargar`.
- **Descargar:** el botón va a `/api/descargar`. Sin sesión → iniciar sesión o registrarse; sin
  compra → comprar; con compra → instalador. El enlace del instalador no se envía al navegador.
- La sesión vive en cookies httpOnly y el navegador nunca llama a Supabase (la CSP no cambia).
  `proxy.ts` renueva la sesión solo en las rutas de cuenta.

### Configuración

1. Vercel → Settings → Environment Variables (ver `.env.example`):
   `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Si la integración de
   Supabase con Vercel creó `SUPABASE_SERVICE_ROLE_KEY`, **bórrala**: no se usa y no debe estar ahí.
2. Supabase → Authentication → URL Configuration: *Site URL* = dominio de la landing y en
   *Redirect URLs* `https://<dominio>/auth/callback` (y `http://localhost:3000/auth/callback`).
3. Para desarrollo: copiar `.env.example` como `.env.local`.
