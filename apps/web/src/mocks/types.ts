export type UserRole = "member" | "admin";
export type AccessState = "available" | "locked" | "unknown";
export type ProductKind = "principal" | "complemento" | "adicional";

export type RelatedItem = {
  id: string;
  title: string;
  meta: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  accessState: AccessState;
  kind: ProductKind;
  coverImage: string;
  progress?: number;
  relatedItems?: RelatedItem[];
};
