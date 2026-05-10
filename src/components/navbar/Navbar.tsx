import { Search, User, LogOut, X, Loader2, ChevronDown, Moon, Sun } from 'lucide-react';
import { Logo } from '../atoms/Logo';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/auth/auth';
import { useSendLogOutMutation } from '../../store/slices/auth/authApi';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useDarkMode } from '../../hook/useDarkMode';
import { setQuery } from '../../store/slices/search/searchSlice';
import { useSearchQuery } from '../../store/ApiSlice';
import { debounce } from 'lodash';

function Navbar() {
  const user = useSelector(selectCurrentUser);
  const [sendLogOut, { isLoading: isLoggingOut }] = useSendLogOutMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Search query with API integration
  const { data: searchResults } = useSearchQuery({
    q: searchValue,
    type: 'all',
    sortBy: 'relevance',
    limit: 10,
  }, {
    skip: !searchValue || searchValue.length < 1,
  });

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      dispatch(setQuery(query));
    }, 300),
    [dispatch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setShowSearchDropdown(value.length >= 1);
    debouncedSearch(value);
  };

  const handleResultClick = (type: 'user' | 'post', id: string) => {
    setShowSearchDropdown(false);
    setSearchValue('');
    if (type === 'user') {
      navigate(`/profile/${id}`);
    } else {
      navigate(`/post/${id}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setShowSearchDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
    }
  };

  const SearchResultsDropdown = () => {
    if (!showSearchDropdown || !searchResults) return null;

    const { users = [], posts = [] } = searchResults.data || {};
    const hasResults = users.length > 0 || posts.length > 0;

    if (!hasResults) {
      return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-bg-secondary border border-neutral-w-400 dark:border-dark-border rounded-lg shadow-lg z-50 animate-fadeIn p-4">
          <p className="text-sm text-neutral-b-600 dark:text-dark-text-secondary text-center">No results found</p>
        </div>
      );
    }

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-bg-secondary border border-neutral-w-400 dark:border-dark-border rounded-lg shadow-lg z-50 animate-fadeIn max-h-96 overflow-y-auto">
        {users.length > 0 && (
          <div className="p-2 border-b border-neutral-w-200 dark:border-dark-border">
            <p className="text-xs font-semibold text-neutral-b-500 dark:text-dark-text-muted mb-2 px-2">Users</p>
            {users.slice(0, 5).map((user: any) => (
              <button
                key={user.id}
                onClick={() => handleResultClick('user', user.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-w-100 dark:hover:bg-dark-bg-tertiary transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary-700 dark:text-primary-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-b-700 dark:text-dark-text-primary truncate">{user.name}</p>
                  <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted truncate">@{user.username}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {posts.length > 0 && (
          <div className="p-2">
            <p className="text-xs font-semibold text-neutral-b-500 dark:text-dark-text-muted mb-2 px-2">Posts</p>
            {posts.slice(0, 5).map((post: any) => (
              <button
                key={post.id}
                onClick={() => handleResultClick('post', post.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-w-100 dark:hover:bg-dark-bg-tertiary transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-b-700 dark:text-dark-text-primary line-clamp-2">{post.content}</p>
                  <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted mt-1">by {post.authorName}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleLogout = () => {
    sendLogOut();
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchValue('');
    setShowSearchDropdown(false);
    dispatch(setQuery(''));
  };

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        }
        setShowSearchDropdown(false);
      }
    };

    if (isSearchOpen || showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen, showSearchDropdown]);

  // Handle click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        if (isProfileOpen) {
          setIsProfileOpen(false);
        }
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <nav className="sticky top-0 z-50 w-ful shadow-sm">
      <div className="flex items-center justify-between h-12 px-3 sm:h-14 sm:px-4 md:h-16 md:px-6 transition-all duration-300">
        {isSearchOpen ? (
          /* Mobile Search Mode */
          <div ref={searchRef} className="relative flex-1 md:hidden animate-fadeIn">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-b-400 dark:text-dark-text-muted w-3.5 h-3.5 transition-colors" />
            <input
              type="text"
              placeholder="Search"
              value={searchValue}
              onChange={handleSearchChange}
              autoFocus
              className="w-full pl-8 pr-9 py-1.5 text-sm bg-neutral-w-200 dark:bg-dark-bg-primary border border-neutral-w-400 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-neutral-b-400 dark:placeholder:text-dark-text-muted dark:text-dark-text-primary transition-all duration-200"
            />
            <button
              onClick={handleCloseSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-w-300 dark:hover:bg-dark-bg-tertiary rounded-md transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <X className="w-3.5 h-3.5 text-neutral-b-600 dark:text-dark-text-secondary" />
            </button>
            <SearchResultsDropdown />
          </div>
        ) : (
          <>
            {/* Logo */}
            <Logo />

            {/* Desktop Search Bar */}
            <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-b-400 dark:text-dark-text-muted w-4 h-4 transition-colors" />
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchValue}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-w-200 dark:bg-dark-bg-primary border border-neutral-w-400 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-neutral-b-400 dark:placeholder:text-dark-text-muted dark:text-dark-text-primary transition-all duration-200 hover:border-neutral-b-300 dark:hover:border-dark-text-muted focus:bg-neutral-w-100 dark:focus:bg-dark-bg-tertiary"
                />
              </form>
              <SearchResultsDropdown />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 shrink-0 sm:gap-2">
              {/* Mobile Search Icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-1.5 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
              >
                <Search className="w-4 h-4 text-neutral-b-600 dark:text-dark-text-secondary sm:w-5 sm:h-5" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                ) : (
                  <Moon className="w-5 h-5 text-neutral-b-600" />
                )}
              </button>

              {/* User Profile Dropdown */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1.5 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary rounded-lg transition-all duration-200 p-1 touch-manipulation sm:gap-2 sm:p-1.5"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center sm:w-7 sm:h-7 md:w-8 md:h-8 transition-all duration-200">
                    <User className="w-3.5 h-3.5 text-primary-700 dark:text-primary-300 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="hidden sm:block text-xs font-medium text-neutral-b-700 dark:text-dark-text-secondary whitespace-nowrap md:text-sm transition-colors">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-neutral-b-600 dark:text-dark-text-secondary transition-transform duration-200 sm:w-4 sm:h-4 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2.5 w-48 bg-neutral-w-900 dark:bg-dark-bg-secondary border border-neutral-w-400 dark:border-dark-border rounded-lg shadow-lg z-50 animate-fadeIn overflow-hidden">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsProfileOpen(false);
                      }}
                      className="w-full px-3 py-3 text-left text-sm text-neutral-b-700 dark:text-dark-text-secondary hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary transition-colors duration-200 flex items-center gap-3"
                    >
                      <User className="w-4 h-4 ml-1" />
                      Profile
                    </button>
                    <hr className="border-neutral-w-400 dark:border-dark-border" />
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={`w-full px-3 py-3 text-left text-sm flex items-center gap-3 transition-all duration-200 group ${isLoggingOut
                        ? 'text-neutral-b-400 dark:text-dark-text-muted cursor-not-allowed opacity-80'
                        : 'text-semantic-r-800 dark:text-semantic-r-700 hover:bg-semantic-r-700/10 dark:hover:bg-semantic-r-900/20'
                        }`}
                    >
                      {isLoggingOut ? (
                        <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4 ml-1 text-semantic-r-800 dark:text-semantic-r-700 transition-transform group-hover:rotate-12" />
                      )}
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar