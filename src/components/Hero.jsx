import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Hero() {
  return (
    <section className="container-page pt-32 sm:pt-40 pb-20 sm:pb-28">
      <motion.div
        initial="hidden"
        animate="show"
        className="max-w-3xl"
      >
        <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-full bg-ink-900 text-paper-50 font-serif text-lg flex items-center justify-center">
            RA
          </div>
          <div className="label">Cupertino, CA · He/Him</div>
        </motion.div>

        <motion.h1 variants={fadeUp} custom={1} className="heading-display text-ink-900">
          Firmware engineer building the systems behind <span className="text-amber italic">AWS's GPU fleet</span>.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          custom={2}
          className="mt-6 text-lg sm:text-xl text-ink-600 leading-relaxed max-w-2xl"
        >
          I write firmware for Baseboard Management Controllers on EC2 servers with AMD and Nvidia GPUs — the layer that keeps AWS's accelerated compute fleet healthy, observable, and cool. Before AWS I built CAN-based motor control firmware at Milwaukee Tool. Purdue MS in Computer Engineering, '24.
        </motion.p>

        <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="mailto:agraw115@purdue.edu"
            className="pill-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16v16H4z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            Get in touch
          </a>
          <a
            href="https://www.linkedin.com/in/rudranshagrawal"
            target="_blank"
            rel="noreferrer"
            className="pill"
          >
            LinkedIn
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
          <a href="/resume.pdf" target="_blank" rel="noreferrer" className="pill">
            Résumé
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v14" />
              <path d="m6 11 6 6 6-6" />
              <path d="M5 21h14" />
            </svg>
          </a>
        </motion.div>

        <motion.div
          variants={fadeUp}
          custom={4}
          className="mt-12 inline-flex items-center gap-3 rounded-full border border-paper-200 bg-white px-4 py-2 text-sm text-ink-600"
        >
          <span className="pulse-dot" />
          <span className="label">Currently</span>
          <span className="text-ink-900">
            Shipping Trana for the App Store · Building BMC firmware at AWS
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
