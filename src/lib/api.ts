import type { Trade, Account, User } from '../types';
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

// ─── Accounts ──────────────────────────────────────────────────

export async function fetchAccounts(): Promise<Account[]> {
  if (isSupabaseSession()) {
    const { data, error } = await getSupabase().from('accounts').select('*');
    if (error) throw new Error(error.message);
    return (data || []) as unknown as Account[];
  }
  const res = await fetch('/api/accounts', { headers: authHeaders() });
  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('API server offline.');
  return res.json();
}

export async function createAccount(account: Account): Promise<void> {
  if (isSupabaseSession()) {
    const { error } = await getSupabase().from('accounts').insert(account as never);
    if (error) throw new Error(error.message);
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
    const { error } = await getSupabase().from('accounts').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  const res = await fetch(`/api/accounts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete account.');
}

// ─── Trades ─────────────────────────────────────────────────────

export async function fetchTrades(): Promise<Trade[]> {
  if (isSupabaseSession()) {
    const { data, error } = await getSupabase()
      .from('trades')
      .select('*')
      .order('entryTime', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map((row: Record<string, unknown>) => ({
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
    const { error } = await getSupabase().from('trades').insert(trade as never);
    if (error) throw new Error(error.message);
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
    const { error } = await getSupabase().from('trades').update(trade as never).eq('id', id);
    if (error) throw new Error(error.message);
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
    const { error } = await getSupabase().from('trades').delete().eq('id', id);
    if (error) throw new Error(error.message);
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
    await getSupabase().from('profiles').insert({
      id: data.user.id,
      username: body.username,
      email: body.email,
    } as never);

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

export async function authLogin(body: { email: string; password: string }): Promise<{ token: string; user: User }> {
  if (isSupabaseSession()) {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Login failed.');

    const { data: profile } = await getSupabase()
      .from('profiles')
      .select('username, email')
      .eq('id', data.user.id)
      .maybeSingle() as unknown as { data: { username: string; email: string } | null; error: unknown };

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

    const { data: profile } = await getSupabase()
      .from('profiles')
      .select('username, email')
      .eq('id', data.user.id)
      .maybeSingle() as unknown as { data: { username: string; email: string } | null; error: unknown };

    // Auto-create profile for OAuth sign-ins (Google)
    if (!profile) {
      const displayName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Trader';
      const email = data.user.email || '';
      await getSupabase().from('profiles').insert({
        id: data.user.id,
        username: displayName,
        email,
      } as never);
      return { id: data.user.id, username: displayName, email };
    }

    return {
      id: data.user.id,
      username: profile?.username || data.user.email?.split('@')[0] || '',
      email: profile?.email || data.user.email || '',
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
