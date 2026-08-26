export type FunnelLocale = "es" | "pt";

export function funnelLocaleForEnvironment(nodeEnv: string): FunnelLocale {
  return nodeEnv === "development" ? "pt" : "es";
}
