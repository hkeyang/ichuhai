import { readFile, writeFile } from 'node:fs/promises';

const dbPath = new URL('../data/db.json', import.meta.url);
const data = JSON.parse(await readFile(dbPath, 'utf8'));
let expired = 0;

for (const order of data.orders || []) {
  if (order.status === 'pending_payment' && new Date(order.expiresAt).getTime() <= Date.now()) {
    order.status = 'expired';
    order.updatedAt = new Date().toISOString();
    expired += 1;
  }
}

await writeFile(dbPath, JSON.stringify(data, null, 2));
console.log(JSON.stringify({ ok: true, expired }, null, 2));
