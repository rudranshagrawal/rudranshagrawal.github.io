import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // ✅ Add this

const COMMANDS = {
  help: `Available commands:\n  help              → show this help message\n  ls                → list projects\n  cat resume        → go to resume page\n  open <project>    → show project details\n  clear             → clear terminal`,
};

const PROJECTS = [
  {
    name: 'can_stack',
    description: 'Built a pub/sub messaging system with emergency broadcast and node registration for embedded motor controllers.'
  },
  {
    name: 'phoropter',
    description: 'Developed an embedded vision system for automated ophthalmic devices using I2C/SPI/USART and Android app integration.'
  },
  {
    name: 'hil_automation',
    description: 'Created a Python-based Hardware-in-the-Loop test framework for automated firmware regression testing.'
  }
];

export default function ProjectTerminal() {
  const [history, setHistory] = useState(['Welcome to Rudransh’s terminal. Type "help" to begin.']);
  const [input, setInput] = useState('');
  const terminalRef = useRef(null);
  const navigate = useNavigate(); // ✅ Hook for navigation

  const runCommand = (cmd) => {
    if (cmd === 'clear') {
      setHistory([]);
      return;
    }

    if (cmd === 'ls') {
      const projectList = PROJECTS.map(p => `- ${p.name}`).join('\n');
      setHistory(prev => [...prev, `> ${cmd}`, projectList]);
      return;
    }

    if (cmd === 'cat resume') {
      setHistory(prev => [...prev, `> ${cmd}`, 'Redirecting to resume page...']);
      setTimeout(() => navigate('/experience'), 800); // ✅ Add navigation
      return;
    }

    if (cmd.startsWith('open ')) {
      const projName = cmd.slice(5);
      const project = PROJECTS.find(p => p.name === projName);
      if (project) {
        setHistory(prev => [...prev, `> ${cmd}`, `${project.description}`]);
      } else {
        setHistory(prev => [...prev, `> ${cmd}`, `Project not found: ${projName}`]);
      }
      return;
    }

    const response = COMMANDS[cmd];
    if (response) {
      setHistory(prev => [...prev, `> ${cmd}`, response]);
    } else {
      setHistory(prev => [...prev, `> ${cmd}`, `Command not found: ${cmd}`]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim();
      if (cmd !== '') runCommand(cmd);
      setInput('');
    }
  };

  useEffect(() => {
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [history]);

  return (
    <div className="max-w-3xl mx-auto mt-10 shadow-xl rounded-lg overflow-hidden">
      {/* ✅ Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full" />
        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
        <div className="w-3 h-3 bg-green-500 rounded-full" />
        <div className="ml-4 text-sm text-gray-300 font-semibold">rudransh@portfolio:~</div>
      </div>

      {/* ✅ Terminal Body */}
      <div
        ref={terminalRef}
        className="bg-black text-green-400 font-mono p-6 h-96 overflow-y-auto"
      >
        {history.map((line, i) => (
          <motion.div
            key={i}
            className="whitespace-pre-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {line}
          </motion.div>
        ))}

        {/* ✅ Input Line */}
        <div className="flex mt-2">
          <span className="text-yellow-400">&gt;</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-black outline-none ml-2 flex-1 text-green-400"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
