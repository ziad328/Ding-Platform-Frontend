import React, { useState } from 'react';
import { User, Edit2, LayoutGrid, Bookmark, Settings } from 'lucide-react';

interface ProfileHeaderProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ activeTab, setActiveTab }) => {
    const [isHoveringCover, setIsHoveringCover] = useState(false);
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

    const tabs = [
        { name: 'My Posts', icon: LayoutGrid },
        { name: 'Saved Posts', icon: Bookmark },
        { name: 'Settings', icon: Settings }
    ];

    return (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
            {/* Cover Photo */}
            <div
                className="relative h-24 sm:h-32 md:h-40 lg:h-48 bg-linear-to-r from-neutral-b-100 to-neutral-w-300 group cursor-pointer"
                onMouseEnter={() => setIsHoveringCover(true)}
                onMouseLeave={() => setIsHoveringCover(false)}
            >
                <div className={`absolute inset-0 bg-neutral-b-600 flex items-center justify-center transition-all duration-300 ${isHoveringCover ? 'opacity-60' : 'opacity-0'
                    }`}>
                    <div className="bg-white rounded-full p-2 sm:p-3">
                        <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-b-700" />
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
                                className="w-full h-full rounded-full bg-neutral-w-900 border-3 sm:border-4 border-white shadow-lg flex items-center justify-center cursor-pointer group"
                                onMouseEnter={() => setIsHoveringAvatar(true)}
                                onMouseLeave={() => setIsHoveringAvatar(false)}
                            >
                                <User className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 text-neutral-b-400" />
                                <div className={`absolute inset-0 bg-neutral-b-600 rounded-full flex items-center justify-center transition-all duration-300 ${isHoveringAvatar ? 'opacity-60' : 'opacity-0'
                                    }`}>
                                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* User Details */}
                        <div>
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-b-900 mb-0.5 sm:mb-1">Robert Fox</h1>
                            <p className="text-xs sm:text-sm text-neutral-b-500 mb-1 sm:mb-2">@robert</p>
                            <p className="text-xs sm:text-sm text-neutral-b-600">Software Engineer</p>
                        </div>
                    </div>

                    {/* Right Side - Stats */}
                    <div className="flex items-center gap-4 sm:gap-6 md:gap-8 mt-3 sm:mt-4 lg:mt-6 lg:mr-4">
                        <div className="text-center">
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-b-900 mb-0.5 sm:mb-1">12</p>
                            <p className="text-xs sm:text-sm text-neutral-b-500">Posts</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-b-900 mb-0.5 sm:mb-1">207</p>
                            <p className="text-xs sm:text-sm text-neutral-b-500">Followers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-b-900 mb-0.5 sm:mb-1">64</p>
                            <p className="text-xs sm:text-sm text-neutral-b-500">Following</p>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex justify-around sm:justify-start border-t border-neutral-w-400 mt-3 sm:mt-4 pt-0.5 sm:pt-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.name
                                        ? 'text-primary-600'
                                        : 'text-neutral-b-500 hover:text-neutral-b-700'
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