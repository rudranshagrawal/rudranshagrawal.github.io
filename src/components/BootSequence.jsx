import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// dmesg-style boot lines. Each item: [timestamp, message].
// Lines ending with " ok" get a green systemd-style [ ok ] marker.
const LINES = [
  ["0.000000", "Booting rudransh.dev v1.0"],
  ["0.001234", "Loading kernel modules: react, vite, tailwind ............ ok"],
  ["0.002456", "Initializing terminal subsystem ............................. ok"],
  ["0.005012", "Detecting host: cupertino-mac.local"],
  ["0.008934", "Mounting /aws/bmc-firmware ................................. ok"],
  ["0.012345", "Loading /milwaukee-tool/can-stack ......................... ok"],
  ["0.018765", "Initializing /trana/cosinor.so ............................. ok"],
  ["0.024901", "Starting podcast service: embedded-edge .................. ok"],
  ["0.034567", "Time zone: America/Los_Angeles (PDT)"],
  ["0.041234", "User: rudransh @ aws · sde, accelerated platforms"],
  ["0.048912", "Loaded 7 projects, 1 podcast"],
  ["0.056789", "System ready."],
];

const PER_LINE_MS = 95;
const START_DELAY_MS = 80;
const WELCOME_HOLD_MS = 850;
const FADE_OUT_MS = 450;

const STORAGE_KEY = "boot-shown";

function alreadyShown() {
  try {
    return Boolean(sessionStorage.getItem(STORAGE_KEY));
  } catch (e) {
    return false;
  }
}

function markShown() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch (e) {}
}

export default function BootSequence() {
  const [done, setDone] = useState(() => alreadyShown());
  const [shown, setShown] = useState(0);
  const [welcomeVisible, setWelcomeVisible] = useState(false);

  // Run the boot animation
  useEffect(() => {
    if (done) return;

    const timeouts = [];

    LINES.forEach((_, i) => {
      timeouts.push(
        setTimeout(() => setShown(i + 1), START_DELAY_MS + i * PER_LINE_MS)
      );
    });

    const totalLinesMs = START_DELAY_MS + LINES.length * PER_LINE_MS;

    timeouts.push(
      setTimeout(() => setWelcomeVisible(true), totalLinesMs + 200)
    );

    timeouts.push(
      setTimeout(() => {
        markShown();
        setDone(true);
      }, totalLinesMs + 200 + WELCOME_HOLD_MS)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [done]);

  // Skip handlers
  useEffect(() => {
    if (done) return;
    const skip = () => {
      markShown();
      setDone(true);
    };
    const onKey = (e) => {
      if (e.key) skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done]);

  // Lock scroll while booting
  useEffect(() => {
    if (done) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_OUT_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => {
            markShown();
            setDone(true);
          }}
          className="fixed inset-0 z-[200] bg-bg overflow-hidden cursor-pointer"
          aria-hidden="true"
        >
          <div className="container-page pt-16 sm:pt-24 font-mono text-[12px] sm:text-[13px] leading-relaxed">
            {LINES.slice(0, shown).map(([t, text], i) => {
              const hasOk = text.endsWith(" ok");
              const message = hasOk ? text.slice(0, -3) : text;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  <span className="text-fg-faint">[ {t}]</span>{" "}
                  <span className="text-fg-dim">{message}</span>
                  {hasOk && (
                    <span className="text-term-green ml-1">[ ok ]</span>
                  )}
                </motion.div>
              );
            })}

            {welcomeVisible && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 text-amber text-base sm:text-lg"
              >
                Welcome.
                <span className="caret" />
              </motion.div>
            )}

            <div className="mt-10 text-[10px] text-fg-faint">
              press any key to skip
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
