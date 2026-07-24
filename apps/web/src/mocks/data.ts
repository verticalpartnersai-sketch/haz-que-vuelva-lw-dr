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
    id: "mock-main-01",
    slug: "producto-principal-ejemplo",
    name: "Producto principal de ejemplo",
    eyebrow: "Producto principal",
    description:
      "Una biblioteca demostrativa para visualizar la experiencia de lectura y sus materiales.",
    accessState: "available",
    kind: "principal",
    coverVariant: "ember",
    progress: 36,
    relatedItems: [
      { id: "item-01", title: "Introducción de ejemplo", meta: "Lectura · 8 min" },
      { id: "item-02", title: "Ejercicio de ejemplo", meta: "Material PDF" },
      { id: "item-03", title: "Cierre de ejemplo", meta: "Lectura · 5 min" },
    ],
    isMock: true,
  },
  {
    id: "mock-main-02",
    slug: "biblioteca-esencial-ejemplo",
    name: "Biblioteca esencial de ejemplo",
    eyebrow: "Producto principal",
    description:
      "Una segunda variante disponible, sin panel lateral, para validar el detalle compacto.",
    accessState: "available",
    kind: "principal",
    coverVariant: "noir",
    isMock: true,
  },
  {
    id: "mock-bump-01",
    slug: "guia-complementaria-ejemplo",
    name: "Guía complementaria de ejemplo",
    eyebrow: "Complemento",
    description:
      "Contenido ficticio que representa un producto conocido, todavía no adquirido.",
    accessState: "locked",
    kind: "complemento",
    coverVariant: "velvet",
    isMock: true,
  },
  {
    id: "mock-bump-02",
    slug: "cuaderno-practico-ejemplo",
    name: "Cuaderno práctico de ejemplo",
    eyebrow: "Complemento",
    description:
      "Un mock editorial para revisar el estado bloqueado sin precio ni checkout real.",
    accessState: "locked",
    kind: "complemento",
    coverVariant: "rose",
    isMock: true,
  },
  {
    id: "mock-bump-03",
    slug: "lectura-breve-ejemplo",
    name: "Lectura breve de ejemplo",
    eyebrow: "Complemento",
    description:
      "Una lectura demostrativa disponible para aumentar la variedad del catálogo estático.",
    accessState: "available",
    kind: "complemento",
    coverVariant: "ember",
    isMock: true,
  },
  {
    id: "mock-up-01",
    slug: "coleccion-adicional-ejemplo",
    name: "Colección adicional de ejemplo",
    eyebrow: "Producto adicional",
    description:
      "Una colección de demostración disponible para recorrer otra portada y otro progreso.",
    accessState: "available",
    kind: "adicional",
    coverVariant: "ink",
    progress: 72,
    isMock: true,
  },
  {
    id: "mock-up-02",
    slug: "material-extra-ejemplo",
    name: "Material extra de ejemplo",
    eyebrow: "Producto adicional",
    description:
      "Una oferta ficticia bloqueada, mostrada únicamente para validar la interfaz.",
    accessState: "locked",
    kind: "adicional",
    coverVariant: "wine",
    isMock: true,
  },
  {
    id: "mock-up-03",
    slug: "archivo-especial-ejemplo",
    name: "Archivo especial de ejemplo",
    eyebrow: "Producto adicional",
    description:
      "Un último mock bloqueado para comprobar el recorte y el desplazamiento del carril.",
    accessState: "locked",
    kind: "adicional",
    coverVariant: "noir",
    isMock: true,
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
