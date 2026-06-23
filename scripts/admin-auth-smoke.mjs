import { existsSync, readFileSync } from "node:fs";

const DEFAULT_BASE_URL = "https://ichuhai.shop";
const ENDPOINTS = [
  "/api/admin/products",
  "/api/admin/orders",
  "/api/admin/ops",
];

function loadDotEnv(path) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = unquote(rawValue);
  }
}

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function maskToken(token) {
  if (!token) return "";
  if (token.length <= 16) return `${token.slice(0, 4)}...`;
  return `${token.slice(0, 8)}...${token.slice(-8)}`;
}

function describeBody(body) {
  if (body == null) return "";
  if (Array.isArray(body)) return `array(${body.length})`;
  if (typeof body === "object") {
    if (Array.isArray(body.items)) return `items(${body.items.length}), total=${body.total ?? "?"}`;
    if (body.error) return `error=${body.error}`;
    return `object keys=${Object.keys(body).slice(0, 8).join(",")}`;
  }
  return typeof body;
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { nonJson: text.slice(0, 160) };
  }
}

async function main() {
  loadDotEnv(".dev.vars");

  const baseUrl = (process.env.ADMIN_SMOKE_BASE_URL || process.env.PUBLIC_SITE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  const username = process.env.ADMIN_USERNAME || "";
  const password = process.env.ADMIN_PASSWORD || "";

  if (!username || !password) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD are required via env or .dev.vars");
  }

  console.log(`Admin auth smoke target: ${baseUrl}`);
  console.log(`Username present: yes (${username})`);
  console.log(`Password present: yes (${password.length} chars)`);

  const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const loginBody = await readJson(loginResponse);
  const token = typeof loginBody?.token === "string" ? loginBody.token : "";

  console.log(`POST /api/admin/login -> ${loginResponse.status}`);
  console.log(`Token received: ${token ? `yes (${maskToken(token)})` : "no"}`);

  if (!loginResponse.ok || !token) {
    console.log(`Login response: ${describeBody(loginBody)}`);
    process.exitCode = 1;
    return;
  }

  const results = [];
  for (const endpoint of ENDPOINTS) {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        "content-type": "application/json",
        "x-admin-token": token,
        "x-admin-username": username,
      },
    });
    const body = await readJson(response);
    const ok = response.ok;
    results.push({ endpoint, status: response.status, ok, body });
    console.log(`GET ${endpoint} -> ${response.status} ${ok ? "OK" : "FAIL"} (${describeBody(body)})`);
  }

  const failed = results.filter((result) => !result.ok);
  if (failed.length) {
    process.exitCode = 1;
    console.log(`Admin auth smoke failed: ${failed.map((result) => result.endpoint).join(", ")}`);
    return;
  }

  console.log("Admin auth smoke passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
