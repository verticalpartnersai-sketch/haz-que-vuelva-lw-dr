type AnswerEvent = {
  answer: string;
};

export type AiUsage = {
  access_active: boolean;
  access_days_remaining: number;
  access_expires_at: string | null;
  access_started_at: string | null;
  has_entitlement: boolean;
  message_limit: number;
  messages_used: number;
  messages_remaining: number;
  messages_reset_at: string | null;
  diagnostic_available: boolean;
  diagnostic_next_at: string | null;
};

export async function getAiUsage() {
  const response = await fetch("/api/ai/usage", { cache: "no-store" });
  if (!response.ok) throw new Error("usage_unavailable");
  return (await response.json()) as AiUsage;
}

export async function createConversation() {
  const response = await fetch("/api/ai/conversations", { method: "POST" });
  if (!response.ok) throw new Error("conversation_unavailable");
  const data = (await response.json()) as { conversationId?: string };
  if (!data.conversationId) throw new Error("conversation_unavailable");
  return data.conversationId;
}

export async function getLatestConversation() {
  const response = await fetch("/api/ai/conversations", { cache: "no-store" });
  if (!response.ok) throw new Error("conversation_unavailable");
  return (await response.json()) as {
    conversationId: string | null;
    messages: Array<{
      content: string;
      id: string;
      role: "assistant" | "user";
    }>;
  };
}

function parseEvent(block: string) {
  const event = block.match(/^event:\s*(.+)$/m)?.[1];
  const data = block.match(/^data:\s*(.+)$/m)?.[1];
  return event && data ? { event, data: JSON.parse(data) as unknown } : null;
}

export async function requestAnswer(input: {
  conversationId: string;
  message: string;
}) {
  const response = await fetch("/api/ai/generations/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok || !response.body) throw new Error("generation_unavailable");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      const parsed = parseEvent(block);
      if (parsed?.event === "answer") {
        answer = (parsed.data as AnswerEvent).answer;
      }
    }
    if (done) break;
  }
  if (!answer) throw new Error("generation_unavailable");
  return answer;
}

export async function requestDiagnostic(input: {
  conversationId: string;
  file: File;
}) {
  const form = new FormData();
  form.set("conversationId", input.conversationId);
  form.set("file", input.file);
  const response = await fetch("/api/ai/diagnostics", {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      code?: string;
    } | null;
    throw new Error(payload?.code ?? "diagnostic_unavailable");
  }
  return (await response.json()) as {
    formatted_report: string;
    report: Record<string, string | string[] | null>;
  };
}
