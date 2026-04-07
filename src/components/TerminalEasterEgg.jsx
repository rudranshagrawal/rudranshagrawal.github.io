import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS } from "../data/projects";

const COMMANDS = [
  "help",
  "whoami",
  "ls",
  "ls projects",
  "ls skills",
  "open",
  "cat about",
  "cat experience",
  "contact",
  "clear",
  "exit",
  "date",
  "echo",
  "sudo",
];

const HELP = `available commands:

  help              show this help
  whoami            who is this guy
  ls                list sections
  ls projects       list projects
  ls skills         list skills
  open <project>    show project blurb
  cat about         a few sentences about me
  cat experience    short work history
  contact           how to reach me
  date              show current date
  echo <text>       print text
  clear             clear screen          (or ctrl+l)
  exit              close terminal        (or esc)

tip: tab completes · up/down arrows recall history`;

const ABOUT = `rudransh agrawal — software engineer @ aws.

working on bmc firmware for ec2 servers running amd and nvidia gpus
out of cupertino. before aws, built can-based motor control firmware
at milwaukee tool. purdue ms in computer engineering, '24.

side projects span consumer health (trana), multi-agent ai systems
(citation guard, orchestrator), and an ios travel app pitched to
the madhya pradesh state government.`;

const EXPERIENCE = `aws · sde, hardware engineering — accelerated platforms
  cupertino, ca · jul 2025 — present
  bmc firmware for ec2 gpu servers · pcie telemetry · fan control

milwaukee tool · firmware engineer i
  chicago, il · aug 2024 — jun 2025
  pib firmware · can pdo stack · python hil regression

milwaukee tool · embedded swe intern
  brookfield, wi · jun 2023 — aug 2023
  micropython runners · azure devops ci · -80% regression cycles`;

const SKILLS_LIST = `languages    c, c++, python, bash, swift
embedded     bare-metal, freertos, board bring-up, task kernels
protocols    can, pcie, uart, spi, i²c, pwm, adc/dac
linux        embedded linux, yocto, buildroot
tools        git, gdb, oscilloscopes, logic analyzers
ci/cd        azure devops, jenkins, docker, hil automation`;

const projectMap = Object.fromEntries(
  PROJECTS.map((p) => [
    p.slug,
    `${p.name}\n  ${p.tagline}\n  status: ${p.status}\n  stack: ${p.tech.join(", ")}`,
  ])
);

