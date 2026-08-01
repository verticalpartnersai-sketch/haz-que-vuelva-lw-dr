import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminPage } from "@/features/admin/admin-page";
import { loadAdminWorkspace } from "@/modules/admin/application/load-admin-workspace";
import {
  AuthenticationRequiredError,
  requireAdmin,
} from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";

export const metadata: Metadata = { title: "Administración" };

export default async function Page() {
  const config = environment();
  let workspace = null;
  if (config.FEATURE_AUTH) {
    try {
      await requireAdmin();
      if (config.FEATURE_ADMIN) {
        workspace = await loadAdminWorkspace();
      }
    } catch (error) {
      if (error instanceof AuthenticationRequiredError) {
        redirect("/");
      }
      throw error;
    }
  }
  return (
    <AdminPage
      contentConnected={config.FEATURE_ADMIN && config.FEATURE_CONTENT}
      workspace={workspace}
    />
  );
}
