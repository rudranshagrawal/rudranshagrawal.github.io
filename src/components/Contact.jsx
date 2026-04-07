export default function Contact() {
  return (
    <section
      id="contact"
      className="container-page py-20 sm:py-24 scroll-mt-24"
    >
      <div className="term-window">
        <div className="term-titlebar">
          <span className="term-dot" style={{ background: "#f87171" }} />
          <span className="term-dot" style={{ background: "#fbbf24" }} />
          <span className="term-dot" style={{ background: "#34d399" }} />
          <span className="ml-3 text-[11px] text-fg-muted">~/contact</span>
        </div>

        <div className="p-6 sm:p-10">
          <div className="label mb-2 prompt-comment">contact</div>
          <h2 className="heading-section max-w-2xl">
            <span className="text-amber">$</span> echo &quot;say hi&quot;
          </h2>
          <p className="mt-4 text-fg-dim text-sm max-w-xl leading-relaxed">
            best way to reach me is email. i read everything, even cold notes —
            especially if you&apos;re working on embedded systems, ai agents, or
            consumer health.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href="mailto:rudranshagrawal@yahoo.com" className="btn-primary">
              rudranshagrawal@yahoo.com
            </a>
            <a
              href="https://www.linkedin.com/in/rudranshagrawal"
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              linkedin
            </a>
            <a
              href="https://github.com/rudranshagrawal"
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              github
            </a>
            <a
              href="https://x.com/rudilicious99"
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              x
            </a>
          </div>

          <div className="mt-10 pt-6 border-t border-line flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-fg-muted">
            <span className="flex items-center gap-2">
              <span className="pulse-dot" />
              cupertino, ca
            </span>
            <span>·</span>
            <span>open to interesting problems</span>
            <span>·</span>
            <span>
              press <kbd className="px-1 border border-line bg-bg-elev text-fg-dim">?</kbd> for terminal
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
