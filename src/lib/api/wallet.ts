import { HttpError } from "./errors";

const SCALE = 1_000_000n;

export type WalletLedgerType = "recharge" | "consume" | "refund" | "adjust";
export type WalletLedgerStatus = "pending" | "completed" | "failed";

export interface WalletLedgerInput {
  userId: string;
  type: WalletLedgerType;
  amountUsdt: string | number;
  status?: WalletLedgerStatus;
  method?: string | null;
  note?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  createdBy?: string | null;
}

export interface WalletLedgerRow {
  id: string;
  user_id: string;
  type: string;
  amount_usdt: string;
  balance_after: string;
  status: string;
  method: string | null;
  note: string | null;
  reference_type: string | null;
  reference_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

function decimalToUnits(value: string | number): bigint {
  const raw = String(value ?? "").trim();
  if (!/^-?\d+(\.\d{1,6})?$/.test(raw)) throw new HttpError(422, "金额格式无效");
  const negative = raw.startsWith("-");
  const normalized = negative ? raw.slice(1) : raw;
  const [whole, fraction = ""] = normalized.split(".");
  const units = BigInt(whole || "0") * SCALE + BigInt(fraction.padEnd(6, "0"));
  return negative ? -units : units;
}

export function normalizeUsdt(value: string | number): string {
  const units = decimalToUnits(value);
  const negative = units < 0n;
  const abs = negative ? -units : units;
  const whole = abs / SCALE;
  const fraction = (abs % SCALE).toString().padStart(6, "0").replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole.toString()}${fraction ? `.${fraction}` : ""}`;
}

function unitsToDecimal(units: bigint): string {
  const negative = units < 0n;
  const abs = negative ? -units : units;
  const whole = abs / SCALE;
  const fraction = (abs % SCALE).toString().padStart(6, "0").replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole.toString()}${fraction ? `.${fraction}` : ""}`;
}

export function compareUsdt(a: string | number, b: string | number): number {
  const left = decimalToUnits(a);
  const right = decimalToUnits(b);
  return left === right ? 0 : left > right ? 1 : -1;
}

async function getUserBalance(db: D1Database, userId: string): Promise<string> {
  const user = await db
    .prepare("SELECT balance_usdt FROM users WHERE id = ?")
    .bind(userId)
    .first<{ balance_usdt: string | null }>();
  if (!user) throw new HttpError(404, "user not found");
  return user.balance_usdt ?? "0";
}

export async function createWalletLedger(
  db: D1Database,
  input: WalletLedgerInput
): Promise<WalletLedgerRow> {
  const status = input.status ?? "completed";
  const amount = normalizeUsdt(input.amountUsdt);
  const currentBalance = await getUserBalance(db, input.userId);
  let balanceAfter = currentBalance;

  if (status === "completed") {
    const nextUnits = decimalToUnits(currentBalance) + decimalToUnits(amount);
    if (nextUnits < 0n) throw new HttpError(409, "账户余额不足");
    balanceAfter = unitsToDecimal(nextUnits);
    await db
      .prepare("UPDATE users SET balance_usdt = ? WHERE id = ?")
      .bind(balanceAfter, input.userId)
      .run();
  }

  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO wallet_ledgers
        (id, user_id, type, amount_usdt, balance_after, status, method, note, reference_type, reference_id, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    )
    .bind(
      id,
      input.userId,
      input.type,
      amount,
      balanceAfter,
      status,
      input.method ?? null,
      input.note ?? null,
      input.referenceType ?? null,
      input.referenceId ?? null,
      input.createdBy ?? null
    )
    .run();

  const row = await db.prepare("SELECT * FROM wallet_ledgers WHERE id = ?").bind(id).first<WalletLedgerRow>();
  if (!row) throw new HttpError(500, "wallet ledger write failed");
  return row;
}

export async function completePendingWalletLedger(
  db: D1Database,
  ledgerId: string,
  actorId: string
): Promise<WalletLedgerRow> {
  const row = await db.prepare("SELECT * FROM wallet_ledgers WHERE id = ?").bind(ledgerId).first<WalletLedgerRow>();
  if (!row) throw new HttpError(404, "wallet ledger not found");
  if (row.status === "completed") return row;
  if (row.status !== "pending") throw new HttpError(409, "该流水不能确认");

  const currentBalance = await getUserBalance(db, row.user_id);
  const nextUnits = decimalToUnits(currentBalance) + decimalToUnits(row.amount_usdt);
  if (nextUnits < 0n) throw new HttpError(409, "账户余额不足");
  const balanceAfter = unitsToDecimal(nextUnits);

  await db.batch([
    db.prepare("UPDATE users SET balance_usdt = ? WHERE id = ?").bind(balanceAfter, row.user_id),
    db
      .prepare(
        "UPDATE wallet_ledgers SET status = 'completed', balance_after = ?, created_by = ?, updated_at = datetime('now') WHERE id = ?"
      )
      .bind(balanceAfter, actorId, ledgerId),
  ]);

  const updated = await db.prepare("SELECT * FROM wallet_ledgers WHERE id = ?").bind(ledgerId).first<WalletLedgerRow>();
  if (!updated) throw new HttpError(500, "wallet ledger update failed");
  return updated;
}

export async function failPendingWalletLedger(
  db: D1Database,
  ledgerId: string,
  actorId: string,
  note: string
): Promise<WalletLedgerRow> {
  const row = await db.prepare("SELECT * FROM wallet_ledgers WHERE id = ?").bind(ledgerId).first<WalletLedgerRow>();
  if (!row) throw new HttpError(404, "wallet ledger not found");
  if (row.status !== "pending") throw new HttpError(409, "只有待确认流水可以驳回");
  await db
    .prepare("UPDATE wallet_ledgers SET status = 'failed', created_by = ?, note = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(actorId, note || row.note || "充值未通过", ledgerId)
    .run();
  const updated = await db.prepare("SELECT * FROM wallet_ledgers WHERE id = ?").bind(ledgerId).first<WalletLedgerRow>();
  if (!updated) throw new HttpError(500, "wallet ledger update failed");
  return updated;
}

export function formatWalletLedger(row: WalletLedgerRow) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    amountUsdt: row.amount_usdt,
    balanceAfter: row.balance_after,
    status: row.status,
    method: row.method,
    note: row.note,
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
