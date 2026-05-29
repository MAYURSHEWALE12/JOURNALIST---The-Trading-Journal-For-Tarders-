import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './screens/LandingPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CursorFollower from './components/CursorFollower';
import CommandPalette from './components/CommandPalette';
import NewTradeModal from './components/NewTradeModal';
import NewAccountModal from './components/NewAccountModal';
import EditTradeModal from './components/EditTradeModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ScreenshotModal from './components/ScreenshotModal';
import SettingsModal from './components/SettingsModal';

const AuthPage = lazy(() => import('./screens/AuthPage'));
const ForgotPassword = lazy(() => import('./screens/ForgotPassword'));
const ResetPassword = lazy(() => import('./screens/ResetPassword'));
const Dashboard = lazy(() => import('./screens/Dashboard'));
const Analytics = lazy(() => import('./screens/Analytics'));
const Timeline = lazy(() => import('./screens/Timeline'));
const TradeDetail = lazy(() => import('./screens/TradeDetail'));
const Calendar = lazy(() => import('./screens/Calendar'));

function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { themeClasses } = useApp();

  return (
    <div className={`min-h-screen flex select-none relative transition-colors duration-200 ${themeClasses.bgBase}`}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto w-full">
        <Header />
        <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {children}
        </div>
      </main>
      <CommandPalette />
      <NewTradeModal />
      <NewAccountModal />
      <EditTradeModal />
      <DeleteConfirmModal />
      <ScreenshotModal />
      <SettingsModal />
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

function CalendarPage() {
  const { accounts } = useApp();
  if (accounts.length === 0) return <EmptyAccountsPage />;
  return <Calendar />;
}

function ExportingOverlay() {
  const { isExportingPDF } = useApp();
  if (!isExportingPDF) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <span className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-white text-xs font-mono tracking-wider">Generating PDF Statement...</span>
      </div>
    </div>
  );
}

function AppSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <span className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppProvider>
          <AppSuspense>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<WorkspaceLayout><DashboardPage /></WorkspaceLayout>} />
              <Route path="/analytics" element={<WorkspaceLayout><AnalyticsPage /></WorkspaceLayout>} />
              <Route path="/timeline" element={<WorkspaceLayout><TimelinePage /></WorkspaceLayout>} />
              <Route path="/calendar" element={<WorkspaceLayout><CalendarPage /></WorkspaceLayout>} />
              <Route path="/trade/:tradeId" element={<WorkspaceLayout><TradeDetailPage /></WorkspaceLayout>} />
            </Routes>
            <CursorFollower />
            <ExportingOverlay />
          </AppSuspense>
        </AppProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
