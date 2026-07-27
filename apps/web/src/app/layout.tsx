import type { Metadata } from "next";
import localFont from "next/font/local";

import { LocaleProvider } from "@/features/i18n/locale";
import { AppShell } from "@/features/shell/app-shell";
import { MockSessionProvider } from "@/features/shell/mock-session";

import "@fontsource/bebas-neue/400.css";
import "./globals.css";

const sourceSans = localFont({
  src: "../assets/fonts/SourceSans3-Variable.ttf",
  variable: "--font-source-sans",
  display: "swap",
  weight: "200 900",
});

export const metadata: Metadata = {
  title: {
    default: "Haz Que Vuelva",
    template: "%s · Haz Que Vuelva",
  },
  description: "Prototipo estático del área de miembros Haz Que Vuelva.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={sourceSans.variable}>
        <LocaleProvider>
          <MockSessionProvider>
            <AppShell>{children}</AppShell>
          </MockSessionProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
