import { Sliders, Sun, Moon, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LogoIcon from './LogoIcon';

export default function Header() {
  const {
    themeClasses, isDarkMode, setIsDarkMode, setMobileMenuOpen,
    user, handleOpenNewTradeModal,
  } = useApp();

  return (
    <header className={`h-16 border-b px-4 md:px-8 flex justify-between items-center shrink-0 ${themeClasses.bgPanel} ${themeClasses.border}`}>
      <div className="flex items-center">
        <button onClick={() => setMobileMenuOpen(prev => !prev)}
          className="p-1 rounded md:hidden text-gray-400 hover:text-white mr-3 shrink-0 cursor-pointer">
          <Sliders className="w-5 h-5 rotate-90" />
        </button>
        <div className={`text-sm md:text-base font-bold flex items-center gap-3 font-mono tracking-wide ${themeClasses.textMain}`}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-white' : 'bg-black'}`}>
              <LogoIcon className="w-3.5 h-3.5" isDark={isDarkMode} />
            </div>
            <span>JOURNALIST</span>
          </div>
          <span className={`hidden sm:inline-block px-2.5 py-0.5 rounded text-[9px] md:text-[10px] font-mono font-bold tracking-wider ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
            {user ? 'DATABASE' : 'OFFLINE'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <button onClick={handleOpenNewTradeModal}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold tracking-tight transition shadow-sm flex items-center gap-1.5 cursor-pointer ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Trade</span><span className="sm:hidden">Add</span>
        </button>
        <button onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-8 md:w-9 h-8 md:h-9 rounded-lg border flex items-center justify-center transition cursor-pointer ${themeClasses.bgCard} ${themeClasses.border} ${themeClasses.bgHover}`}>
          {isDarkMode ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-black" />}
        </button>
      </div>
    </header>
  );
}
