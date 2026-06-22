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
  encrypted_content TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  failure_reason TEXT,
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
  ('net_tron','TRON','TRON','TRC20',1,1,'TPPHD2bUCbRLEt7aBMRoWQbD3aY69NnEe6',3),
  ('net_eth','ETH','ETH','ERC20',0,0,'0x7fE9A4b11cE5A9E2fA40eB3fA2465d9E4c07F001',12),
  ('net_bsc','BSC','BSC','BEP20',0,0,'0xB35b2C2f9B5f3A7D61d5b3f82D82d9a89Ce7b002',15),
  ('net_base','BASE','USDC Base','Base',0,0,'0xBA5E000000000000000000000000000000000001',12);
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
      await ensureOperationalSchema(db);
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }
  await bootstrapPromise;
}

async function columnExists(db: D1Database, table: string, column: string): Promise<boolean> {
  const result = await db.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
  return result.results.some((row) => row.name === column);
}

async function addColumn(db: D1Database, table: string, column: string, definition: string): Promise<void> {
  if (!(await columnExists(db, table, column))) {
    await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
  }
}

async function ensureOperationalSchema(db: D1Database): Promise<void> {
  const operationalSql = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS product_tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#22c55e',
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS purchase_fields (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  field_key TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'select',
  required INTEGER NOT NULL DEFAULT 1,
  affects_sku INTEGER NOT NULL DEFAULT 0,
  affects_price INTEGER NOT NULL DEFAULT 0,
  affects_stock INTEGER NOT NULL DEFAULT 0,
  show_in_summary INTEGER NOT NULL DEFAULT 1,
  show_in_user_detail INTEGER NOT NULL DEFAULT 1,
  show_in_admin_detail INTEGER NOT NULL DEFAULT 1,
  placeholder TEXT,
  help_text TEXT,
  default_value TEXT,
  options_json TEXT NOT NULL DEFAULT '[]',
  min_value INTEGER,
  max_value INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(product_id, field_key)
);
CREATE TABLE IF NOT EXISTS inventory_batches (
  id TEXT PRIMARY KEY,
  sku_id TEXT NOT NULL REFERENCES skus(id),
  product_id TEXT,
  type TEXT NOT NULL DEFAULT 'card',
  total_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  duplicate_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  empty_count INTEGER NOT NULL DEFAULT 0,
  operator_id TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  tx_hash TEXT NOT NULL UNIQUE,
  network TEXT NOT NULL,
  token TEXT NOT NULL DEFAULT 'USDT',
  from_address TEXT,
  to_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  confirmations INTEGER NOT NULL DEFAULT 0,
  matched_order_id TEXT,
  matched_order_no TEXT,
  match_status TEXT NOT NULL DEFAULT 'unmatched',
  detected_at TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS ticket_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES support_tickets(id),
  author_type TEXT NOT NULL DEFAULT 'admin',
  content TEXT NOT NULL,
  internal INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS content_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '通用',
  sort_order INTEGER NOT NULL DEFAULT 0,
  default_open INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS purchase_note_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'subscription',
  content TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS notification_templates (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS blacklists (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  value TEXT NOT NULL,
  reason TEXT NOT NULL,
  effect TEXT NOT NULL DEFAULT 'block_order',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(kind, value)
);
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'amount',
  discount_value TEXT NOT NULL,
  min_amount TEXT,
  usage_limit INTEGER,
  per_user_limit INTEGER,
  starts_at TEXT,
  ends_at TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'super_admin',
  status TEXT NOT NULL DEFAULT 'active',
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS role_permissions (
  role TEXT PRIMARY KEY,
  permissions_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
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
CREATE INDEX IF NOT EXISTS idx_purchase_fields_product ON purchase_fields(product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(match_status);
CREATE INDEX IF NOT EXISTS idx_blacklists_status ON blacklists(status);
INSERT OR IGNORE INTO categories (id, name, key, icon, sort_order) VALUES
  ('cat_social','社交','social','message-circle',10),
  ('cat_music','音乐','music','music',20),
  ('cat_video','视频','video','play',30),
  ('cat_game','游戏','game','gamepad-2',40),
  ('cat_software','软件','software','app-window',50),
  ('cat_more','更多','more','more-horizontal',90);
INSERT OR IGNORE INTO product_tags (id, name, color, icon, sort_order) VALUES
  ('tag_auto','自动发货','#16a34a','zap',10),
  ('tag_hot','热门','#ef4444','flame',20),
  ('tag_new','新品','#2563eb','sparkles',30),
  ('tag_low','低价','#f59e0b','badge-dollar-sign',40);
INSERT OR IGNORE INTO content_settings (key, value_json) VALUES
  ('home','{"heroTitle":"全球数字商品即时交付","heroSubtitle":"USDT 安全支付，自动发货与人工售后并行。","benefits":["即时发货","安全支付","7x24 支持"]}'),
  ('platform保障','{"items":["库存加密保存","支付异常人工核验","关键操作审计"]}');
INSERT OR IGNORE INTO notification_templates (id, type, title, content) VALUES
  ('tpl_order_created','order_created','订单已创建','订单 {{orderNo}} 已创建，请在有效期内支付。'),
  ('tpl_paid','payment_success','支付成功','订单 {{orderNo}} 已确认到账，系统正在发货。'),
  ('tpl_delivered','delivery_success','发货成功','订单 {{orderNo}} 已发货：{{deliveryContent}}'),
  ('tpl_stock','stock_warning','库存预警','{{skuName}} 可用库存低于预警值。');
INSERT OR IGNORE INTO purchase_note_templates (id, name, product_type, content) VALUES
  ('note_subscription','订阅类购买须知','subscription','自动发货 1-3 分钟到账；请确认账号地区与套餐周期；30 天保障按商品说明执行。'),
  ('note_card','卡密类购买须知','card','付款后在订单详情查看卡密；卡密发出后请尽快兑换；库存异常会转人工处理。'),
  ('note_account','账号类购买须知','account','账号密码自动发货；请及时修改密码并妥善保存；禁止转售共享。'),
  ('note_recharge','充值类购买须知','recharge','请确认充值账号无误；通常 5-15 分钟完成；填错账号不支持退款。');
INSERT OR IGNORE INTO admin_users (id, username, email, role, status) VALUES
  ('admin_seed','admin','admin@example.com','super_admin','active');
INSERT OR IGNORE INTO role_permissions (role, permissions_json) VALUES
  ('super_admin','["*"]'),
  ('operation','["product.view","product.edit","sku.edit","inventory.import","order.view"]'),
  ('support','["order.view","ticket.reply","delivery.manual"]'),
  ('finance','["payment.view","payment.confirm","refund.record"]'),
  ('readonly','["*.view"]');
`;
  const statements = operationalSql.split(";").map((statement) => statement.trim()).filter(Boolean);
  for (let index = 0; index < statements.length; index += 20) {
    await db.batch(statements.slice(index, index + 20).map((statement) => db.prepare(statement)));
  }

  await addColumn(db, "products", "product_type", "TEXT NOT NULL DEFAULT 'subscription'");
  await addColumn(db, "products", "subtitle", "TEXT");
  await addColumn(db, "products", "description", "TEXT");
  await addColumn(db, "products", "icon_url", "TEXT");
  await addColumn(db, "products", "cover_url", "TEXT");
  await addColumn(db, "products", "tags_json", "TEXT NOT NULL DEFAULT '[]'");
  await addColumn(db, "products", "purchase_notice", "TEXT");
  await addColumn(db, "products", "after_sale_rule", "TEXT");
  await addColumn(db, "products", "is_home_visible", "INTEGER NOT NULL DEFAULT 1");
  await addColumn(db, "products", "is_recommended", "INTEGER NOT NULL DEFAULT 0");
  await addColumn(db, "products", "sort_order", "INTEGER NOT NULL DEFAULT 0");
  await addColumn(db, "skus", "sku_name", "TEXT");
  await addColumn(db, "skus", "price_cny", "TEXT");
  await addColumn(db, "skus", "compare_price_usdt", "TEXT");
  await addColumn(db, "skus", "cost_usdt", "TEXT");
  await addColumn(db, "skus", "stock_type", "TEXT NOT NULL DEFAULT 'limited'");
  await addColumn(db, "skus", "warning_stock", "INTEGER NOT NULL DEFAULT 5");
  await addColumn(db, "skus", "min_quantity", "INTEGER NOT NULL DEFAULT 1");
  await addColumn(db, "skus", "max_quantity", "INTEGER NOT NULL DEFAULT 1");
  await addColumn(db, "skus", "disabled_reason", "TEXT");
  await addColumn(db, "skus", "sort_order", "INTEGER NOT NULL DEFAULT 0");
  await addColumn(db, "inventory_items", "product_id", "TEXT");
  await addColumn(db, "inventory_items", "type", "TEXT NOT NULL DEFAULT 'card'");
  await addColumn(db, "inventory_items", "import_batch_id", "TEXT");
  await addColumn(db, "inventory_items", "remark", "TEXT");
  await addColumn(db, "inventory_items", "locked_at", "TEXT");
  await addColumn(db, "inventory_items", "sold_at", "TEXT");
  await addColumn(db, "orders", "quantity", "INTEGER NOT NULL DEFAULT 1");
  await addColumn(db, "orders", "payment_status", "TEXT NOT NULL DEFAULT 'unpaid'");
  await addColumn(db, "orders", "delivery_status", "TEXT NOT NULL DEFAULT 'undelivered'");
  await addColumn(db, "orders", "after_sale_status", "TEXT NOT NULL DEFAULT 'none'");
  await addColumn(db, "orders", "user_input_json", "TEXT NOT NULL DEFAULT '{}'");
  await addColumn(db, "orders", "payment_provider", "TEXT");
  await addColumn(db, "orders", "provider_payment_id", "TEXT");
  await addColumn(db, "orders", "provider_payment_status", "TEXT");
  await addColumn(db, "orders", "provider_payment_url", "TEXT");
  await addColumn(db, "orders", "provider_payload_json", "TEXT NOT NULL DEFAULT '{}'");
  await addColumn(db, "payment_transactions", "exception_type", "TEXT");
  await addColumn(db, "deliveries", "encrypted_content", "TEXT");
  await addColumn(db, "deliveries", "status", "TEXT NOT NULL DEFAULT 'sent'");
  await addColumn(db, "deliveries", "failure_reason", "TEXT");

  await ensureUsersEmailSchema(db);

  await db.prepare("UPDATE payment_networks SET is_enabled = CASE WHEN code = 'TRON' THEN 1 ELSE 0 END, is_recommended = CASE WHEN code = 'TRON' THEN 1 ELSE 0 END, confirmations = CASE WHEN code = 'TRON' THEN 3 ELSE confirmations END, updated_at = datetime('now')").run();
  await db.prepare("UPDATE payment_networks SET address = 'TPPHD2bUCbRLEt7aBMRoWQbD3aY69NnEe6', updated_at = datetime('now') WHERE code = 'TRON' AND address = 'TXL8d1e7hVKZy8vY8g9a6n3sJX4mP6u6wJ'").run();
}

/**
 * 邮箱账号体系的 users 表演进：
 *  - 旧库 users.telegram_id 是 NOT NULL UNIQUE，邮箱用户没有 telegram_id，必须放宽。
 *    SQLite 不能直接改列约束，需 重命名 → 建新表 → 拷贝 → 删旧表。
 *  - 新库（内联 DDL 已是新结构）只需补齐 email 相关列即可。
 */
async function ensureUsersEmailSchema(db: D1Database): Promise<void> {
  const info = await db.prepare("PRAGMA table_info(users)").all<{ name: string; notnull: number }>();
  if (!info.results.length) return; // 表还没建（理论上不会发生，schemaSql 已建）

  const telegramIdCol = info.results.find((row) => row.name === "telegram_id");
  const needsRebuild = telegramIdCol ? telegramIdCol.notnull === 1 : false;

  if (needsRebuild) {
    // 旧库：重建表以放宽 telegram_id / telegram_username 约束并补列
    const statements = [
      "ALTER TABLE users RENAME TO users_legacy_email_migration",
      `CREATE TABLE users (
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
      )`,
      `INSERT INTO users (id, telegram_id, telegram_username, default_currency, last_login_at, created_at)
        SELECT id, telegram_id, telegram_username, default_currency, last_login_at, created_at
        FROM users_legacy_email_migration`,
      "DROP TABLE users_legacy_email_migration",
      "CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id)",
      "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
    ];
    for (const sql of statements) {
      await db.prepare(sql).run();
    }
    return;
  }

  // 新结构：幂等补列（兼容介于两版之间的库）
  await addColumn(db, "users", "email", "TEXT");
  await addColumn(db, "users", "password_hash", "TEXT");
  await addColumn(db, "users", "email_verified", "INTEGER NOT NULL DEFAULT 0");
  await addColumn(db, "users", "nickname", "TEXT");
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)").run();
}
