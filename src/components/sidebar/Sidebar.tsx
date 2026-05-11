import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  RiHome9Line, RiHome9Fill, RiSendInsLine, RiSendInsFill,
  RiVideoLine, RiVideoFill, RiSearchLine, RiStoreLine, RiStoreFill,
  RiMenuLine, RiSettings2Line, RiLogoutBoxLine, RiUser3Line,
} from '@remixicon/react';
import { X, Loader2 } from 'lucide-react';
import logoSvg from '../../assets/Logo.svg';
import { selectCurrentUser } from '../../store/slices/auth/auth';
import { useSendLogOutMutation } from '../../store/slices/auth/authApi';
import { setQuery } from '../../store/slices/search/searchSlice';
import { useSearchQuery } from '../../store/ApiSlice';
import { debounce } from 'lodash';

const COLLAPSED_W  = 72;
const EXPANDED_W   = 240;
const ICON_SIZE    = 26;
const WRAP_SIZE    = 48;
const ROW_LEFT_PAD = (COLLAPSED_W - WRAP_SIZE) / 2;

const ROW: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 14,
  paddingLeft: ROW_LEFT_PAD, paddingRight: 12,
  paddingTop: 4, paddingBottom: 4,
  width: '100%', cursor: 'pointer', boxSizing: 'border-box' as const,
};

const WRAP: React.CSSProperties = {
  width: WRAP_SIZE, height: WRAP_SIZE, borderRadius: 14,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  transition: 'background-color 150ms ease',
};

const wrapHover = 'group-hover:bg-neutral-b-200/40 dark:group-hover:bg-dark-bg-tertiary/60';

const NavLabel = ({ visible, active, children }: { visible: boolean; active?: boolean; children: React.ReactNode }) => (
  <span
    style={{
      opacity:    visible ? 1 : 0,
      maxWidth:   visible ? '160px' : '0px',
      overflow:   'hidden',
      whiteSpace: 'nowrap',
      transition: 'opacity 140ms ease, max-width 180ms ease',
    }}
    className={`text-sm font-medium ${active ? 'font-semibold text-neutral-b-800 dark:text-neutral-w-200' : 'text-neutral-b-600 dark:text-dark-text-secondary'}`}
  >
    {children}
  </span>
);

