import type { Trade, Account, User, DayNote } from '../types';
import { isSupabaseConfigured, getSupabase } from './supabase';

// ─── Helpers ───────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('journalist_jwt');
  return token
    ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

export function safeParseArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'string') {
    try { return JSON.parse(val) as string[]; } catch { return []; }
  }
  return [];
}

function isSupabaseSession(): boolean {
  return isSupabaseConfigured();
}

async function supabaseFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  return res;
}

let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

function getAccessToken(): string | null {
  return _accessToken;
}

// ─── Accounts ──────────────────────────────────────────────────

export async function fetchAccounts(): Promise<Account[]> {
  if (isSupabaseSession()) {
    const res = await supabaseFetch('/accounts?select=*');
    if (!res.ok) throw new Error('UNAUTHORIZED');
    return (await res.json()) as unknown as Account[];
  }
  const res = await fetch('/api/accounts', { headers: authHeaders() });
  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('API server offline.');
  return res.json();
}

export async function createAccount(account: Account): Promise<void> {
  if (isSupabaseSession()) {
    const res = await supabaseFetch('/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    });
    if (!res.ok) throw new Error('Failed to save account.');
    return;
  }
  const res = await fetch('/api/accounts', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(account),
  });
  if (!res.ok) throw new Error('Failed to save account.');
}

