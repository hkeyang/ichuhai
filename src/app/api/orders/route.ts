// src/app/api/orders/route.ts
// POST /api/orders — 用户下单

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/api/audit";
import { writeNotification } from "@/lib/api/notifications";
import { sendOrderCreatedEmail } from "@/lib/api/mailer";
import {
  allocatePaymentAmount,
  buildProviderPayload,
  DEFAULT_PAYMENT_EXPIRY_MINUTES,
  isSupportedTronNetwork,
} from "@/lib/api/usdt-trc20";
import type { OrderRow, ProductRow, SkuRow, PaymentNetworkRow } from "@/lib/api/types";

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

/** 生成订单号：GF + yyMMddHHmmss + 4位随机数 */
function generateOrderNo(): string {
  const dt = new Date().toISOString().replace(/\D/g, "").slice(2, 14);
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `GF${dt}${rand}`;
}

// ─── OPTIONS ──────────────────────────────────────────────────────────────────

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

// ─── POST /api/orders ─────────────────────────────────────────────────────────

interface OrderBody {
  productId?: unknown;
  skuId?: unknown;
  paymentNetwork?: unknown;
  telegramUsername?: unknown;
  email?: unknown;
  fiatCurrency?: unknown;
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;
  const db = cloudflareEnv.DB;

