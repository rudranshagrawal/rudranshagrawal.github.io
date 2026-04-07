import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HELP = `Available commands:
  help              show this help
  whoami            who is this guy
  ls projects       list projects
  open <project>    show project blurb
  contact           how to reach me
  clear             clear terminal
  exit              close terminal`;

const PROJECT_BLURBS = {
  trana: "Trana — circadian rhythm health app for iOS, Watch, and web. Shipping April 2026.",
  "heart-of-india":
    "Heart of India — official iOS app for the Madhya Pradesh state tourism board. AI trip planner included.",
  "citation-guard":
    "Citation Guard — multi-agent system that catches hallucinated legal citations in AI-generated briefs.",
  orchestrator:
    "Multi-Agent Orchestrator — Planner DAG + Code/Test/Review agents with live SSE visualization.",
  "can-stack":
    "CAN Stack @ Milwaukee — pub/sub CAN messaging on bare metal. In production firmware.",
  "hil-automation":
    "HIL Automation — Python framework for hardware regression. Cut cycle time 80%.",
  phoropter:
    "Embedded Vision Phoropter — Purdue capstone, 65% cost savings vs commercial units.",
};

export default function TerminalEasterEgg() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([
    "rudransh@portfolio:~$ help",
    HELP,
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      // Open with ? (shift+/) when not typing in an input
      const tag = document.activeElement?.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key === "?" && !inField && !open) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history]);

  const run = (cmd) => {
    const c = cmd.trim();
    if (!c) return;
    const echo = `rudransh@portfolio:~$ ${c}`;

    if (c === "clear") {
      setHistory([]);
      return;
    }
    if (c === "exit") {
      setOpen(false);
      return;
    }
    if (c === "help") {
      setHistory((h) => [...h, echo, HELP]);
      return;
    }
    if (c === "whoami") {
      setHistory((h) => [
        ...h,
        echo,
        "Rudransh Agrawal · Firmware engineer @ AWS · Cupertino, CA · Purdue MS '24",
      ]);
      return;
    }
    if (c === "ls projects") {
      setHistory((h) => [
        ...h,
        echo,
        Object.keys(PROJECT_BLURBS)
          .map((p) => "  " + p)
          .join("\n"),
      ]);
      return;
    }
    if (c.startsWith("open ")) {
      const slug = c.slice(5).trim();
      const blurb = PROJECT_BLURBS[slug];
      setHistory((h) => [
        ...h,
        echo,
        blurb || `Project not found: ${slug}`,
      ]);
      return;
    }
    if (c === "contact") {
      setHistory((h) => [
        ...h,
        echo,
        "agraw115@purdue.edu · linkedin.com/in/rudranshagrawal",
      ]);
      return;
    }
    setHistory((h) => [...h, echo, `command not found: ${c}`]);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      run(input);
      setInput("");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-ink-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-ink-800 px-4 py-2 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-paper-300 font-mono">
                rudransh@portfolio: ~
              </span>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto text-paper-300 hover:text-white text-xs font-mono"
              >
                esc
              </button>
            </div>
            <div
              ref={bodyRef}
              className="bg-ink-900 text-emerald-300 font-mono text-sm p-5 h-[420px] overflow-y-auto"
              onClick={() => inputRef.current?.focus()}
            >
              {history.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {line}
                </div>
              ))}
              <div className="flex mt-1">
                <span className="text-paper-300">rudransh@portfolio:~$&nbsp;</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  className="flex-1 bg-transparent outline-none text-emerald-300"
                  spellCheck={false}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
