export default function Contact() {
  return (
    <section
      id="contact"
      className="container-page py-20 sm:py-28 scroll-mt-24"
    >
      <div className="rounded-3xl border border-paper-200 bg-white p-8 sm:p-14">
        <div className="label mb-3">Contact</div>
        <h2 className="heading-section text-ink-900 max-w-2xl">
          If something here is interesting, I'd love to hear about it.
        </h2>
        <p className="mt-4 text-ink-600 max-w-xl leading-relaxed">
          Best way to reach me is email. I read everything, even cold notes — especially if you're working on embedded systems, AI agents, or consumer health.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="mailto:agraw115@purdue.edu" className="pill-primary">
            agraw115@purdue.edu
          </a>
          <a
            href="https://www.linkedin.com/in/rudranshagrawal"
            target="_blank"
            rel="noreferrer"
            className="pill"
          >
            LinkedIn
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
          <a href="/resume.pdf" target="_blank" rel="noreferrer" className="pill">
            Résumé (PDF)
          </a>
        </div>

        <div className="mt-10 pt-8 border-t border-paper-200 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500">
          <span className="flex items-center gap-2">
            <span className="pulse-dot" />
            Cupertino, CA
          </span>
          <span>·</span>
          <span>Open to interesting problems</span>
          <span>·</span>
          <span className="font-mono text-xs">Press ? for terminal</span>
        </div>
      </div>
    </section>
  );
}
