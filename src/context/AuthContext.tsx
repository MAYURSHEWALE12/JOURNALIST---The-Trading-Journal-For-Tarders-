import { createContext, useContext, useState, useCallback, type ReactNode, type Dispatch, type SetStateAction, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import * as api from '../lib/api';

export interface AuthContextValue {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  handleLogOut: () => void;
  isSignUpMode: boolean;
  setIsSignUpMode: (v: boolean) => void;
  authEmail: string;
  setAuthEmail: (v: string) => void;
  authPassword: string;
  setAuthPassword: (v: string) => void;
  authUsername: string;
  setAuthUsername: (v: string) => void;
  authError: string;
  setAuthError: (v: string) => void;
  authLoading: boolean;
  setAuthLoading: (v: boolean) => void;
  handleAuthSubmit: (e: FormEvent) => Promise<void>;

  forgotEmail: string;
  setForgotEmail: (v: string) => void;
  forgotLoading: boolean;
  forgotError: string;
  setForgotError: (v: string) => void;
  forgotSent: boolean;
  setForgotSent: (v: boolean) => void;
  forgotResetUrl: string;
  handleForgotPassword: () => Promise<void>;

  resetPassword: string;
  setResetPassword: (v: string) => void;
  resetLoading: boolean;
  resetError: string;
  setResetError: (v: string) => void;
  handleResetPassword: (token: string, email: string) => Promise<void>;

  showChangePassword: boolean;
  setShowChangePassword: (v: boolean) => void;
  changeOldPassword: string;
  setChangeOldPassword: (v: string) => void;
  changeNewPassword: string;
  setChangeNewPassword: (v: string) => void;
  changeLoading: boolean;
  changeError: string;
  changeMessage: string;
  setChangeMessage: (v: string) => void;
  handleChangePassword: () => Promise<void>;

  updateUserProfile: (updates: Partial<Omit<User, 'id' | 'email'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>(null as unknown as AuthContextValue);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children, onLoginSuccess }: { children: ReactNode; onLoginSuccess?: () => void }) {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('journalist_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotResetUrl, setForgotResetUrl] = useState('');

  const [resetPassword, setResetPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changeOldPassword, setChangeOldPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeMessage, setChangeMessage] = useState('');

  const handleLogOut = useCallback(() => {
    setUser(null);
    api.authLogout();
    localStorage.removeItem('journalist_user');
    localStorage.removeItem('journalist_jwt');
    localStorage.removeItem('journalist_active_screen');
    localStorage.removeItem('journalist_sandbox_accounts');
    localStorage.removeItem('journalist_sandbox_trades');
    localStorage.removeItem('journalist_active_account_id');
    navigate('/');
  }, [navigate]);

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const data = isSignUpMode
        ? await api.authRegister({ username: authUsername.trim(), email: authEmail.trim(), password: authPassword })
        : await api.authLogin({ email: authEmail.trim(), password: authPassword });
      localStorage.setItem('journalist_jwt', data.token);
      localStorage.setItem('journalist_user', JSON.stringify(data.user));
      localStorage.setItem('journalist_active_screen', 'DASHBOARD');
      setUser(data.user);
      setAuthLoading(false);
      navigate('/dashboard');
      onLoginSuccess?.();
    } catch (err) {
      setAuthError((err as Error).message || 'Cannot connect to server.');
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = useCallback(async () => {
    if (!forgotEmail) { setForgotError('Enter your email address.'); return; }
    setForgotLoading(true); setForgotError(''); setForgotSent(false); setForgotResetUrl('');
    try {
      const data = await api.authForgotPassword(forgotEmail);
      setForgotSent(true);
      if (data.devMode && data.otp) {
        setForgotResetUrl(data.otp);
      }
    } catch (err) {
      setForgotError((err as Error).message);
    } finally {
      setForgotLoading(false);
    }
  }, [forgotEmail]);

  const handleResetPassword = useCallback(async (token: string, email: string) => {
    if (!resetPassword || resetPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }
    setResetLoading(true); setResetError('');
    try {
      await api.authResetPassword(email, token, resetPassword);
      setResetPassword('');
      navigate('/auth');
    } catch (err) {
      setResetError((err as Error).message);
    } finally {
      setResetLoading(false);
    }
  }, [resetPassword, navigate]);

  const handleChangePassword = useCallback(async () => {
    if (!changeOldPassword || !changeNewPassword) {
      setChangeError('Both fields are required.'); return;
    }
    if (changeNewPassword.length < 6) {
      setChangeError('New password must be at least 6 characters.'); return;
    }
    setChangeLoading(true); setChangeError(''); setChangeMessage('');
    try {
      const data = await api.authChangePassword(changeOldPassword, changeNewPassword);
      setChangeMessage(data.message || 'Password changed.');
      setChangeOldPassword('');
      setChangeNewPassword('');
    } catch (err) {
      setChangeError((err as Error).message);
    } finally {
      setChangeLoading(false);
    }
  }, [changeOldPassword, changeNewPassword]);

  const updateUserProfile = useCallback(async (updates: Partial<Omit<User, 'id' | 'email'>>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('journalist_user', JSON.stringify(updatedUser));

    if (isSupabaseConfigured()) {
      try {
        const { getSupabase } = await import('../lib/supabase');
        const supabase = getSupabase();
        await supabase.auth.updateUser({
          data: {
            username: updatedUser.username,
            avatar_url: updatedUser.avatarUrl,
            trading_bio: updatedUser.tradingBio,
            twitter_handle: updatedUser.twitterHandle,
            telegram_handle: updatedUser.telegramHandle,
          }
        });
        try {
          await api.updateProfile(user.id, {
            username: updatedUser.username,
            avatar_url: updatedUser.avatarUrl,
            trading_bio: updatedUser.tradingBio,
            twitter_handle: updatedUser.twitterHandle,
            telegram_handle: updatedUser.telegramHandle,
          });
        } catch (err) {
          console.error('Failed to sync profile to public profiles table:', err);
        }
      } catch (err) {
        console.error('Failed to sync profile to Supabase:', err);
      }
    }
  }, [user]);

  const value: AuthContextValue = {
    user, setUser, handleLogOut,
    isSignUpMode, setIsSignUpMode,
    authEmail, setAuthEmail, authPassword, setAuthPassword,
    authUsername, setAuthUsername, authError, setAuthError, authLoading, setAuthLoading,
    handleAuthSubmit,
    forgotEmail, setForgotEmail, forgotLoading, forgotError, setForgotError, forgotSent, setForgotSent, forgotResetUrl,
    handleForgotPassword,
    resetPassword, setResetPassword, resetLoading, resetError, setResetError,
    handleResetPassword,
    showChangePassword, setShowChangePassword,
    changeOldPassword, setChangeOldPassword, changeNewPassword, setChangeNewPassword,
    changeLoading, changeError, changeMessage, setChangeMessage,
    handleChangePassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
