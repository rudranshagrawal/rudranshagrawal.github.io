// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center bg-black text-white shadow-md fixed top-0 left-0 z-50">
      <Link to="/" className="text-xl font-bold text-yellow-400">
        Rudransh.dev
      </Link>

      <div className="space-x-4">
        <Link
          to="/"
          className={`hover:underline ${
            pathname === '/' ? 'text-yellow-400 font-semibold' : 'text-gray-300'
          }`}
        >
          Home
        </Link>
        <Link
          to="/experience"
          className={`hover:underline ${
            pathname === '/experience'
              ? 'text-yellow-400 font-semibold'
              : 'text-gray-300'
          }`}
        >
          Experience
        </Link>
      </div>
    </nav>
  );
}
