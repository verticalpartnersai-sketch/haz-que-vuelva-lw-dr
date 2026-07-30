"use client";

import { createBrowserClient } from "@supabase/ssr";

export type SupabaseBrowserConfiguration = {
  publishableKey: string;
  url: string;
};

export function createSupabaseBrowserClient(
  configuration: SupabaseBrowserConfiguration,
) {
  return createBrowserClient(configuration.url, configuration.publishableKey);
}
