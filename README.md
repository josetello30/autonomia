# autonomia

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
