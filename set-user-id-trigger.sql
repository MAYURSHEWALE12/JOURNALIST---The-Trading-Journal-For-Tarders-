-- Run in Supabase SQL Editor
-- Auto-set user_id on trades and accounts if not provided

CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_trades_user_id ON trades;
CREATE TRIGGER set_trades_user_id
  BEFORE INSERT ON public.trades
  FOR EACH ROW
  WHEN (NEW.user_id IS NULL)
  EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_accounts_user_id ON accounts;
CREATE TRIGGER set_accounts_user_id
  BEFORE INSERT ON public.accounts
  FOR EACH ROW
  WHEN (NEW.user_id IS NULL)
  EXECUTE FUNCTION public.set_user_id();
