const ROLES = [
  {
    company: "Amazon Web Services",
    role: "SDE, Hardware Engineering — Accelerated Platforms",
    location: "Cupertino, CA",
    dates: "Jul 2025 — Present",
    current: true,
    bullets: [
      "Design and implement BMC firmware for EC2 servers with AMD and Nvidia GPUs, enabling new product introduction (NPI) for accelerated compute platforms.",
      "Build PCIe integration and custom telemetry systems for GPU health, asset monitoring, and automated vision reporting.",
      "Engineer fan control algorithms (FSC) for energy-efficient server cooling under high-performance loads.",
      "Own BMC firmware rollout and validation from prototyping through fleet deployment.",
    ],
  },
  {
    company: "Milwaukee Tool",
    role: "Firmware Engineer I",
    location: "Chicago, IL",
    dates: "Aug 2024 — Jun 2025",
    bullets: [
      "Designed and deployed embedded firmware for Power Interface Boards (PIB) managing battery packs and orchestrator modules.",
      "Implemented deterministic device control with custom task kernels for safety-critical environments — no RTOS.",
      "Built C++ infrastructure for CAN command and telemetry on a PDO publish/subscribe model.",
      "Automated regression testing with Python-based Hardware-in-the-Loop (HIL) test suites.",
    ],
  },
  {
    company: "Milwaukee Tool",
    role: "Embedded Software Engineering Intern",
    location: "Brookfield, WI",
    dates: "Jun 2023 — Aug 2023",
    bullets: [
      "Built MicroPython runners and UART-linked C++ APIs for embedded device testing on Arduino Teensy 4.1.",
      "Developed CI/CD test scripts with Azure DevOps that cut regression cycles by 80%.",
    ],
  },
];

const EDUCATION = [
  {
    school: "Purdue University",
    degree: "M.S. Computer Engineering",
    dates: "May 2024",
    detail: "GPA 3.81 · Graduate TA, ECE 36200 (Microprocessor Systems & Interfacing)",
  },
  {
    school: "Purdue University",
    degree: "B.S. Computer Engineering",
    dates: "May 2023",
    detail:
      "GPA 3.91 · Eli Shay & RCA Zworykin Scholar · Resident Advisor · UTA, ECE 20001",
  },
];

export default function Experience() {
  return (
    <section
      id="experience"
      className="container-page py-20 sm:py-28 scroll-mt-24"
    >
      <div className="mb-12">
        <div className="label mb-3">Experience</div>
        <h2 className="heading-section text-ink-900">Where I've worked.</h2>
      </div>

      <div className="relative">
        {/* timeline rail */}
        <div className="absolute left-2 top-2 bottom-2 w-px bg-paper-300 hidden sm:block" />

        <ol className="space-y-12">
          {ROLES.map((r) => (
            <li key={r.company + r.dates} className="relative sm:pl-12">
              {/* dot */}
              <span
                className={`hidden sm:block absolute left-0 top-2 h-4 w-4 rounded-full border-2 ${
                  r.current
                    ? "bg-emerald-500 border-emerald-500"
                    : "bg-paper-50 border-ink-300"
                }`}
              />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
                <div>
                  <h3 className="font-serif text-2xl text-ink-900">
                    {r.company}
                    {r.current && (
                      <span className="ml-3 inline-flex items-center gap-1.5 align-middle text-xs font-sans font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Current
                      </span>
                    )}
                  </h3>
                  <div className="text-ink-600 mt-1">
                    {r.role} · <span className="text-ink-500">{r.location}</span>
                  </div>
                </div>
                <div className="font-mono text-xs text-ink-500 shrink-0">
                  {r.dates}
                </div>
              </div>
              <ul className="space-y-2 text-ink-700 leading-relaxed max-w-prose">
                {r.bullets.map((b, i) => (
                  <li key={i} className="relative pl-5">
                    <span className="absolute left-0 top-2.5 h-1 w-1 rounded-full bg-ink-400" />
                    {b}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      {/* Education */}
      <div className="mt-20 pt-12 border-t border-paper-200">
        <div className="label mb-6">Education</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {EDUCATION.map((e) => (
            <div key={e.degree} className="card">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="font-serif text-lg text-ink-900">{e.school}</h4>
                <span className="font-mono text-xs text-ink-500">{e.dates}</span>
              </div>
              <div className="text-ink-700 mt-1">{e.degree}</div>
              <div className="text-sm text-ink-500 mt-2 leading-relaxed">
                {e.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
