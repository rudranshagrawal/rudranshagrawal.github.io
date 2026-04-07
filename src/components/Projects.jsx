import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { PROJECTS, FILTERS } from "../data/projects";
import ProjectCaseStudy from "./ProjectCaseStudy";

// Track viewport breakpoint (matches Tailwind's md: breakpoint)
function useColumns() {
  const [cols, setCols] = useState(() => {
    if (typeof window === "undefined") return 2;
    return window.matchMedia("(min-width: 768px)").matches ? 2 : 1;
  });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e) => setCols(e.matches ? 2 : 1);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return cols;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function Projects() {
  const [filter, setFilter] = useState("all");
  const [openSlug, setOpenSlug] = useState(null);
  const cols = useColumns();

  const filtered = useMemo(() => {
    if (filter === "all") return PROJECTS;
    return PROJECTS.filter((p) => p.tags.includes(filter));
  }, [filter]);

  const rows = useMemo(() => chunk(filtered, cols), [filtered, cols]);
  const openProject = openSlug
    ? PROJECTS.find((p) => p.slug === openSlug)
    : null;

  return (
    <section id="work" className="container-page py-20 sm:py-24 scroll-mt-24">
      <div className="mb-10">
        <div className="label mb-2 prompt-comment">selected work</div>
        <h2 className="heading-section">
          <span className="text-amber">$</span> ls -la ./projects
        </h2>
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
            {filter === f.id && <span>✓</span>}
            {f.label}
          </button>
        ))}
      </div>

      <LayoutGroup>
        <div className="space-y-4">
          {rows.map((row, rowIdx) => {
            const rowHasOpen = row.some((p) => p.slug === openSlug);
            return (
              <div key={`row-${rowIdx}-${cols}`} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {row.map((p) => (
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

                <AnimatePresence mode="wait">
                  {rowHasOpen && openProject && (
                    <ProjectCaseStudy
                      key={openProject.slug}
                      project={openProject}
                      onClose={() => setOpenSlug(null)}
                    />
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </LayoutGroup>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-fg-muted text-sm">
          <span className="text-amber">$</span> no results — try another filter
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
      className={`group text-left term-window transition ${
        open ? "border-amber" : ""
      }`}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      <div className="term-titlebar">
        <span className="term-dot" style={{ background: "#f87171" }} />
        <span className="term-dot" style={{ background: "#fbbf24" }} />
        <span className="term-dot" style={{ background: "#34d399" }} />
        <span className="ml-3 text-[11px] text-fg-muted truncate">
          ~/projects/{project.slug}
        </span>
      </div>

      <div className="p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 text-[11px] text-fg-muted">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: project.accent || "#fbbf24" }}
              />
              {project.tags.join(" · ")}
            </div>
            <h3 className="text-xl text-fg group-hover:text-amber transition">
              {project.name}
            </h3>
          </div>
          <span className="text-fg-muted group-hover:text-amber transition shrink-0 text-xs">
            {open ? "[ - ]" : "[ + ]"}
          </span>
        </div>

        <p className="text-sm text-fg-dim leading-relaxed">{project.tagline}</p>

        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {project.tech.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-[10px] text-fg-muted px-1.5 py-0.5 border border-line"
            >
              {t}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="text-[10px] text-fg-faint px-1.5 py-0.5">
              +{project.tech.length - 4}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
