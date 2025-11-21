import { useState } from 'react';
import { Camera } from 'lucide-react';

const Settings = () => {
    const [activeSection, setActiveSection] = useState('General');
    const sections = ['General', 'Account', 'Logout'];

    return (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row">
                {/* Settings Sidebar */}
                <div className="w-full sm:w-40 md:w-48 border-b sm:border-b-0 sm:border-r border-neutral-w-400">
                    {sections.map((section) => (
                        <button
                            key={section}
                            onClick={() => setActiveSection(section)}
                            className={`w-full text-left px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-xs sm:text-sm transition-colors ${activeSection === section
                                    ? 'bg-neutral-w-200 text-primary-600 font-medium'
                                    : 'text-neutral-b-600 hover:bg-neutral-w-200'
                                }`}
                        >
                            {section}
                        </button>
                    ))}
                </div>

                {/* Settings Content */}
                <div className="flex-1 p-3 sm:p-4 md:p-6">
                    {activeSection === 'General' && (
                        <div className="space-y-3 sm:space-y-4">
                            <button className="w-full border-2 border-dashed border-neutral-w-400 rounded-lg p-4 sm:p-5 md:p-6 text-center hover:border-primary-500 transition-colors">
                                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-b-400 mx-auto mb-1.5 sm:mb-2" />
                                <p className="text-xs sm:text-sm text-neutral-b-600">Choose an image for avatar</p>
                            </button>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-neutral-b-700 mb-1.5 sm:mb-2">
                                    Full name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-neutral-w-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-neutral-b-700 mb-1.5 sm:mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-neutral-w-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-neutral-b-700 mb-1.5 sm:mb-2">
                                    Bio
                                </label>
                                <textarea
                                    placeholder="Tell us about yourself"
                                    rows={3}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-neutral-w-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-xs sm:text-sm"
                                />
                            </div>

                            <button className="w-full bg-neutral-b-900 text-white py-2 sm:py-2.5 rounded-lg font-medium hover:bg-neutral-b-800 transition-colors text-xs sm:text-sm">
                                Save Changes
                            </button>
                        </div>
                    )}

                    {activeSection === 'Account' && (
                        <div className="space-y-3 sm:space-y-4">
                            <h3 className="text-base sm:text-lg font-semibold text-neutral-b-900 mb-2 sm:mb-3">Delete Account</h3>
                            <p className="text-xs sm:text-sm text-neutral-b-600 mb-3 sm:mb-4 leading-relaxed">
                                This action is irreversible and will permanently delete all your data associated with the account.
                            </p>
                            <button className="w-full border border-semantic-r-900 text-semantic-r-900 py-2 sm:py-2.5 rounded-lg font-medium hover:bg-semantic-r-900 hover:text-white transition-colors text-xs sm:text-sm">
                                Delete My Account
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;