import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`relative w-9 h-9 flex items-center justify-center rounded-xl
        text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]
        hover:bg-[var(--color-bg-subtle)] transition-all duration-200 cursor-pointer ${className}`}
    >
      <span className={`absolute transition-all duration-300 ${isDark ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
        <Sun className="w-4.5 h-4.5" />
      </span>
      <span className={`absolute transition-all duration-300 ${!isDark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}>
        <Moon className="w-4.5 h-4.5" />
      </span>
    </button>
  );
}
