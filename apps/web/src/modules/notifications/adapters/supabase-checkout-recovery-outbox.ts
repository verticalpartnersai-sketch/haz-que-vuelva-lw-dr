import type { SupabaseClient } from "@supabase/supabase-js";

import type { CheckoutRecoveryJob } from "../application/run-checkout-recovery-worker.ts";

type RecoveryRow = {
  globally_suppressed: boolean;
  marketing_suppressed: boolean;
  purchase_status: string;
  recipient: string;
  sequence_id: string;
  unsubscribe_token: string;
};

export class SupabaseCheckoutRecoveryOutbox {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async claim(): Promise<CheckoutRecoveryJob[]> {
    const { data, error } = await this.client.rpc("claim_outbox_jobs", {
      p_job_type: "send_checkout_recovery",
      p_limit: 25,
    });
    if (error) {
      throw new Error(`Checkout recovery claim failed: ${error.message}`);
    }
    return (data ?? []) as CheckoutRecoveryJob[];
  }

  async resolve(job: CheckoutRecoveryJob) {
    const sequenceId = job.payload.sequence_id;
    if (!sequenceId) return null;

    const { data, error } = await this.client.rpc(
      "resolve_checkout_recovery_sequence",
      { p_sequence_id: sequenceId },
    );
    if (error) {
      throw new Error(`Checkout recovery resolution failed: ${error.message}`);
    }
    const row = data as RecoveryRow | null;
    if (!row) return null;

    return {
      globallySuppressed: row.globally_suppressed,
      marketingSuppressed: row.marketing_suppressed,
      purchaseStatus: row.purchase_status,
      recipient: row.recipient,
      sequenceId: row.sequence_id,
      unsubscribeToken: row.unsubscribe_token,
    };
  }

  async reserve(job: CheckoutRecoveryJob): Promise<boolean> {
    const { data, error } = await this.client.rpc(
      "reserve_checkout_recovery_job",
      { p_job_id: job.id },
    );
    if (error) {
      throw new Error(`Checkout recovery reservation failed: ${error.message}`);
    }
    return data === true;
  }

  async confirm(job: CheckoutRecoveryJob): Promise<boolean> {
    const { data, error } = await this.client.rpc(
      "confirm_checkout_recovery_job",
      { p_job_id: job.id },
    );
    if (error) {
      throw new Error(`Checkout recovery confirmation failed: ${error.message}`);
    }
    return data === true;
  }

  async complete(
    job: CheckoutRecoveryJob,
    outcome: string,
    providerMessageId?: string,
  ) {
    const { error } = await this.client.rpc("complete_checkout_recovery_job", {
      p_job_id: job.id,
      p_outcome: outcome,
      p_provider_message_id: providerMessageId ?? null,
    });
    if (error) {
      throw new Error(`Checkout recovery completion failed: ${error.message}`);
    }
  }

  async retry(job: CheckoutRecoveryJob, error: unknown) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const terminal = job.attempts >= 8;
    const delaySeconds = Math.min(3600, 60 * 2 ** Math.min(job.attempts, 5));
    const availableAt = new Date(Date.now() + delaySeconds * 1000).toISOString();
    const { error: retryError } = await this.client.rpc(
      "retry_checkout_recovery_job",
      {
        p_available_at: availableAt,
        p_error: message.slice(0, 500),
        p_job_id: job.id,
        p_terminal: terminal,
      },
    );
    if (retryError) {
      throw new Error(`Checkout recovery retry failed: ${retryError.message}`);
    }
  }
}
