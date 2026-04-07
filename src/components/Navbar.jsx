import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const SECTIONS = [
  { id: "work", label: "work" },
  { id: "experience", label: "experience" },
  { id: "podcast", label: "podcast" },
  { id: "skills", label: "skills" },
  { id: "contact", label: "contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("work");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      const offsets = SECTIONS.map((s) => {
        const el = document.getElementById(s.id);
        if (!el) return { id: s.id, top: Infinity };
        return { id: s.id, top: el.getBoundingClientRect().top };
      });
      const current = offsets
        .filter((o) => o.top < 140)
        .sort((a, b) => b.top - a.top)[0];
      if (current) setActive(current.id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (id) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg/85 backdrop-blur-md border-b border-line"
          : "bg-transparent"
      }`}
    >
      <div className="container-page flex items-center justify-between py-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-sm text-fg hover:text-amber transition flex items-center gap-2"
        >
          <span className="text-amber">~/</span>rudransh
          <span className="text-amber">$</span>
        </button>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleNav(s.id)}
              className={`px-3 py-1.5 transition ${
                active === s.id
                  ? "text-amber"
                  : "text-fg-dim hover:text-fg"
              }`}
            >
              {active === s.id && <span className="text-amber">&gt; </span>}
              {s.label}
            </button>
          ))}
          <span className="ml-2 pl-3 border-l border-line">
            <ThemeToggle />
          </span>
        </nav>

        <button
          className="md:hidden p-2 -mr-2 text-fg"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-bg">
          <div className="container-page py-3 flex flex-col gap-1 text-sm">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleNav(s.id)}
                className="text-left px-3 py-2 text-fg-dim hover:text-amber"
              >
                <span className="text-amber">&gt; </span>
                {s.label}
              </button>
            ))}
            <div className="px-3 py-2 border-t border-line mt-1">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
