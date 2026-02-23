import React from 'react';

const shimmer = 'animate-pulse bg-neutral-w-300 dark:bg-dark-bg-tertiary';

interface CommentSkeletonProps {
    level?: number;
}

export const CommentSkeleton: React.FC<CommentSkeletonProps> = ({ level = 0 }) => (
    <div className={`${level > 0 ? 'ml-8' : ''}`}>
        <div className="flex gap-3">
            {/* User Avatar */}
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${shimmer} shrink-0`} />

            {/* Comment Content */}
            <div className="flex-1 min-w-0">
                {/* Comment Header */}
                <div className="flex items-center gap-2 mb-1">
                    <div className={`h-4 w-24 rounded ${shimmer}`} />
                    <div className={`h-3 w-16 rounded ${shimmer}`} />
                </div>

                {/* Comment Text */}
                <div className="space-y-1 mb-2">
                    <div className={`h-3 w-full rounded ${shimmer}`} />
                    <div className={`h-3 w-4/5 rounded ${shimmer}`} />
                    <div className={`h-3 w-3/5 rounded ${shimmer}`} />
                </div>

                {/* Comment Actions */}
                <div className="flex items-center gap-4">
                    <div className={`h-4 w-8 rounded ${shimmer}`} />
                    <div className={`h-4 w-4 rounded ${shimmer}`} />
                    <div className={`h-4 w-12 rounded ${shimmer}`} />
                </div>
            </div>
        </div>
    </div>
);

export default CommentSkeleton;
