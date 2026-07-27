import type { Product } from "./types";

export const featureFlags = {
  comments: false,
} as const;

export const mockMember = {
  name: "Alumna de ejemplo",
  email: "alumna.demo@example.invalid",
  locale: "Español",
  notifications: "Resumen semanal",
  isMock: true,
} as const;

export const products: Product[] = [
  {
    id: "haz_que_vuelva",
    slug: "haz-que-vuelva",
    name: "Haz Que Vuelva™",
    eyebrow: "Producto principal",
    description:
      "Guía principal en español para acompañar el proceso de reconexión, entregada en PDF.",
    accessState: "available",
    kind: "principal",
    coverImage: "/images/products/haz-que-vuelva.webp",
  },
  {
    id: "21_mensajes",
    slug: "21-mensajes-de-reconexion",
    name: "21 Mensajes de Reconexión",
    eyebrow: "Complemento",
    description:
      "Complemento editorial en español con 21 mensajes de reconexión, entregado en PDF.",
    accessState: "locked",
    kind: "complemento",
    coverImage: "/images/products/21-mensajes-de-reconexion.webp",
  },
  {
    id: "la_otra",
    slug: "la-otra",
    name: "La Otra",
    eyebrow: "Complemento",
    description:
      "Complemento editorial en español para profundizar el contenido principal, entregado en PDF.",
    accessState: "locked",
    kind: "complemento",
    coverImage: "/images/products/la-otra.webp",
  },
  {
    id: "reconquista_30",
    slug: "reconquista-30",
    name: "Reconquista 30™",
    eyebrow: "Producto adicional",
    description:
      "Producto editorial adicional en español, entregado en PDF.",
    accessState: "locked",
    kind: "adicional",
    coverImage: "/images/products/reconquista-30.webp",
  },
  {
    id: "vuelve_ia",
    slug: "vuelve-ia",
    name: "VUELVE IA™",
    eyebrow: "Producto adicional",
    description:
      "Acceso vitalicio a VUELVE IA con una franquicia inicial de 30 respuestas.",
    accessState: "locked",
    kind: "adicional",
    coverImage: "/images/products/vuelve-ia.webp",
  },
];

export const productGroups = [
  {
    id: "todos",
    title: "Todos tus productos",
    products,
  },
  {
    id: "disponibles",
    title: "Disponibles para ti",
    products: products.filter((product) => product.accessState === "available"),
  },
  {
    id: "bloqueados",
    title: "Descubre después",
    products: products.filter((product) => product.accessState === "locked"),
  },
] as const;

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
