"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  htmlLanguage,
  localeCookieName,
  type Locale,
} from "@/features/i18n/locale-config";

export type { Locale } from "@/features/i18n/locale-config";

type LocaleContextValue = {
  locale: Locale;
  l: (spanish: string, portuguese: string, english: string) => string;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);

    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${localeCookieName}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  }, []);

  useEffect(() => {
    document.documentElement.lang = htmlLanguage(locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      l: (spanish, portuguese, english) =>
        ({ es: spanish, pt: portuguese, en: english })[locale],
      setLocale,
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale requires LocaleProvider");
  return context;
}
