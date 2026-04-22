import { useCallback, useEffect, useRef, useState } from "react";
import { streamChat } from "../../lib/ai";
import {
  getChatHistory,
  setChatHistory,
  clearChatHistory,
  appendMealLog,
  saveSessionLog,
  getSessionLog,
  addWeight,
} from "../../lib/storage";
import { dayOfWeek, todayISO, recentSummary } from "../../lib/fitness-format";
import { tap, success } from "../../lib/haptics";

const STARTERS = [
  "How was my last session?",
  "What should I focus on today?",
  "Draft my weekly check-in",
  "My shoulder hurts, swap an exercise",
];

export default function ChatPanel({ plan, onDraftReady }) {
  const [messages, setMessages] = useState(() => getChatHistory());
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const bodyRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    setChatHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // Primed context from Diet tab
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("fit-coach-primed");
      if (!raw) return;
      sessionStorage.removeItem("fit-coach-primed");
      const primed = JSON.parse(raw);
      if (primed.kind === "meal-context" && primed.mealTitle) {
        setInput(`About my ${primed.mealTitle.toLowerCase()} — `);
      }
    } catch {}
  }, []);

  const buildContext = useCallback(() => {
    const iso = todayISO();
    return {
      plan,
      date: iso,
      dayOfWeek: dayOfWeek(),
      todaySession: getSessionLog(iso),
      todayMeals: [],
      recent: recentSummary(7),
      weights: recentSummary(14).weights,
    };
  }, [plan]);

  const applyToolCall = useCallback(
    (tool) => {
      const args = tool.arguments || {};
      const date = args.date || todayISO();
      switch (tool.name) {
        case "log_exercise": {
          const existing = getSessionLog(date) || {
            exercises: [],
            sessionNotes: "",
          };
          const ex = existing.exercises.find(
            (e) =>
              e.name?.toLowerCase() === args.exercise_name?.toLowerCase()
          );
          const newSet = {
            weight: args.weight_kg,
            reps: args.reps,
            rpe: args.rpe ?? null,
          };
          if (ex) {
            ex.sets = [...(ex.sets || []), newSet];
            if (args.notes)
              ex.notes = (ex.notes ? ex.notes + "\n" : "") + args.notes;
          } else {
            existing.exercises.push({
              name: args.exercise_name,
              sets: [newSet],
              notes: args.notes || "",
            });
          }
          saveSessionLog(date, existing);
          success();
          return `Logged ${args.exercise_name}: ${args.weight_kg}kg × ${args.reps}`;
        }
        case "log_meal": {
          appendMealLog(date, {
            mealId: args.meal_id || "custom",
            mealTitle: args.meal_title,
            timeEaten: args.time_eaten || "",
            minutesToCook: args.minutes_to_cook || 0,
            notes: args.notes || "",
            loggedAt: new Date().toISOString(),
          });
          success();
          return `Logged ${args.meal_title}`;
        }
        case "log_weight": {
          addWeight(date, args.kg);
          success();
          return `Weight ${args.kg} kg logged`;
        }
        case "draft_coach_message": {
          if (args.text && onDraftReady) onDraftReady(args.text);
          return "Drafted coach message — check the check-in card below";
        }
        default:
          return `Unknown tool: ${tool.name}`;
      }
    },
    [onDraftReady]
  );

  const send = useCallback(
    async (text) => {
      const content = (text ?? input).trim();
      if (!content || streaming) return;
      setInput("");
      setError("");
      tap();
      const userMsg = { role: "user", content, timestamp: Date.now() };
      setMessages((m) => [...m, userMsg]);

      setStreaming(true);
      const assistantMsg = {
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };
      setMessages((m) => [...m, assistantMsg]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamChat({
          messages: [
            ...messages.map(({ role, content }) => ({ role, content })),
            { role: "user", content },
          ],
          context: buildContext(),
          signal: controller.signal,
          onToken: (t) => {
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              copy[copy.length - 1] = { ...last, content: last.content + t };
              return copy;
            });
          },
          onToolCall: (tool) => {
            const ack = applyToolCall(tool);
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              const suffix = `\n\n✓ ${ack}`;
              copy[copy.length - 1] = {
                ...last,
                content: last.content + suffix,
              };
              return copy;
            });
          },
        });
      } catch (e) {
        if (e.name !== "AbortError") {
          setError(e.message || "AI error — try again");
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [input, messages, streaming, buildContext, applyToolCall]
  );

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const clear = () => {
    setMessages([]);
    clearChatHistory();
  };

  return (
    <div className="fit-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-line-soft">
        <div>
          <h2 className="text-lg font-semibold text-fg">Coach</h2>
          <p className="text-xs text-fg-muted">
            Chats with your plan as context
          </p>
        </div>
        {messages.length > 0 && !streaming && (
          <button
            onClick={clear}
            className="text-xs text-fg-muted hover:text-term-red transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={bodyRef}
        className="overflow-y-auto bg-bg-elev/40 max-h-[55vh] min-h-[240px]"
      >
        {messages.length === 0 && (
          <div className="p-5 space-y-3">
            <p className="text-sm text-fg-dim leading-relaxed">
              Ask anything about your training, meals, or progress. I can also
              log sets and meals for you — just describe what you did.
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="fit-chip"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`px-5 py-3 ${
              m.role === "user" ? "bg-transparent" : "bg-white"
            } ${i > 0 ? "border-t border-line-soft" : ""}`}
          >
            <div
              className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${
                m.role === "user" ? "text-fg-faint" : "text-amber"
              }`}
            >
              {m.role === "user" ? "You" : "Coach"}
            </div>
            <div className="text-sm text-fg whitespace-pre-wrap leading-relaxed">
              {m.content}
              {i === messages.length - 1 &&
                streaming &&
                m.role === "assistant" && (
                  <span className="inline-block w-1.5 h-4 bg-amber align-middle ml-1 animate-pulse" />
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="px-5 py-2 text-xs text-term-red bg-term-red/5 border-t border-term-red/20">
          {error}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="p-4 flex gap-2 border-t border-line-soft"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          disabled={streaming}
          placeholder={
            streaming ? "Thinking…" : "Tell me about your training…"
          }
          className="fit-input flex-1 resize-none min-h-[48px] text-sm"
        />
        {streaming ? (
          <button
            type="button"
            onClick={stop}
            className="fit-btn-danger"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="fit-btn-primary disabled:opacity-40"
            aria-label="send"
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
}
