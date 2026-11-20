# autonomia - GestIA

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

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

- **Sección de descarga** (`components/download-section.tsx`): versión, fecha, tamaño y enlaces se editan solo en
  `data/download.json`. Mientras `url` sea `null`, el botón muestra «Próximamente» y no descarga nada.

## Integración continua y seguridad (Sprint 7)

Cada pull request y cada push a `main` ejecutan el workflow [CI](.github/workflows/ci.yml):

| Control | Herramienta | Qué bloquea |
|---|---|---|
| Dependencias (P3-56) | `pnpm audit --prod --audit-level high` | Vulnerabilidades altas o críticas en dependencias de producción (las medias y bajas solo se reportan) |
| Secretos (P3-57) | `gitleaks` sobre todo el historial | Cualquier clave, token o contraseña |

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
