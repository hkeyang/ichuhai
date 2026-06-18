import { getCloudflareContext } from "@opennextjs/cloudflare";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  return jsonResponse(
    { error: "tx hash submission is disabled; USDT TRC20 payments are detected automatically" },
    410,
    request,
    env as CloudflareEnv
  );
}
