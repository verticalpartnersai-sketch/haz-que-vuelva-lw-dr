"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Icon } from "@/components/icon";
import { SelectControl } from "@/components/select-control";
import { Tooltip } from "@/components/tooltip";
import { useLocale, type Locale } from "@/features/i18n/locale";
import { useMockSession } from "@/features/shell/mock-session";
import {
  mobileNavigationForLocale,
  navigationForRole,
} from "@/features/shell/navigation";
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
  const { l, locale, setLocale, t } = useLocale();
  const [status, setStatus] = useState("");

  return (
    <aside
      aria-label={l(
        "Navegación principal",
        "Navegação principal",
        "Main navigation",
      )}
      className="side-rail"
    >
      <nav className="side-rail__nav">
        {navigationForRole(role, locale).map((item) => (
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
        <Tooltip label={t("shell.language")}>
          <span className="side-rail__language-trigger">
            <SelectControl
              ariaLabel={t("shell.language")}
              className="select-control--rail"
              leadingIcon="globe"
              onChange={(value) => setLocale(value as Locale)}
              options={[
                { label: "ES", value: "es" },
                { label: "PT", value: "pt" },
                { label: "EN", value: "en" },
              ]}
              value={locale}
            />
          </span>
        </Tooltip>
        <Tooltip label={t("shell.logout")}>
          <button
            aria-label={`${t("shell.logout")} — ${l(
              "simulación",
              "simulação",
              "simulation",
            )}`}
            className="side-rail__item"
            onClick={() =>
              setStatus(
                l(
                  "Cierre de sesión simulado.",
                  "Saída simulada.",
                  "Simulated sign out.",
                ),
              )
            }
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
  const { l, locale } = useLocale();

  return (
    <nav
      aria-label={l("Navegación móvil", "Navegação móvel", "Mobile navigation")}
      className="mobile-dock"
    >
      {mobileNavigationForLocale(locale).map((item) => (
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
  const { l } = useLocale();

  return (
    <div className="app-shell" id="application-root">
      <a className="skip-link" href="#contenido-principal">
        {l("Saltar al contenido", "Pular para o conteúdo", "Skip to content")}
      </a>
      <SideRail />
      <div className="app-shell__viewport">
        <header className="mobile-header">
          <Link aria-label="Haz Que Vuelva — Inicio" href="/">
            <BrandMark />
          </Link>
          <span className="mock-chip">
            {l("Prototipo", "Protótipo", "Prototype")}
          </span>
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
