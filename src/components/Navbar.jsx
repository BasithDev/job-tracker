import { Link, useLocation } from 'react-router-dom';
import { FiBriefcase, FiPlus, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../ThemeContext';

export default function Navbar({ onAddClick }) {
  const location = useLocation();
  const { theme, toggle } = useTheme();

  return (
    <nav className="flex items-center justify-between px-5 sm:px-8 py-3.5 bg-card/90 backdrop-blur-xl border-b border-border sticky top-0 z-50 transition-colors">
      <Link to="/" className="flex items-center gap-2.5 text-lg font-bold text-fg tracking-tight hover:text-accent transition-colors">
        <FiBriefcase className="text-xl text-accent" />
        <span>JobTracker</span>
      </Link>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-transparent text-fg2 hover:bg-hover hover:text-fg transition-all cursor-pointer border-none text-lg"
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </button>

        {location.pathname === '/' && (
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent border border-accent text-white rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-accent-h hover:border-accent-h hover:-translate-y-0.5 btn-glow"
            onClick={onAddClick}
          >
            <FiPlus /> Add Job
          </button>
        )}
      </div>
    </nav>
  );
}
