// src/lib/api/audit.ts
// 审计日志写入工具，将操作记录插入 D1 audit_logs 表

/**
 * 写入审计日志
 *
 * @param db        D1 数据库实例
 * @param request   原始请求（用于提取 IP 和 User-Agent）
 * @param actor     操作者信息（actorId + role）
 * @param action    操作动作，如 "order.create"、"admin.deliver"
 * @param target    操作目标类型，如 "order"、"product"
 * @param targetId  操作目标的 ID
 * @param metadata  附加元数据（可选）
 */
export async function writeAuditLog(
  db: D1Database,
  request: Request,
  actor: { actorId: string; role: string },
  action: string,
  target: string,
  targetId: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO audit_logs (id, actor_id, actor_role, action, target, target_id, ip, user_agent, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .bind(
      crypto.randomUUID(),
      actor.actorId,
      actor.role,
      action,
      target,
      targetId,
      request.headers.get("cf-connecting-ip") ||
        request.headers.get("x-forwarded-for") ||
        "",
      request.headers.get("user-agent") || "",
      JSON.stringify(metadata)
    )
    .run();
}
