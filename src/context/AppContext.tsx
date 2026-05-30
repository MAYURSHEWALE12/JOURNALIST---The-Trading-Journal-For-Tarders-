import { createContext, useContext, useEffect, type ReactNode } from 'react';
import * as api from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';
import { UIProvider, useUI } from './UIContext';
import type { UIContextValue } from './UIContext';
import { AuthProvider, useAuth } from './AuthContext';
import type { AuthContextValue } from './AuthContext';
import { AccountProvider, useAccounts } from './AccountContext';
import type { AccountContextValue } from './AccountContext';
import { TradeProvider, useTrades } from './TradeContext';
import type { TradeContextValue } from './TradeContext';
import { AnalyticsProvider, useAnalytics } from './AnalyticsContext';
import type { AnalyticsContextValue } from './AnalyticsContext';

// Re-export all individual hooks for selective imports
// eslint-disable-next-line react-refresh/only-export-components
export { useUI } from './UIContext';
// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from './AuthContext';
// eslint-disable-next-line react-refresh/only-export-components
export { useAccounts } from './AccountContext';
// eslint-disable-next-line react-refresh/only-export-components
export { useTrades } from './TradeContext';
// eslint-disable-next-line react-refresh/only-export-components
export { useAnalytics } from './AnalyticsContext';

type CombinedValue = UIContextValue & AuthContextValue & AccountContextValue & TradeContextValue & AnalyticsContextValue;

const AppContext = createContext<CombinedValue>(null as unknown as CombinedValue);

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  return useContext(AppContext);
}

function AppCoordinator({ children }: { children: ReactNode }) {
  const ui = useUI();
  const auth = useAuth();
  const accounts = useAccounts();
  const trades = useTrades();
  const analytics = useAnalytics();

  useEffect(() => {
    const token = localStorage.getItem('journalist_jwt');
    const storedUser = localStorage.getItem('journalist_user');

    if (token && storedUser) {
      api.authMe()
        .then(async () => {
          await Promise.all([accounts.loadAccountsFromServer(), trades.loadTradesFromServer()]);
        })
        .catch(() => { auth.handleLogOut(); })
        .finally(() => { ui.setDataLoading(false); });
      return;
    }

    if (!isSupabaseConfigured()) { ui.setDataLoading(false); return; }

    let cancelled = false;

    (async () => {
      const { getSupabase } = await import('../lib/supabase');
      const supabase = getSupabase();

      const loadData = async () => {
        try {
          const su = await api.authMe();
          if (cancelled) return;
          auth.setUser(su);
          localStorage.setItem('journalist_user', JSON.stringify(su));
          await Promise.all([accounts.loadAccountsFromServer(), trades.loadTradesFromServer()]);
        } catch { /* failed */ }
        if (!cancelled) ui.setDataLoading(false);
      };

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (cancelled) return;
        if (session?.access_token) {
          api.setAccessToken(session.access_token);
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          loadData();
        }
      });

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data.session) {
        if (data.session.access_token) {
          api.setAccessToken(data.session.access_token);
        }
        await loadData();
      } else {
        setTimeout(() => {
          if (!cancelled) { ui.setDataLoading(false); subscription?.unsubscribe(); }
        }, 4000);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCommandAction = (action: () => void) => {
    action();
    ui.setIsCommandOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        ui.setIsCommandOpen(false);
        trades.setIsNewTradeOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const combined: CombinedValue = {
    ...ui,
    ...auth,
    ...accounts,
    ...trades,
    ...analytics,
    handleCommandAction,
  };

  return <AppContext.Provider value={combined}>{children}</AppContext.Provider>;
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <UIProvider>
      <AuthProvider onLoginSuccess={() => {}}>
        <AccountProvider>
          <TradeProvider>
            <AnalyticsProvider>
              <AppCoordinator>
                {children}
              </AppCoordinator>
            </AnalyticsProvider>
          </TradeProvider>
        </AccountProvider>
      </AuthProvider>
    </UIProvider>
  );
}
