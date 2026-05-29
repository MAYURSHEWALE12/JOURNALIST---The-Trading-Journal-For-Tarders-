-- Run this in Supabase Dashboard → SQL Editor
-- It uses the email from auth.users to find your Google user UUID, then inserts old trades

DO $$
DECLARE
  target_user_id uuid;
  acc_id text := 'acc-3695';
  existing_acc integer;
BEGIN
  -- Find your Google user by email (change if different!)
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'mvshewale2003@gmail.com';
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'No auth user found with email mvshewale2003@gmail.com.';
  END IF;

  RAISE NOTICE 'Using user UUID: %', target_user_id;

  -- Insert account if not exists
  SELECT COUNT(*) INTO existing_acc FROM public.accounts WHERE id = acc_id;
  IF existing_acc = 0 THEN
    INSERT INTO public.accounts (id, name, type, "createdAt", "accountSize", user_id)
    VALUES (acc_id, 'Binance', 'Crypto', '2026-05-28T20:55:10.047Z', 400, target_user_id);
    RAISE NOTICE 'Account acc-3695 created.';
  ELSE
    RAISE NOTICE 'Account acc-3695 already exists, updating user_id.';
    UPDATE public.accounts SET user_id = target_user_id WHERE id = acc_id;
  END IF;

  -- Insert trades (skip duplicates by id)
  INSERT INTO public.trades (id, asset, direction, status, "entryPrice", "exitPrice", quantity, "entryTime", "exitTime", "netPnl", "plannedR", "realizedR", strategy, tags, notes, "emotionalState", "accountId", "screenshotUrl", user_id)
  VALUES
    ('TRD-570', 'TRXUSDT', 'LONG', 'WIN', 0.1, 0.2, 300, '2026-05-28T20:56:18.755Z', '2026-05-28T20:56:18.755Z', 10, 2, 2, 'ICT Silver Bullet', '["Scalp"]', '1 day 0.5 fib zone and took entry on 1 hour tf', '["Calm"]', acc_id, 'https://www.tradingview.com/x/3ixI2CPP/', target_user_id),
    ('TRD-558', 'BTCUSDT', 'LONG', 'WIN', 2000, 30000, 1, '2026-05-28T20:57:24.556Z', '2026-05-28T20:57:24.556Z', 20, 2, 2, 'ICT Silver Bullet', '[]', 'Took this trade as it was on daily 0.5 fib level and then shifted to low tf 1 hour, saw entry confirmation', '[]', acc_id, 'https://www.tradingview.com/x/jp5CpY9q/', target_user_id),
    ('TRD-1780041882930-8971', 'TRXUSDT', 'SHORT', 'LOSS', 0.1, 0.09, 300, '2026-05-29T08:04:42.930Z', '2026-05-29T08:04:42.930Z', -10, 2, 2, 'ICT Silver Bullet', '["SCALP"]', 'TEST', '["Calm"]', acc_id, 'https://www.tradingview.com/x/AS8q7lLa/', target_user_id),
    ('TRD-1780042422729-3704', 'LTCUSDT', 'LONG', 'BREAKEVEN', 20, 30, 400, '2026-05-29T08:13:42.729Z', '2026-05-29T08:13:42.729Z', 0, 2, 2, 'ICT Silver Bullet', '["SCALP"]', 'TEST', '["Calm"]', acc_id, '["https://www.tradingview.com/x/o2sqCWYt/","https://www.tradingview.com/x/wBVCPscU/"]', target_user_id),
    ('TRD-1780042968868-2187', 'BNBUSDT', 'SHORT', 'WIN', 300, 290, 500, '2026-05-29T08:22:48.868Z', '2026-05-29T08:22:48.868Z', 30, 2, 2, 'ICT Silver Bullet', '["SCALP"]', 'No description provided.', '["Neutral"]', acc_id, '["https://www.tradingview.com/x/CiusCcfK/","https://www.tradingview.com/x/J162YDOI/","https://www.tradingview.com/x/pYsoHn4y/"]', target_user_id),
    ('TRD-1780052621657-5699', 'XRPUSDT', 'LONG', 'WIN', 1, 2, 400, '2026-05-19T12:00:00.000Z', '2026-05-19T12:00:00.000Z', 18, 2, 2, 'ICT Silver Bullet', '["TEST"]', 'TEST', '["Calm"]', acc_id, '["https://www.tradingview.com/x/OvJY21AV/"]', target_user_id)
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Migration complete! 6 trades inserted.';
END $$;
