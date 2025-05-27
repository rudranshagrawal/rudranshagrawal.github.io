export default function ResumeExperience() {
  return (
    <section id="experience" className="max-w-4xl mx-auto px-6 py-16 space-y-12">
      <div>
        <h2 className="text-3xl font-bold text-yellow-400">Education</h2>
        <p className="mt-2">🎓 <strong>Purdue University</strong></p>
        <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
          <li>MS in Computer Engineering (May 2024) – GPA: 3.81</li>
          <li>BS in Computer Engineering (May 2023) – GPA: 3.91</li>
          <li>Graduate & Undergraduate TA (ECE 36200, ECE 20001)</li>
          <li>Eli Shay and RCA Zworykin Scholar</li>
        </ul>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-yellow-400">Industry Experience</h2>
        <p className="mt-2">💼 <strong>Milwaukee Tool – Firmware Engineer I</strong> <span className="text-sm text-gray-400">(Aug 2024 – Present)</span></p>
        <ul className="list-disc list-inside text-gray-300 mt-1 space-y-1">
          <li>Built firmware for Power Interface Board (PIB) and battery communication</li>
          <li>Developed deterministic kernel (no RTOS)</li>
          <li>CAN-based messaging: PDO pub/sub infrastructure</li>
          <li>Python HIL test framework for CI automation</li>
        </ul>
        <p className="mt-4">💼 <strong>Firmware Intern</strong> <span className="text-sm text-gray-400">(Summer 2023)</span></p>
        <ul className="list-disc list-inside text-gray-300 mt-1 space-y-1">
          <li>Created MicroPython test runner (Teensy 4.1)</li>
          <li>Designed UART APIs for firmware ↔ Python comm</li>
          <li>Cut regression test time by 80%</li>
        </ul>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-yellow-400">Projects</h2>
        <p className="mt-2">🔧 <strong>Embedded Vision-Based Phoropter</strong></p>
        <ul className="list-disc list-inside text-gray-300 mt-1 space-y-1">
          <li>Controlled ophthalmic hardware with I2C, SPI, USART</li>
          <li>Built Android app + safety firmware logic</li>
          <li>Delivered 65% cost savings</li>
        </ul>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-yellow-400">Skills</h2>
        <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
          <li><strong>Languages:</strong> C, C++, Python</li>
          <li><strong>Embedded:</strong> CAN, UART, HIL, RTOS-free firmware</li>
          <li><strong>Tools:</strong> Azure DevOps, Teensy, Chart.js</li>
        </ul>
      </div>
    </section>
  );
}
