import { useState } from "react";
import { motion } from "framer-motion";

const TABS = [
  { id: "problem", label: "problem" },
  { id: "approach", label: "approach" },
  { id: "architecture", label: "architecture" },
  { id: "result", label: "result" },
];

export default function ProjectCaseStudy({ project, onClose }) {
  const [tab, setTab] = useState("problem");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="my-4 term-window border-amber">
        <div className="term-titlebar border-b-amber/40">
          <span className="term-dot" style={{ background: "#f87171" }} />
          <span className="term-dot" style={{ background: "#fbbf24" }} />
          <span className="term-dot" style={{ background: "#34d399" }} />
          <span className="ml-3 text-[11px] text-fg-muted truncate">
            ~/projects/{project.slug} — case study
          </span>
          <button
            onClick={onClose}
            className="ml-auto text-fg-muted hover:text-amber text-xs"
          >
            [ esc ]
          </button>
        </div>

        {/* Header */}
        <div className="px-5 sm:px-7 pt-6 pb-5 border-b border-line">
          <div className="flex items-center gap-2 mb-2 text-[11px] text-fg-muted">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: project.accent || "#fbbf24" }}
            />
            {project.role}
          </div>
          <h3 className="text-2xl sm:text-3xl text-fg">
            <span className="text-amber">$ </span>
            {project.name}
          </h3>
          <p className="mt-2 text-fg-dim text-sm max-w-2xl">{project.tagline}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-fg-muted">
            <span className="pulse-dot" />
            {project.status}
          </div>
        </div>

        {/* Image gallery */}
        {project.images && project.images.length > 0 && (
          <div className="px-5 sm:px-7 pt-6">
            <div className="text-[11px] text-fg-muted mb-3 prompt-comment">
              screenshots
            </div>
            <div className="flex gap-3 overflow-x-auto pb-3 -mx-5 sm:-mx-7 px-5 sm:px-7 snap-x snap-mandatory">
              {project.images.map((img) => (
                <figure
                  key={img.src}
                  className="shrink-0 snap-start w-[180px] sm:w-[200px]"
                >
                  <div className="border border-line bg-bg-elev overflow-hidden aspect-[9/19]">
                    <img
                      src={img.src}
                      alt={img.caption}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement.innerHTML =
                          '<div class="h-full w-full flex items-center justify-center text-[10px] text-fg-muted p-4 text-center">screenshot pending</div>';
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="mt-2 text-[10px] text-fg-muted">
                    {img.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-5 sm:px-7 pt-4">
          <div className="flex gap-1 border-b border-line -mb-px overflow-x-auto text-sm">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-2 transition border-b-2 whitespace-nowrap ${
                  tab === t.id
                    ? "border-amber text-amber"
                    : "border-transparent text-fg-muted hover:text-fg"
                }`}
              >
                {tab === t.id && <span className="text-amber">&gt; </span>}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-7 py-6">
          <motion.p
            key={tab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-fg-dim leading-relaxed text-sm max-w-prose"
          >
            {project[tab]}
          </motion.p>

          <div className="mt-8 pt-5 border-t border-line">
            <div className="label mb-3 prompt-comment">stack</div>
            <div className="flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="text-[11px] text-fg-dim px-2 py-1 border border-line bg-bg-elev"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {project.link && (
            <div className="mt-5">
              <a
                href={project.link.href}
                target="_blank"
                rel="noreferrer"
                className="btn"
              >
                {project.link.label} →
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
