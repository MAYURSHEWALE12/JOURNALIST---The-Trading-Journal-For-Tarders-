-- Run this in your Supabase project's SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- Profiles table (links to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Crypto',
  "accountSize" NUMERIC DEFAULT 0,
  "createdAt" TEXT DEFAULT '',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id TEXT PRIMARY KEY,
  asset TEXT NOT NULL,
  direction TEXT NOT NULL,
  status TEXT NOT NULL,
  "entryPrice" NUMERIC NOT NULL,
  "exitPrice" NUMERIC DEFAULT 0,
  quantity NUMERIC NOT NULL,
  "entryTime" TEXT NOT NULL,
  "exitTime" TEXT NOT NULL,
  "netPnl" NUMERIC DEFAULT 0,
  "plannedR" NUMERIC DEFAULT 0,
  "realizedR" NUMERIC DEFAULT 0,
  strategy TEXT DEFAULT '',
  tags JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  "emotionalState" JSONB DEFAULT '[]',
  "accountId" TEXT DEFAULT '',
  "screenshotUrl" TEXT DEFAULT '',
  "screenshotUrls" JSONB DEFAULT '[]',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_entry_time ON trades("entryTime");
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
