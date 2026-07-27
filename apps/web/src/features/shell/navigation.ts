import type { IconName } from "@/components/icon";
import type { CopyKey, Locale } from "@/features/i18n/locale";
import type { UserRole } from "@/mocks/types";

export type NavigationItem = {
  id: string;
  href: string;
  label: string;
  labelKey: CopyKey;
  icon: IconName;
};

const coreNavigation = [
  { id: "inicio", href: "/", labelKey: "nav.home", icon: "home" },
  { id: "productos", href: "/productos", labelKey: "nav.products", icon: "library" },
  { id: "ia", href: "/ia", labelKey: "nav.ai", icon: "spark" },
  { id: "perfil", href: "/perfil", labelKey: "nav.profile", icon: "user" },
] as const satisfies readonly Omit<NavigationItem, "label">[];

const adminNavigation = {
  id: "administracion",
  href: "/administracion",
  labelKey: "nav.admin",
  icon: "settings",
} as const satisfies Omit<NavigationItem, "label">;

const navigationLabels: Record<
  Locale,
  Record<Extract<CopyKey, `nav.${string}`>, string>
> = {
  es: {
    "nav.admin": "Administración",
    "nav.ai": "IA",
    "nav.home": "Inicio",
    "nav.products": "Productos",
    "nav.profile": "Perfil",
  },
  pt: {
    "nav.admin": "Administração",
    "nav.ai": "IA",
    "nav.home": "Início",
    "nav.products": "Produtos",
    "nav.profile": "Perfil",
  },
  en: {
    "nav.admin": "Administration",
    "nav.ai": "AI",
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.profile": "Profile",
  },
};

function localize(
  item: Omit<NavigationItem, "label">,
  locale: Locale,
): NavigationItem {
  return {
    ...item,
    label:
      navigationLabels[locale][
        item.labelKey as Extract<CopyKey, `nav.${string}`>
      ],
  };
}

export function navigationForRole(
  role: UserRole,
  locale: Locale = "es",
): NavigationItem[] {
  const items =
    role === "admin"
      ? [...coreNavigation, adminNavigation]
      : [...coreNavigation];
  return items.map((item) => localize(item, locale));
}

export function mobileNavigationForLocale(
  locale: Locale,
): NavigationItem[] {
  return coreNavigation.map((item) => localize(item, locale));
}
