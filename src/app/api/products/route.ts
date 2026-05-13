import { getCloudflareContext } from "@opennextjs/cloudflare";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import type { ProductRow, SkuRow, PaymentNetworkRow } from "@/lib/api/types";

// Convert snake_case DB row to camelCase for frontend compatibility
function formatProduct(product: ProductRow) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    categoryId: product.category_id,
    status: product.status,
    deliveryType: product.delivery_type,
    baseCurrency: product.base_currency,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

function formatSku(sku: SkuRow) {
  return {
    id: sku.id,
    productId: sku.product_id,
    optionValues: (() => {
      try {
        return JSON.parse(sku.option_values);
      } catch {
        return {};
      }
    })(),
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

function formatPaymentNetwork(network: PaymentNetworkRow) {
  return {
    id: network.id,
    code: network.code,
    displayName: network.display_name,
    tokenStandard: network.token_standard,
    isEnabled: network.is_enabled === 1,
    isRecommended: network.is_recommended === 1,
    address: network.address,
    confirmations: network.confirmations,
    warningText: network.warning_text,
  };
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  try {
    const db = (env as CloudflareEnv).DB;

    const [productsResult, skusResult, networksResult] = await db.batch<ProductRow | SkuRow | PaymentNetworkRow>([
      db.prepare("SELECT * FROM products WHERE status = 'active' ORDER BY created_at ASC"),
      db.prepare("SELECT * FROM skus ORDER BY product_id, created_at ASC"),
      db.prepare("SELECT * FROM payment_networks WHERE is_enabled = 1 ORDER BY created_at ASC"),
    ]);

    const products = (productsResult.results as ProductRow[]).map(formatProduct);
    const allSkus = (skusResult.results as SkuRow[]).map(formatSku);
    const supportedPaymentNetworks = (networksResult.results as PaymentNetworkRow[]).map(formatPaymentNetwork);

    const response = products.map((product) => ({
      ...product,
      skus: allSkus.filter((sku) => sku.productId === product.id),
      supportedPaymentNetworks,
    }));

    return jsonResponse(response, 200, request, env as CloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, env as CloudflareEnv);
    }
    return jsonResponse({ error: "internal server error" }, 500, request, env as CloudflareEnv);
  }
}
