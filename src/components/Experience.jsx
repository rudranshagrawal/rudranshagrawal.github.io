const ROLES = [
  {
    company: "amazon web services",
    role: "sde, hardware engineering — accelerated platforms",
    location: "cupertino, ca",
    dates: "jul 2025 — present",
    current: true,
    bullets: [
      "design and implement bmc firmware for ec2 servers with amd and nvidia gpus, enabling new product introduction (npi) for accelerated compute platforms.",
      "build pcie integration and custom telemetry systems for gpu health, asset monitoring, and automated vision reporting.",
      "engineer fan control algorithms (fsc) for energy-efficient server cooling under high-performance loads.",
      "own bmc firmware rollout and validation from prototyping through fleet deployment.",
    ],
  },
  {
    company: "milwaukee tool",
    role: "firmware engineer i",
    location: "chicago, il",
    dates: "aug 2024 — jun 2025",
    bullets: [
      "designed and deployed embedded firmware for power interface boards (pib) managing battery packs and orchestrator modules.",
      "implemented deterministic device control with custom task kernels for safety-critical environments — no rtos.",
      "built c++ infrastructure for can command and telemetry on a pdo publish/subscribe model.",
      "automated regression testing with python-based hardware-in-the-loop (hil) test suites.",
    ],
  },
  {
    company: "milwaukee tool",
    role: "embedded software engineering intern",
    location: "brookfield, wi",
    dates: "jun 2023 — aug 2023",
    bullets: [
      "built micropython runners and uart-linked c++ apis for embedded device testing on arduino teensy 4.1.",
      "developed ci/cd test scripts with azure devops that cut regression cycles by 80%.",
    ],
  },
];

const EDUCATION = [
  {
    school: "purdue university",
    degree: "m.s. computer engineering",
    dates: "may 2024",
    detail: "gpa 3.81 · grad ta, ece 36200 (microprocessor systems & interfacing)",
  },
  {
    school: "purdue university",
    degree: "b.s. computer engineering",
    dates: "may 2023",
    detail:
      "gpa 3.91 · eli shay & rca zworykin scholar · resident advisor · uta, ece 20001",
  },
];

export default function Experience() {
  return (
    <section
      id="experience"
      className="container-page py-20 sm:py-24 scroll-mt-24"
    >
      <div className="mb-10">
        <div className="label mb-2 prompt-comment">experience</div>
        <h2 className="heading-section">
          <span className="text-amber">$</span> cat /work-history.log
        </h2>
      </div>

      <div className="relative">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-line hidden sm:block" />

        <ol className="space-y-10">
          {ROLES.map((r) => (
            <li key={r.company + r.dates} className="relative sm:pl-10">
              <span
                className={`hidden sm:block absolute left-0 top-2 h-4 w-4 border-2 ${
                  r.current
                    ? "bg-term-green border-term-green"
                    : "bg-bg border-line-bright"
                }`}
              />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
                <div>
                  <h3 className="text-lg text-fg">
                    <span className="text-amber">$</span> {r.company}
                    {r.current && (
                      <span className="ml-3 inline-flex items-center gap-1.5 align-middle text-[10px] text-term-green border border-term-green/40 px-2 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-term-green animate-pulse" />
                        current
                      </span>
                    )}
                  </h3>
                  <div className="text-fg-dim text-sm mt-1">
                    {r.role} · <span className="text-fg-muted">{r.location}</span>
                  </div>
                </div>
                <div className="text-[11px] text-fg-muted shrink-0">
                  {r.dates}
                </div>
              </div>
              <ul className="space-y-1.5 text-sm text-fg-dim leading-relaxed max-w-prose">
                {r.bullets.map((b, i) => (
                  <li key={i} className="relative pl-5">
                    <span className="absolute left-0 top-2 h-1 w-1 bg-amber/70" />
                    {b}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      {/* Education */}
      <div className="mt-16 pt-10 border-t border-line">
        <div className="label mb-5 prompt-comment">education</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EDUCATION.map((e) => (
            <div key={e.degree} className="card">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="text-base text-fg">
                  <span className="text-amber">$</span> {e.school}
                </h4>
                <span className="text-[10px] text-fg-muted">{e.dates}</span>
              </div>
              <div className="text-sm text-fg-dim mt-1">{e.degree}</div>
              <div className="text-xs text-fg-muted mt-2 leading-relaxed">
                {e.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
