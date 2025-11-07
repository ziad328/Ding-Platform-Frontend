import { Search, User, LogOut, X } from 'lucide-react';
import { Logo } from '../atoms/Logo';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/auth/auth';
import { useSendLogOutMutation } from '../../store/slices/auth/authApi';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

function Navbar() {
  const user = useSelector(selectCurrentUser);
  const [sendLogOut] = useSendLogOutMutation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await sendLogOut().unwrap();
      navigate('/auth/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchValue('');
  };

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        }
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-neutral-w-900 border-b border-neutral-w-400 shadow-sm">
      <div className="flex items-center justify-between h-12 px-3 sm:h-14 sm:px-4 md:h-16 md:px-6 transition-all duration-300">
        {isSearchOpen ? (
          /* Mobile Search Mode */
          <div ref={searchRef} className="relative flex-1 md:hidden animate-fadeIn">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-b-400 w-3.5 h-3.5 transition-colors" />
            <input
              type="text"
              placeholder="Search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              autoFocus
              className="w-full pl-8 pr-9 py-1.5 text-sm bg-neutral-w-200 border border-neutral-w-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-neutral-b-400 transition-all duration-200"
            // NOTE: API Integration Point - Implement search functionality
            />
            <button
              onClick={handleCloseSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-w-300 rounded-md transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <X className="w-3.5 h-3.5 text-neutral-b-600" />
            </button>
          </div>
        ) : (
          <>
            {/* Logo */}
            <Logo />

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-b-400 w-4 h-4 transition-colors" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-w-200 border border-neutral-w-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-neutral-b-400 transition-all duration-200 hover:border-neutral-b-300 focus:bg-neutral-w-100"
              // NOTE: API Integration Point - Implement search functionality
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 shrink-0 sm:gap-2">
              {/* Mobile Search Icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-1.5 hover:bg-neutral-w-200 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
              >
                <Search className="w-4 h-4 text-neutral-b-600 sm:w-5 sm:h-5" />
              </button>

              {/* User Profile */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-1.5 hover:bg-neutral-w-200 rounded-lg transition-all duration-200 p-1 touch-manipulation sm:gap-2 sm:p-1.5 hover:scale-105 active:scale-95"
              >
                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center sm:w-7 sm:h-7 md:w-8 md:h-8 transition-all duration-200">
                  <User className="w-3.5 h-3.5 text-primary-700 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </div>
                <span className="hidden sm:block text-xs font-medium text-neutral-b-700 whitespace-nowrap md:text-sm transition-colors">
                  {user?.name || 'User'}
                </span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-1 hover:bg-semantic-r-700/10 rounded-lg transition-all duration-200 touch-manipulation sm:p-1.5 md:p-2 hover:scale-110 active:scale-95"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-semantic-r-800 sm:w-5 sm:h-5 transition-transform hover:rotate-12" />
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar