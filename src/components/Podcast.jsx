const SHOW_ID = "67JPws1H3Uqhzi9GOuvXqI";
const SHOW_URL = `https://open.spotify.com/show/${SHOW_ID}`;
const EMBED_URL = `https://open.spotify.com/embed/show/${SHOW_ID}?utm_source=generator&theme=0`;

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

        {/* Spotify embed — auto-updates with new episodes */}
        <div className="px-5 sm:px-7 pb-6">
          <div className="text-[11px] text-fg-muted mb-3 prompt-comment">
            latest episodes
          </div>
          <div className="border border-line bg-bg-elev overflow-hidden">
            <iframe
              title="Embedded Edge on Spotify"
              src={EMBED_URL}
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ display: "block" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
