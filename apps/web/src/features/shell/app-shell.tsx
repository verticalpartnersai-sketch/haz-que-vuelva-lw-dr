"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Icon } from "@/components/icon";
import { Tooltip } from "@/components/tooltip";
import { useMockSession } from "@/features/shell/mock-session";
import { navigationForRole, mobileNavigation } from "@/features/shell/navigation";
import { RouteFocus } from "@/features/shell/route-focus";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span aria-label="Haz Que Vuelva" className="brand-mark">
      <span aria-hidden="true" className="brand-mark__symbol">
        H
      </span>
      {compact ? null : (
        <span aria-hidden="true" className="brand-mark__text">
          Haz Que Vuelva
        </span>
      )}
    </span>
  );
}

function SideRail() {
  const pathname = usePathname();
  const { role } = useMockSession();
  const [status, setStatus] = useState("");

  return (
    <aside aria-label="Navegación principal" className="side-rail">
      <Link aria-label="Haz Que Vuelva — Inicio" className="side-rail__brand" href="/">
        <BrandMark compact />
      </Link>
      <nav className="side-rail__nav">
        {navigationForRole(role).map((item) => (
          <Tooltip key={item.id} label={item.label}>
            <Link
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              aria-label={item.label}
              className="side-rail__item"
              href={item.href}
            >
              <Icon name={item.icon} />
            </Link>
          </Tooltip>
        ))}
      </nav>
      <div className="side-rail__footer">
        <Tooltip label="Cerrar sesión">
          <button
            aria-label="Cerrar sesión — simulación"
            className="side-rail__item"
            onClick={() => setStatus("Cierre de sesión simulado.")}
            type="button"
          >
            <Icon name="logout" />
          </button>
        </Tooltip>
        <span aria-live="polite" className="sr-only">
          {status}
        </span>
      </div>
    </aside>
  );
}

function MobileDock() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación móvil" className="mobile-dock">
      {mobileNavigation.map((item) => (
        <Link
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          className="mobile-dock__item"
          href={item.href}
          key={item.id}
        >
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell" id="application-root">
      <a className="skip-link" href="#contenido-principal">
        Saltar al contenido
      </a>
      <SideRail />
      <div className="app-shell__viewport">
        <header className="mobile-header">
          <Link aria-label="Haz Que Vuelva — Inicio" href="/">
            <BrandMark />
          </Link>
          <span className="mock-chip">Prototipo</span>
        </header>
        <main className="app-main" id="contenido-principal" tabIndex={-1}>
          <RouteFocus />
          {children}
        </main>
      </div>
      <MobileDock />
    </div>
  );
}
