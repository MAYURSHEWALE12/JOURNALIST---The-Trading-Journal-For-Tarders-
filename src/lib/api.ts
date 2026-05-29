import type { Trade, Account, User } from '../types';

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('journalist_jwt');
  return token
    ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

export async function fetchAccounts(): Promise<Account[]> {
  const res = await fetch('/api/accounts', { headers: authHeaders() });
  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('API server offline.');
  return res.json();
}

export async function fetchTrades(): Promise<Trade[]> {
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
  const res = await fetch('/api/trades', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(trade),
  });
  if (!res.ok) throw new Error('Failed to save trade.');
}

export async function updateTrade(id: string, trade: Partial<Trade>): Promise<void> {
  const res = await fetch(`/api/trades/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(trade),
  });
  if (!res.ok) throw new Error('Failed to update trade.');
}

export async function deleteTrade(id: string): Promise<void> {
  const res = await fetch(`/api/trades/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete trade.');
}

export async function createAccount(account: Account): Promise<void> {
  const res = await fetch('/api/accounts', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(account),
  });
  if (!res.ok) throw new Error('Failed to save account.');
}

export async function deleteAccount(id: string): Promise<void> {
  const res = await fetch(`/api/accounts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete account.');
}

export async function authRegister(body: { username: string; email: string; password: string }): Promise<{ token: string; user: User }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed.');
  return data;
}

export async function authLogin(body: { email: string; password: string }): Promise<{ token: string; user: User }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed.');
  return data;
}

export async function authForgotPassword(email: string): Promise<{ message?: string; devMode?: boolean; otp?: string; error?: string }> {
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

export async function authMe(): Promise<User> {
  const res = await fetch('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('journalist_jwt')}` },
  });
  if (!res.ok) throw new Error('UNAUTHORIZED');
  return res.json();
}

export function safeParseArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'string') {
    try { return JSON.parse(val) as string[]; } catch { return []; }
  }
  return [];
}
