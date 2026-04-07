import { useState } from "react";
import { motion } from "framer-motion";

const TABS = [
  { id: "problem", label: "Problem" },
  { id: "approach", label: "Approach" },
  { id: "architecture", label: "Architecture" },
  { id: "result", label: "Result" },
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
      <div className="mt-2 mb-6 rounded-2xl border border-ink-900 bg-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 sm:p-8 border-b border-paper-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: project.accent || "#b45309" }}
              />
              <span className="label">{project.role}</span>
            </div>
            <h3 className="font-serif text-3xl sm:text-4xl text-ink-900">
              {project.name}
            </h3>
            <p className="mt-2 text-ink-600 max-w-2xl">{project.tagline}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-ink-500">
              <span className="inline-block h-1 w-1 rounded-full bg-emerald-500" />
              {project.status}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-900 transition shrink-0"
            aria-label="Close case study"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image gallery */}
        {project.images && project.images.length > 0 && (
          <div className="px-6 sm:px-8 pt-6">
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 sm:-mx-8 px-6 sm:px-8 snap-x snap-mandatory">
              {project.images.map((img) => (
                <figure
                  key={img.src}
                  className="shrink-0 snap-start w-[200px] sm:w-[220px]"
                >
                  <div className="rounded-xl border border-paper-200 bg-paper-100 overflow-hidden aspect-[9/19]">
                    <img
                      src={img.src}
                      alt={img.caption}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement.innerHTML =
                          '<div class="h-full w-full flex items-center justify-center text-xs text-ink-400 p-4 text-center">Screenshot coming soon</div>';
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="mt-2 text-xs text-ink-500">
                    {img.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 sm:px-8 pt-6">
          <div className="flex gap-1 border-b border-paper-200 -mb-px overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm transition border-b-2 whitespace-nowrap ${
                  tab === t.id
                    ? "border-ink-900 text-ink-900 font-medium"
                    : "border-transparent text-ink-500 hover:text-ink-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 py-6 sm:py-8">
          <motion.p
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-ink-700 leading-relaxed max-w-prose"
          >
            {project[tab]}
          </motion.p>

          {/* Tech tags */}
          <div className="mt-8 pt-6 border-t border-paper-200">
            <div className="label mb-3">Stack</div>
            <div className="flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="font-mono text-[11px] text-ink-600 px-2 py-1 rounded bg-paper-100"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {project.link && (
            <div className="mt-6">
              <a
                href={project.link.href}
                target="_blank"
                rel="noreferrer"
                className="pill"
              >
                {project.link.label}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
