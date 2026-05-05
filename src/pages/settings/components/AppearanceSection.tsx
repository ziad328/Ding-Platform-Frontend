import { useDispatch, useSelector } from 'react-redux';
import { Moon } from 'lucide-react';
import { toggleTheme, selectIsDark } from '../../../store/slices/theme/themeSlice';
import { useEffect } from 'react';

function AppearanceSection() {
  const dispatch = useDispatch();
  const isDark = useSelector(selectIsDark);

  // Keep DOM in sync whenever Redux state changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <section
      aria-labelledby="appearance-heading"
      className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-neutral-w-400 dark:border-dark-border p-6 shadow-sm"
    >
      <h2
        id="appearance-heading"
        className="text-lg font-semibold text-neutral-b-800 dark:text-dark-text-primary mb-1"
      >
        Appearance
      </h2>
      <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mb-6">
        Choose your preferred colour scheme.
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Moon size={20} className="text-primary-500" />
          <div>
            <p className="text-sm font-medium text-neutral-b-800 dark:text-dark-text-primary">
              Dark Mode
            </p>
            <p className="text-xs text-neutral-b-400 dark:text-dark-text-muted mt-0.5">
              {isDark ? 'On' : 'Off'}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => dispatch(toggleTheme())}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
            transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2
            focus-visible:ring-primary-500 focus-visible:ring-offset-2
            ${isDark ? 'bg-primary-500' : 'bg-neutral-w-400'}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg
              ring-0 transition duration-200 ease-in-out
              ${isDark ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>
    </section>
  );
}

export default AppearanceSection;
