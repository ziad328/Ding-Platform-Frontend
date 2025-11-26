import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description }) => {
    return (
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm p-6 sm:p-8 md:p-12 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-neutral-w-300 dark:bg-dark-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-neutral-b-400 dark:text-dark-text-muted" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-b-900 dark:text-dark-text-primary mb-1.5 sm:mb-2">{title}</h3>
            <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted">{description}</p>
        </div>
    );
};

export default EmptyState;