import { requireAdmin } from "@/modules/identity/application/current-identity";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

export async function createAiPromptDraft(prompt: string) {
  await requireAdmin();
  const normalized = prompt.trim();
  if (normalized.length < 80) {
    throw new Error("Prompt must contain at least 80 characters");
  }

  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("create_ai_prompt_draft", {
    p_prompt: normalized,
  });
  if (error) throw new Error(`Prompt draft failed: ${error.code}`);
  return data as string;
}

export async function publishAiPrompt(promptId: string) {
  await requireAdmin();
  const client = await createSupabaseServerClient();
  const { error } = await client.rpc("publish_ai_prompt", {
    p_prompt_id: promptId,
  });
  if (error) throw new Error(`Prompt publication failed: ${error.code}`);
}
