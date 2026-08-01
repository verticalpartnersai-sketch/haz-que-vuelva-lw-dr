import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

const ownerEmailHash = createHash("sha256")
  .update("nitroxinteligence@gmail.com")
  .digest("hex");

test("admin authorization requires both the role and the owner principal", () => {
  const migration = read(
    "../../../supabase/migrations/202607310023_single_admin_owner.sql",
  );

  assert.match(migration, /create table if not exists app_private\.admin_principals/);
  assert.match(migration, new RegExp(ownerEmailHash));
  assert.match(
    migration,
    /join app_private\.admin_principals as principal[\s\S]*profile\.role = 'admin'/,
  );
  assert.match(migration, /raise exception 'admin_principal_not_allowed'/);
  assert.match(
    migration,
    /update public\.profiles[\s\S]*set role = 'member'[\s\S]*where role = 'admin'/,
  );
  assert.doesNotMatch(migration, /nitroxinteligence@gmail\.com/);
});

test("the server identity downgrades an unauthorized admin-shaped profile", () => {
  const identity = read(
    "../src/modules/identity/application/current-identity.ts",
  );

  assert.match(identity, /profile\.role === "admin"/);
  assert.match(identity, /client\.rpc\("is_admin"\)/);
  assert.match(
    identity,
    /isAuthorizedAdmin === true \? "admin" : "member"/,
  );
});
