-- 0001_initial.sql
-- Cloudflare D1 初始化 Schema
-- ichuhai 虚拟数字商品商城

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- 商品表
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL DEFAULT 'more',
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','hidden','archived')),
  delivery_type TEXT NOT NULL DEFAULT 'manual' CHECK(delivery_type IN ('auto','manual','mixed')),
  base_currency TEXT NOT NULL DEFAULT 'USDT',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);

-- SKU 表
CREATE TABLE skus (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  option_values TEXT NOT NULL DEFAULT '{}',  -- JSON
  price_usdt TEXT NOT NULL,
  stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK(stock_status IN ('in_stock','low_stock','sold_out')),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  delivery_type TEXT NOT NULL DEFAULT 'manual' CHECK(delivery_type IN ('auto','manual','mixed')),
  is_default INTEGER NOT NULL DEFAULT 0,
  is_recommended INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_skus_product_id ON skus(product_id);

-- 支付网络表
CREATE TABLE payment_networks (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  token_standard TEXT NOT NULL,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  is_recommended INTEGER NOT NULL DEFAULT 0,
  address TEXT NOT NULL,
  confirmations INTEGER NOT NULL DEFAULT 1,
  warning_text TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 汇率表
CREATE TABLE exchange_rates (
  currency TEXT PRIMARY KEY,
  rate TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  telegram_id TEXT NOT NULL UNIQUE,
  telegram_username TEXT NOT NULL,
  default_currency TEXT NOT NULL DEFAULT 'CNY',
  last_login_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_telegram_id ON users(telegram_id);

-- 订单表
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_no TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  sku_id TEXT NOT NULL,
  product_snapshot TEXT NOT NULL,  -- JSON
  sku_snapshot TEXT NOT NULL,      -- JSON
  telegram_username TEXT NOT NULL,
  email TEXT NOT NULL,
  amount_usdt TEXT NOT NULL,
  fiat_currency TEXT NOT NULL DEFAULT 'USD',
  fiat_amount_snapshot TEXT,
  exchange_rate_snapshot TEXT,
  payment_currency TEXT NOT NULL DEFAULT 'USDT',
  payment_network TEXT NOT NULL,
  payment_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK(status IN ('created','pending_payment','payment_confirming','paid','delivering','completed','expired','failed','refunding','refunded')),
  tx_hash TEXT,
  paid_at TEXT,
  delivered_at TEXT,
  admin_note TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_tx_hash ON orders(tx_hash);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_telegram ON orders(telegram_username);

-- 发货记录表
CREATE TABLE deliveries (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  method TEXT NOT NULL,
  operator TEXT,
  channel TEXT NOT NULL DEFAULT '["telegram","email"]',  -- JSON array
  masked_content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);

-- 通知记录表
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  channel TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message_id TEXT,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_notifications_order_id ON notifications(order_id);

-- 工单表
CREATE TABLE support_tickets (
  id TEXT PRIMARY KEY,
  ticket_no TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL REFERENCES orders(id),
  order_no TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'after_sales',
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','resolved','closed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_tickets_order_id ON support_tickets(order_id);

-- 审计日志表
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  target_id TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  metadata TEXT DEFAULT '{}',  -- JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_target ON audit_logs(target, target_id);

-- 库存项表（加密存储）
CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY,
  sku_id TEXT NOT NULL REFERENCES skus(id),
  masked_value TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','reserved','delivered','revoked')),
  order_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_inventory_sku ON inventory_items(sku_id, status);
