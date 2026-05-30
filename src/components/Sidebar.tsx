import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Compass, BarChart3, BookOpen, Calendar, Search, User, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LogoIcon from './LogoIcon';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview Workspace', icon: Compass },
  { path: '/analytics', label: 'Advanced Analytics', icon: BarChart3 },
  { path: '/timeline', label: 'Journal Timeline', icon: BookOpen },
  { path: '/calendar', label: 'Trading Calendar', icon: Calendar },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    themeClasses, isDarkMode, sidebarCollapsed, setSidebarCollapsed,
    mobileMenuOpen, setMobileMenuOpen,
    activeAccountId, setActiveAccountId, accounts, setIsAddAccountOpen,
    user, handleLogOut, setIsCommandOpen, setIsSettingsOpen, handleDeleteAccount,
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      <aside className={`fixed md:relative top-0 left-0 h-full z-40 border-r flex flex-col justify-between transition-all duration-300 ${themeClasses.bgPanel} ${themeClasses.border} ${sidebarCollapsed ? 'w-16 md:w-16 hidden md:flex' : 'w-64 md:w-60'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          <div className={`p-4 border-b flex items-center justify-between ${themeClasses.border}`}>
            <div className="flex items-center space-x-3 overflow-hidden cursor-pointer" onClick={() => navigate('/')}>
              <div className={`w-8 h-8 rounded flex items-center justify-center inner-stroke shrink-0 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                <LogoIcon className="w-4.5 h-4.5" isDark={isDarkMode} />
              </div>
              {!sidebarCollapsed && <span className={`font-display font-bold text-lg tracking-tight ${themeClasses.textMain}`}>Journalist</span>}
            </div>
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`hidden md:block p-1 rounded transition cursor-pointer ${themeClasses.textSub} ${themeClasses.bgHover}`}>
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button onClick={() => setMobileMenuOpen(false)}
              className={`md:hidden p-1 rounded transition cursor-pointer ${themeClasses.textSub} ${themeClasses.bgHover}`}>
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className={`p-3 mx-3 my-4 bg-transparent border rounded flex flex-col space-y-2 ${themeClasses.border}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-gray-500 font-bold">Active Account</span>
                <button onClick={() => setIsAddAccountOpen(true)}
                  className={`text-[10px] font-bold underline cursor-pointer ${isDarkMode ? 'text-white' : 'text-black'}`}>＋ Add</button>
              </div>
              <div className="relative" ref={selectRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(prev => !prev)}
                  className={`w-full text-xs font-semibold bg-transparent border-0 outline-none p-0 pr-6 cursor-pointer flex items-center justify-between text-left ${themeClasses.textMain}`}
                >
                  <span className="truncate">
                    {accounts.find(a => a.id === activeAccountId)?.name || 'Select Account'} 
                    <span className="text-[10px] text-gray-500 ml-1.5 font-mono font-normal">
                      ({accounts.find(a => a.id === activeAccountId)?.type || 'N/A'})
                    </span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 absolute right-0 transition-transform duration-200 pointer-events-none ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>

                {dropdownOpen && (
                  <div className={`absolute top-full left-0 right-0 mt-2.5 rounded-lg border shadow-2xl p-1 z-50 transition-all duration-200 ${
                    isDarkMode ? 'bg-[#121212] border-white/[0.08] text-white' : 'bg-white border-gray-200 text-black'
                  }`}>
                    {accounts.map(acc => {
                      const isActive = acc.id === activeAccountId;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => {
                            setActiveAccountId(acc.id);
                            setDropdownOpen(false);
                            setMobileMenuOpen(false);
                          }}
                          className={`group w-full text-left px-2.5 py-2.5 rounded text-xs transition duration-150 cursor-pointer flex justify-between items-center ${
                            isActive
                              ? (isDarkMode ? 'bg-white/10 text-white font-semibold' : 'bg-black/5 text-black font-semibold')
                              : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]' : 'text-gray-600 hover:text-black hover:bg-black/[0.03]')
                          }`}
                        >
                          <span className="truncate flex-1 pr-2">
                            {acc.name} <span className="text-[10px] text-gray-500 ml-1 font-mono font-normal">({acc.type})</span>
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isActive && <span className="text-[10px] text-gray-400 md:group-hover:hidden">✦</span>}
                            <button
                              type="button"
                              title="Delete Account"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to delete "${acc.name}"? This will permanently delete this account and all associated trades.`)) {
                                  handleDeleteAccount(acc.id);
                                }
                              }}
                              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition cursor-pointer text-gray-500 flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <nav className="p-2 space-y-1">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <button key={path} onClick={() => { navigate(path); setMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded text-sm transition-all cursor-pointer ${location.pathname === path ? themeClasses.navActive : `text-gray-400 hover:text-white ${themeClasses.bgHover}`}`}>
                <Icon className="w-4.5 h-4.5" />
                {!sidebarCollapsed && <span>{label}</span>}
              </button>
            ))}
            <button onClick={() => { setIsCommandOpen(true); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded text-sm text-gray-400 transition-all cursor-pointer ${themeClasses.bgHover}`}>
              <Search className="w-4.5 h-4.5" />
              {!sidebarCollapsed && (
                <div className="flex-1 flex justify-between items-center">
                  <span>Command Bar</span>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">⌘K</kbd>
                </div>
              )}
            </button>
          </nav>
        </div>

        <div className={`p-3 border-t ${themeClasses.border}`}>
          {/* Interactive, hoverable user block that opens Settings Modal */}
          <button 
            onClick={() => { setIsSettingsOpen(true); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 p-1.5 rounded-xl transition text-left cursor-pointer ${themeClasses.bgHover}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden relative ${themeClasses.bgCard} border border-white/[0.08]`}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-black'}`} />
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 flex flex-col text-left overflow-hidden">
                <span className={`text-xs font-semibold truncate ${themeClasses.textMain}`}>
                  {user ? (user.username || user.email.split('@')[0]) : 'Guest User'}
                </span>
                <span className="text-[9px] text-gray-500 truncate font-mono">
                  {user?.tradingBio || (user ? user.email : 'Offline Mode')}
                </span>
              </div>
            )}
          </button>
          
          {!sidebarCollapsed && (
            <button onClick={handleLogOut}
              className={`w-full mt-3 py-1.5 border rounded text-[10px] transition cursor-pointer ${themeClasses.border} ${themeClasses.bgCard} ${themeClasses.bgHover} ${themeClasses.textSub}`}>
              {user ? '⎋ Sign Out' : 'Exit guest mode'}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