export async function deleteAccount(id: string): Promise<void> {
  if (isSupabaseSession()) {
    const res = await supabaseFetch(`/accounts?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete account.');
    return;
  }
  const res = await fetch(`/api/accounts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete account.');
}

// ─── Day Notes ────────────────────────────────────────────────

export async function fetchMonthNotes(month: string): Promise<DayNote[]> {
  if (isSupabaseSession()) {
    const res = await supabaseFetch(`/day_notes?select=*&date=like=${month}%`);
    if (!res.ok) throw new Error('Failed to fetch day notes.');
    return res.json() as unknown as DayNote[];
  }
  const res = await fetch(`/api/day-notes?month=${encodeURIComponent(month)}`, { headers: authHeaders() });
  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('API server offline.');
  return res.json();
}

export async function upsertDayNote(date: string, content: string): Promise<void> {
  if (isSupabaseSession()) {
    const res = await supabaseFetch(`/day_notes?date=eq.${encodeURIComponent(date)}`, {
      method: 'PUT',
      body: JSON.stringify({ date, content }),
    });
    if (!res.ok) throw new Error('Failed to save day note.');
    return;
  }
  const res = await fetch(`/api/day-notes/${encodeURIComponent(date)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to save day note.');
}

// ─── Trades ─────────────────────────────────────────────────────

export async function fetchTrades(): Promise<Trade[]> {
  if (isSupabaseSession()) {
    const res = await supabaseFetch('/trades?select=*&order=entryTime.desc');
    if (!res.ok) throw new Error('UNAUTHORIZED');
    const data = await res.json() as Array<Record<string, unknown>>;
    return data.map((row) => ({
      ...row,
      tags: safeParseArray(row.tags),
      emotionalState: safeParseArray(row.emotionalState),
    })) as unknown as Trade[];
  }
  const res = await fetch('/api/trades', { headers: authHeaders() });
  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('API server offline.');
  const data = await res.json() as Array<Record<string, unknown>>;
  return data.map((row) => ({
    ...row,
    tags: safeParseArray(row.tags),
    emotionalState: safeParseArray(row.emotionalState),
  })) as unknown as Trade[];
}

export async function createTrade(trade: Trade): Promise<void> {
  if (isSupabaseSession()) {
    const res = await supabaseFetch('/trades', {
      method: 'POST',
      body: JSON.stringify(trade),
    });
    if (!res.ok) throw new Error('Failed to save trade.');
    return;
  }
  const res = await fetch('/api/trades', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(trade),
  });
  if (!res.ok) throw new Error('Failed to save trade.');
}

export async function updateTrade(id: string, trade: Partial<Trade>): Promise<void> {
  if (isSupabaseSession()) {
    const res = await supabaseFetch(`/trades?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(trade),
    });
    if (!res.ok) throw new Error('Failed to update trade.');
    return;
  }
  const res = await fetch(`/api/trades/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(trade),
  });
  if (!res.ok) throw new Error('Failed to update trade.');
}

export async function deleteTrade(id: string): Promise<void> {
  if (isSupabaseSession()) {
    const res = await supabaseFetch(`/trades?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete trade.');
    return;
  }
  const res = await fetch(`/api/trades/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete trade.');
}

// ─── Auth ───────────────────────────────────────────────────────

export async function authRegister(body: { username: string; email: string; password: string }): Promise<{ token: string; user: User }> {
  if (isSupabaseSession()) {
    const { data, error } = await getSupabase().auth.signUp({
      email: body.email,
      password: body.password,
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Registration failed.');

    // Create profile entry
    await supabaseFetch('/profiles', {
      method: 'POST',
      body: JSON.stringify({ id: data.user.id, username: body.username, email: body.email }),
    });

    // If email confirmation is required, session will be null
    if (!data.session) {
      throw new Error('✅ Account created! Check your email to confirm your account before logging in.');
    }

    const user: User = { id: data.user.id, username: body.username, email: body.email };
    return { token: data.session?.access_token || '', user };
  }
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Registration failed.');
  return result;
}

export async function updateProfile(id: string, updates: {
  username?: string;
  avatar_url?: string;
  trading_bio?: string;
  twitter_handle?: string;
  telegram_handle?: string;
}): Promise<void> {
  if (isSupabaseSession()) {
    const res = await supabaseFetch(`/profiles?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update public profile.');
    return;
  }
  const res = await fetch(`/api/profiles/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update public profile.');
}

export async function updateProfileUsername(id: string, username: string): Promise<void> {
  return updateProfile(id, { username });
}


export async function authLogin(body: { email: string; password: string }): Promise<{ token: string; user: User }> {
  if (isSupabaseSession()) {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Login failed.');

    const profileRes = await supabaseFetch(`/profiles?select=username,email&id=eq.${data.user.id}`);
    const profiles = await profileRes.json() as Array<{ username: string; email: string }>;
    const profile = profiles?.[0] || null;

    const user: User = {
      id: data.user.id,
      username: profile?.username || body.email.split('@')[0],
      email: profile?.email || body.email,
    };
    return { token: data.session?.access_token || '', user };
  }
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Login failed.');
  return result;
}

export async function authLogout(): Promise<void> {
  if (isSupabaseSession()) {
    await getSupabase().auth.signOut();
    return;
  }
}

export async function authSignInWithGoogle(): Promise<void> {
  const { error } = await getSupabase().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/dashboard',
    },
  });
  if (error) throw new Error(error.message);
}

export async function authLinkGoogle(): Promise<void> {
  const { error } = await getSupabase().auth.linkIdentity({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/dashboard',
    },
  });
  if (error) throw new Error(error.message);
}

export async function authSetPassword(password: string): Promise<void> {
  const { error } = await getSupabase().auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

export async function authMe(): Promise<User> {
  if (isSupabaseSession()) {
    const { data, error } = await getSupabase().auth.getUser();
    if (error || !data.user) throw new Error('UNAUTHORIZED');

    const { user: authUser } = data;
    const displayName = authUser.user_metadata?.username
      || authUser.user_metadata?.full_name
      || authUser.user_metadata?.name
      || authUser.email?.split('@')[0]
      || 'Trader';
    const email = authUser.email || '';

    const avatarUrl = authUser.user_metadata?.avatar_url || '';
    const tradingBio = authUser.user_metadata?.trading_bio || '';
    const twitterHandle = authUser.user_metadata?.twitter_handle || '';
    const telegramHandle = authUser.user_metadata?.telegram_handle || '';

    // Get or create profile — insert is handled by DB trigger
    try {
      const profileRes = await supabaseFetch(`/profiles?select=username,email,avatar_url,trading_bio,twitter_handle,telegram_handle&id=eq.${authUser.id}`);
      const profiles = await profileRes.json() as Array<{
        username: string;
        email: string;
        avatar_url?: string;
        trading_bio?: string;
        twitter_handle?: string;
        telegram_handle?: string;
      }>;
      const profile = profiles?.[0] || null;

      if (profile) {
        return {
          id: authUser.id,
          username: profile.username,
          email: profile.email,
          avatarUrl: profile.avatar_url || avatarUrl,
          tradingBio: profile.trading_bio || tradingBio,
          twitterHandle: profile.twitter_handle || twitterHandle,
          telegramHandle: profile.telegram_handle || telegramHandle,
        };
      } else {
        // Self-healing: if no profile exists (e.g. Gmail login without DB trigger), create it now
        try {
          await supabaseFetch('/profiles', {
            method: 'POST',
            body: JSON.stringify({
              id: authUser.id,
              username: displayName,
              email: email,
              avatar_url: avatarUrl,
              trading_bio: tradingBio,
              twitter_handle: twitterHandle,
              telegram_handle: telegramHandle,
            }),
          });
        } catch (err) {
          console.error('Failed to auto-create public profile:', err);
        }
      }
    } catch {
      // Fallback to metadata
    }

    return {
      id: authUser.id,
      username: displayName,
      email,
      avatarUrl,
      tradingBio,
      twitterHandle,
      telegramHandle,
    };
  }
  const res = await fetch('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('journalist_jwt')}` },
  });
  if (!res.ok) throw new Error('UNAUTHORIZED');
  return res.json();
}

// ─── Auth helpers (password reset, change password) ──

export async function authForgotPassword(email: string): Promise<{ message?: string; devMode?: boolean; otp?: string; error?: string }> {
  if (isSupabaseSession()) {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw new Error(error.message);
    return { message: 'Check your email for a password reset link.' };
  }
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send reset email.');
  return data;
}

export async function authResetPassword(email: string, token: string, password: string): Promise<{ message?: string; error?: string }> {
  if (isSupabaseSession()) {
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) throw new Error(error.message);
    return { message: 'Password updated successfully.' };
  }
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset password.');
  return data;
}

export async function authChangePassword(oldPassword: string, newPassword: string): Promise<{ message?: string; error?: string }> {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to change password.');
  return data;
}
