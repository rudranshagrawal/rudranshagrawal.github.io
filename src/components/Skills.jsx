const GROUPS = [
  {
    label: "Languages",
    items: ["C", "C++", "Python", "Bash", "Swift"],
  },
  {
    label: "Embedded",
    items: [
      "Bare-metal",
      "FreeRTOS",
      "Board bring-up",
      "Interrupt-driven",
      "Task kernels",
    ],
  },
  {
    label: "Protocols",
    items: ["CAN", "PCIe", "UART", "SPI", "I²C", "PWM", "ADC/DAC"],
  },
  {
    label: "Linux",
    items: ["Embedded Linux", "Yocto", "Buildroot"],
  },
  {
    label: "Tools",
    items: ["Git", "GDB", "Oscilloscopes", "Logic analyzers", "In-circuit debuggers"],
  },
  {
    label: "CI/CD",
    items: ["Azure DevOps", "Jenkins", "Docker", "HIL test automation"],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="container-page py-20 sm:py-28 scroll-mt-24">
      <div className="mb-12">
        <div className="label mb-3">Skills</div>
        <h2 className="heading-section text-ink-900">What I work with.</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {GROUPS.map((g) => (
          <div key={g.label} className="card">
            <div className="label mb-3">{g.label}</div>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((item) => (
                <span
                  key={item}
                  className="font-mono text-[12px] text-ink-700 px-2.5 py-1 rounded-md bg-paper-100 border border-paper-200"
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
