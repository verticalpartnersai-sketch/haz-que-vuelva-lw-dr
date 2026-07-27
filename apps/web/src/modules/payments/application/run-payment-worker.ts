import type { SupabasePaymentOutbox } from "@/modules/payments/adapters/supabase-payment-outbox";
import type {
  ExternalOfferCatalog,
  MemberDirectory,
  PaymentProjection,
} from "@/modules/payments/application/project-payment-event";
import { projectPaymentEvent } from "@/modules/payments/application/project-payment-event";

type Dependencies = {
  outbox: SupabasePaymentOutbox;
  members: MemberDirectory;
  offers: ExternalOfferCatalog;
  projection: PaymentProjection;
};

export async function runPaymentWorker(dependencies: Dependencies) {
  const jobs = await dependencies.outbox.claim();
  let completed = 0;

  for (const job of jobs) {
    try {
      const eventKey = job.payload.event_key;
      if (!eventKey) throw new Error("missing_event_key");
      const event = await dependencies.outbox.event(eventKey);
      await projectPaymentEvent(event, dependencies);
      await dependencies.outbox.complete(job.id);
      completed += 1;
    } catch (error) {
      const code = error instanceof Error ? error.message : "unknown_error";
      await dependencies.outbox.retry(job, code);
    }
  }

  return { claimed: jobs.length, completed };
}
