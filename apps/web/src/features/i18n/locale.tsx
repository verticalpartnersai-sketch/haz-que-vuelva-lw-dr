"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "es" | "pt" | "en";

export type CopyKey =
  | "admin.description"
  | "admin.title"
  | "ai.description"
  | "ai.kicker"
  | "ai.title"
  | "home.description"
  | "home.explore"
  | "home.library"
  | "home.rail.available"
  | "home.rail.all"
  | "home.rail.locked"
  | "home.title"
  | "nav.admin"
  | "nav.ai"
  | "nav.home"
  | "nav.products"
  | "nav.profile"
  | "products.description"
  | "products.title"
  | "profile.description"
  | "profile.title"
  | "shell.language"
  | "shell.logout"
  | "status.available"
  | "status.expired"
  | "status.locked";

const copy: Record<Locale, Record<CopyKey, string>> = {
  es: {
    "admin.description": "Estructura visual sin formularios, datos reales ni operaciones.",
    "admin.title": "Administración",
    "ai.description":
      "Un espacio pensado para acompañarte, ordenar tus ideas y avanzar con más claridad.",
    "ai.kicker": "Conversación premium",
    "ai.title": "Asistente de relaciones",
    "home.description":
      "Continúa donde lo dejaste y encuentra todo lo que elegiste en una experiencia simple, directa y hecha para ti.",
    "home.explore": "Explorar productos",
    "home.library": "Mi biblioteca",
    "home.rail.available": "Disponibles para ti",
    "home.rail.all": "Todos tus productos",
    "home.rail.locked": "Descubre después",
    "home.title": "Tu espacio de contenidos",
    "nav.admin": "Administración",
    "nav.ai": "IA",
    "nav.home": "Inicio",
    "nav.products": "Productos",
    "nav.profile": "Perfil",
    "products.description":
      "Reúne el producto principal, sus complementos y productos adicionales. Los estados de acceso de esta vista son simulados.",
    "products.title": "Productos",
    "profile.description":
      "Revisa los datos y alterna el papel mock para validar la navegación.",
    "profile.title": "Perfil",
    "shell.language": "Cambiar idioma",
    "shell.logout": "Cerrar sesión",
    "status.available": "Disponible",
    "status.expired": "Vencido",
    "status.locked": "Bloqueado",
  },
  pt: {
    "admin.description": "Estrutura visual sem formulários, dados reais ou operações.",
    "admin.title": "Administração",
    "ai.description":
      "Um espaço pensado para acompanhar você, organizar suas ideias e avançar com mais clareza.",
    "ai.kicker": "Conversa premium",
    "ai.title": "Assistente de relacionamentos",
    "home.description":
      "Continue de onde parou e encontre tudo o que escolheu em uma experiência simples, direta e feita para você.",
    "home.explore": "Explorar produtos",
    "home.library": "Minha biblioteca",
    "home.rail.available": "Disponíveis para você",
    "home.rail.all": "Todos os seus produtos",
    "home.rail.locked": "Descubra depois",
    "home.title": "Seu espaço de conteúdos",
    "nav.admin": "Administração",
    "nav.ai": "IA",
    "nav.home": "Início",
    "nav.products": "Produtos",
    "nav.profile": "Perfil",
    "products.description":
      "Reúne o produto principal, seus complementos e produtos adicionais. Os estados de acesso desta tela são simulados.",
    "products.title": "Produtos",
    "profile.description":
      "Revise os dados e alterne o papel mock para validar a navegação.",
    "profile.title": "Perfil",
    "shell.language": "Alterar idioma",
    "shell.logout": "Sair",
    "status.available": "Disponível",
    "status.expired": "Expirado",
    "status.locked": "Bloqueado",
  },
  en: {
    "admin.description": "Visual structure without forms, real data, or operations.",
    "admin.title": "Administration",
    "ai.description":
      "A space designed to support you, organize your thoughts, and move forward with greater clarity.",
    "ai.kicker": "Premium conversation",
    "ai.title": "Relationship assistant",
    "home.description":
      "Pick up where you left off and find everything you chose in a simple, direct experience made for you.",
    "home.explore": "Explore products",
    "home.library": "My library",
    "home.rail.available": "Available for you",
    "home.rail.all": "All your products",
    "home.rail.locked": "Discover later",
    "home.title": "Your content space",
    "nav.admin": "Administration",
    "nav.ai": "AI",
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.profile": "Profile",
    "products.description":
      "Brings together the main product, its complements, and additional products. Access states in this view are simulated.",
    "products.title": "Products",
    "profile.description":
      "Review the data and switch the mock role to validate navigation.",
    "profile.title": "Profile",
    "shell.language": "Change language",
    "shell.logout": "Sign out",
    "status.available": "Available",
    "status.expired": "Expired",
    "status.locked": "Locked",
  },
};

const localeLabels: Record<Locale, string> = {
  es: "Español",
  pt: "Português",
  en: "English",
};

type LocaleContextValue = {
  locale: Locale;
  localeLabel: string;
  l: (spanish: string, portuguese: string, english: string) => string;
  setLocale: (locale: Locale) => void;
  t: (key: CopyKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("es");

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      localeLabel: localeLabels[locale],
      l: (spanish, portuguese, english) =>
        ({ es: spanish, pt: portuguese, en: english })[locale],
      setLocale,
      t: (key) => copy[locale][key],
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale debe usarse dentro de LocaleProvider");
  }
  return context;
}
