import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  htmlLanguage,
  isLocale,
  localeCookieName,
} from "@/features/i18n/locale-config";
import { LocaleProvider } from "@/features/i18n/locale";

import "@fontsource/bebas-neue/400.css";
import "@fontsource/source-sans-3/400.css";
import "@fontsource/source-sans-3/600.css";
import "@fontsource/source-sans-3/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Haz Que Vuelva",
    template: "%s · Haz Que Vuelva",
  },
  description: "Experiencia pública de Haz Que Vuelva.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const requestedLocale = (await cookies()).get(localeCookieName)?.value;
  const initialLocale = isLocale(requestedLocale) ? requestedLocale : "es";

  return (
    <html lang={htmlLanguage(initialLocale)}>
      <body>
        <LocaleProvider initialLocale={initialLocale}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
