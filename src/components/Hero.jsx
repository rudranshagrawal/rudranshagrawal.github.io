import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

const TYPED_LINES = [
  { prompt: "$", text: "whoami" },
  { result: "rudransh agrawal — sde @ aws · cupertino, ca" },
  { prompt: "$", text: "cat /about.md" },
];

export default function Hero() {
  const [showRest, setShowRest] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowRest(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="container-page pt-28 sm:pt-36 pb-16 sm:pb-24 relative">
      <motion.div initial="hidden" animate="show" className="max-w-3xl">
        {/* Boot lines */}
        <div className="space-y-1 text-sm text-fg-dim mb-10">
          {TYPED_LINES.map((l, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}>
              {l.prompt && (
                <span>
                  <span className="text-amber">{l.prompt}</span>{" "}
                  <span className="text-fg">{l.text}</span>
                </span>
              )}
              {l.result && <span className="text-fg-dim">{l.result}</span>}
            </motion.div>
          ))}
        </div>

        <motion.h1
          variants={fadeUp}
          custom={3}
          className="heading-display"
        >
          Firmware engineer building the systems behind{" "}
          <span className="text-amber">AWS&apos;s GPU fleet</span>.
          <span className="caret" />
        </motion.h1>

        <motion.p
          variants={fadeUp}
          custom={4}
          className="mt-6 text-base sm:text-lg text-fg-dim leading-relaxed max-w-2xl"
        >
          I write firmware for Baseboard Management Controllers on EC2 servers
          with AMD and Nvidia GPUs — the layer that keeps AWS&apos;s accelerated
          compute fleet healthy, observable, and cool. Before AWS I built
          CAN-based motor control firmware at Milwaukee Tool. Purdue MS in
          Computer Engineering, &apos;24.
        </motion.p>

        <motion.div
          variants={fadeUp}
          custom={5}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <a href="mailto:rudranshagrawal@yahoo.com" className="btn-primary">
            email me
          </a>
          <a
            href="https://www.linkedin.com/in/rudranshagrawal"
            target="_blank"
            rel="noreferrer"
            className="btn"
          >
            linkedin
          </a>
          <a
            href="https://github.com/rudranshagrawal"
            target="_blank"
            rel="noreferrer"
            className="btn"
          >
            github
          </a>
          <a
            href="https://x.com/rudilicious99"
            target="_blank"
            rel="noreferrer"
            className="btn"
          >
            x
          </a>
        </motion.div>

        <motion.div
          variants={fadeUp}
          custom={6}
          className="mt-12 inline-flex items-center gap-3 border border-line bg-bg-panel px-4 py-2 text-xs text-fg-dim"
        >
          <span className="pulse-dot" />
          <span className="label">currently</span>
          <span className="text-fg">
            shipping trana for the app store · building bmc fw at aws
          </span>
        </motion.div>

        {showRest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 text-xs text-fg-faint"
          >
            press <kbd className="px-1.5 py-0.5 border border-line bg-bg-panel text-fg-dim">?</kbd> to open the terminal
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