export default function TerminalEasterEgg() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([
    { kind: "result", text: 'type "help" to begin · tab completes' },
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  // ghost suggestion (next matching command after the cursor)
  const ghost = useMemo(() => {
    if (!input) return "";
    const parts = input.split(" ");
    if (parts[0] === "open" && parts.length === 2) {
      const partial = parts[1];
      const match = PROJECTS.map((p) => p.slug).find(
        (s) => s.startsWith(partial) && s !== partial
      );
      return match ? match.slice(partial.length) : "";
    }
    const match = COMMANDS.find(
      (c) => c.startsWith(input) && c !== input
    );
    return match ? match.slice(input.length) : "";
  }, [input]);

  // Open / close keybindings
  useEffect(() => {
    const onKey = (e) => {
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

  const print = (lines) => {
    setHistory((h) => [
      ...h,
      ...(Array.isArray(lines) ? lines : [lines]).map((text) => ({
        kind: "result",
        text,
      })),
    ]);
  };

  const printPrompt = (cmd) => {
    setHistory((h) => [...h, { kind: "prompt", text: cmd }]);
  };

  const run = (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setCommandHistory((ch) => [...ch, cmd]);
    setHistoryIndex(-1);

    if (cmd === "clear") {
      setHistory([]);
      return;
    }
    if (cmd === "exit") {
      printPrompt(cmd);
      setTimeout(() => setOpen(false), 100);
      return;
    }
    printPrompt(cmd);

    if (cmd === "help") return print(HELP);
    if (cmd === "whoami")
      return print(
        "rudransh agrawal · sde @ aws · cupertino, ca · purdue ms '24"
      );
    if (cmd === "ls")
      return print(
        "about      experience      projects      skills      contact"
      );
    if (cmd === "ls projects")
      return print(
        PROJECTS.map((p) => `  ${p.slug.padEnd(22)} ${p.tagline}`).join("\n")
      );
    if (cmd === "ls skills") return print(SKILLS_LIST);
    if (cmd === "cat about" || cmd === "about") return print(ABOUT);
    if (cmd === "cat experience" || cmd === "experience")
      return print(EXPERIENCE);
    if (cmd === "contact")
      return print(
        "rudranshagrawal@yahoo.com\nlinkedin.com/in/rudranshagrawal\ngithub.com/rudranshagrawal\nx.com/rudilicious99"
      );
    if (cmd === "date")
      return print(new Date().toString().toLowerCase());
    if (cmd.startsWith("echo ")) return print(cmd.slice(5));
    if (cmd.startsWith("sudo "))
      return print(`permission denied: nice try`);
    if (cmd.startsWith("open ")) {
      const slug = cmd.slice(5).trim();
      const blurb = projectMap[slug];
      return print(
        blurb ||
          `project not found: ${slug}\n\ntry: ${PROJECTS.map((p) => p.slug).join(", ")}`
      );
    }
    if (cmd === "rm -rf /")
      return print("nice try. you're not on my server.");
    if (cmd === "ls -la" || cmd === "ll") return print("nothing hidden here.");

    return print(
      `command not found: ${cmd}\ntry "help" for a list of commands`
    );
  };

  const acceptGhost = () => {
    if (ghost) setInput(input + ghost);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      run(input);
      setInput("");
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      acceptGhost();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const next =
        historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setInput(commandHistory[next] || "");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const next = historyIndex + 1;
      if (next >= commandHistory.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(next);
        setInput(commandHistory[next] || "");
      }
      return;
    }
    if (e.key === "ArrowRight" && ghost && e.target.selectionStart === input.length) {
      e.preventDefault();
      acceptGhost();
      return;
    }
    if ((e.key === "l" || e.key === "L") && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setHistory([]);
      return;
    }
    if ((e.key === "c" || e.key === "C") && e.ctrlKey) {
      e.preventDefault();
      printPrompt(input + "^C");
      setInput("");
      setHistoryIndex(-1);
      return;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-bg/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.97, y: 6 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.97, y: 6 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl term-window border-amber/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="term-titlebar border-b-amber/30">
              <span className="term-dot" style={{ background: "#f87171" }} />
              <span className="term-dot" style={{ background: "#fbbf24" }} />
              <span className="term-dot" style={{ background: "#34d399" }} />
              <span className="ml-3 text-[11px] text-fg-muted">
                rudransh@portfolio: ~
              </span>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto text-fg-muted hover:text-amber text-[11px]"
              >
                [ esc ]
              </button>
            </div>
            <div
              ref={bodyRef}
              className="bg-bg text-fg text-[13px] p-4 sm:p-5 h-[440px] overflow-y-auto leading-relaxed"
              onClick={() => inputRef.current?.focus()}
            >
              {history.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {line.kind === "prompt" ? (
                    <>
                      <span className="text-amber">rudransh@portfolio:~$</span>{" "}
                      <span className="text-fg">{line.text}</span>
                    </>
                  ) : (
                    <span className="text-fg-dim">{line.text}</span>
                  )}
                </div>
              ))}
              <div className="flex items-center mt-1 relative">
                <span className="text-amber whitespace-pre">rudransh@portfolio:~$ </span>
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="absolute inset-0 w-full bg-transparent outline-none text-fg caret-amber"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <span className="invisible whitespace-pre">{input || " "}</span>
                  {ghost && (
                    <span className="absolute left-0 top-0 pointer-events-none text-fg-faint whitespace-pre">
                      <span className="invisible">{input}</span>
                      {ghost}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
