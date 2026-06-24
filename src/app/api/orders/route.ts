// src/app/api/orders/route.ts
// POST /api/orders — 用户下单

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/api/audit";
import { writeNotification } from "@/lib/api/notifications";
import { checkBlacklist } from "@/lib/api/blacklist";
import { sendOrderCreatedEmail } from "@/lib/api/mailer";
import { resolveUserId } from "@/lib/api/user-session";
import { compareUsdt, createWalletLedger } from "@/lib/api/wallet";
import {
  allocatePaymentAmount,
  buildProviderPayload,
  DEFAULT_PAYMENT_EXPIRY_MINUTES,
  isSupportedTronNetwork,
  type PaymentAmountAllocation,
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
  paymentMethod?: unknown;
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
    const paymentMethod = String(body.paymentMethod ?? "usdt_trc20").trim();
    if (!["usdt_trc20", "balance"].includes(paymentMethod)) throw new HttpError(422, "paymentMethod is invalid");
    const sessionUserId = await resolveUserId(request, cloudflareEnv);
    const sessionUser = sessionUserId
      ? await db
          .prepare("SELECT id, email, telegram_username, nickname, balance_usdt, default_currency FROM users WHERE id = ?")
          .bind(sessionUserId)
          .first<{
            id: string;
            email: string | null;
            telegram_username: string | null;
            nickname: string | null;
            balance_usdt: string | null;
            default_currency: string;
          }>()
      : null;

    // 2. 基础字段非空校验
    if (!productId) throw new HttpError(422, "productId is required");
    if (!skuId) throw new HttpError(422, "skuId is required");
    if (paymentMethod !== "balance" && paymentNetworkCode !== "TRON") throw new HttpError(400, "only USDT TRC20 payments are supported");

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
    const network = paymentMethod === "balance"
      ? null
      : await db
          .prepare(`SELECT * FROM payment_networks WHERE code = ? AND is_enabled = 1`)
          .bind("TRON")
          .first<PaymentNetworkRow>();

    if (paymentMethod !== "balance" && !isSupportedTronNetwork(network)) throw new HttpError(400, "TRON USDT payment network is not configured");

    // 6. 校验 telegramUsername
    const accountTelegram = rawTelegramUsername || sessionUser?.telegram_username || "";
    if (!sessionUser && !/^@?[a-zA-Z0-9_]{5,32}$/.test(accountTelegram)) {
      throw new HttpError(422, "invalid telegram username");
    }

    // 7. 校验 email
    const accountEmail = (rawEmail || sessionUser?.email || "").trim().toLowerCase();
    if (
      accountEmail.length > 254 ||
      !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(accountEmail)
    ) {
      throw new HttpError(422, "invalid email");
    }

    // 7.5 黑名单拦截：命中 block_order/block_payment 拒绝下单；命中 require_manual_review 创建但标记风险。
    const clientIp =
      request.headers.get("cf-connecting-ip") ||
      (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      "";
    const blacklistHits = await checkBlacklist(db, {
      telegramUsername: rawTelegramUsername,
      email: accountEmail,
      ip: clientIp,
    });
    const blockingHit = blacklistHits.find(
      (hit) => hit.effect === "block_order" || hit.effect === "block_payment"
    );
    if (blockingHit) {
      try {
        await writeAuditLog(
          db,
          request,
          { actorId: rawTelegramUsername || rawEmail || clientIp || "anonymous", role: "customer" },
          "order.blocked_blacklist",
          "blacklist",
          blockingHit.id,
          { kind: blockingHit.kind, value: blockingHit.value, effect: blockingHit.effect, email: accountEmail, telegramUsername: accountTelegram }
        );
      } catch {
        // 审计失败不影响拦截
      }
      throw new HttpError(403, "当前账户暂时无法下单，请联系客服");
    }
    const requiresManualReview = blacklistHits.some((hit) => hit.effect === "require_manual_review");

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
    if (paymentMethod === "balance") {
      if (!sessionUser) throw new HttpError(401, "余额支付需要登录");
      if (compareUsdt(sessionUser.balance_usdt ?? "0", baseAmountUsdt) < 0) throw new HttpError(409, "账户余额不足");
    }
    let paymentAmount: PaymentAmountAllocation | null = {
      amount: baseAmountUsdt,
      baseAmount: baseAmountUsdt,
      suffixUnits: 0,
      suffix: "0",
    };
    if (paymentMethod !== "balance") {
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
      paymentAmount = allocatePaymentAmount(baseAmountUsdt, activeOrders.results);
      if (!paymentAmount) {
        throw new HttpError(409, "当前同价订单较多，请稍后重试");
      }
    }
    const amountUsdt = paymentAmount.amount;
    const fiatAmountSnapshot = (Number(amountUsdt) * rate).toFixed(2);
    const exchangeRateSnapshot = String(rate);

    // 11. 规范化 telegramUsername（确保以 @ 开头）
    const telegramSource = accountTelegram || (accountEmail ? accountEmail.split("@")[0] : "email_user");
    const telegramUsername = telegramSource.startsWith("@")
      ? telegramSource
      : `@${telegramSource}`;

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

    const paymentAddress = paymentMethod === "balance" ? "WALLET_BALANCE" : network!.address;
    let paymentCurrency = "USDT";
    const paymentNetwork = paymentMethod === "balance" ? "WALLET" : "TRON";
    let paymentProvider: string | null = paymentMethod === "balance" ? "wallet-balance" : "usdt-trc20-direct";
    let providerPaymentId: string | null = null;
    let providerPaymentStatus: string | null = null;
    let providerPaymentUrl: string | null = null;
    let providerPayload: Record<string, unknown> = paymentMethod === "balance"
      ? { provider: "wallet-balance", paymentAmountUsdt: amountUsdt, balanceDebitUsdt: baseAmountUsdt }
      : buildProviderPayload(paymentAmount);

    // 14. INSERT INTO orders
    await db
      .prepare(
        `INSERT INTO orders (
          id, order_no, user_id, product_id, sku_id,
          product_snapshot, sku_snapshot,
          telegram_username, email,
          amount_usdt, fiat_currency, fiat_amount_snapshot, exchange_rate_snapshot,
          payment_currency, payment_network, payment_address,
          status, payment_status, paid_at, expires_at,
          payment_provider, provider_payment_id, provider_payment_status, provider_payment_url, provider_payload_json,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?,
          ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          datetime('now'), datetime('now')
        )`
      )
      .bind(
        orderId, orderNo, sessionUser?.id ?? null, productId, skuId,
        productSnapshot, skuSnapshot,
        telegramUsername, accountEmail,
        amountUsdt, fiatCurrency, fiatAmountSnapshot, exchangeRateSnapshot,
        paymentCurrency, paymentNetwork, paymentAddress,
        paymentMethod === "balance" ? "paid" : "pending_payment",
        paymentMethod === "balance" ? "paid" : "unpaid",
        paymentMethod === "balance" ? now : null,
        expiresAt,
        paymentProvider, providerPaymentId, providerPaymentStatus, providerPaymentUrl, JSON.stringify(providerPayload)
      )
      .run();

    if (paymentMethod === "balance" && sessionUser) {
      try {
        await createWalletLedger(db, {
          userId: sessionUser.id,
          type: "consume",
          amountUsdt: `-${baseAmountUsdt}`,
          method: "balance",
          note: `订单 ${orderNo} 余额支付`,
          referenceType: "order",
          referenceId: orderId,
          createdBy: "system",
        });
      } catch (error) {
        await db
          .prepare("UPDATE orders SET status = 'failed', payment_status = 'failed', admin_note = ?, updated_at = datetime('now') WHERE id = ?")
          .bind(error instanceof Error ? error.message : "余额扣款失败", orderId)
          .run();
        throw error;
      }
    }

    // 命中 require_manual_review：订单照常创建，但标记风险备注，便于后台人工审核
    if (requiresManualReview) {
      try {
        await db
          .prepare(
            "UPDATE orders SET admin_note = ?, after_sale_status = 'open', updated_at = datetime('now') WHERE id = ?"
          )
          .bind("命中黑名单 require_manual_review，需人工审核", orderId)
          .run();
      } catch {
        // 标记失败不影响下单
      }
    }

    // 15. 异步发送订单确认邮件（fire-and-forget，不 await 阻塞）
    // 构建一个最小 OrderRow 用于邮件发送
    const orderRowForMail = {
      id: orderId,
      order_no: orderNo,
      user_id: sessionUser?.id ?? null,
      product_id: productId,
      sku_id: skuId,
      product_snapshot: productSnapshot,
      sku_snapshot: skuSnapshot,
      telegram_username: telegramUsername,
      email: accountEmail,
      amount_usdt: amountUsdt,
      fiat_currency: fiatCurrency,
      fiat_amount_snapshot: fiatAmountSnapshot,
      exchange_rate_snapshot: exchangeRateSnapshot,
      payment_currency: paymentCurrency,
      payment_network: paymentNetwork,
      payment_address: paymentAddress,
      status: paymentMethod === "balance" ? "paid" : "pending_payment",
      tx_hash: null,
      paid_at: paymentMethod === "balance" ? now : null,
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
        paymentUrl: paymentMethod === "balance" ? `/order/${orderId}/success` : `/pay/${orderId}`,
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
