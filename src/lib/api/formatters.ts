import type {
  AuditLogRow,
  DeliveryRow,
  NotificationRow,
  OrderRow,
  PaymentNetworkRow,
  ProductRow,
  SkuRow,
  SupportTicketRow,
} from "./types";

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function formatProduct(product: ProductRow) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    categoryId: product.category_id,
    productType: product.product_type ?? "subscription",
    shortDescription: product.subtitle ?? "",
    subtitle: product.subtitle ?? "",
    detailDescription: product.description ?? "",
    description: product.description ?? "",
    iconUrl: product.icon_url ?? null,
    coverUrl: product.cover_url ?? null,
    featureTags: parseJson<string[]>(product.tags_json, []),
    tags: parseJson<string[]>(product.tags_json, []),
    purchaseNotice: product.purchase_notice ?? "",
    afterSaleRule: product.after_sale_rule ?? "",
    status: product.status,
    deliveryType: product.delivery_type,
    baseCurrency: product.base_currency,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

export function formatSku(sku: SkuRow) {
  return {
    id: sku.id,
    productId: sku.product_id,
    optionValues: parseJson<Record<string, string>>(sku.option_values, {}),
    priceUsdt: sku.price_usdt,
    stockStatus: sku.stock_status,
    stockQuantity: sku.stock_quantity,
    deliveryType: sku.delivery_type,
    isDefault: sku.is_default === 1,
    isRecommended: sku.is_recommended === 1,
    createdAt: sku.created_at,
    updatedAt: sku.updated_at,
  };
}

export function formatPaymentNetwork(network: PaymentNetworkRow) {
  const code = network.code.toUpperCase();
  return {
    id: network.id,
    code: network.code,
    displayName: code === "BASE" ? "USDC Base" : network.display_name,
    tokenStandard: code === "BASE" ? "Base" : network.token_standard,
    isEnabled: network.is_enabled === 1,
    isRecommended: network.is_recommended === 1,
    address: network.address,
    confirmations: network.confirmations,
    warningText: network.warning_text,
    createdAt: network.created_at,
    updatedAt: network.updated_at,
  };
}

export function formatOrder(order: OrderRow) {
  return {
    id: order.id,
    orderId: order.id,
    orderNo: order.order_no,
    productId: order.product_id,
    skuId: order.sku_id,
    productSnapshot: parseJson(order.product_snapshot, {}),
    skuSnapshot: parseJson(order.sku_snapshot, {}),
    telegramUsername: order.telegram_username,
    email: order.email,
    amountUsdt: order.amount_usdt,
    fiatCurrency: order.fiat_currency,
    fiatAmountSnapshot: order.fiat_amount_snapshot,
    exchangeRateSnapshot: order.exchange_rate_snapshot,
    paymentCurrency: order.payment_currency,
    paymentNetwork: order.payment_network,
    paymentAddress: order.payment_address,
    status: order.status,
    txHash: order.tx_hash,
    paidAt: order.paid_at,
    deliveredAt: order.delivered_at,
    adminNote: order.admin_note,
    expiresAt: order.expires_at,
    paymentProvider: order.payment_provider ?? null,
    providerPaymentId: order.provider_payment_id ?? null,
    providerPaymentStatus: order.provider_payment_status ?? null,
    providerPaymentUrl: order.provider_payment_url ?? null,
    providerPayload: parseJson(order.provider_payload_json, {}),
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

export function formatDelivery(delivery: DeliveryRow) {
  return {
    id: delivery.id,
    orderId: delivery.order_id,
    method: delivery.method,
    operator: delivery.operator,
    channel: parseJson<string[]>(delivery.channel, []),
    maskedContent: delivery.masked_content,
    status: delivery.status ?? "sent",
    failureReason: delivery.failure_reason ?? null,
    createdAt: delivery.created_at,
  };
}

export function formatNotification(notification: NotificationRow) {
  return {
    id: notification.id,
    orderId: notification.order_id,
    channel: notification.channel,
    type: notification.type,
    provider: notification.provider,
    status: notification.status,
    messageId: notification.message_id,
    error: notification.error,
    createdAt: notification.created_at,
  };
}

export function formatSupportTicket(ticket: SupportTicketRow) {
  return {
    id: ticket.id,
    ticketNo: ticket.ticket_no,
    orderId: ticket.order_id,
    orderNo: ticket.order_no,
    type: ticket.type,
    description: ticket.description,
    status: ticket.status,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
  };
}

export function formatAuditLog(log: AuditLogRow) {
  return {
    id: log.id,
    actorId: log.actor_id,
    actorRole: log.actor_role,
    action: log.action,
    target: log.target,
    targetId: log.target_id,
    ip: log.ip,
    userAgent: log.user_agent,
    metadata: parseJson<Record<string, unknown>>(log.metadata, {}),
    createdAt: log.created_at,
  };
}
