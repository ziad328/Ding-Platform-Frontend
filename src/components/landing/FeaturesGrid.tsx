import { motion } from 'framer-motion';
import { Zap, Shield, Heart, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
}

interface FeaturesGridProps {
    features?: Feature[];
}

const defaultFeatures: Feature[] = [
    {
        icon: Zap,
        title: 'Instant Dings',
        description: 'Share moments instantly with your circle. No delays, no filters—just real-time connections.',
    },
    {
        icon: Shield,
        title: 'Privacy First',
        description: 'Your data belongs to you. We don\'t sell your information or track you across the web.',
    },
    {
        icon: Heart,
        title: 'No Algorithms',
        description: 'See posts from people you follow, in chronological order. No manipulation, no hidden feeds.',
    },
    {
        icon: Users,
        title: 'Real Connections',
        description: 'Build meaningful relationships with people who share your interests and values.',
    },
];

function FeaturesGrid({ features = defaultFeatures }: FeaturesGridProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    };

    return (
        <section className="py-16 md:py-20 px-4 md:px-6 lg:px-8 bg-neutral-w-100 dark:bg-dark-bg-secondary">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-b-900 dark:text-dark-text-primary mb-4">
                        Why Choose Ding?
                    </h2>
                    <p className="text-base sm:text-lg text-neutral-b-500 dark:text-dark-text-muted max-w-2xl mx-auto">
                        Experience social media the way it should be—authentic, transparent, and built for you.
                    </p>
                </div>

                {/* Features Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                >
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                variants={cardVariants}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="group bg-neutral-w-900 dark:bg-dark-bg-primary border border-neutral-w-400 dark:border-dark-border rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:border-primary-500 dark:hover:border-primary-600"
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                                    <Icon className="w-6 h-6 text-primary-700 dark:text-primary-400" />
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-semibold text-neutral-b-900 dark:text-dark-text-primary mb-2">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}

export default FeaturesGrid;
