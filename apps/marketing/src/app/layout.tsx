import type { Metadata } from "next";
import { cookies } from "next/headers";

import { MetaPixelLoader } from "@/features/analytics/meta-pixel-loader";
import { UtmifyTrackingScript } from "@/features/analytics/utmify-tracking-script";
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
  metadataBase: new URL("https://hazquevuelva.site"),
  applicationName: "Haz Que Vuelva",
  title: {
    default: "Haz Que Vuelva",
    template: "%s · Haz Que Vuelva",
  },
  description: "Experiencia pública de Haz Que Vuelva.",
  manifest: "/manifest.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const requestedLocale = (await cookies()).get(localeCookieName)?.value;
  const initialLocale = isLocale(requestedLocale) ? requestedLocale : "es";

  return (
    <html lang={htmlLanguage(initialLocale)}>
      <body>
        <MetaPixelLoader pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID} />
        <LocaleProvider initialLocale={initialLocale}>
          {children}
        </LocaleProvider>
        <UtmifyTrackingScript />
      </body>
    </html>
  );
}
