// src/lib/api/types.ts
// D1 数据库行类型定义，与 migrations/0001_initial.sql 中的表结构对应

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  product_type?: string | null;
  subtitle?: string | null;
  description?: string | null;
  icon_url?: string | null;
  cover_url?: string | null;
  tags_json?: string | null;
  purchase_notice?: string | null;
  after_sale_rule?: string | null;
  status: "active" | "hidden" | "archived";
  delivery_type: "auto" | "manual" | "mixed";
  base_currency: string;
  created_at: string;
  updated_at: string;
}

export interface SkuRow {
  id: string;
  product_id: string;
  option_values: string; // JSON string
  price_usdt: string;
  stock_status: "in_stock" | "low_stock" | "sold_out";
  stock_quantity: number;
  delivery_type: "auto" | "manual" | "mixed";
  is_default: number; // SQLite boolean (0 | 1)
  is_recommended: number; // SQLite boolean (0 | 1)
  created_at: string;
  updated_at: string;
}

export interface PaymentNetworkRow {
  id: string;
  code: string;
  display_name: string;
  token_standard: string;
  is_enabled: number; // SQLite boolean (0 | 1)
  is_recommended: number; // SQLite boolean (0 | 1)
  address: string;
  confirmations: number;
  warning_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: string;
  order_no: string;
  product_id: string;
  sku_id: string;
  product_snapshot: string; // JSON
  sku_snapshot: string; // JSON
  telegram_username: string;
  email: string;
  amount_usdt: string;
  fiat_currency: string;
  fiat_amount_snapshot: string | null;
  exchange_rate_snapshot: string | null;
  payment_currency: string;
  payment_network: string;
  payment_address: string;
  status: string;
  tx_hash: string | null;
  paid_at: string | null;
  delivered_at: string | null;
  admin_note: string | null;
  expires_at: string;
  payment_provider?: string | null;
  provider_payment_id?: string | null;
  provider_payment_status?: string | null;
  provider_payment_url?: string | null;
  provider_payload_json?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRow {
  id: string;
  telegram_id: string;
  telegram_username: string;
  default_currency: string;
  last_login_at: string;
  created_at: string;
}

export interface DeliveryRow {
  id: string;
  order_id: string;
  method: string;
  operator: string | null;
  channel: string; // JSON array
  masked_content: string;
  encrypted_content: string | null;
  status: string;
  failure_reason: string | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  order_id: string | null;
  channel: string;
  type: string;
  provider: string;
  status: string;
  message_id: string | null;
  error: string | null;
  created_at: string;
}

export interface SupportTicketRow {
  id: string;
  ticket_no: string;
  order_id: string;
  order_no: string;
  type: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
}

export interface AuditLogRow {
  id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  target: string;
  target_id: string;
  ip: string | null;
  user_agent: string | null;
  metadata: string; // JSON
  created_at: string;
}

export interface InventoryItemRow {
  id: string;
  sku_id: string;
  masked_value: string;
  encrypted_value: string;
  status: "available" | "reserved" | "delivered" | "revoked";
  order_id: string | null;
  created_at: string;
}
