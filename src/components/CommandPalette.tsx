import { Search, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { exportTradesToPDF } from '../lib/pdfExporter';

export default function CommandPalette() {
  const navigate = useNavigate();
  const {
    isDarkMode, isCommandOpen, setIsCommandOpen,
    handleCommandAction, handleOpenNewTradeModal, accounts,
    activeAccountId, setActiveAccountId, activeAccount,
    activeTrades, computedStats, user, calendarDays, setIsExportingPDF
  } = useApp();

  useEffect(() => {
    if (!isCommandOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen, setIsCommandOpen]);

  if (!isCommandOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
      onClick={() => setIsCommandOpen(false)}
    >
      <div 
        className={`border w-full max-w-xl rounded shadow-2xl overflow-hidden font-sans transition-all duration-200 cursor-default ${isDarkMode ? 'bg-[#121212] border-border-active' : 'bg-[#f0f0f0] border-gray-400'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-4 border-b flex items-center space-x-3 ${isDarkMode ? 'border-border-subtle' : 'border-gray-200'}`}>
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Type a workspace command or search assets..."
            className={`w-full bg-transparent text-sm border-none focus:outline-none ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-black placeholder-gray-400'}`}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsCommandOpen(false);
              }
            }}
          />
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded text-gray-500 ${isDarkMode ? 'bg-black border border-border-subtle' : 'bg-[#ffffff] border border-gray-300'}`}>ESC</span>
        </div>
        <div className={`p-2 divide-y text-xs ${isDarkMode ? 'divide-border-subtle/55' : 'divide-gray-200'}`}>
          <div className="py-2.5">
            <span className="px-3 text-[10px] font-mono uppercase text-gray-500 tracking-wider">Quick Actions</span>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => handleCommandAction(handleOpenNewTradeModal)}
                className={`w-full text-left px-3 py-2 rounded flex justify-between items-center transition-colors duration-150 cursor-pointer ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#1a1a1a]' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}
              >
                <span className="flex items-center gap-2">
                  <Plus className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-black'}`} />
                  Create a New Trade Record
                </span>
                <span className="text-[9px] font-mono text-gray-500">Shortcut P</span>
              </button>
              <button
                onClick={() => handleCommandAction(async () => { setIsExportingPDF(true); try { await exportTradesToPDF(activeTrades, computedStats, accounts.find(a => a.id === activeAccountId), user, calendarDays); } finally { setIsExportingPDF(false); } })}
                className={`w-full text-left px-3 py-2 rounded flex justify-between items-center transition-colors duration-150 cursor-pointer ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#1a1a1a]' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-file-text w-4 h-4 ${isDarkMode ? 'text-white' : 'text-black'}`} aria-hidden="true">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>
                  </svg>
                  Export Performance PDF Report
                </span>
                <span className="text-[9px] font-mono text-gray-500">Shortcut Print</span>
              </button>
              <button
                onClick={() => handleCommandAction(() => {
                  if (accounts.length > 0) {
                    const currentIdx = accounts.findIndex(a => a.id === activeAccountId);
                    const nextIdx = (currentIdx + 1) % accounts.length;
                    setActiveAccountId(accounts[nextIdx].id);
                  }
                })}
                className={`w-full text-left px-3 py-2 rounded flex justify-between items-center transition-colors duration-150 cursor-pointer ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#1a1a1a]' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`lucide lucide-sliders-vertical w-4 h-4 ${isDarkMode ? 'text-white' : 'text-black'}`} aria-hidden="true">
                    <path d="M10 8h4"></path><path d="M12 21v-9"></path><path d="M12 8V3"></path><path d="M17 16h4"></path><path d="M19 12V3"></path><path d="M19 21v-5"></path><path d="M3 14h4"></path><path d="M5 10V3"></path><path d="M5 21v-7"></path>
                  </svg>
                  Toggle Active Trading Account
                </span>
                <span className="text-[9px] font-mono text-gray-500">{activeAccount}</span>
              </button>
            </div>
          </div>
          <div className="py-2.5">
            <span className="px-3 text-[10px] font-mono uppercase text-gray-500 tracking-wider">Navigate Screens</span>
            <div className="mt-2 space-y-1">
                    <button 
                    onClick={() => handleCommandAction(() => navigate('/dashboard'))}
                    className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors duration-150 cursor-pointer ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#1a1a1a]' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`lucide lucide-compass w-4.5 h-4.5 ${isDarkMode ? 'text-white' : 'text-black'}`} aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"></path></svg>
                    Workspace Dashboard
                  </button>
                  <button 
                    onClick={() => handleCommandAction(() => navigate('/analytics'))}
                    className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors duration-150 cursor-pointer ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#1a1a1a]' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`lucide lucide-chart-column w-4.5 h-4.5 ${isDarkMode ? 'text-white' : 'text-black'}`} aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
                    Advanced Analytics
                  </button>
                  <button 
                    onClick={() => handleCommandAction(() => navigate('/timeline'))}
                    className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors duration-150 cursor-pointer ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-[#1a1a1a]' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`lucide lucide-book-open w-4.5 h-4.5 ${isDarkMode ? 'text-white' : 'text-black'}`} aria-hidden="true"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
                    Journal Timeline View
                  </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
