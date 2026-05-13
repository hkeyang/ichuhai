let bootstrapPromise: Promise<void> | null = null;

const schemaSql = `
CREATE TABLE IF NOT EXISTS products (
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
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE TABLE IF NOT EXISTS skus (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  option_values TEXT NOT NULL DEFAULT '{}',
  price_usdt TEXT NOT NULL,
  stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK(stock_status IN ('in_stock','low_stock','sold_out')),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  delivery_type TEXT NOT NULL DEFAULT 'manual' CHECK(delivery_type IN ('auto','manual','mixed')),
  is_default INTEGER NOT NULL DEFAULT 0,
  is_recommended INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_skus_product_id ON skus(product_id);
CREATE TABLE IF NOT EXISTS payment_networks (
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
CREATE TABLE IF NOT EXISTS exchange_rates (
  currency TEXT PRIMARY KEY,
  rate TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  telegram_id TEXT NOT NULL UNIQUE,
  telegram_username TEXT NOT NULL,
  default_currency TEXT NOT NULL DEFAULT 'CNY',
  last_login_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_no TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  sku_id TEXT NOT NULL,
  product_snapshot TEXT NOT NULL,
  sku_snapshot TEXT NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_tx_hash ON orders(tx_hash);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_telegram ON orders(telegram_username);
CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  method TEXT NOT NULL,
  operator TEXT,
  channel TEXT NOT NULL DEFAULT '["telegram","email"]',
  masked_content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE TABLE IF NOT EXISTS notifications (
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
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);
CREATE TABLE IF NOT EXISTS support_tickets (
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
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON support_tickets(order_id);
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  target_id TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_logs(target, target_id);
CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  sku_id TEXT NOT NULL REFERENCES skus(id),
  masked_value TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','reserved','delivered','revoked')),
  order_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_items(sku_id, status);
`;

const seedSql = `
INSERT OR IGNORE INTO products (id, slug, name, category_id, status, delivery_type) VALUES
  ('discord-nitro','discord-nitro','Discord Nitro','social','active','auto'),
  ('spotify-premium','spotify-premium','Spotify Premium','music','active','auto'),
  ('youtube-premium','youtube-premium','YouTube Premium','video','active','mixed'),
  ('steam-wallet','steam-wallet','Steam Wallet','game','active','manual'),
  ('microsoft-365','microsoft-365','Microsoft 365','software','active','auto');
INSERT OR IGNORE INTO skus (id, product_id, option_values, price_usdt, stock_status, delivery_type, is_default) VALUES
  ('dn-g-new-1','discord-nitro','{"region":"Global","account_type":"新号","duration":"1个月"}','1.80','in_stock','auto',1),
  ('dn-g-new-3','discord-nitro','{"region":"Global","account_type":"新号","duration":"3个月"}','4.80','in_stock','auto',0),
  ('dn-g-new-12','discord-nitro','{"region":"Global","account_type":"新号","duration":"12个月"}','16.20','in_stock','auto',0),
  ('dn-us-old-1','discord-nitro','{"region":"US","account_type":"老号","duration":"1个月"}','2.10','low_stock','manual',0),
  ('dn-eu-share-3','discord-nitro','{"region":"EU","account_type":"共享","duration":"3个月"}','3.90','in_stock','auto',0),
  ('dn-jp-new-1','discord-nitro','{"region":"JP","account_type":"新号","duration":"1个月"}','2.30','sold_out','manual',0),
  ('sp-1','spotify-premium','{"duration":"1个月"}','2.20','in_stock','auto',1),
  ('sp-3','spotify-premium','{"duration":"3个月"}','6.10','in_stock','auto',0),
  ('sp-12','spotify-premium','{"duration":"12个月"}','21.80','low_stock','auto',0),
  ('yt-g-1','youtube-premium','{"region":"Global","duration":"1个月"}','2.50','in_stock','auto',1),
  ('yt-us-12','youtube-premium','{"region":"US","duration":"12个月"}','24.00','in_stock','manual',0),
  ('sw-5','steam-wallet','{"amount":"5 USD"}','5.00','in_stock','manual',1),
  ('sw-10','steam-wallet','{"amount":"10 USD"}','10.00','in_stock','manual',0),
  ('sw-20','steam-wallet','{"amount":"20 USD"}','20.00','low_stock','manual',0),
  ('ms-personal','microsoft-365','{"plan":"个人版"}','3.50','in_stock','auto',1),
  ('ms-family','microsoft-365','{"plan":"家庭版"}','8.80','in_stock','auto',0);
INSERT OR IGNORE INTO payment_networks (id, code, display_name, token_standard, is_enabled, is_recommended, address, confirmations) VALUES
  ('net_tron','TRON','TRON','TRC20',1,1,'TXL8d1e7hVKZy8vY8g9a6n3sJX4mP6u6wJ',1),
  ('net_eth','ETH','ETH','ERC20',1,0,'0x7fE9A4b11cE5A9E2fA40eB3fA2465d9E4c07F001',12),
  ('net_bsc','BSC','BSC','BEP20',1,0,'0xB35b2C2f9B5f3A7D61d5b3f82D82d9a89Ce7b002',15),
  ('net_base','BASE','BASE','ERC20',1,0,'0xBA5E000000000000000000000000000000000001',12);
INSERT OR IGNORE INTO exchange_rates (currency, rate) VALUES
  ('USD','1'),('CNY','7.22'),('GBP','0.79'),('EUR','0.93'),('AUD','1.52'),('JPY','155'),('HKD','7.82'),('KRW','1360');
`;

export async function ensureDatabaseReady(db: D1Database): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const statements = `${schemaSql}\n${seedSql}`
        .split(";")
        .map((statement) => statement.trim())
        .filter(Boolean);
      for (let index = 0; index < statements.length; index += 20) {
        await db.batch(statements.slice(index, index + 20).map((statement) => db.prepare(statement)));
      }
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }
  await bootstrapPromise;
}
