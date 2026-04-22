// Netlify Function: /api/chat → proxies to OpenAI with streaming.
//
// Request body:  { messages: [{role, content}], context: {...} }
// Response:      text/event-stream with `data: {...}\n\n` chunks
//                  type: "token"   {text}
//                  type: "tool"    {name, arguments}
//                  type: "error"   {message}
//
// Env vars:
//   OPENAI_API_KEY       required
//   OPENAI_MODEL         optional (default "gpt-4o-mini")
//   FITNESS_AI_DAILY_CAP optional (default 100)

import OpenAI from "openai";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const DAILY_CAP = parseInt(process.env.FITNESS_AI_DAILY_CAP || "100", 10);

// In-memory rate counter. Netlify functions cold-start so this is a best-effort
// cap (not a hard limit), but for a single-user dashboard it's enough to
// prevent runaway calls from a bug.
const usage = new Map(); // key: "YYYY-MM-DD" → count

function today() {
  return new Date().toISOString().slice(0, 10);
}

function bumpUsage() {
  const k = today();
  const n = (usage.get(k) || 0) + 1;
  usage.set(k, n);
  // Trim old keys
  for (const key of usage.keys()) {
    if (key !== k) usage.delete(key);
  }
  return n;
}

function systemPrompt(context) {
  const { plan, date, dayOfWeek, todaySession, todayMeals, recent, weights, prefs } = context || {};
  const macros = plan?.meta?.macros;
  return [
    "You are a concise, supportive fitness coach assistant for Rudransh.",
    "Reply short unless a detailed answer is genuinely requested. Avoid lecturing.",
    "Tone: friendly, direct, not clinical. Never judgmental about missed sessions/meals.",
    "When the user tells you about an exercise, meal, or weight in natural language,",
    "extract the structured data and call the matching tool — do NOT just reply with text.",
    "When the user asks to draft a coach check-in message, call draft_coach_message with a formatted text.",
    "",
    `Today: ${date} (${dayOfWeek}).`,
    "",
    "Static plan summary:",
    `  Goal: ${plan?.meta?.goal}, start ${plan?.meta?.planStart}, end ${plan?.meta?.planEnd}.`,
    macros
      ? `  Targets: ${macros.caloriesKcal} kcal, ${macros.proteinG}g protein, ${macros.carbsG}g carbs, ${macros.fatsG}g fat.`
      : "",
    plan?.workouts?.[dayOfWeek]
      ? `  Today's workout: ${plan.workouts[dayOfWeek].title}.`
      : "",
    plan?.meals?.length
      ? `  Today's meals: ${plan.meals.map((m) => m.title).join(", ")}.`
      : "",
    "",
    "Today's data so far:",
    `  Session: ${JSON.stringify(todaySession ?? {})}`,
    `  Meals: ${JSON.stringify(todayMeals ?? [])}`,
    "",
    "Recent 7 days:",
    `  Weights: ${JSON.stringify(weights ?? [])}`,
    `  Recent sessions: ${JSON.stringify(recent?.sessions ?? []).slice(0, 1500)}`,
    "",
    prefs?.coachWhatsApp
      ? "The user has a coach they message weekly on WhatsApp."
      : "The user has not set their coach's WhatsApp number yet.",
  ]
    .filter(Boolean)
    .join("\n");
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "log_exercise",
      description:
        "Record a single set of an exercise in the session log. Infer date from context (today unless specified).",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "ISO date YYYY-MM-DD" },
          exercise_name: { type: "string" },
          weight_kg: { type: "number" },
          reps: { type: "integer" },
          rpe: { type: "number", description: "0-10 optional" },
          notes: { type: "string" },
        },
        required: ["exercise_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "log_meal",
      description: "Record that a meal was eaten, with time and minutes to cook.",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string" },
          meal_id: { type: "string", description: "breakfast, lunch, pre-workout, post-workout, or dinner" },
          meal_title: { type: "string" },
          time_eaten: { type: "string", description: "HH:MM 24h" },
          minutes_to_cook: { type: "integer" },
          notes: { type: "string" },
        },
        required: ["meal_title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "log_weight",
      description: "Record a body weight entry for a given day.",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string" },
          kg: { type: "number" },
        },
        required: ["kg"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "draft_coach_message",
      description:
        "Produce a formatted weekly check-in message for WhatsApp, ready to send to the coach.",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "The full formatted message body" },
        },
        required: ["text"],
      },
    },
  },
];

function sseEvent(type, data) {
  return `data: ${JSON.stringify({ type, ...data })}\n\n`;
}

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      sseEvent("error", { message: "OPENAI_API_KEY not configured on Netlify" }),
      { status: 200, headers: { "Content-Type": "text/event-stream" } }
    );
  }

  const count = bumpUsage();
  if (count > DAILY_CAP) {
    return new Response(
      sseEvent("error", {
        message: `daily AI limit reached (${DAILY_CAP}). resets tomorrow.`,
      }),
      { status: 200, headers: { "Content-Type": "text/event-stream" } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const { messages = [], context = {} } = body;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (chunk) => controller.enqueue(enc.encode(chunk));

      try {
        const completion = await openai.chat.completions.create({
          model: MODEL,
          stream: true,
          messages: [
            { role: "system", content: systemPrompt(context) },
            ...messages,
          ],
          tools: TOOLS,
          temperature: 0.6,
        });

        // Tool-call assembly across streamed deltas
        const toolCalls = {}; // index -> { name, argsBuf }

        for await (const chunk of completion) {
          const choice = chunk.choices?.[0];
          const delta = choice?.delta;
          if (!delta) continue;

          if (delta.content) {
            send(sseEvent("token", { text: delta.content }));
          }

          if (delta.tool_calls?.length) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0;
              if (!toolCalls[idx]) toolCalls[idx] = { name: "", argsBuf: "" };
              if (tc.function?.name) toolCalls[idx].name = tc.function.name;
              if (tc.function?.arguments)
                toolCalls[idx].argsBuf += tc.function.arguments;
            }
          }

          if (choice.finish_reason) {
            for (const [, tc] of Object.entries(toolCalls)) {
              let args = {};
              try {
                args = tc.argsBuf ? JSON.parse(tc.argsBuf) : {};
              } catch (e) {
                args = { _parseError: e.message, _raw: tc.argsBuf };
              }
              send(sseEvent("tool", { tool: { name: tc.name, arguments: args } }));
            }
          }
        }

        send("data: [DONE]\n\n");
      } catch (e) {
        send(sseEvent("error", { message: e.message || "upstream error" }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}

export const config = {
  path: "/api/chat",
};
