type AnswerEvent = {
  answer: string;
};

export async function createConversation() {
  const response = await fetch("/api/ai/conversations", { method: "POST" });
  if (!response.ok) throw new Error("conversation_unavailable");
  const data = (await response.json()) as { conversationId?: string };
  if (!data.conversationId) throw new Error("conversation_unavailable");
  return data.conversationId;
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
