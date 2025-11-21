import React from 'react';

const shimmer = 'animate-pulse bg-neutral-w-300';

export const ProfileHeaderSkeleton: React.FC = () => (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
        <div className={`h-24 sm:h-32 md:h-40 lg:h-48 ${shimmer}`} />
        <div className="px-3 sm:px-4 md:px-6 pb-2">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                    <div className="relative -mt-10 sm:-mt-12 md:-mt-14 mb-3 sm:mb-4 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                        <div className={`w-full h-full rounded-full border-4 border-white shadow-lg ${shimmer}`} />
                    </div>
                    <div className="space-y-2">
                        <div className={`h-4 w-40 rounded ${shimmer}`} />
                        <div className={`h-3 w-24 rounded ${shimmer}`} />
                        <div className={`h-3 w-32 rounded ${shimmer}`} />
                    </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 md:gap-8 mt-3 sm:mt-4 lg:mt-6 lg:mr-4">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="space-y-1 text-center">
                            <div className={`h-5 w-10 mx-auto rounded ${shimmer}`} />
                            <div className={`h-3 w-12 mx-auto rounded ${shimmer}`} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-around sm:justify-start border-t border-neutral-w-400 mt-3 sm:mt-4 pt-1 gap-4 sm:gap-6">
                {[1, 2, 3].map((tab) => (
                    <div key={tab} className={`h-8 w-16 sm:w-24 rounded-full ${shimmer}`} />
                ))}
            </div>
        </div>
    </div>
);

export const PostSkeleton: React.FC<{ withImage?: boolean }> = ({ withImage }) => (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5">
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
        {withImage && <div className={`h-40 sm:h-48 md:h-56 rounded-lg ${shimmer}`} />}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-w-400">
            <div className="flex items-center gap-4 sm:gap-6">
                {[1, 2].map((action) => (
                    <div key={action} className={`h-4 w-16 rounded ${shimmer}`} />
                ))}
            </div>
            <div className={`h-4 w-6 rounded ${shimmer}`} />
        </div>
    </div>
);

export const SuggestedFriendsSkeleton: React.FC = () => (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5">
        <div className={`h-4 w-40 rounded mb-4 ${shimmer}`} />
        <div className="space-y-3">
            {[1, 2, 3, 4].map((friend) => (
                <div key={friend} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${shimmer}`} />
                        <div className="space-y-2">
                            <div className={`h-3 w-32 rounded ${shimmer}`} />
                            <div className={`h-3 w-24 rounded ${shimmer}`} />
                        </div>
                    </div>
                    <div className={`h-6 w-6 rounded-full ${shimmer}`} />
                </div>
            ))}
        </div>
    </div>
);

export const SettingsSkeleton: React.FC = () => (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-40 md:w-48 border-b sm:border-b-0 sm:border-r border-neutral-w-400">
                {[1, 2, 3].map((item) => (
                    <div key={item} className={`h-10 w-full ${shimmer}`} />
                ))}
            </div>
            <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4">
                <div className={`h-24 rounded-lg border-2 border-dashed border-neutral-w-400 ${shimmer}`} />
                {[1, 2, 3].map((field) => (
                    <div key={field} className="space-y-2">
                        <div className={`h-3 w-24 rounded ${shimmer}`} />
                        <div className={`h-10 rounded-lg ${shimmer}`} />
                    </div>
                ))}
                <div className={`h-10 rounded-lg ${shimmer}`} />
            </div>
        </div>
    </div>
);

export const FooterSkeleton: React.FC = () => (
    <footer className="p-3 sm:p-4 md:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className={`h-3 w-40 rounded ${shimmer}`} />
            <div className="flex items-center gap-4">
                {[1, 2, 3].map((item) => (
                    <div key={item} className={`h-3 w-20 rounded ${shimmer}`} />
                ))}
            </div>
        </div>
    </footer>
);


