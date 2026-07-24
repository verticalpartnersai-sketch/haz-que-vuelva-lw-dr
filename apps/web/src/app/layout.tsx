import type { Metadata } from "next";
import localFont from "next/font/local";

import { AppShell } from "@/features/shell/app-shell";
import { MockSessionProvider } from "@/features/shell/mock-session";

import "./globals.css";

const sourceSans = localFont({
  src: "../assets/fonts/SourceSans3-Variable.ttf",
  variable: "--font-source-sans",
  display: "swap",
  weight: "200 900",
});

const bodoniModa = localFont({
  src: "../assets/fonts/BodoniModa-Variable.ttf",
  variable: "--font-bodoni-moda",
  display: "swap",
  weight: "400 900",
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
      <body className={`${sourceSans.variable} ${bodoniModa.variable}`}>
        <MockSessionProvider>
          <AppShell>{children}</AppShell>
        </MockSessionProvider>
      </body>
    </html>
  );
}
