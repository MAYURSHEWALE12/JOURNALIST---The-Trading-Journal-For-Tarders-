import { ChevronLeft, ChevronRight, Compass, BarChart3, BookOpen, Calendar, Search, User } from 'lucide-react';
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
    user, handleLogOut, setIsCommandOpen, setIsSettingsOpen,
  } = useApp();

  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      <aside className={`fixed md:relative top-0 left-0 h-full z-40 border-r flex flex-col justify-between transition-all duration-300 ${themeClasses.bgPanel} ${themeClasses.border} ${sidebarCollapsed ? 'w-16 md:w-16 hidden md:flex' : 'w-64 md:w-60'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          <div className={`p-4 border-b flex items-center justify-between ${themeClasses.border}`}>
            <div className="flex items-center space-x-3 overflow-hidden">
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
              <div className="relative">
                <select value={activeAccountId}
                  onChange={(e) => { setActiveAccountId(e.target.value); setMobileMenuOpen(false); }}
                  className={`w-full text-xs font-medium bg-transparent border-0 outline-none p-0 cursor-pointer ${themeClasses.textMain}`}>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id} className={isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}>
                      {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
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
