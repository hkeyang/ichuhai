import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureDatabaseReady } from "@/lib/api/bootstrap";
import { parseBody } from "@/lib/api/body-parser";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { HttpError } from "@/lib/api/errors";
import { resolveUserId } from "@/lib/api/user-session";

interface TicketOwnershipRow {
  id: string;
  status: string;
}

interface TicketMessageRow {
  id: string;
  ticket_id: string;
  author_type: string;
  content: string;
  internal: number;
  created_at: string;
}

function normalizeUsername(value: string | null | undefined) {
  const trimmed = String(value || "").trim();
  return trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
}

function formatMessage(message: TicketMessageRow) {
  return {
    id: message.id,
    ticketId: message.ticket_id,
    authorType: message.author_type,
    content: message.content,
    internal: Boolean(message.internal),
    createdAt: message.created_at,
  };
}

export async function OPTIONS(request: Request) {
  const { env } = await getCloudflareContext();
  return optionsResponse(request, env as CloudflareEnv);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { env } = await getCloudflareContext();
  const cloudflareEnv = env as CloudflareEnv;

  try {
    const userId = await resolveUserId(request, cloudflareEnv);
    if (!userId) throw new HttpError(401, "unauthorized");
    const { id } = await params;

    const body = await parseBody<{ content?: unknown }>(request);
    const content = String(body.content ?? "").trim();
    if (!content) throw new HttpError(422, "content is required");
    if (content.length > 500) throw new HttpError(422, "content must be 500 characters or less");
    if (/[<>]/.test(content)) throw new HttpError(422, "content must not contain html");

    const db = cloudflareEnv.DB;
    await ensureDatabaseReady(db);

    const user = await db
      .prepare("SELECT id, telegram_username, email FROM users WHERE id = ?")
      .bind(userId)
      .first<{ id: string; telegram_username: string | null; email: string | null }>();
    if (!user) throw new HttpError(404, "user not found");

    const conditions = ["o.user_id = ?"];
    const bindValues: string[] = [user.id];
    const username = normalizeUsername(user.telegram_username);
    if (username) {
      conditions.push("o.telegram_username IN (?, ?)");
      bindValues.push(username, `@${username}`);
    }
    if (user.email) {
      conditions.push("o.email = ?");
      bindValues.push(user.email);
    }

    const ticket = await db
      .prepare(
        `SELECT t.id, t.status
         FROM support_tickets t
         INNER JOIN orders o ON o.id = t.order_id
         WHERE (t.id = ? OR t.ticket_no = ?)
         AND (${conditions.join(" OR ")})
         LIMIT 1`
      )
      .bind(id, id, ...bindValues)
      .first<TicketOwnershipRow>();
    if (!ticket) throw new HttpError(404, "ticket not found");

    const messageId = crypto.randomUUID();
    await db
      .prepare(
        "INSERT INTO ticket_messages (id, ticket_id, author_type, content, internal, created_at) VALUES (?, ?, 'user', ?, 0, datetime('now'))"
      )
      .bind(messageId, ticket.id, content)
      .run();

    if (!["resolved", "closed"].includes(ticket.status)) {
      await db
        .prepare("UPDATE support_tickets SET status = 'in_progress', updated_at = datetime('now') WHERE id = ?")
        .bind(ticket.id)
        .run();
    }

    const message = await db
      .prepare("SELECT id, ticket_id, author_type, content, internal, created_at FROM ticket_messages WHERE id = ?")
      .bind(messageId)
      .first<TicketMessageRow>();

    return jsonResponse({ message: message ? formatMessage(message) : null }, 201, request, cloudflareEnv);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, request, cloudflareEnv);
    }
    console.error("[POST /api/me/support-tickets/:id/messages] unexpected error:", error);
    return jsonResponse({ error: "internal server error" }, 500, request, cloudflareEnv);
  }
}
