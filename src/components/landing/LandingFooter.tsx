import { Logo } from '../atoms/Logo';

function LandingFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-neutral-w-900 dark:bg-dark-bg-secondary border-t border-neutral-w-400 dark:border-dark-border py-8 md:py-12 px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Top Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    {/* Logo and Tagline */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <Logo />
                        <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted">
                            Connect authentically, share freely.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                        <a
                            href="#about"
                            className="text-sm text-neutral-b-600 dark:text-dark-text-secondary hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                        >
                            About
                        </a>
                        <a
                            href="#terms"
                            className="text-sm text-neutral-b-600 dark:text-dark-text-secondary hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                        >
                            Terms
                        </a>
                        <a
                            href="#privacy"
                            className="text-sm text-neutral-b-600 dark:text-dark-text-secondary hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                        >
                            Privacy
                        </a>
                        <a
                            href="#contact"
                            className="text-sm text-neutral-b-600 dark:text-dark-text-secondary hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                        >
                            Contact
                        </a>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-neutral-w-400 dark:border-dark-border mb-6" />

                {/* Bottom Section */}
                <div className="text-center">
                    <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted">
                        © {currentYear} Ding. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default LandingFooter;
