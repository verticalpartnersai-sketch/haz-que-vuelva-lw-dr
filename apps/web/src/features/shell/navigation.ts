import type { IconName } from "@/components/icon";
import type { UserRole } from "@/mocks/types";

export type NavigationItem = {
  id: string;
  href: string;
  label: string;
  icon: IconName;
};

const coreNavigation: NavigationItem[] = [
  { id: "inicio", href: "/", label: "Inicio", icon: "home" },
  { id: "productos", href: "/productos", label: "Productos", icon: "library" },
  { id: "ia", href: "/ia", label: "IA", icon: "spark" },
  { id: "perfil", href: "/perfil", label: "Perfil", icon: "user" },
];

const adminNavigation: NavigationItem = {
  id: "administracion",
  href: "/administracion",
  label: "Administración",
  icon: "settings",
};

export function navigationForRole(role: UserRole): NavigationItem[] {
  return role === "admin"
    ? [...coreNavigation, adminNavigation]
    : [...coreNavigation];
}

export const mobileNavigation = coreNavigation;
