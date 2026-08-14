export type CheckoutRecoveryJob = {
  id: string;
  attempts: number;
  payload: { sequence_id?: string; step?: number };
};

type CheckoutRecoveryCandidate = {
  globallySuppressed: boolean;
  marketingSuppressed: boolean;
  purchaseStatus: string;
  recipient: string;
  sequenceId: string;
  unsubscribeToken: string;
};

type Dependencies = {
  checkoutBaseUrl: string;
  memberAppUrl: string;
  outbox: {
    claim(): Promise<CheckoutRecoveryJob[]>;
    confirm(job: CheckoutRecoveryJob): Promise<boolean>;
    complete(
      job: CheckoutRecoveryJob,
      outcome: string,
      providerMessageId?: string,
    ): Promise<void>;
    reserve(job: CheckoutRecoveryJob): Promise<boolean>;
    resolve(job: CheckoutRecoveryJob): Promise<CheckoutRecoveryCandidate | null>;
    retry(job: CheckoutRecoveryJob, code: string): Promise<void>;
  };
  sender: {
    send(message: {
      checkoutUrl: string;
      idempotencyKey: string;
      recipient: string;
      step: number;
      unsubscribeUrl: string;
    }): Promise<string>;
  };
};

function checkoutUrl(baseUrl: string, step: number, sequenceId: string) {
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", "resend");
  url.searchParams.set("utm_medium", "email");
  url.searchParams.set("utm_campaign", "abandoned_checkout");
  url.searchParams.set("utm_content", `email_${step}`);
  url.searchParams.set("recovery_id", sequenceId);
  return url.toString();
}

function unsubscribeUrl(memberAppUrl: string, token: string) {
  const url = new URL("/api/notifications/checkout-recovery/unsubscribe", memberAppUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

export async function runCheckoutRecoveryWorker(dependencies: Dependencies) {
  const jobs = await dependencies.outbox.claim();
  let converted = 0;
  let sent = 0;
  let suppressed = 0;

  for (const job of jobs) {
    try {
      const candidate = await dependencies.outbox.resolve(job);
      const step = job.payload.step;
      if (!candidate) {
        await dependencies.outbox.complete(job, "ineligible");
        continue;
      }
      if (!step || step < 1 || step > 3) {
        throw new Error("invalid_checkout_recovery_job");
      }
      if (candidate.purchaseStatus !== "precheckout") {
        const convertedStatus = ["approved", "authorized", "completed"].includes(
          candidate.purchaseStatus,
        );
        await dependencies.outbox.complete(
          job,
          convertedStatus ? "converted" : "ineligible",
        );
        if (convertedStatus) converted += 1;
        continue;
      }
      if (candidate.globallySuppressed || candidate.marketingSuppressed) {
        await dependencies.outbox.complete(job, "suppressed");
        suppressed += 1;
        continue;
      }

      const reserved = await dependencies.outbox.reserve(job);
      if (!reserved) {
        await dependencies.outbox.complete(job, "ineligible");
        continue;
      }

      const confirmed = await dependencies.outbox.confirm(job);
      if (!confirmed) {
        await dependencies.outbox.complete(job, "ineligible");
        continue;
      }

      const providerMessageId = await dependencies.sender.send({
        checkoutUrl: checkoutUrl(
          dependencies.checkoutBaseUrl,
          step,
          candidate.sequenceId,
        ),
        idempotencyKey: `checkout-recovery/${job.id}`,
        recipient: candidate.recipient,
        step,
        unsubscribeUrl: unsubscribeUrl(
          dependencies.memberAppUrl,
          candidate.unsubscribeToken,
        ),
      });
      await dependencies.outbox.complete(job, "sent", providerMessageId);
      sent += 1;
    } catch (error) {
      const code = error instanceof Error ? error.message : "unknown_error";
      await dependencies.outbox.retry(job, code);
    }
  }

  return { claimed: jobs.length, converted, sent, suppressed };
}
