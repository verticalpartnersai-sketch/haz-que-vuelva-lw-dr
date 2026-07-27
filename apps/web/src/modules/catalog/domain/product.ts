export const PRODUCT_CODES = [
  "haz_que_vuelva",
  "21_mensajes",
  "la_otra",
  "reconquista_30",
  "vuelve_ia",
] as const;

export type ProductCode = (typeof PRODUCT_CODES)[number];

export type Product = {
  code: ProductCode;
  name: string;
  active: boolean;
};

export function isProductCode(value: string): value is ProductCode {
  return PRODUCT_CODES.some((code) => code === value);
}
