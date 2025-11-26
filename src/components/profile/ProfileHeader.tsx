import React, { useState } from 'react';
import { User, Edit2, LayoutGrid, Bookmark, Settings, MapPin, Globe } from 'lucide-react';
import { selectCurrentUser } from '../../store/slices/auth/auth';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { ProfileData } from '../../store/slices/profile/profile';
interface ProfileHeaderProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    profile: ProfileData | null;
    followersCount?: number;
    followingCount?: number;
    isStatsLoading?: boolean;
    postsCount?: number;
    isPostsCountLoading?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    activeTab,
    setActiveTab,
    profile,
    followersCount,
    followingCount,
    isStatsLoading,
    postsCount,
    isPostsCountLoading,
}) => {
    const [isHoveringCover, setIsHoveringCover] = useState(false);
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
    const user = useSelector(selectCurrentUser);
    const navigate = useNavigate();
    const displayName = profile?.user?.name ?? user?.name ?? 'Your Name';
    const username = profile?.user?.email ?? user?.email ?? undefined;
    const usernameHandle = username ? `@${username.split('@')[0]}` : '';
    const avatarSrc = profile?.user?.image ?? user?.image ?? null;
    const coverStyles = profile?.coverPhoto
        ? {
            backgroundImage: `url(${profile.coverPhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }
        : undefined;
    const bio = profile?.bio;
    const location = profile?.location;
    const website = profile?.website;
    const tabs = [
        { name: 'My Posts', icon: LayoutGrid },
        { name: 'Saved Posts', icon: Bookmark },
        { name: 'Settings', icon: Settings }
    ];

    return (
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
            {/* Cover Photo */}
            <div
                className="relative h-24 sm:h-32 md:h-40 lg:h-48 bg-linear-to-r from-neutral-b-100 to-neutral-w-300 dark:from-dark-bg-tertiary dark:to-dark-bg-secondary group cursor-pointer"
                style={coverStyles}
                onMouseEnter={() => setIsHoveringCover(true)}
                onMouseLeave={() => setIsHoveringCover(false)}
            >
                <div className={`absolute inset-0 bg-neutral-b-600 dark:bg-neutral-b-800 flex items-center justify-center transition-all duration-300 ${isHoveringCover ? 'opacity-60' : 'opacity-0'
                    }`}>
                    <div className="bg-white dark:bg-dark-bg-primary rounded-full p-2 sm:p-3">
                        <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-b-700 dark:text-dark-text-primary" />
                    </div>
                </div>
            </div>

            {/* Profile Info */}
            <div className="px-3 sm:px-4 md:px-6 pb-2">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    {/* Left Side - Avatar and Bio */}
                    <div className="flex-1">
                        {/* Avatar */}
                        <div className="relative -mt-10 sm:-mt-12 md:-mt-14 mb-3 sm:mb-4 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                            <div
                                className="w-full h-full rounded-full bg-neutral-w-900 dark:bg-dark-bg-secondary border-3 sm:border-4 border-white dark:border-dark-bg-secondary flex items-center justify-center cursor-pointer group"
                                onMouseEnter={() => setIsHoveringAvatar(true)}
                                onMouseLeave={() => setIsHoveringAvatar(false)}
                            >
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="profile" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <User className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 text-neutral-b-400 dark:text-dark-text-muted" />
                                )}
                                <div className={`absolute inset-0 bg-neutral-b-600 dark:bg-neutral-b-800 rounded-full flex items-center justify-center transition-all duration-300 ${isHoveringAvatar ? 'opacity-60' : 'opacity-0'
                                    }`}>
                                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* User Details */}
                        <div>
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary mb-0.5 sm:mb-1">
                                {displayName}
                            </h1>
                            {usernameHandle && (
                                <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted mb-1 sm:mb-2">
                                    {usernameHandle}
                                </p>
                            )}
                            {bio && (
                                <p className="text-xs sm:text-sm text-neutral-b-600 dark:text-dark-text-secondary mb-1 sm:mb-2">
                                    {bio}
                                </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted">
                                {location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {location}
                                    </span>
                                )}
                                {website && (
                                    <a
                                        href={website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        {website.replace(/^https?:\/\//, '')}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Stats */}
                    <div className="flex items-center gap-4 sm:gap-6 md:gap-8 mt-3 sm:mt-4 lg:mt-6 lg:mr-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab('My Posts')}
                            className="group text-center focus:outline-none hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                            aria-label="View posts tab"
                        >
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary mb-0.5 sm:mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {isPostsCountLoading ? '...' : postsCount ?? 0}
                            </p>
                            <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Posts</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/profile/followers')}
                            className="group text-center focus:outline-none hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                            aria-label="View all followers"
                        >
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary mb-0.5 sm:mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {isStatsLoading ? '...' : followersCount ?? 0}
                            </p>
                            <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Followers</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/profile/following')}
                            className="group text-center focus:outline-none hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                            aria-label="View all following"
                        >
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary mb-0.5 sm:mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {isStatsLoading ? '...' : followingCount ?? 0}
                            </p>
                            <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Following</p>
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex justify-around sm:justify-start border-t border-neutral-w-400 dark:border-dark-border mt-3 sm:mt-4 pt-0.5 sm:pt-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.name
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-neutral-b-500 dark:text-dark-text-muted hover:text-neutral-b-700 dark:hover:text-dark-text-secondary'
                                    }`}
                            >
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">{tab.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;