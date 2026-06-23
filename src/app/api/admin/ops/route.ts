import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { verifyAdminSessionToken } from "@/lib/api/admin-session";
import { writeAuditLog } from "@/lib/api/audit";
import { encryptInventoryValue } from "@/lib/api/inventory-crypto";

type AnyRow = Record<string, unknown>;

const TABLES = {
  categories: "categories",
  tags: "product_tags",
  purchaseFields: "purchase_fields",
  inventory: "inventory_items",
  inventoryBatches: "inventory_batches",
  paymentTransactions: "payment_transactions",
  faqs: "faqs",
  noteTemplates: "purchase_note_templates",
  notificationTemplates: "notification_templates",
  content: "content_settings",
  blacklists: "blacklists",
  coupons: "coupons",
  adminUsers: "admin_users",
  roles: "role_permissions",
} as const;

async function requireAdmin(request: Request, env: CloudflareEnv) {
  const token = request.headers.get("x-admin-token") || "";
  if (env.NODE_ENV === "production") {
    const valid = await verifyAdminSessionToken(token, env);
    if (!valid) throw new HttpError(401, "admin auth required");
  }
}

function rowToCamel(row: AnyRow): AnyRow {
  const mapped: AnyRow = {};
  for (const [key, value] of Object.entries(row)) {
    mapped[key.replace(/_([a-z])/g, (_, char) => char.toUpperCase())] = parseJsonValue(value);
  }
  return mapped;
}

