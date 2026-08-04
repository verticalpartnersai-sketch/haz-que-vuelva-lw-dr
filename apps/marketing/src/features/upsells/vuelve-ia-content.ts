export const vuelveSteps = [
  {
    label: "01",
    title: "Compartes el contexto",
    body: "Pega la conversación o carga el archivo .txt exportado de WhatsApp. También puedes enviar un .zip que contenga ese texto.",
  },
  {
    label: "02",
    title: "La conversación se organiza",
    body: "VUELVE IA separa hechos, inferencias, iniciativa, reciprocidad, cambios de tono, límites y lagunas.",
  },
  {
    label: "03",
    title: "Recibes una decisión explicada",
    body: "La lectura termina en una recomendación principal, un plan para las próximas 24 horas y condiciones para volver a evaluar.",
  },
] as const;

export const vuelveDetails = [
  {
    title: "Tu conversación real",
    body: "El análisis parte del intercambio que viviste, no de un ejemplo genérico que podría servir para cualquiera.",
  },
  {
    title: "Hechos antes de interpretaciones",
    body: "Distingue lo que ocurrió, lo que el chat sugiere y lo que ninguna conversación puede demostrar.",
  },
  {
    title: "Estado probable del canal",
    body: "Organiza iniciativa, reciprocidad, cambios de tono, límites, silencios y señales de riesgo.",
  },
  {
    title: "Decisión principal justificada",
    body: "Indica si tiene más sentido escribir, responder, esperar, mantener solo logística o no contactar.",
  },
  {
    title: "Plan de 24 horas y 7 días",
    body: "Convierte la lectura en acciones concretas y define qué tendría que cambiar antes del siguiente movimiento.",
  },
  {
    title: "El mismo caso durante 30 días",
    body: "Puedes añadir mensajes nuevos y continuar preguntando sin reconstruir todo el contexto desde cero.",
  },
] as const;

export const vuelveExample = {
  fact: "Él respondió y añadió una pregunta propia.",
  unknown: "No sabemos si quiere volver o si solo mantiene una conversación cordial.",
  signal: "Existe apertura para una respuesta breve; todavía no existe evidencia suficiente para hablar de la relación.",
  decision: "Responder con la misma intensidad y observar si él sostiene el siguiente intercambio.",
} as const;

export const vuelveOfferSummary = [
  "Importación por texto, .txt de WhatsApp o .zip con el archivo",
  "Hechos, señales, inferencias, límites y lagunas separados",
  "Decisión principal con justificación y plan de acción",
  "Un caso activo con contexto continuo durante 30 días",
] as const;
