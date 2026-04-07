const GROUPS = [
  {
    label: "languages",
    items: ["c", "c++", "python", "bash", "swift"],
  },
  {
    label: "embedded",
    items: [
      "bare-metal",
      "freertos",
      "board bring-up",
      "interrupt-driven",
      "task kernels",
    ],
  },
  {
    label: "protocols",
    items: ["can", "pcie", "uart", "spi", "i²c", "pwm", "adc/dac"],
  },
  {
    label: "linux",
    items: ["embedded linux", "yocto", "buildroot"],
  },
  {
    label: "tools",
    items: ["git", "gdb", "oscilloscopes", "logic analyzers", "in-circuit debuggers"],
  },
  {
    label: "ci/cd",
    items: ["azure devops", "jenkins", "docker", "hil test automation"],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="container-page py-20 sm:py-24 scroll-mt-24">
      <div className="mb-10">
        <div className="label mb-2 prompt-comment">skills</div>
        <h2 className="heading-section">
          <span className="text-amber">$</span> man rudransh
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GROUPS.map((g) => (
          <div key={g.label} className="card">
            <div className="text-[11px] text-amber mb-3">
              <span className="text-fg-faint">--</span> {g.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((item) => (
                <span
                  key={item}
                  className="text-[11px] text-fg-dim px-2 py-1 border border-line bg-bg-elev"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
