import { Moon, Sun } from 'lucide-react';
import { Logo } from '../atoms/Logo';
import { useDarkMode } from '../../hook/useDarkMode';
import { useNavigate } from 'react-router-dom';

function LandingNavbar() {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const navigate = useNavigate();

    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-neutral-w-900/80 dark:bg-dark-bg-secondary/80 border-b border-neutral-w-400/50 dark:border-dark-border/50 shadow-sm">
            <div className="flex items-center justify-between h-14 px-4 md:h-16 md:px-6 lg:px-8 transition-all duration-300">
                {/* Logo */}
                <Logo />

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? (
                            <Sun className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                        ) : (
                            <Moon className="w-5 h-5 text-neutral-b-600" />
                        )}
                    </button>

                    {/* Sign In Button */}
                    <button
                        onClick={() => navigate('/auth/signin')}
                        className="px-4 py-2 bg-primary-700 dark:bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-800 dark:hover:bg-primary-700 active:bg-primary-900 dark:active:bg-primary-800 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default LandingNavbar;
