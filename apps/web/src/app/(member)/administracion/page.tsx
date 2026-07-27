import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminPage } from "@/features/admin/admin-page";
import { requireAdmin } from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";

export const metadata: Metadata = { title: "Administración" };

export default async function Page() {
  if (environment().FEATURE_AUTH) {
    try {
      await requireAdmin();
    } catch {
      redirect("/");
    }
  }
  return <AdminPage />;
}
