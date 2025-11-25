import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroSectionProps {
    onGetStarted: () => void;
    onLearnMore: () => void;
}

function HeroSection({ onGetStarted, onLearnMore }: HeroSectionProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
            },
        },
    };

    return (
        <section className="relative min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 md:py-16 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-primary-100/50 via-neutral-w-200 to-primary-200/40 dark:from-primary-900/20 dark:via-dark-bg-primary dark:to-primary-800/15" />

            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300/40 dark:bg-primary-700/25 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/35 dark:bg-primary-600/20 rounded-full blur-2xl animate-pulse delay-1000" />

            {/* Content */}
            <motion.div
                className="relative z-10 max-w-4xl mx-auto text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Badge */}
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-primary-100 dark:bg-primary-900/30 border border-primary-300 dark:border-primary-700 rounded-full">
                    <Sparkles className="w-4 h-4 text-primary-700 dark:text-primary-400" />
                    <span className="text-sm font-medium text-primary-800 dark:text-primary-300">
                        Welcome to the Future of Social
                    </span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    variants={itemVariants}
                    className="auth-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-primary-800 dark:text-primary-400 mb-6 font-bold"
                >
                    Ding
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    variants={itemVariants}
                    className="text-xl sm:text-2xl md:text-3xl text-neutral-b-700 dark:text-dark-text-secondary mb-4 font-medium"
                >
                    Connect Authentically, Share Freely
                </motion.p>

                <motion.p
                    variants={itemVariants}
                    className="text-base sm:text-lg text-neutral-b-500 dark:text-dark-text-muted mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    A social platform built for real connections. No algorithms deciding what you see.
                    No endless scrolling. Just genuine moments with the people who matter.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <button
                        onClick={onGetStarted}
                        className="group px-8 py-3.5 bg-primary-700 dark:bg-primary-600 text-white text-base font-semibold rounded-lg hover:bg-primary-800 dark:hover:bg-primary-700 active:bg-primary-900 dark:active:bg-primary-800 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={onLearnMore}
                        className="px-8 py-3.5 bg-neutral-w-900 dark:bg-dark-bg-secondary text-neutral-b-700 dark:text-dark-text-secondary text-base font-semibold rounded-lg border-2 border-neutral-w-400 dark:border-dark-border hover:bg-neutral-w-300 dark:hover:bg-dark-bg-tertiary transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        Learn More
                    </button>
                </motion.div>
            </motion.div>
        </section>
    );
}

export default HeroSection;
