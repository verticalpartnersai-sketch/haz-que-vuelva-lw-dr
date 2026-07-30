import type { Metadata } from "next";

import { ProfilePage } from "@/features/profile/profile-page";
import { currentIdentity } from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";

export const metadata: Metadata = { title: "Perfil" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const identity = environment().FEATURE_AUTH ? await currentIdentity() : null;
  return (
    <ProfilePage
      identity={
        identity
          ? { displayName: identity.displayName, email: identity.email }
          : null
      }
    />
  );
}
