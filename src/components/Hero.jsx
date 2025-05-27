import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="p-10 text-left">
      <motion.h1 
        initial={{ opacity: 0, y: -30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1 }}
        className="text-4xl font-bold text-yellow-400"
      >
        Hello. I’m <span className="text-white">Rudransh Agrawal</span>
      </motion.h1>

      <p className="mt-2 text-lg text-gray-300">
        Embedded Firmware Engineer specializing in CAN systems, deterministic real-time code, and HIL automation.
      </p>

      <motion.div whileHover={{ scale: 1.05 }}>
        <Link 
          to="/experience" 
          className="inline-block mt-6 px-5 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition"
        >
          View Experience
        </Link>
      </motion.div>
    </div>
  );
}
