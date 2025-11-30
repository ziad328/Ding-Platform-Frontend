import React from 'react';

const shimmer = 'animate-pulse bg-neutral-w-300 dark:bg-dark-bg-tertiary';

export const PostCreationSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm p-3 mb-3 sm:rounded-xl sm:p-4 md:p-5">
        <div className="flex gap-2 pb-3 items-start sm:gap-3">
            {/* User Avatar */}
            <div className={`w-8 h-8 rounded-full ${shimmer} shrink-0 sm:w-10 sm:h-10`} />

            {/* Input Area */}
            <div className="flex-1 min-w-0 space-y-2">
                <div className={`h-5 w-full rounded ${shimmer}`} />
                <div className="border-b border-neutral-w-400 dark:border-dark-border"></div>
            </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-2 gap-2 sm:mt-3">
            <div className={`h-8 w-28 rounded-lg ${shimmer}`} />
            <div className={`h-8 w-20 rounded-lg ${shimmer}`} />
        </div>
    </div>
);

export const FeedPostSkeleton: React.FC<{ withImage?: boolean }> = ({ withImage }) => (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${shimmer}`} />
                <div className="space-y-2">
                    <div className={`h-3 w-32 rounded ${shimmer}`} />
                    <div className={`h-3 w-20 rounded ${shimmer}`} />
                </div>
            </div>
            <div className={`h-3 w-16 rounded ${shimmer}`} />
        </div>
        <div className="space-y-2 mb-3 sm:mb-4">
            <div className={`h-3 w-full rounded ${shimmer}`} />
            <div className={`h-3 w-11/12 rounded ${shimmer}`} />
            <div className={`h-3 w-10/12 rounded ${shimmer}`} />
        </div>
        {withImage && <div className={`h-40 sm:h-48 md:h-56 rounded-lg ${shimmer} mb-3`} />}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-w-400 dark:border-dark-border">
            <div className="flex items-center gap-4 sm:gap-6">
                {[1, 2].map((action) => (
                    <div key={action} className={`h-4 w-16 rounded ${shimmer}`} />
                ))}
            </div>
            <div className={`h-4 w-6 rounded ${shimmer}`} />
        </div>
    </div>
);

export const FeedLoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
    <>
        {Array.from({ length: count }).map((_, index) => (
            <FeedPostSkeleton key={index} withImage={index % 3 === 0} />
        ))}
    </>
);
