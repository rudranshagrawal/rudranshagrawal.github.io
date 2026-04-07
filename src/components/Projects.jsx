import { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { PROJECTS, FILTERS } from "../data/projects";
import ProjectCaseStudy from "./ProjectCaseStudy";

export default function Projects() {
  const [filter, setFilter] = useState("all");
  const [openSlug, setOpenSlug] = useState(null);

  const filtered = useMemo(() => {
    if (filter === "all") return PROJECTS;
    return PROJECTS.filter((p) => p.tags.includes(filter));
  }, [filter]);

  const featured = filtered.filter((p) => p.featured);
  const compact = filtered.filter((p) => !p.featured);

  return (
    <section id="work" className="container-page py-20 sm:py-28 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
        <div>
          <div className="label mb-3">Selected work</div>
          <h2 className="heading-section text-ink-900">
            Things I've built end-to-end.
          </h2>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-10">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFilter(f.id);
              setOpenSlug(null);
            }}
            className={`chip ${filter === f.id ? "chip-active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <LayoutGroup>
        {/* Featured grid */}
        {featured.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {featured.map((p) => (
              <FeaturedCard
                key={p.slug}
                project={p}
                open={openSlug === p.slug}
                onClick={() =>
                  setOpenSlug(openSlug === p.slug ? null : p.slug)
                }
              />
            ))}
          </div>
        )}

        {/* Inline case study panel */}
        <AnimatePresence mode="wait">
          {openSlug && (
            <ProjectCaseStudy
              key={openSlug}
              project={PROJECTS.find((p) => p.slug === openSlug)}
              onClose={() => setOpenSlug(null)}
            />
          )}
        </AnimatePresence>

        {/* Compact rows */}
        {compact.length > 0 && (
          <div className="mt-12">
            <div className="label mb-4">Embedded work</div>
            <div className="divide-y divide-paper-200 border-y border-paper-200">
              {compact.map((p) => (
                <CompactRow
                  key={p.slug}
                  project={p}
                  open={openSlug === p.slug}
                  onClick={() =>
                    setOpenSlug(openSlug === p.slug ? null : p.slug)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </LayoutGroup>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-ink-500">
          Nothing in this category yet — try another filter.
        </div>
      )}
    </section>
  );
}

function FeaturedCard({ project, open, onClick }) {
  return (
    <motion.button
      layout
      onClick={onClick}
      className={`group relative text-left card flex flex-col gap-4 ${
        open ? "border-ink-900" : ""
      }`}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: project.accent || "#b45309" }}
            />
            <span className="label">{project.tags.join(" · ")}</span>
          </div>
          <h3 className="font-serif text-2xl text-ink-900">{project.name}</h3>
        </div>
        <span className="text-ink-400 group-hover:text-ink-900 transition shrink-0">
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m18 15-6-6-6 6" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          )}
        </span>
      </div>

      <p className="text-ink-600 leading-relaxed">{project.tagline}</p>

      <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
        {project.tech.slice(0, 4).map((t) => (
          <span
            key={t}
            className="font-mono text-[11px] text-ink-500 px-2 py-0.5 rounded bg-paper-100"
          >
            {t}
          </span>
        ))}
        {project.tech.length > 4 && (
          <span className="font-mono text-[11px] text-ink-400">
            +{project.tech.length - 4}
          </span>
        )}
      </div>
    </motion.button>
  );
}

function CompactRow({ project, open, onClick }) {
  return (
    <motion.button
      layout
      onClick={onClick}
      className={`w-full text-left py-5 px-1 flex items-center justify-between gap-6 group ${
        open ? "text-ink-900" : "text-ink-700"
      }`}
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h3 className="font-serif text-xl text-ink-900">{project.name}</h3>
          <span className="text-sm text-ink-500">{project.tagline}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden sm:inline font-mono text-[11px] text-ink-400">
          {project.tech[0]}
        </span>
        <span className="text-ink-400 group-hover:text-ink-900 transition">
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m18 15-6-6-6 6" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          )}
        </span>
      </div>
    </motion.button>
  );
}
