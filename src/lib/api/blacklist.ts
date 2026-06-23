// src/lib/api/blacklist.ts
// 黑名单命中检查，供下单接口拦截使用。

export type BlacklistEffect = "block_order" | "require_manual_review" | "block_payment";

export interface BlacklistHit {
  id: string;
  kind: string;
  value: string;
  effect: BlacklistEffect;
  reason: string;
}

export interface BlacklistCheckInput {
  telegramUsername?: string | null;
  email?: string | null;
  ip?: string | null;
}

/**
 * 检查下单主体是否命中 active 黑名单。
 * 匹配规则（大小写不敏感）：
 *  - telegram_username / telegram_id：去掉 @ 前缀后比较
 *  - email
 *  - ip
 * 返回所有命中项，调用方据 effect 决定拦截或标记人工复核。
 */
export async function checkBlacklist(db: D1Database, input: BlacklistCheckInput): Promise<BlacklistHit[]> {
  const candidates: { kinds: string[]; value: string }[] = [];

  if (input.telegramUsername) {
    const raw = input.telegramUsername.trim();
    const stripped = raw.replace(/^@/, "").toLowerCase();
    if (stripped) candidates.push({ kinds: ["telegram_username", "telegram_id"], value: stripped });
  }
  if (input.email) {
    const email = input.email.trim().toLowerCase();
    if (email) candidates.push({ kinds: ["email"], value: email });
  }
  if (input.ip) {
    const ip = input.ip.trim();
    if (ip) candidates.push({ kinds: ["ip"], value: ip });
  }

  if (!candidates.length) return [];

  const { results } = await db
    .prepare("SELECT id, kind, value, effect, reason FROM blacklists WHERE status = 'active'")
    .all<{ id: string; kind: string; value: string; effect: string; reason: string }>();

  const hits: BlacklistHit[] = [];
  for (const row of results) {
    const rowValue = String(row.value ?? "").replace(/^@/, "").trim().toLowerCase();
    for (const candidate of candidates) {
      if (candidate.kinds.includes(row.kind) && rowValue === candidate.value) {
        hits.push({
          id: row.id,
          kind: row.kind,
          value: row.value,
          effect: (row.effect as BlacklistEffect) || "block_order",
          reason: row.reason,
        });
        break;
      }
    }
  }
  return hits;
}
