// Single choke point for talking to the AI coach Netlify Function.
// If we ever swap OpenAI for another provider, only this file and the
// Function itself change.

const ENDPOINT = "/api/chat";

/**
 * Stream a chat completion. Calls `onToken` per incoming text delta and
 * `onToolCall` when the model invokes a tool. Resolves with the full
 * assembled response { text, toolCalls }.
 */
export async function streamChat({
  messages,
  context = {},
  onToken = () => {},
  onToolCall = () => {},
  signal,
}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, context }),
    signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}): ${body || res.statusText}`);
  }

  if (!res.body) {
    const text = await res.text();
    onToken(text);
    return { text, toolCalls: [] };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let assembled = "";
  const toolCalls = [];

  // Each SSE event is a `data: {...}\n\n` line with a JSON payload.
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n\n")) !== -1) {
      const chunk = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 2);
      if (!chunk.startsWith("data:")) continue;
      const data = chunk.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      let evt;
      try {
        evt = JSON.parse(data);
      } catch {
        continue;
      }
      if (evt.type === "token" && typeof evt.text === "string") {
        assembled += evt.text;
        onToken(evt.text);
      } else if (evt.type === "tool" && evt.tool) {
        toolCalls.push(evt.tool);
        onToolCall(evt.tool);
      } else if (evt.type === "error") {
        throw new Error(evt.message || "AI error");
      }
    }
  }

  return { text: assembled, toolCalls };
}

/**
 * One-shot non-streaming call — used when we don't need progressive tokens
 * (e.g. background "draft coach message" where we want the final text).
 */
export async function chatOnce({ messages, context = {} }) {
  let text = "";
  const toolCalls = [];
  const result = await streamChat({
    messages,
    context,
    onToken: (t) => (text += t),
    onToolCall: (tc) => toolCalls.push(tc),
  });
  return result;
}
