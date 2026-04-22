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
  "how was my last session?",
  "what should I focus on today?",
  "draft my weekly check-in",
  "my shoulder hurts, swap an exercise",
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

  // If the user clicked "Ask AI" from another tab, pre-prime context
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("fit-coach-primed");
      if (!raw) return;
      sessionStorage.removeItem("fit-coach-primed");
      const primed = JSON.parse(raw);
      if (primed.kind === "meal-context" && primed.mealTitle) {
        setInput(`about my ${primed.mealTitle.toLowerCase()} — `);
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
      todayMeals: [], // DietTab owns append; we pass the aggregate via recent
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
          const existing = getSessionLog(date) || { exercises: [], sessionNotes: "" };
          const ex = existing.exercises.find(
            (e) => e.name?.toLowerCase() === args.exercise_name?.toLowerCase()
          );
          const newSet = {
            weight: args.weight_kg,
            reps: args.reps,
            rpe: args.rpe ?? null,
          };
          if (ex) {
            ex.sets = [...(ex.sets || []), newSet];
            if (args.notes) ex.notes = (ex.notes ? ex.notes + "\n" : "") + args.notes;
          } else {
            existing.exercises.push({
              name: args.exercise_name,
              sets: [newSet],
              notes: args.notes || "",
            });
          }
          saveSessionLog(date, existing);
          success();
          return `logged ${args.exercise_name}: ${args.weight_kg}kg × ${args.reps}`;
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
          return `logged ${args.meal_title}`;
        }
        case "log_weight": {
          addWeight(date, args.kg);
          success();
          return `weight ${args.kg} kg logged`;
        }
        case "draft_coach_message": {
          if (args.text && onDraftReady) onDraftReady(args.text);
          return "drafted coach message — check the check-in area";
        }
        default:
          return `unknown tool: ${tool.name}`;
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
      const assistantMsg = { role: "assistant", content: "", timestamp: Date.now() };
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
              const suffix = `\n\n> ${ack}`;
              copy[copy.length - 1] = { ...last, content: last.content + suffix };
              return copy;
            });
          },
        });
      } catch (e) {
        if (e.name !== "AbortError") {
          setError(e.message || "ai error — try again");
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
    <div className="flex flex-col">
      {/* Messages */}
      <div
        ref={bodyRef}
        className="flex-1 overflow-y-auto bg-bg-panel border border-line max-h-[50vh] min-h-[240px]"
      >
        {messages.length === 0 && (
          <div className="p-4 text-sm text-fg-muted">
            <div className="mb-3">
              <span className="text-amber">$</span> ask anything about your training,
              meals, or progress. i can also log sets and meals for you — just
              describe what you did.
            </div>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="chip text-xs"
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
            className={`px-4 py-3 ${
              m.role === "user"
                ? "bg-bg-elev border-t border-line"
                : "border-t border-line"
            } ${i === 0 ? "border-t-0" : ""}`}
          >
            <div
              className={`text-[10px] uppercase tracking-wider mb-1 ${
                m.role === "user" ? "text-fg-faint" : "text-amber"
              }`}
            >
              {m.role === "user" ? "you" : "ai coach"}
            </div>
            <div className="text-sm text-fg whitespace-pre-wrap leading-relaxed">
              {m.content}
              {i === messages.length - 1 && streaming && m.role === "assistant" && (
                <span className="caret" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-2 text-[11px] text-term-red">
          <span className="text-amber">$</span> {error}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-3 flex gap-2"
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
          placeholder={streaming ? "thinking..." : "tell me about your training..."}
          className="flex-1 bg-bg-elev border border-line text-fg text-sm font-mono p-3 outline-none focus:border-amber resize-none min-h-[48px]"
        />
        {streaming ? (
          <button
            type="button"
            onClick={stop}
            className="btn px-4 border-term-red/60 text-term-red"
          >
            stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="btn-primary px-4 disabled:opacity-40"
            aria-label="send"
          >
            send
          </button>
        )}
      </form>

      {messages.length > 0 && !streaming && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={clear}
            className="text-[10px] text-fg-faint hover:text-term-red"
          >
            clear chat
          </button>
        </div>
      )}
    </div>
  );
}
