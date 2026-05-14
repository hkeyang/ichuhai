-- 0003_telegram_login_sessions.sql
-- 一次性 Telegram 深链登录会话
-- issue 时写 pending；webhook /start <token> 进来后填 telegram_* 和 user_id，status=completed；
-- poll 成功读取后 status=consumed；超过 expires_at 由后续清理或轮询时标记 expired。

CREATE TABLE IF NOT EXISTS telegram_login_sessions (
  token TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','completed','consumed','expired')),
  telegram_id TEXT,
  telegram_username TEXT,
  telegram_first_name TEXT,
  telegram_last_name TEXT,
  user_id TEXT,
  issued_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tg_login_sessions_expires ON telegram_login_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_tg_login_sessions_status ON telegram_login_sessions(status);
