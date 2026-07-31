import type { SupabaseClient } from "@supabase/supabase-js";

import { isProductCode } from "../../catalog/domain/product.ts";
import type {
  ExternalOfferCatalog,
  PaymentProjection,
} from "../application/project-payment-event.ts";

export class SupabasePaymentProjector
  implements ExternalOfferCatalog, PaymentProjection
{
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async productForOffer(input: {
    provider: "perfect_pay";
    productCode: string;
    planCode: string;
  }) {
    const exact = await this.client
      .from("external_offers")
      .select("product_code")
      .eq("provider", input.provider)
      .eq("external_product_code", input.productCode)
      .eq("external_plan_code", input.planCode)
      .eq("active", true)
      .maybeSingle();
    if (exact.error) {
      throw new Error(`Offer lookup failed: ${exact.error.code}`);
    }
    if (exact.data && isProductCode(exact.data.product_code)) {
      return exact.data.product_code;
    }

    if (input.planCode.startsWith("item:")) return null;

    const wildcard = await this.client
      .from("external_offers")
      .select("product_code")
      .eq("provider", input.provider)
      .eq("external_product_code", input.productCode)
      .eq("external_plan_code", "*")
      .eq("active", true)
      .maybeSingle();
    if (wildcard.error) {
      throw new Error(`Offer lookup failed: ${wildcard.error.code}`);
    }
    if (!wildcard.data || !isProductCode(wildcard.data.product_code)) {
      return null;
    }
    return wildcard.data.product_code;
  }

  async apply(input: Parameters<PaymentProjection["apply"]>[0]) {
    const { event, memberId, productCode } = input;
    const { error } = await this.client.rpc("apply_payment_projection", {
      p_event_key: event.eventKey,
      p_member_id: memberId,
      p_product_code: productCode,
      p_sale_code: event.saleCode,
      p_status: event.status,
      p_effect: event.effect,
      p_customer_email: event.customerEmail,
      p_external_product_code: event.productCode,
      p_external_plan_code: event.planCode,
      p_amount_minor: event.amountMinor,
      p_currency: event.currency,
      p_occurred_at: event.occurredAt.toISOString(),
    });
    if (error) throw new Error(`Payment projection failed: ${error.code}`);
  }
}
