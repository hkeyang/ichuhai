ALTER TABLE users ADD COLUMN balance_usdt TEXT NOT NULL DEFAULT '0';

CREATE TABLE IF NOT EXISTS wallet_ledgers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,            -- recharge | consume | refund | adjust
  amount_usdt TEXT NOT NULL,     -- 正负字符串
  balance_after TEXT NOT NULL,   -- 该笔之后的余额快照
  status TEXT NOT NULL DEFAULT 'completed', -- pending | completed | failed
  method TEXT,
  note TEXT,
  reference_type TEXT,
  reference_id TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_wallet_ledgers_user ON wallet_ledgers(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_ledgers_status ON wallet_ledgers(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_ledgers_reference ON wallet_ledgers(reference_type, reference_id);