function Sidebar() {
  const user     = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sendLogOut, { isLoading: isLoggingOut }] = useSendLogOutMutation();

  const [expanded,       setExpanded]       = useState(false);
  const [searchActive,   setSearchActive]   = useState(false);
  const [searchValue,    setSearchValue]    = useState('');
  const [showDropdown,   setShowDropdown]   = useState(false);
  const [moreOpen,       setMoreOpen]       = useState(false);
  const [morePos,        setMorePos]        = useState({ bottom: 0, left: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarRef    = useRef<HTMLElement>(null);
  const searchRef     = useRef<HTMLInputElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hoverTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: searchResults } = useSearchQuery(
    { q: searchValue, type: 'all', sortBy: 'relevance', limit: 10 },
    { skip: !searchValue || searchValue.length < 1 }
  );
  const debouncedSearch = useCallback(debounce((q: string) => dispatch(setQuery(q)), 300), [dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchValue(v);
    setShowDropdown(v.length >= 1);
    debouncedSearch(v);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) { navigate(`/search?q=${encodeURIComponent(searchValue)}`); clearSearch(); }
  };

  const clearSearch = useCallback(() => {
    setSearchValue(''); setShowDropdown(false); setSearchActive(false); dispatch(setQuery(''));
  }, [dispatch]);

  const handleResultClick = (type: 'user' | 'post', id: string) => {
    clearSearch();
    type === 'user' ? navigate(`/profile/${id}`) : navigate(`/post/${id}`);
  };

  const openMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (moreButtonRef.current) {
      const r = moreButtonRef.current.getBoundingClientRect();
      setMorePos({ bottom: window.innerHeight - r.top + 6, left: r.left });
    }
    setMoreOpen(v => !v);
  };

  const handleMouseEnter = () => {
    if (collapseTimer.current) { clearTimeout(collapseTimer.current); collapseTimer.current = null; }
    hoverTimer.current = setTimeout(() => setExpanded(true), 1000);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
    if (!moreOpen && !showDropdown) {
      collapseTimer.current = setTimeout(() => { setExpanded(false); clearSearch(); }, 500);
    }
  };

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const outsideSidebar = sidebarRef.current && !sidebarRef.current.contains(target);
      const outsideMore    = !document.getElementById('more-dd')?.contains(target);
      if (outsideSidebar && outsideMore) setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node))
        setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [mobileMenuOpen]);

  const userInitial = (user?.username?.[0] || user?.name?.[0] || 'U').toUpperCase();
  const userAvatar  = user?.avatar || user?.profileImage || user?.profilePicture || null;

  const Avatar = ({ size = 26 }: { size?: number }) =>
    userAvatar
      ? <img src={userAvatar} alt="" style={{ width: size, height: size }} className="rounded-full object-cover shrink-0" />
      : <div style={{ width: size, height: size }} className="rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center shrink-0">
          <span className="text-white font-semibold text-xs">{userInitial}</span>
        </div>;

  const iconClass = (active: boolean) =>
    active ? 'text-neutral-b-800 dark:text-neutral-w-200' : 'text-neutral-b-600 dark:text-dark-text-secondary';

  const coreItems = [
    { Out: RiHome9Line,   Fill: RiHome9Fill,   label: 'Home',     path: '/',         exact: true  },
    { Out: RiSendInsLine, Fill: RiSendInsFill, label: 'Messages', path: '/messages', exact: false },
    { Out: RiVideoLine,   Fill: RiVideoFill,   label: 'Reels',    path: '/reels',    exact: false },
  ];

  return (
    <>
      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-40 bg-neutral-w-200 dark:bg-dark-bg-primary select-none"
        style={{ width: expanded ? EXPANDED_W : COLLAPSED_W, transition: 'width 160ms ease-in-out', overflow: 'visible' }}
      >
        <div
          style={{ display:'flex', alignItems:'center', gap:14, paddingLeft: 20, paddingRight:12, paddingTop:20, paddingBottom:20, width:'100%', cursor:'default', boxSizing:'border-box' }}
        >
          <img src={logoSvg} alt="Ding" style={{ width: 28, height: 28, flexShrink: 0 }} />
          <span style={{ opacity: expanded ? 1 : 0, maxWidth: expanded ? '120px' : '0px', overflow: 'hidden', whiteSpace: 'nowrap', transition: 'opacity 140ms ease, max-width 180ms ease' }}
            className="text-xl font-extrabold text-primary-800 dark:text-primary-400">
            Ding
          </span>
        </div>

        <nav className="flex flex-col gap-2 flex-1" style={{ overflow: 'visible' }}>
          {coreItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.exact} onClick={e => e.stopPropagation()}
              className="group" style={ROW}
            >
              {({ isActive }) => {
                const Icon = isActive ? item.Fill : item.Out;
                return <>
                  <div style={WRAP} className={wrapHover}>
                    <Icon size={ICON_SIZE} className={iconClass(isActive)} />
                  </div>
                  <NavLabel visible={expanded} active={isActive}>{item.label}</NavLabel>
                </>;
              }}
            </NavLink>
          ))}

          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(true); setSearchActive(true); setTimeout(() => searchRef.current?.focus(), 170); }}
            className="group" style={ROW}
          >
            <div style={WRAP} className={wrapHover}>
              <RiSearchLine size={ICON_SIZE} className={iconClass(false)} />
            </div>
            <div style={{ opacity: expanded ? 1 : 0, maxWidth: expanded ? '160px' : '0px', overflow: 'hidden', whiteSpace: 'nowrap', transition: 'opacity 140ms ease, max-width 180ms ease' }}
              onClick={e => e.stopPropagation()}>
              {searchActive
                ? <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input ref={searchRef} type="text" value={searchValue} onChange={handleSearchChange}
                      placeholder="Search…" autoFocus
                      className="w-28 text-sm bg-transparent border-none outline-none text-neutral-b-700 dark:text-dark-text-primary placeholder:text-neutral-b-400 dark:placeholder:text-dark-text-muted" />
                    {searchValue && <button type="button" onClick={(e) => { e.stopPropagation(); clearSearch(); }}><X size={13} className="text-neutral-b-400" /></button>}
                  </form>
                : <span className="text-sm font-medium text-neutral-b-600 dark:text-dark-text-secondary">Search</span>
              }
            </div>
          </button>

          {showDropdown && searchResults && (() => {
            const { users = [], posts = [] } = (searchResults as any).data || {};
            const hasResults = users.length > 0 || posts.length > 0;
            return (
              <div style={{ position: 'fixed', left: (expanded ? EXPANDED_W : COLLAPSED_W) + 8, top: 120, zIndex: 60 }}
                className="w-72 bg-white dark:bg-dark-bg-secondary border border-neutral-w-400 dark:border-dark-border rounded-xl shadow-xl max-h-96 overflow-y-auto"
                onClick={e => e.stopPropagation()}
                onMouseLeave={(e) => {
                  const intoSidebar = sidebarRef.current?.contains(e.relatedTarget as Node);
                  if (!intoSidebar) { collapseTimer.current = setTimeout(() => { setExpanded(false); clearSearch(); }, 1000); }
                }}>
                {!hasResults
                  ? <p className="text-sm text-center text-neutral-b-500 dark:text-dark-text-muted py-4">No results found</p>
                  : <>
                      {users.length > 0 && <div className="p-2 border-b border-neutral-w-200 dark:border-dark-border">
                        <p className="text-xs font-semibold text-neutral-b-400 px-2 mb-1">People</p>
                        {users.slice(0, 5).map((u: any) => (
                          <button key={u.id} onClick={() => handleResultClick('user', u.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-w-100 dark:hover:bg-dark-bg-tertiary text-left transition-colors">
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
                              {(u.username?.[0] || '?').toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-neutral-b-700 dark:text-dark-text-primary truncate">{u.name}</p>
                              <p className="text-xs text-neutral-b-400 truncate">@{u.username}</p>
                            </div>
                          </button>
                        ))}
                      </div>}
                      {posts.length > 0 && <div className="p-2">
                        <p className="text-xs font-semibold text-neutral-b-400 px-2 mb-1">Posts</p>
                        {posts.slice(0, 5).map((p: any) => (
                          <button key={p.id} onClick={() => handleResultClick('post', p.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-w-100 dark:hover:bg-dark-bg-tertiary text-left transition-colors">
                            <p className="text-sm text-neutral-b-700 dark:text-dark-text-primary line-clamp-2">{p.content}</p>
                          </button>
                        ))}
                      </div>}
                    </>
                }
              </div>
            );
          })()}

          <NavLink to="/marketplace" onClick={e => e.stopPropagation()}
            className="group" style={ROW}>
            {({ isActive }) => {
              const Icon = isActive ? RiStoreFill : RiStoreLine;
              return <>
                <div style={WRAP} className={wrapHover}>
                  <Icon size={ICON_SIZE} className={iconClass(isActive)} />
                </div>
                <NavLabel visible={expanded} active={isActive}>Market</NavLabel>
              </>;
            }}
          </NavLink>

          <NavLink to="/profile" onClick={e => e.stopPropagation()}
            className="group" style={ROW}>
            {({ isActive }) => <>
              <div style={WRAP} className={wrapHover}>
                <Avatar size={34} />
              </div>
              <NavLabel visible={expanded} active={isActive}>Profile</NavLabel>
            </>}
          </NavLink>

          <div className="flex-1" />

          <div className="pb-3">
            <button ref={moreButtonRef} onClick={openMore}
              className="group" style={ROW}>
              <div style={WRAP} className={wrapHover}>
                <RiMenuLine size={ICON_SIZE} className={iconClass(false)} />
              </div>
              <NavLabel visible={expanded}>More</NavLabel>
            </button>
          </div>
        </nav>
      </aside>

      <div id="more-dd"
        style={{ position: 'fixed', bottom: morePos.bottom, left: morePos.left + 12, zIndex: 200,
          opacity: moreOpen ? 1 : 0, transform: moreOpen ? 'translateY(0)' : 'translateY(6px)',
          pointerEvents: moreOpen ? 'auto' : 'none', transition: 'opacity 130ms ease, transform 130ms ease' }}
        className="w-44 bg-white dark:bg-dark-bg-secondary rounded-xl shadow-2xl border border-neutral-w-300 dark:border-dark-border overflow-hidden">
        <button onClick={() => { navigate('/settings'); setMoreOpen(false); setExpanded(false); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-b-700 dark:text-dark-text-secondary hover:bg-neutral-w-100 dark:hover:bg-dark-bg-tertiary transition-colors">
          <RiSettings2Line size={18} /> Settings
        </button>
        <hr className="border-neutral-w-300 dark:border-dark-border" />
        <button onClick={() => { sendLogOut(); setMoreOpen(false); }} disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-semantic-r-800 dark:text-semantic-r-700 hover:bg-semantic-r-700/10 dark:hover:bg-semantic-r-900/20 transition-colors disabled:opacity-60">
          {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <RiLogoutBoxLine size={18} />}
          {isLoggingOut ? 'Logging out…' : 'Logout'}
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 dark:bg-dark-bg-secondary/85 backdrop-blur-md border-t border-neutral-w-400 dark:border-dark-border md:hidden">
        <div className="flex items-center justify-around h-14 px-2">
          {([
            { Out: RiHome9Line,   Fill: RiHome9Fill,   path: '/',            exact: true  },
            { Out: RiSendInsLine, Fill: RiSendInsFill, path: '/messages',    exact: false },
            { Out: RiVideoLine,   Fill: RiVideoFill,   path: '/reels',       exact: false },
            { Out: RiStoreLine,   Fill: RiStoreFill,   path: '/marketplace', exact: false },
          ] as const).map(item => (
            <NavLink key={item.path} to={item.path} end={item.exact}
              className="flex items-center justify-center flex-1 h-full touch-manipulation">
              {({ isActive }) => {
                const Icon = isActive ? item.Fill : item.Out;
                return <div className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-neutral-b-200/40 dark:hover:bg-dark-bg-tertiary/60 active:scale-95 transition-all">
                  <Icon size={24} className={isActive ? 'text-neutral-b-800 dark:text-neutral-w-200' : 'text-neutral-b-500 dark:text-dark-text-muted'} />
                </div>;
              }}
            </NavLink>
          ))}
          <button onClick={() => setMobileMenuOpen(true)}
            className="flex items-center justify-center flex-1 h-full touch-manipulation active:scale-95 transition-transform">
            <Avatar size={30} />
          </button>
        </div>
      </nav>

      <div className="fixed inset-0 z-50 md:hidden"
        style={{ opacity: mobileMenuOpen ? 1 : 0, pointerEvents: mobileMenuOpen ? 'auto' : 'none', transition: 'opacity 150ms ease', background: 'rgba(0,0,0,0.28)' }}
        onClick={() => setMobileMenuOpen(false)} />

      <div ref={mobileMenuRef}
        className="fixed bottom-16 right-3 z-60 w-48 bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl border border-neutral-w-300 dark:border-dark-border overflow-hidden md:hidden"
        style={{ opacity: mobileMenuOpen ? 1 : 0, transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(10px)', pointerEvents: mobileMenuOpen ? 'auto' : 'none', transition: 'opacity 150ms ease, transform 150ms ease' }}>
        <button onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-neutral-b-700 dark:text-dark-text-secondary hover:bg-neutral-w-100 dark:hover:bg-dark-bg-tertiary transition-colors">
          <RiUser3Line size={18} /> Profile
        </button>
        <button onClick={() => { navigate('/settings'); setMobileMenuOpen(false); }}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-neutral-b-700 dark:text-dark-text-secondary hover:bg-neutral-w-100 dark:hover:bg-dark-bg-tertiary transition-colors">
          <RiSettings2Line size={18} /> Settings
        </button>
        <hr className="border-neutral-w-300 dark:border-dark-border" />
        <button onClick={() => { sendLogOut(); setMobileMenuOpen(false); }} disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-semantic-r-800 dark:text-semantic-r-700 hover:bg-semantic-r-700/10 dark:hover:bg-semantic-r-900/20 transition-colors disabled:opacity-60">
          {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <RiLogoutBoxLine size={18} />}
          {isLoggingOut ? 'Logging out…' : 'Logout'}
        </button>
      </div>
    </>
  );
}

export default Sidebar;