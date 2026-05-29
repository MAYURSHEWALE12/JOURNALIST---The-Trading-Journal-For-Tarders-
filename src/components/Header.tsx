import { Sliders, Sun, Moon, Plus, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const {
    themeClasses, isDarkMode, setIsDarkMode, setMobileMenuOpen,
    user, handleOpenNewTradeModal,
  } = useApp();

  return (
    <header className={`h-16 border-b px-4 md:px-6 flex justify-between items-center shrink-0 ${themeClasses.bgPanel} ${themeClasses.border}`}>
      <div className="flex items-center">
        <button onClick={() => setMobileMenuOpen(prev => !prev)}
          className="p-1 rounded md:hidden text-gray-400 hover:text-white mr-3 shrink-0 cursor-pointer">
          <Sliders className="w-5 h-5 rotate-90" />
        </button>
        <div className={`text-xs md:text-sm font-semibold flex items-center gap-2 font-mono ${themeClasses.textMain}`}>
          <span>JOURNALIST</span>
          <span className={`hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
            {user ? 'DATABASE SECURE' : 'OFFLINE MODE'}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2 md:space-x-3">
        <button onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-8.5 h-8.5 rounded border flex items-center justify-center transition cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.bgHover}`}>
          {isDarkMode ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-black" />}
        </button>
        <button onClick={handleOpenNewTradeModal}
          className={`px-3 py-1.5 rounded text-xs font-semibold tracking-tight transition shadow-sm flex items-center gap-1 cursor-pointer ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Trade Record</span><span className="sm:hidden">Add</span>
        </button>
        <div className={`w-8 h-8 rounded border flex items-center justify-center cursor-pointer relative transition ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.bgHover}`}>
          <Bell className={`w-4 h-4 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`} />
          <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full animate-ping ${isDarkMode ? 'bg-white' : 'bg-black'}`} />
        </div>
      </div>
    </header>
  );
}