  try {
    await ensureDatabaseReady(db);
    // 1. 解析请求体
    const body = await parseBody<OrderBody>(request);

    const productId = String(body.productId ?? "").trim();
    const skuId = String(body.skuId ?? "").trim();
    const paymentNetworkCode = String(body.paymentNetwork ?? "TRON").trim().toUpperCase();
    const rawTelegramUsername = String(body.telegramUsername ?? "").trim();
    const rawEmail = String(body.email ?? "").trim().toLowerCase();
    const rawFiatCurrency = String(body.fiatCurrency ?? "").trim().toUpperCase();

    // 2. 基础字段非空校验
    if (!productId) throw new HttpError(422, "productId is required");
    if (!skuId) throw new HttpError(422, "skuId is required");
    if (paymentNetworkCode !== "TRON") throw new HttpError(400, "only USDT TRC20 payments are supported");

    // 3. 查询 product（status='active'）
    const product = await db
      .prepare(`SELECT * FROM products WHERE id = ?`)
      .bind(productId)
      .first<ProductRow>();

    if (!product) throw new HttpError(404, "product not found");
    if (product.status !== "active") throw new HttpError(409, "product is not available");

    // 4. 查询 sku（匹配 productId）
    const sku = await db
      .prepare(`SELECT * FROM skus WHERE id = ? AND product_id = ?`)
      .bind(skuId, productId)
      .first<SkuRow>();

    if (!sku) throw new HttpError(404, "sku not found");
    if (sku.stock_status === "sold_out") throw new HttpError(409, "sku is sold out");

    // 5. 查询 payment_network（is_enabled=1）
    const network = await db
      .prepare(`SELECT * FROM payment_networks WHERE code = ? AND is_enabled = 1`)
      .bind("TRON")
      .first<PaymentNetworkRow>();

    if (!isSupportedTronNetwork(network)) throw new HttpError(400, "TRON USDT payment network is not configured");

    // 6. 校验 telegramUsername
    if (!/^@?[a-zA-Z0-9_]{5,32}$/.test(rawTelegramUsername)) {
      throw new HttpError(422, "invalid telegram username");
    }

    // 7. 校验 email
    if (
      rawEmail.length > 254 ||
      !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(rawEmail)
    ) {
      throw new HttpError(422, "invalid email");
    }

    // 8. 确定 fiatCurrency 和汇率
    const rateRow = await db
      .prepare(`SELECT rate FROM exchange_rates WHERE currency = ?`)
      .bind(rawFiatCurrency)
      .first<{ rate: string }>();

    const fiatCurrency = rateRow ? rawFiatCurrency : "USD";
    const finalRateRow = rateRow ?? await db
      .prepare(`SELECT rate FROM exchange_rates WHERE currency = 'USD'`)
      .first<{ rate: string }>();
    const rate = Number(finalRateRow?.rate ?? "1");

    // 9. 生成订单 ID 和订单号
    const orderId = crypto.randomUUID();
    const orderNo = generateOrderNo();

    // 10. 计算金额
    const baseAmountUsdt = sku.price_usdt;
    const reusablePaymentWindowStartedAt = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const activeOrders = await db
      .prepare(
        `SELECT amount_usdt, status, expires_at, payment_network
         FROM orders
         WHERE payment_network = 'TRON'
           AND status IN ('created','pending_payment','payment_confirming')
           AND expires_at > ?`
      )
      .bind(reusablePaymentWindowStartedAt)
      .all<Pick<OrderRow, "amount_usdt" | "status" | "expires_at" | "payment_network">>();
    const paymentAmount = allocatePaymentAmount(baseAmountUsdt, activeOrders.results);
    if (!paymentAmount) {
      throw new HttpError(409, "当前同价订单较多，请稍后重试");
    }
    const amountUsdt = paymentAmount.amount;
    const fiatAmountSnapshot = (Number(amountUsdt) * rate).toFixed(2);
    const exchangeRateSnapshot = String(rate);

    // 11. 规范化 telegramUsername（确保以 @ 开头）
    const telegramUsername = rawTelegramUsername.startsWith("@")
      ? rawTelegramUsername
      : `@${rawTelegramUsername}`;

    // 12. 设置过期时间（15 分钟后）
    const expiresAt = new Date(Date.now() + DEFAULT_PAYMENT_EXPIRY_MINUTES * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    // 13. 构建快照（保持 camelCase 以兼容前端）
    const productSnapshot = JSON.stringify({
      id: product.id,
      slug: product.slug,
      name: product.name,
      categoryId: product.category_id,
      status: product.status,
      deliveryType: product.delivery_type,
      baseCurrency: product.base_currency,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    });

    const skuSnapshot = JSON.stringify({
      id: sku.id,
      productId: sku.product_id,
      optionValues: (() => {
        try { return JSON.parse(sku.option_values); } catch { return {}; }
      })(),
      priceUsdt: sku.price_usdt,
      stockStatus: sku.stock_status,
      stockQuantity: sku.stock_quantity,
      deliveryType: sku.delivery_type,
      isDefault: sku.is_default === 1,
      isRecommended: sku.is_recommended === 1,
      createdAt: sku.created_at,
      updatedAt: sku.updated_at,
    });

    const paymentAddress = network.address;
    let paymentCurrency = "USDT";
    const paymentNetwork = "TRON";
    let paymentProvider: string | null = "usdt-trc20-direct";
    let providerPaymentId: string | null = null;
    let providerPaymentStatus: string | null = null;
    let providerPaymentUrl: string | null = null;
    let providerPayload: Record<string, unknown> = buildProviderPayload(paymentAmount);

    // 14. INSERT INTO orders
    await db
      .prepare(
        `INSERT INTO orders (
          id, order_no, product_id, sku_id,
          product_snapshot, sku_snapshot,
          telegram_username, email,
          amount_usdt, fiat_currency, fiat_amount_snapshot, exchange_rate_snapshot,
          payment_currency, payment_network, payment_address,
          status, expires_at,
          payment_provider, provider_payment_id, provider_payment_status, provider_payment_url, provider_payload_json,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?,
          ?, ?,
          ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          'pending_payment', ?,
          ?, ?, ?, ?, ?,
          datetime('now'), datetime('now')
        )`
      )
      .bind(
        orderId, orderNo, productId, skuId,
        productSnapshot, skuSnapshot,
        telegramUsername, rawEmail,
        amountUsdt, fiatCurrency, fiatAmountSnapshot, exchangeRateSnapshot,
        paymentCurrency, paymentNetwork, paymentAddress,
        expiresAt,
        paymentProvider, providerPaymentId, providerPaymentStatus, providerPaymentUrl, JSON.stringify(providerPayload)
      )
      .run();

    // 15. 异步发送订单确认邮件（fire-and-forget，不 await 阻塞）
    // 构建一个最小 OrderRow 用于邮件发送
    const orderRowForMail = {
      id: orderId,
      order_no: orderNo,
      product_id: productId,
      sku_id: skuId,
      product_snapshot: productSnapshot,
      sku_snapshot: skuSnapshot,
      telegram_username: telegramUsername,
      email: rawEmail,
      amount_usdt: amountUsdt,
      fiat_currency: fiatCurrency,
      fiat_amount_snapshot: fiatAmountSnapshot,
      exchange_rate_snapshot: exchangeRateSnapshot,
      payment_currency: paymentCurrency,
      payment_network: paymentNetwork,
      payment_address: paymentAddress,
      status: "pending_payment",
      tx_hash: null,
      paid_at: null,
      delivered_at: null,
      admin_note: null,
      expires_at: expiresAt,
      payment_provider: paymentProvider,
      provider_payment_id: providerPaymentId,
      provider_payment_status: providerPaymentStatus,
      provider_payment_url: providerPaymentUrl,
      provider_payload_json: JSON.stringify(providerPayload),
      created_at: now,
      updated_at: now,
    };

    // fire-and-forget：邮件发送 + 通知记录 + 审计日志（不阻塞响应）
    const afterInsert = (async () => {
      let mailResult: { ok: boolean; provider: string; messageId: string | null; error?: string };
      try {
        mailResult = await sendOrderCreatedEmail(orderRowForMail, cloudflareEnv);
      } catch (err) {
        mailResult = {
          ok: false,
          provider: "mailchannels",
          messageId: null,
          error: err instanceof Error ? err.message : "order notification failed",
        };
      }

      // 16. 写入 notification 记录
      try {
        await writeNotification(db, {
          orderId,
          channel: "email",
          type: "order_created",
          provider: mailResult.provider,
          status: mailResult.ok ? "sent" : "failed",
          messageId: mailResult.messageId,
          error: mailResult.error ?? null,
        });
      } catch {
        // 通知写入失败不影响主流程
      }

      // 17. 写入 audit_log
      try {
        await writeAuditLog(
          db,
          request,
          { actorId: telegramUsername, role: "customer" },
          "order.create",
          "order",
          orderId,
          { orderNo, productId, skuId, paymentNetwork, paymentProvider, fiatCurrency, baseAmountUsdt, amountUsdt, amountSuffix: paymentAmount.suffix }
        );
      } catch {
        // 审计日志写入失败不影响主流程
      }
    })();

    // 在 Cloudflare Workers 中使用 waitUntil 确保异步任务完成
    try {
      const ctx = await getCloudflareContext();
      if (ctx.ctx && typeof (ctx.ctx as { waitUntil?: (p: Promise<unknown>) => void }).waitUntil === "function") {
        (ctx.ctx as { waitUntil: (p: Promise<unknown>) => void }).waitUntil(afterInsert);
      }
    } catch {
      // waitUntil 不可用时忽略（本地开发环境）
    }

    // 18. 返回 201
    return jsonResponse(
      {
        orderId,
        orderNo,
        paymentUrl: `/pay/${orderId}`,
        paymentProvider,
        providerPaymentId,
      },
      201,
      request,
      cloudflareEnv
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/orders] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
