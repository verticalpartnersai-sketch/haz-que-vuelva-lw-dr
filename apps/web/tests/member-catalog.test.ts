import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { presentMemberCatalog } from "../src/features/products/product-presenter.ts";
import {
  listMemberCatalog,
  type CatalogProductRecord,
  type MemberCatalogGateway,
} from "../src/modules/catalog/application/list-member-catalog.ts";

class FakeCatalog implements MemberCatalogGateway {
  entitlementLookups: string[] = [];
  products: CatalogProductRecord[] = [
    {
      code: "21_mensajes",
      name: "21 Mensajes",
      description: null,
      sortOrder: 20,
    },
    {
      code: "haz_que_vuelva",
      name: "Haz Que Vuelva",
      description: "Descripción publicada",
      sortOrder: 10,
    },
    {
      code: "producto_no_soportado",
      name: "No soportado",
      description: null,
      sortOrder: 1,
    },
  ];

  async listActiveProducts() {
    return this.products;
  }

  async listEntitledProductCodes(memberId: string) {
    this.entitlementLookups.push(memberId);
    return ["haz_que_vuelva", "producto_no_soportado"];
  }

  async listReadingProgress(memberId: string) {
    assert.equal(memberId, "member-1");
    return [
      { productCode: "haz_que_vuelva", progressPercent: 40 },
      { productCode: "producto_no_soportado", progressPercent: 100 },
    ];
  }
}

test("el catálogo real ordena productos y resuelve acceso por entitlement", async () => {
  const gateway = new FakeCatalog();

  const catalog = await listMemberCatalog({
    gateway,
    memberId: "member-1",
  });

  assert.deepEqual(
    catalog.map(({ code, entitled }) => ({ code, entitled })),
    [
      { code: "haz_que_vuelva", entitled: true },
      { code: "21_mensajes", entitled: false },
    ],
  );
  assert.deepEqual(gateway.entitlementLookups, ["member-1"]);
});

test("el catálogo rechaza una consulta sin identidad autenticada", async () => {
  const gateway = new FakeCatalog();

  await assert.rejects(
    listMemberCatalog({ gateway, memberId: "" }),
    /catalog_member_id_required/,
  );
  assert.deepEqual(gateway.entitlementLookups, []);
});

test("la presentación conserva assets canónicos y usa copy publicada", async () => {
  const items = await listMemberCatalog({
    gateway: new FakeCatalog(),
    memberId: "member-1",
  });

  const products = presentMemberCatalog(items);
  assert.equal(products[0].slug, "haz-que-vuelva");
  assert.equal(products[0].description, "Descripción publicada");
  assert.equal(products[0].accessState, "available");
  assert.equal(products[0].progress, 40);
  assert.equal(
    products[1].coverImage,
    "/images/products/21-mensajes-de-reconexion.webp",
  );
  assert.equal(products[1].accessState, "locked");
});

test("el detalle no confía en el acceso disponible del catálogo mock", () => {
  const detailRoute = readFileSync(
    new URL(
      "../src/app/(member)/productos/[slug]/page.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(detailRoute, /loadMemberProducts/);
  assert.doesNotMatch(detailRoute, /getProductBySlug/);
});

test("un entitlement de VUELVE IA abre el chat y no un lector PDF", () => {
  const cardSource = readFileSync(
    new URL("../src/features/products/product-card.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    cardSource,
    /product\.id === "vuelve_ia" \? "\/ia" : `\/productos\/\$\{product\.slug\}`/,
  );
});

test("las rutas autenticadas no congelan flags ni entitlements en el build", () => {
  const memberLayout = readFileSync(
    new URL("../src/app/(member)/layout.tsx", import.meta.url),
    "utf8",
  );

  assert.match(memberLayout, /export const dynamic = "force-dynamic"/);
});