function parseJsonValue(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function text(value: unknown, fallback = "") {
  const output = String(value ?? fallback).trim();
  return output || fallback;
}

function boolInt(value: unknown, fallback = false) {
  return value === undefined ? (fallback ? 1 : 0) : value ? 1 : 0;
}

function maskValue(value: string): string {
  if (value.length <= 8) return "***";
  return `${value.slice(0, 4)}***${value.slice(-4)}`;
}

async function listAll(db: D1Database) {
  const [
    categories,
    tags,
    purchaseFields,
    inventory,
    batches,
    transactions,
    faqs,
    noteTemplates,
    notificationTemplates,
    content,
    blacklists,
    coupons,
    adminUsers,
    roles,
  ] = await db.batch<AnyRow>([
    db.prepare("SELECT * FROM categories ORDER BY sort_order ASC, created_at ASC"),
    db.prepare("SELECT * FROM product_tags ORDER BY sort_order ASC, created_at ASC"),
    db.prepare("SELECT * FROM purchase_fields ORDER BY product_id, sort_order ASC, created_at ASC"),
    db.prepare(`SELECT i.*, s.product_id AS sku_product_id, s.price_usdt, s.option_values, p.name AS product_name
                FROM inventory_items i
                LEFT JOIN skus s ON s.id = i.sku_id
                LEFT JOIN products p ON p.id = COALESCE(i.product_id, s.product_id)
                ORDER BY i.created_at DESC LIMIT 300`),
    db.prepare("SELECT * FROM inventory_batches ORDER BY created_at DESC LIMIT 100"),
    db.prepare("SELECT * FROM payment_transactions ORDER BY detected_at DESC LIMIT 200"),
    db.prepare("SELECT * FROM faqs ORDER BY sort_order ASC, created_at DESC"),
    db.prepare("SELECT * FROM purchase_note_templates ORDER BY product_type, created_at DESC"),
    db.prepare("SELECT * FROM notification_templates ORDER BY type ASC"),
    db.prepare("SELECT * FROM content_settings ORDER BY key ASC"),
    db.prepare("SELECT * FROM blacklists ORDER BY created_at DESC"),
    db.prepare("SELECT * FROM coupons ORDER BY created_at DESC"),
    db.prepare("SELECT * FROM admin_users ORDER BY created_at ASC"),
    db.prepare("SELECT * FROM role_permissions ORDER BY role ASC"),
  ]);

  return {
    categories: categories.results.map(rowToCamel),
    tags: tags.results.map(rowToCamel),
    purchaseFields: purchaseFields.results.map(rowToCamel),
    inventory: inventory.results.map(rowToCamel),
    inventoryBatches: batches.results.map(rowToCamel),
    paymentTransactions: transactions.results.map(rowToCamel),
    faqs: faqs.results.map(rowToCamel),
    noteTemplates: noteTemplates.results.map(rowToCamel),
    notificationTemplates: notificationTemplates.results.map(rowToCamel),
    content: content.results.map(rowToCamel),
    blacklists: blacklists.results.map(rowToCamel),
    coupons: coupons.results.map(rowToCamel),
    adminUsers: adminUsers.results.map(rowToCamel),
    roles: roles.results.map(rowToCamel),
  };
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;
  try {
    await requireAdmin(request, cloudflareEnv);
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);
    return jsonResponse(await listAll(db), 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    console.error("[GET /api/admin/ops] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;
  try {
    await requireAdmin(request, cloudflareEnv);
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);
    const body = await parseBody<Record<string, unknown>>(request);
    const action = text(body.action);

    if (action === "category.create") {
      const id = crypto.randomUUID();
      await db.prepare(`INSERT INTO categories (id, name, key, icon, sort_order, visible, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`)
        .bind(id, text(body.name, "新分类"), text(body.key, `cat-${Date.now()}`), text(body.icon, "more-horizontal"), Number(body.sortOrder ?? 0), boolInt(body.visible, true))
        .run();
      await writeAuditLog(db, request, { actorId: "admin", role: "admin" }, action, "category", id, body);
    } else if (action === "tag.create") {
      const id = crypto.randomUUID();
      await db.prepare(`INSERT INTO product_tags (id, name, color, icon, sort_order, enabled, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`)
        .bind(id, text(body.name, "新标签"), text(body.color, "#22c55e"), text(body.icon, "tag"), Number(body.sortOrder ?? 0), boolInt(body.enabled, true))
        .run();
      await writeAuditLog(db, request, { actorId: "admin", role: "admin" }, action, "tag", id, body);
    } else if (action === "category.update") {
      const catId = text(body.id);
      if (!catId) throw new HttpError(422, "category id is required");
      const fields: string[] = [];
      const binds: unknown[] = [];
      if (body.name !== undefined) { fields.push("name = ?"); binds.push(text(body.name)); }
      if (body.icon !== undefined) { fields.push("icon = ?"); binds.push(text(body.icon)); }
      if (body.sortOrder !== undefined) { fields.push("sort_order = ?"); binds.push(Number(body.sortOrder ?? 0)); }
      if (body.visible !== undefined) { fields.push("visible = ?"); binds.push(boolInt(body.visible, true)); }
      if (!fields.length) throw new HttpError(422, "no fields to update");
      fields.push("updated_at = datetime('now')");
      binds.push(catId);
      await db.prepare(`UPDATE categories SET ${fields.join(", ")} WHERE id = ? OR key = ?`).bind(...binds, catId).run();
      await writeAuditLog(db, request, { actorId: "admin", role: "admin" }, action, "category", catId, body);
    } else if (action === "tag.update") {
      const tagId = text(body.id);
      if (!tagId) throw new HttpError(422, "tag id is required");
      const fields: string[] = [];
      const binds: unknown[] = [];
      if (body.name !== undefined) { fields.push("name = ?"); binds.push(text(body.name)); }
      if (body.color !== undefined) { fields.push("color = ?"); binds.push(text(body.color)); }
      if (body.icon !== undefined) { fields.push("icon = ?"); binds.push(text(body.icon)); }
      if (body.sortOrder !== undefined) { fields.push("sort_order = ?"); binds.push(Number(body.sortOrder ?? 0)); }
      if (body.enabled !== undefined) { fields.push("enabled = ?"); binds.push(boolInt(body.enabled, true)); }
      if (!fields.length) throw new HttpError(422, "no fields to update");
      fields.push("updated_at = datetime('now')");
      binds.push(tagId);
      await db.prepare(`UPDATE product_tags SET ${fields.join(", ")} WHERE id = ? OR name = ?`).bind(...binds, tagId).run();
      await writeAuditLog(db, request, { actorId: "admin", role: "admin" }, action, "tag", tagId, body);
      const id = crypto.randomUUID();
      await db.prepare(`INSERT INTO purchase_fields
        (id, product_id, field_key, field_label, field_type, required, affects_sku, affects_price, affects_stock, show_in_summary, show_in_user_detail, show_in_admin_detail, placeholder, help_text, default_value, options_json, min_value, max_value, sort_order, visible, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`)
        .bind(
          id,
          text(body.productId),
          text(body.fieldKey, "field"),
          text(body.fieldLabel, "购买字段"),
          text(body.fieldType, "select"),
          boolInt(body.required, true),
          boolInt(body.affectsSku),
          boolInt(body.affectsPrice),
          boolInt(body.affectsStock),
          boolInt(body.showInSummary, true),
          boolInt(body.showInUserDetail, true),
          boolInt(body.showInAdminDetail, true),
          text(body.placeholder),
          text(body.helpText),
          text(body.defaultValue),
          JSON.stringify(body.options ?? []),
          body.minValue ?? null,
          body.maxValue ?? null,
          Number(body.sortOrder ?? 0),
          boolInt(body.visible, true)
        )
        .run();
      await writeAuditLog(db, request, { actorId: "admin", role: "admin" }, action, "purchase_field", id, body);
    } else if (action === "inventory.import") {
      const skuId = text(body.skuId);
      const productId = text(body.productId);
      const type = text(body.type, "card");
      const rawLines = Array.isArray(body.items) ? body.items : text(body.items).split(/\r?\n/);
      const normalized = rawLines.map((item) => text(item)).filter(Boolean);
      const batchId = crypto.randomUUID();
      let success = 0;
      let duplicate = 0;
      let failed = 0;
      for (const item of normalized) {
        const masked = maskValue(item);
        const existing = await db.prepare("SELECT id FROM inventory_items WHERE sku_id = ? AND masked_value = ? LIMIT 1").bind(skuId, masked).first();
        if (existing) {
          duplicate += 1;
          continue;
        }
        try {
          const encrypted = await encryptInventoryValue(item, cloudflareEnv.INVENTORY_ENCRYPTION_KEY || "dev-inventory-key");
          await db.prepare(`INSERT INTO inventory_items (id, sku_id, product_id, type, masked_value, encrypted_value, status, order_id, import_batch_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'available', NULL, ?, datetime('now'))`)
            .bind(crypto.randomUUID(), skuId, productId || null, type, masked, encrypted, batchId)
            .run();
          success += 1;
        } catch {
          failed += 1;
        }
      }
      await db.prepare(`INSERT INTO inventory_batches (id, sku_id, product_id, type, total_count, success_count, duplicate_count, failed_count, empty_count, operator_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin', datetime('now'))`)
        .bind(batchId, skuId, productId || null, type, rawLines.length, success, duplicate, failed, rawLines.length - normalized.length)
        .run();
      await writeAuditLog(db, request, { actorId: "admin", role: "admin" }, action, "inventory_batch", batchId, { skuId, type, success, duplicate, failed });
    } else if (action === "paymentTransaction.create") {
      const id = crypto.randomUUID();
      await db.prepare(`INSERT INTO payment_transactions (id, tx_hash, network, token, from_address, to_address, amount, confirmations, matched_order_no, match_status, note, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`)
        .bind(id, text(body.txHash, `manual-${Date.now()}`), text(body.network, "TRON"), text(body.token, "USDT"), text(body.fromAddress), text(body.toAddress), text(body.amount, "0"), Number(body.confirmations ?? 0), text(body.orderNo), text(body.matchStatus, "manual_confirm"), text(body.note))
        .run();
      await writeAuditLog(db, request, { actorId: "admin", role: "admin" }, action, "payment_transaction", id, body);
    } else if (action === "faq.create") {
      const id = crypto.randomUUID();
      await db.prepare(`INSERT INTO faqs (id, question, answer, category, sort_order, default_open, visible, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`)
        .bind(id, text(body.question, "常见问题"), text(body.answer, "答案内容"), text(body.category, "通用"), Number(body.sortOrder ?? 0), boolInt(body.defaultOpen), boolInt(body.visible, true))
        .run();
      await writeAuditLog(db, request, { actorId: "admin", role: "admin" }, action, "faq", id, body);
    } else if (action === "content.save") {
      await db.prepare(`INSERT INTO content_settings (key, value_json, updated_at) VALUES (?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = datetime('now')`)
        .bind(text(body.key, "home"), JSON.stringify(body.value ?? {}))
        .run();
      await writeAuditLog(db, request, { actorId: "admin", role: "admin" }, action, "content", text(body.key, "home"), body);
    } else if (action === "blacklist.create") {
      const id = crypto.randomUUID();
      await db.prepare(`INSERT OR REPLACE INTO blacklists (id, kind, value, reason, effect, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`)
        .bind(id, text(body.kind, "telegram_id"), text(body.value), text(body.reason, "风险用户"), text(body.effect, "block_order"), text(body.status, "active"))
        .run();
      await writeAuditLog(db, request, { actorId: "admin", role: "admin" }, action, "blacklist", id, body);
    } else if (action === "coupon.create") {
      const id = crypto.randomUUID();
      await db.prepare(`INSERT INTO coupons (id, name, code, discount_type, discount_value, min_amount, usage_limit, per_user_limit, starts_at, ends_at, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`)
        .bind(id, text(body.name, "优惠码"), text(body.code, `CODE${Date.now()}`), text(body.discountType, "amount"), text(body.discountValue, "1"), body.minAmount ?? null, body.usageLimit ?? null, body.perUserLimit ?? null, body.startsAt ?? null, body.endsAt ?? null, text(body.status, "active"))
        .run();
      await writeAuditLog(db, request, { actorId: "admin", role: "admin" }, action, "coupon", id, body);
    } else if (action === "ticket.reply") {
      const id = crypto.randomUUID();
      await db.prepare("INSERT INTO ticket_messages (id, ticket_id, author_type, content, internal, created_at) VALUES (?, ?, 'admin', ?, ?, datetime('now'))")
        .bind(id, text(body.ticketId), text(body.content, "已处理"), boolInt(body.internal))
        .run();
      await db.prepare("UPDATE support_tickets SET status = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(text(body.status, "in_progress"), text(body.ticketId))
        .run();
      await writeAuditLog(db, request, { actorId: "admin", role: "admin" }, action, "ticket", text(body.ticketId), body);
    } else if (action === "template.save") {
      await db.prepare(`INSERT INTO notification_templates (id, type, title, content, enabled, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(type) DO UPDATE SET title = excluded.title, content = excluded.content, enabled = excluded.enabled, updated_at = datetime('now')`)
        .bind(crypto.randomUUID(), text(body.type, "custom"), text(body.title, "通知模板"), text(body.content, "模板内容"), boolInt(body.enabled, true))
        .run();
      await writeAuditLog(db, request, { actorId: "admin", role: "admin" }, action, "notification_template", text(body.type, "custom"), body);
    } else {
      throw new HttpError(422, "unsupported admin ops action");
    }

    return jsonResponse(await listAll(db), 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    console.error("[POST /api/admin/ops] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
