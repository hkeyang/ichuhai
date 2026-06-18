import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { formatPaymentNetwork, formatProduct, formatSku } from "@/lib/api/formatters";
import type { ProductRow, SkuRow, PaymentNetworkRow } from "@/lib/api/types";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;
  try {
    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const [productsResult, skusResult, networksResult] = await db.batch<ProductRow | SkuRow | PaymentNetworkRow>([
      db.prepare("SELECT * FROM products WHERE status = 'active' ORDER BY created_at ASC"),
      db.prepare("SELECT * FROM skus ORDER BY product_id, created_at ASC"),
      db.prepare("SELECT * FROM payment_networks WHERE is_enabled = 1 AND code = 'TRON' ORDER BY created_at ASC"),
    ]);

    const products = (productsResult.results as ProductRow[]).map(formatProduct);
    const allSkus = (skusResult.results as SkuRow[]).map(formatSku);
    const supportedPaymentNetworks = (networksResult.results as PaymentNetworkRow[]).map(formatPaymentNetwork);

    const response = products.map((product) => ({
      ...product,
      skus: allSkus.filter((sku) => sku.productId === product.id),
      supportedPaymentNetworks,
    }));

    return jsonResponse(response, 200, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
