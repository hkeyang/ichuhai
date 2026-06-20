-- 0005_email_accounts.sql
-- 邮箱+密码账号体系：
--   1) 放宽 users.telegram_id / telegram_username 的 NOT NULL 约束（邮箱用户没有 telegram 信息）
--      并新增 email / password_hash / email_verified / nickname 列。
--      SQLite 无法直接修改列约束，需 重命名旧表 → 建新表 → 拷贝 → 删旧表。
--   2) 新增 email_verifications 表，存注册邮箱验证码（哈希存储，限次 + 过期）。

-- ── 1) 重建 users 表 ───────────────────────────────────────────────
ALTER TABLE users RENAME TO users_legacy;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  telegram_id TEXT UNIQUE,
  telegram_username TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  nickname TEXT,
  default_currency TEXT NOT NULL DEFAULT 'CNY',
  last_login_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO users (id, telegram_id, telegram_username, default_currency, last_login_at, created_at)
SELECT id, telegram_id, telegram_username, default_currency, last_login_at, created_at
FROM users_legacy;

DROP TABLE users_legacy;

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── 2) 邮箱验证码表 ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_verifications (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'register' CHECK(purpose IN ('register','reset')),
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires ON email_verifications(expires_at);
