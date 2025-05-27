import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const terminalScript = [
  '> help',
  'Available commands:\n  help              → show this help message\n  ls                → list sections\n  cat resume        → summary of resume\n  open can_stack    → show CAN project\n  clear             → clear terminal',
  '',
  '> ls',
  'Sections:\n  - resume\n  - can_stack\n  - phoropter\n  - contact',
  '',
  '> cat resume',
  'Rudransh Agrawal – Firmware Engineer\nSpecialized in CAN systems, real-time kernels, and HIL automation.',
  '',
  '> open can_stack',
  'CAN Stack Project:\nBuilt a pub/sub and emergency broadcast system with node registration for embedded motor controllers.',
];

export default function SimulatedTerminal() {
  const [lines, setLines] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < terminalScript.length) {
      const timeout = setTimeout(() => {
        setLines((prev) => [...prev, terminalScript[index]]);
        setIndex(index + 1);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [index]);

  return (
    <div className="bg-black text-green-400 font-mono p-6 rounded-lg shadow-xl max-w-3xl mx-auto mt-10 h-auto min-h-[400px]">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          className="whitespace-pre-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {line}
        </motion.div>
      ))}
    </div>
  );
}
