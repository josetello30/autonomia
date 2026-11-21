export type Effort = "Bajo" | "Medio" | "Alto"

export type Category = "Puntero y clic" | "Navegación" | "Escritura" | "Ventanas y apps" | "Control"

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

export const CATEGORIES: Category[] = ["Puntero y clic", "Navegación", "Escritura", "Ventanas y apps", "Control"]

/**
 * Funciones reales de la app de escritorio GestIA con su gesto por defecto.
 * Mantener alineado con `DEFAULT_ACTIONS` y el menú de acciones rápidas del repositorio GestIA:
 * cada gesto se puede reasignar desde la app (pestaña Mapeo).
 */
export const commands: Command[] = [
  {
    id: "move-pointer",
    action: "Mover el puntero",
    gesture: "Movimiento de la cabeza",
    category: "Puntero y clic",
    effort: "Bajo",
    description:
      "El cursor sigue los giros suaves de tu cabeza, con suavizado para evitar temblores y velocidad ajustable.",
    keywords: ["mouse", "raton", "cursor", "mover", "cabeza", "apuntar", "señalar", "navegar", "internet", "pantalla"],
  },
  {
    id: "left-click",
    action: "Clic izquierdo",
    gesture: "Guiño izquierdo",
    category: "Puntero y clic",
    effort: "Medio",
    description:
      "Cierra solo el ojo izquierdo un instante para hacer clic donde está el cursor. Un parpadeo natural no cuenta.",
    keywords: ["clic", "click", "pulsar", "seleccionar", "presionar", "boton", "enlace", "abrir", "internet", "web"],
  },
  {
    id: "right-click",
    action: "Clic derecho",
    gesture: "Guiño derecho",
    category: "Puntero y clic",
    effort: "Medio",
    description: "Un guiño con el ojo derecho abre el menú contextual de lo que tienes debajo del cursor.",
    keywords: ["clic derecho", "menu", "contextual", "opciones", "copiar", "pegar", "propiedades"],
  },
  {
    id: "double-click",
    action: "Doble clic",
    gesture: "Abrir la boca",
    category: "Puntero y clic",
    effort: "Bajo",
    description:
      "Abre archivos y programas abriendo la boca. Al hablar no se activa: espera a que termines.",
    keywords: ["doble", "abrir", "archivo", "programa", "carpeta", "ejecutar"],
  },
  {
    id: "drag",
    action: "Arrastrar y soltar",
    gesture: "Sonreír",
    category: "Puntero y clic",
    effort: "Bajo",
    description: "Una sonrisa agarra el elemento, mueves la cabeza para llevarlo y otra sonrisa lo suelta.",
    keywords: ["arrastrar", "soltar", "mover", "archivo", "seleccionar", "texto", "ventana"],
  },
  {
    id: "dwell-click",
    action: "Clic sin gestos",
    gesture: "Mantener el cursor quieto",
    category: "Puntero y clic",
    effort: "Bajo",
    description:
      "Clic por permanencia: deja el cursor quieto un momento y hace clic solo. Ideal si los gestos faciales te cansan.",
    keywords: ["permanencia", "esperar", "quieto", "automatico", "sin gestos", "cansancio", "fatiga", "clic"],
  },
  {
    id: "scroll",
    action: "Desplazar páginas",
    gesture: "Fruncir los labios",
    category: "Navegación",
    effort: "Medio",
    description:
      "Activa el modo desplazamiento: aleja la cabeza del centro para recorrer páginas y documentos; repite el gesto para salir.",
    keywords: ["scroll", "desplazar", "bajar", "subir", "pagina", "leer", "internet", "documento", "web"],
  },
  {
    id: "pause",
    action: "Pausar y reanudar",
    gesture: "Cerrar ambos ojos",
    category: "Control",
    effort: "Medio",
    description: "Pausa el control para descansar o conversar sin activar acciones; repite el gesto para seguir.",
    keywords: ["pausar", "descansar", "detener", "parar", "reanudar", "conversar", "hablar", "pausa"],
  },
  {
    id: "recenter",
    action: "Recentrar el puntero",
    gesture: "Levantar las cejas",
    category: "Control",
    effort: "Bajo",
    description: "Toma tu postura actual como el centro de la pantalla, útil si cambiaste de posición en la silla.",
    keywords: ["recentrar", "centro", "calibrar", "postura", "ajustar", "recalibrar"],
  },
  {
    id: "per-app",
    action: "Gestos distintos por aplicación",
    gesture: "Configurable en la pestaña Mapeo",
    category: "Control",
    effort: "Bajo",
    description:
      "Asigna otras acciones a cada gesto según la ventana activa, por ejemplo una para el navegador y otra para Word.",
    keywords: ["mapeo", "personalizar", "configurar", "aplicacion", "navegador", "word", "perfil", "asignar"],
  },
  {
    id: "virtual-keyboard",
    action: "Escribir con el teclado virtual",
    gesture: "Cursor + clic",
    category: "Escritura",
    effort: "Medio",
    description:
      "Teclado en pantalla con ñ, tildes y sugerencias de palabras; pulsas cada tecla con el cursor y tu gesto de clic.",
    keywords: ["escribir", "teclado", "texto", "mensaje", "correo", "chat", "letras", "palabras", "redactar"],
  },
  {
    id: "phrases",
    action: "Frases rápidas",
    gesture: "Cursor + clic",
    category: "Escritura",
    effort: "Bajo",
    description:
      "Guarda frases frecuentes como «Necesito ayuda» o «Gracias» y escríbelas completas con una sola selección.",
    keywords: ["frases", "mensaje", "comunicar", "ayuda", "responder", "chat", "conversacion", "enviar", "urgente"],
  },
  {
    id: "switch-window",
    action: "Cambiar de ventana",
    gesture: "Menú de acciones rápidas",
    category: "Ventanas y apps",
    effort: "Bajo",
    description: "Desde el menú de acciones rápidas pasa a otra ventana abierta, vuelve atrás o cierra la actual.",
    keywords: ["ventana", "cambiar", "alt tab", "cerrar", "atras", "volver", "multitarea"],
  },
  {
    id: "show-desktop",
    action: "Mostrar el escritorio",
    gesture: "Menú de acciones rápidas",
    category: "Ventanas y apps",
    effort: "Bajo",
    description: "Minimiza todo para ver el escritorio con una sola selección del menú de acciones rápidas.",
    keywords: ["escritorio", "minimizar", "inicio", "windows", "pantalla"],
  },
  {
    id: "open-apps",
    action: "Abrir aplicaciones",
    gesture: "Menú de acciones rápidas",
    category: "Ventanas y apps",
    effort: "Bajo",
    description: "Abre el navegador, el explorador de archivos, el bloc de notas o la calculadora sin buscar íconos.",
    keywords: ["abrir", "navegador", "internet", "chrome", "archivos", "explorador", "notas", "calculadora", "programa"],
  },
]
