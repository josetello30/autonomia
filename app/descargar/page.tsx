import Link from "next/link"
import { ArrowLeft, Check, Download, Eye, Keyboard, MousePointer2, ShieldCheck, Sparkles } from "lucide-react"

const screenshots = [
  {
    title: "Panel de control facial",
    description:
      "Activa la cámara, calibra tu perfil y configura qué gestos quieres utilizar. GestIA transforma movimientos naturales como abrir la boca, cerrar los ojos o levantar las cejas en acciones del sistema.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-YQ14QFtwBQ4RvMoMzMpuEFKoBRwLc0.png",
    icon: Eye,
  },
  {
    title: "Teclado virtual accesible",
    description:
      "Escribe sin depender de un teclado físico. El teclado virtual incluye letras, números, navegación, edición y accesos rápidos para que puedas controlar tus aplicaciones con comodidad.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2LqRRCMWvE8w84jJxzKVD46zs3VBa6.png",
    icon: Keyboard,
  },
  {
    title: "Frases rápidas",
    description:
      "Guarda y selecciona frases frecuentes con un solo gesto. Es útil para comunicar necesidades, responder conversaciones o avisar que necesitas ayuda sin escribir cada palabra.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-GIHnGa64yvdTSwCEfH4egbx5lLfu2Y.png",
    icon: Sparkles,
  },
  {
    title: "Calibración paso a paso",
    description:
      "El programa te guía por una calibración visual: mueve la cabeza hacia los puntos indicados y crea un perfil ajustado a tus movimientos. Así mejora la precisión del puntero y de cada gesto.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IsEub3P5T3CdftTXMRbpyGUXC1yOrZ.png",
    icon: MousePointer2,
  },
]

const benefits = [
  "Control del cursor mediante movimientos de cabeza",
  "Gestos faciales configurables por perfil",
  "Procesamiento local: tus imágenes no se guardan",
  "Teclado virtual y frases rápidas integradas",
  "Calibración guiada para una experiencia personalizada",
]

export default function DescargarPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/90 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Eye className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg">Gest<span className="text-primary">IA</span></span>
          </Link>
          <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver al inicio
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              Conoce GestIA
            </span>
            <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
              Una forma más libre de usar tu computadora.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
              GestIA convierte tus gestos faciales y movimientos de cabeza en controles precisos para el cursor, el teclado y tus frases cotidianas.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="/#descarga" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5">
                <Download className="size-5" aria-hidden="true" />
                Descargar GestIA
              </a>
              <span className="text-sm font-medium text-muted-foreground">Para Windows 10 y 11 · Instalación en minutos</span>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Qué incluye</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Todo lo necesario para empezar</h2>
              <p className="mt-4 leading-7 text-muted-foreground">Una herramienta pensada para facilitar la interacción diaria con el equipo, con controles ajustables a cada persona.</p>
              <ul className="mt-7 flex flex-col gap-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-sm font-medium">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-3.5" aria-hidden="true" /></span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-background p-3 shadow-sm">
              <img src={screenshots[0].image} alt="Panel principal de GestIA con cámara, puntero y configuración de gestos" className="w-full rounded-xl" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Así funciona</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Un recorrido simple y personalizable</h2>
          </div>
          <div className="flex flex-col gap-10">
            {screenshots.slice(1).map((item, index) => {
              const Icon = item.icon
              return (
                <article key={item.title} className={`grid gap-8 rounded-2xl border border-border bg-card p-4 sm:p-6 lg:grid-cols-2 lg:items-center ${index % 2 ? "lg:[&>div:first-child]:order-2" : ""}`}>
                  <div className="overflow-hidden rounded-xl border border-border bg-background">
                    <img src={item.image} alt={item.title} className="max-h-[420px] w-full object-contain" />
                  </div>
                  <div className="px-2 py-4 sm:px-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></div>
                    <p className="mt-5 text-sm font-bold text-primary">Paso {index + 2}</p>
                    <h3 className="mt-2 text-2xl font-bold">{item.title}</h3>
                    <p className="mt-4 leading-7 text-muted-foreground">{item.description}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="bg-[#13171c] px-4 py-16 text-white sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-3 text-primary"><ShieldCheck className="size-6" aria-hidden="true" /><span className="font-bold">Accesibilidad primero</span></div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">Empieza a usar GestIA</h2>
              <p className="mt-3 max-w-2xl text-white/70">El precio de GestIA se anunciará junto con la versión inicial. Mientras tanto puedes descargarla e instalarla desde la sección de descarga.</p>
            </div>
            <a href="/#descarga" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition hover:brightness-110"><Download className="size-5" aria-hidden="true" />Descargar GestIA</a>
          </div>
        </section>
      </main>
    </div>
  )
}
