import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './screens/LandingPage';
import AuthPage from './screens/AuthPage';
import ForgotPassword from './screens/ForgotPassword';
import ResetPassword from './screens/ResetPassword';
import Dashboard from './screens/Dashboard';
import Analytics from './screens/Analytics';
import Timeline from './screens/Timeline';
import TradeDetail from './screens/TradeDetail';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CursorFollower from './components/CursorFollower';
import CommandPalette from './components/CommandPalette';
import NewTradeModal from './components/NewTradeModal';
import NewAccountModal from './components/NewAccountModal';
import EditTradeModal from './components/EditTradeModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ScreenshotModal from './components/ScreenshotModal';

function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { themeClasses } = useApp();

  return (
    <div className={`min-h-screen flex select-none relative transition-colors duration-200 ${themeClasses.bgBase}`}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto w-full">
        <Header />
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {children}
        </div>
      </main>
      <CommandPalette />
      <NewTradeModal />
      <NewAccountModal />
      <EditTradeModal />
      <DeleteConfirmModal />
      <ScreenshotModal />
    </div>
  );
}

function EmptyAccountsPage() {
  const { themeClasses, isDarkMode, setIsAddAccountOpen } = useApp();

  return (
    <div className={`border rounded-xl p-12 text-center max-w-xl mx-auto space-y-5 my-12 ${themeClasses.bgPanel} ${themeClasses.border}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 animate-pulse"><line x1="4" x2="4" y1="21" y2="14"></line><line x1="4" x2="4" y1="10" y2="3"></line><line x1="12" x2="12" y1="21" y2="12"></line><line x1="12" x2="12" y1="8" y2="3"></line><line x1="20" x2="20" y1="21" y2="16"></line><line x1="20" x2="20" y1="12" y2="3"></line></svg>
      </div>
      <div className="space-y-2">
        <h3 className={`font-display font-bold text-lg ${themeClasses.textMain}`}>Create your first trading account</h3>
        <p className={`text-xs max-w-md mx-auto leading-relaxed ${themeClasses.textSub}`}>
          Journalist supports isolated journals per trading account. Add an account to start documenting trades, psychology, and advanced analytics.
        </p>
      </div>
      <button onClick={() => setIsAddAccountOpen(true)}
        className={`px-5 py-2.5 rounded text-xs font-bold transition cursor-pointer ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
        ＋ Scaffold First Account
      </button>
    </div>
  );
}

function DashboardPage() {
  const { accounts } = useApp();
  if (accounts.length === 0) return <EmptyAccountsPage />;
  return <Dashboard />;
}

function AnalyticsPage() {
  const { accounts } = useApp();
  if (accounts.length === 0) return <EmptyAccountsPage />;
  return <Analytics />;
}

function TimelinePage() {
  const { accounts } = useApp();
  if (accounts.length === 0) return <EmptyAccountsPage />;
  return <Timeline />;
}

function TradeDetailPage() {
  const { accounts } = useApp();
  if (accounts.length === 0) return <EmptyAccountsPage />;
  return <TradeDetail />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<WorkspaceLayout><DashboardPage /></WorkspaceLayout>} />
          <Route path="/analytics" element={<WorkspaceLayout><AnalyticsPage /></WorkspaceLayout>} />
          <Route path="/timeline" element={<WorkspaceLayout><TimelinePage /></WorkspaceLayout>} />
          <Route path="/trade/:tradeId" element={<WorkspaceLayout><TradeDetailPage /></WorkspaceLayout>} />
        </Routes>
        <CursorFollower />
      </AppProvider>
    </BrowserRouter>
  );
}
