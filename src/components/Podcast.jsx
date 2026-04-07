import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SHOW_ID = "67JPws1H3Uqhzi9GOuvXqI";
const SHOW_URL = `https://open.spotify.com/show/${SHOW_ID}`;

export default function Podcast() {
  return (
    <section
      id="podcast"
      className="container-page py-20 sm:py-24 scroll-mt-24"
    >
      <div className="mb-10">
        <div className="label mb-2 prompt-comment">podcast</div>
        <h2 className="heading-section">
          <span className="text-amber">$</span> play /podcast/embedded-edge.mp3
        </h2>
      </div>

      <div className="term-window">
        <div className="term-titlebar">
          <span className="term-dot" style={{ background: "#f87171" }} />
          <span className="term-dot" style={{ background: "#fbbf24" }} />
          <span className="term-dot" style={{ background: "#34d399" }} />
          <span className="ml-3 text-[11px] text-fg-muted">
            ~/podcast/embedded-edge
          </span>
          <span className="ml-auto text-[10px] text-term-green flex items-center gap-1.5">
            <span className="pulse-dot" />
            live on spotify
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 sm:gap-8 p-5 sm:p-7">
          {/* Cover */}
          <a
            href={SHOW_URL}
            target="_blank"
            rel="noreferrer"
            className="group block"
          >
            <div className="border border-line bg-bg-elev overflow-hidden aspect-square w-full max-w-[260px]">
              <img
                src="/podcast/cover.png"
                alt="Embedded Edge podcast cover"
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            </div>
          </a>

          {/* Content */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 text-[11px] text-fg-muted">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#a3e635" }}
              />
              created &amp; hosted by rudy
            </div>
            <h3 className="text-2xl sm:text-3xl text-fg">
              <span className="text-amber">$ </span>embedded edge
            </h3>
            <p className="mt-1 text-sm text-fg-muted">
              conversations about firmware engineering
            </p>

            <p className="mt-4 text-sm text-fg-dim leading-relaxed max-w-prose">
              a podcast about the world of firmware engineering — and the
              interviews that get you there. each episode features
              conversations with engineers, hiring managers, and technical
              leads working on the front lines of embedded systems. real-world
              projects, low-level debugging, rtos quirks, hardware-software
              integration, and how to navigate technical interviews for
              embedded roles. whether you&apos;re prepping for your first job
              or leveling up in the industry, this show gives you the edge.
            </p>

            <p className="mt-3 text-sm text-fg-dim leading-relaxed max-w-prose">
              i also publish an ai-generated companion show on spotify almost
              weekly, where i pick an embedded topic and let an ai walk through
              it.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={SHOW_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                listen on spotify →
              </a>
              <a
                href={SHOW_URL}
                target="_blank"
                rel="noreferrer"
                className="btn"
              >
                share
              </a>
            </div>
          </div>
        </div>

        <SuggestTopic />
      </div>
    </section>
  );
}

function SuggestTopic() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [topic, setTopic] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const data = new URLSearchParams();
      data.append("form-name", "topic-suggestion");
      data.append("topic", topic);
      data.append("name", name);
      data.append("email", email);

      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data.toString(),
      });

      if (!res.ok) throw new Error("submission failed");
      setSubmitted(true);
      setTopic("");
      setName("");
      setEmail("");
    } catch (err) {
      setError("something broke. try emailing me directly?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t border-line">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 sm:px-7 py-4 flex items-center justify-between text-sm text-fg-dim hover:text-amber transition group"
      >
        <span>
          <span className="text-amber">$</span> got an embedded topic you want
          covered?
        </span>
        <span className="text-fg-muted group-hover:text-amber text-xs">
          {open ? "[ - ]" : "[ + suggest a topic ]"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-7 pb-6">
              {submitted ? (
                <div className="border border-term-green/40 bg-term-green/5 p-5 text-sm">
                  <div className="text-term-green flex items-center gap-2 mb-1">
                    <span>✓</span>
                    <span>topic received</span>
                  </div>
                  <div className="text-fg-dim">
                    thanks for the idea — i read every one. you might just hear
                    it on the show.
                  </div>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setOpen(false);
                    }}
                    className="mt-3 text-[11px] text-fg-muted hover:text-amber"
                  >
                    [ submit another ]
                  </button>
                </div>
              ) : (
                <form
                  name="topic-suggestion"
                  method="POST"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  onSubmit={onSubmit}
                  className="space-y-4"
                >
                  {/* Required hidden fields for Netlify */}
                  <input
                    type="hidden"
                    name="form-name"
                    value="topic-suggestion"
                  />
                  <p hidden>
                    <label>
                      don&apos;t fill this out:{" "}
                      <input name="bot-field" />
                    </label>
                  </p>

                  <div>
                    <label className="block text-[11px] text-fg-muted mb-1.5">
                      <span className="text-amber">&gt;</span> topic
                      <span className="text-term-red ml-1">*</span>
                    </label>
                    <textarea
                      name="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                      rows={3}
                      placeholder="e.g. how do you debug i2c on a board with no logic analyzer?"
                      className="w-full bg-bg-elev border border-line text-fg text-sm font-mono p-3 outline-none focus:border-amber transition placeholder:text-fg-faint resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-fg-muted mb-1.5">
                        <span className="text-amber">&gt;</span> your name{" "}
                        <span className="text-fg-faint">(optional)</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="rudransh"
                        className="w-full bg-bg-elev border border-line text-fg text-sm font-mono p-2.5 outline-none focus:border-amber transition placeholder:text-fg-faint"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-fg-muted mb-1.5">
                        <span className="text-amber">&gt;</span> email{" "}
                        <span className="text-fg-faint">(optional)</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-bg-elev border border-line text-fg text-sm font-mono p-2.5 outline-none focus:border-amber transition placeholder:text-fg-faint"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-xs text-term-red">{error}</div>
                  )}

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={submitting || !topic.trim()}
                      className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? "sending..." : "send topic"}
                    </button>
                    <span className="text-[11px] text-fg-muted">
                      no spam. i&apos;ll only email if i need to follow up.
                    </span>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
