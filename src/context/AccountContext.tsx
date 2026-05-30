import { createContext, useContext, useState, useMemo, useEffect, useCallback, type ReactNode, type Dispatch, type SetStateAction, type FormEvent } from 'react';
import type { Account, NewAccountData } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import * as api from '../lib/api';
import { useAuth } from './AuthContext';

export interface AccountContextValue {
  accounts: Account[];
  activeAccountId: string;
  setActiveAccountId: Dispatch<SetStateAction<string>>;
  activeAccount: string;
  isAddAccountOpen: boolean;
  setIsAddAccountOpen: Dispatch<SetStateAction<boolean>>;
  newAccountData: NewAccountData;
  setNewAccountData: Dispatch<SetStateAction<NewAccountData>>;
  handleAddNewAccount: (e: FormEvent) => Promise<void>;
  isCreatingAccount: boolean;
  loadAccountsFromServer: () => Promise<void>;
  handleDeleteAccount: (id: string) => Promise<void>;
}

const AccountContext = createContext<AccountContextValue>(null as unknown as AccountContextValue);

// eslint-disable-next-line react-refresh/only-export-components
export function useAccounts() {
  return useContext(AccountContext);
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const { user, handleLogOut } = useAuth();

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('journalist_sandbox_accounts');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeAccountId, setActiveAccountId] = useState<string>(() => {
    return localStorage.getItem('journalist_active_account_id') || '';
  });
  useEffect(() => {
    if (activeAccountId) localStorage.setItem('journalist_active_account_id', activeAccountId);
  }, [activeAccountId]);

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccountData, setNewAccountData] = useState<NewAccountData>({ name: '', type: 'Crypto', accountSize: '' });
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const activeAccount = useMemo(() => {
    const acc = accounts.find(a => a.id === activeAccountId);
    return acc ? acc.name : 'Crypto Ledger';
  }, [accounts, activeAccountId]);

  const loadAccountsFromServer = useCallback(async () => {
    const token = localStorage.getItem('journalist_jwt');
    if (!token && !isSupabaseConfigured()) return;
    try {
      const data = await api.fetchAccounts();
      if (data.length > 0) {
        setAccounts(data);
        localStorage.setItem('journalist_sandbox_accounts', JSON.stringify(data));
        setActiveAccountId(prev => {
          const saved = localStorage.getItem('journalist_active_account_id');
          if (saved && data.some((a: Account) => a.id === saved)) return saved;
          if (prev && data.some((a: Account) => a.id === prev)) return prev;
          return data[0].id;
        });
      }
    } catch (err) {
      if ((err as Error).message === 'UNAUTHORIZED') { handleLogOut(); return; }
      const saved = localStorage.getItem('journalist_sandbox_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAccounts(parsed);
        setActiveAccountId(prev => {
          const savedId = localStorage.getItem('journalist_active_account_id');
          if (savedId && parsed.some((a: Account) => a.id === savedId)) return savedId;
          if (prev && parsed.some((a: Account) => a.id === prev)) return prev;
          return parsed.length > 0 ? parsed[0].id : '';
        });
      }
    }
  }, [handleLogOut]);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccounts([]);
      setActiveAccountId('');
      return;
    }
    if (accounts.length === 0) {
      loadAccountsFromServer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAddNewAccount = async (e: FormEvent) => {
    e.preventDefault();
    if (!newAccountData.name.trim()) return;
    setIsCreatingAccount(true);
    const newAcc: Account = {
      id: `acc-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newAccountData.name,
      type: newAccountData.type,
      createdAt: new Date().toISOString(),
      accountSize: parseFloat(newAccountData.accountSize) || 0,
      user_id: user?.id,
    };
    try {
      await api.createAccount(newAcc);
      await loadAccountsFromServer();
      setActiveAccountId(newAcc.id);
    } catch {
      setAccounts(prev => {
        const updated = [...prev, newAcc];
        localStorage.setItem('journalist_sandbox_accounts', JSON.stringify(updated));
        return updated;
      });
      setActiveAccountId(newAcc.id);
    }
    setIsCreatingAccount(false);
    setIsAddAccountOpen(false);
    setNewAccountData({ name: '', type: 'Crypto', accountSize: '' });
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await api.deleteAccount(id);
      setAccounts(prev => {
        const updated = prev.filter(acc => acc.id !== id);
        localStorage.setItem('journalist_sandbox_accounts', JSON.stringify(updated));
        return updated;
      });
    } catch {
      setAccounts(prev => {
        const updated = prev.filter(acc => acc.id !== id);
        localStorage.setItem('journalist_sandbox_accounts', JSON.stringify(updated));
        return updated;
      });
    }

    if (id === activeAccountId) {
      setAccounts(prev => {
        const remaining = prev.filter(acc => acc.id !== id);
        if (remaining.length > 0) {
          setActiveAccountId(remaining[0].id);
        } else {
          setActiveAccountId('');
        }
        return prev;
      });
    }
  };

  const value: AccountContextValue = {
    accounts, activeAccountId, setActiveAccountId, activeAccount,
    isAddAccountOpen, setIsAddAccountOpen, newAccountData, setNewAccountData,
    handleAddNewAccount, isCreatingAccount, loadAccountsFromServer, handleDeleteAccount,
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}
