export type Effort = "Bajo" | "Medio" | "Alto"

export type Category =
  | "Navegación Web"
  | "Comunicación"
  | "Entretenimiento"
  | "Emergencia"
  | "Sistema"
  | "Productividad"

export interface Command {
  id: string
  action: string
  gesture: string
  category: Category
  effort: Effort
  description: string
  /** Palabras clave que enriquecen la búsqueda semántica */
  keywords: string[]
}

export const CATEGORIES: Category[] = [
  "Navegación Web",
  "Comunicación",
  "Entretenimiento",
  "Emergencia",
  "Sistema",
  "Productividad",
]

export const commands: Command[] = [
  {
    id: "open-gmail",
    action: "Abrir Gmail",
    gesture: "Movimiento de cejas",
    category: "Comunicación",
    effort: "Bajo",
    description:
      "Abre la bandeja de entrada de tu correo electrónico para leer y responder mensajes sin usar las manos.",
    keywords: ["correo", "email", "mail", "mensajes", "bandeja", "escribir correo", "revisar correo"],
  },
  {
    id: "click",
    action: "Hacer clic",
    gesture: "Pestañeo doble",
    category: "Navegación Web",
    effort: "Bajo",
    description: "Ejecuta un clic izquierdo en el elemento donde se encuentra el cursor mediante un doble parpadeo.",
    keywords: ["clic", "seleccionar", "presionar", "boton", "activar", "pulsar"],
  },
  {
    id: "scroll-up",
    action: "Desplazar hacia arriba",
    gesture: "Mirada arriba",
    category: "Navegación Web",
    effort: "Medio",
    description: "Desplaza la página hacia arriba manteniendo la mirada dirigida hacia la parte superior de la pantalla.",
    keywords: ["scroll", "subir", "desplazar", "arriba", "navegar pagina", "leer arriba"],
  },
  {
    id: "scroll-down",
    action: "Desplazar hacia abajo",
    gesture: "Mirada abajo",
    category: "Navegación Web",
    effort: "Medio",
    description: "Desplaza la página hacia abajo dirigiendo la mirada hacia la parte inferior de la pantalla.",
    keywords: ["scroll", "bajar", "desplazar", "abajo", "navegar pagina", "leer mas"],
  },
  {
    id: "go-home",
    action: "Ir al inicio",
    gesture: "Sonrisa",
    category: "Navegación Web",
    effort: "Bajo",
    description: "Regresa a la página principal o pantalla de inicio del sistema con una sonrisa.",
    keywords: ["inicio", "home", "principal", "menu", "volver", "pantalla principal"],
  },
  {
    id: "voice-call",
    action: "Iniciar llamada",
    gesture: "Guiño derecho",
    category: "Comunicación",
    effort: "Medio",
    description: "Inicia una llamada de voz con tu contacto favorito usando un guiño con el ojo derecho.",
    keywords: ["llamar", "telefono", "contacto", "hablar", "llamada", "comunicar"],
  },
  {
    id: "send-message",
    action: "Enviar mensaje de texto",
    gesture: "Boca abierta",
    category: "Comunicación",
    effort: "Medio",
    description: "Envía un mensaje de texto predefinido o dictado por voz abriendo la boca de forma sostenida.",
    keywords: ["mensaje", "texto", "sms", "chat", "escribir", "whatsapp", "responder"],
  },
  {
    id: "play-music",
    action: "Reproducir música",
    gesture: "Cabeceo (asentir)",
    category: "Entretenimiento",
    effort: "Bajo",
    description: "Reproduce tu lista de música favorita asintiendo suavemente con la cabeza.",
    keywords: ["musica", "reproducir", "canciones", "spotify", "playlist", "escuchar", "sonido"],
  },
  {
    id: "pause-media",
    action: "Pausar reproducción",
    gesture: "Cejas levantadas",
    category: "Entretenimiento",
    effort: "Bajo",
    description: "Pausa el video o la música que se está reproduciendo levantando ambas cejas.",
    keywords: ["pausa", "detener", "parar", "video", "musica", "stop"],
  },
  {
    id: "watch-video",
    action: "Abrir YouTube",
    gesture: "Giro de cabeza a la derecha",
    category: "Entretenimiento",
    effort: "Medio",
    description: "Abre la aplicación de videos para ver contenido de entretenimiento girando la cabeza a la derecha.",
    keywords: ["video", "youtube", "ver", "peliculas", "series", "entretenimiento", "streaming"],
  },
  {
    id: "emergency-call",
    action: "Llamada de emergencia",
    gesture: "Pestañeo triple prolongado",
    category: "Emergencia",
    effort: "Alto",
    description:
      "Activa una llamada inmediata a servicios de emergencia o a tu contacto de confianza con un patrón de tres parpadeos.",
    keywords: ["emergencia", "ayuda", "sos", "911", "urgente", "auxilio", "peligro", "socorro"],
  },
  {
    id: "alert-caregiver",
    action: "Avisar a cuidador",
    gesture: "Mirada fija sostenida",
    category: "Emergencia",
    effort: "Alto",
    description: "Envía una alerta silenciosa a tu cuidador manteniendo la mirada fija en el punto central de la pantalla.",
    keywords: ["cuidador", "asistencia", "alerta", "avisar", "familia", "notificar", "ayuda"],
  },
  {
    id: "open-browser",
    action: "Abrir navegador web",
    gesture: "Doble asentimiento",
    category: "Navegación Web",
    effort: "Medio",
    description: "Abre el navegador para buscar información en internet asintiendo dos veces con la cabeza.",
    keywords: ["navegador", "internet", "web", "buscar", "google", "chrome", "paginas"],
  },
  {
    id: "increase-volume",
    action: "Subir volumen",
    gesture: "Mirada arriba sostenida",
    category: "Sistema",
    effort: "Bajo",
    description: "Aumenta el volumen del dispositivo manteniendo la mirada hacia arriba durante unos segundos.",
    keywords: ["volumen", "subir", "sonido", "audio", "mas alto", "sistema"],
  },
  {
    id: "type-keyboard",
    action: "Escribir con teclado virtual",
    gesture: "Seguimiento ocular",
    category: "Productividad",
    effort: "Alto",
    description: "Activa el teclado en pantalla y escribe seleccionando letras con el movimiento y la fijación de la mirada.",
    keywords: ["escribir", "teclado", "texto", "redactar", "letras", "dictar", "productividad"],
  },
  {
    id: "take-note",
    action: "Crear una nota",
    gesture: "Guiño izquierdo",
    category: "Productividad",
    effort: "Medio",
    description: "Crea una nota rápida por voz para recordar tareas o ideas usando un guiño con el ojo izquierdo.",
    keywords: ["nota", "recordatorio", "apunte", "tarea", "agenda", "guardar", "productividad"],
  },
]
