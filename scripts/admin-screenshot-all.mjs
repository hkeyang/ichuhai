import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const baseUrl = process.env.ADMIN_BASE_URL || "http://127.0.0.1:4174";
const outDir = path.resolve(process.env.ADMIN_SCREENSHOT_DIR || "artifacts/admin-all-current");
const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const debugPort = Number(process.env.CHROME_DEBUG_PORT || 9223);
const viewport = { width: 1470, height: 845, scale: 2 };

const pages = [
  { tab: "dashboard", name: "01-dashboard" },
  { tab: "products", sub: "list", name: "02-products-01-list" },
  { tab: "products", sub: "editBase", name: "02-products-02-basic-info" },
  { tab: "products", sub: "editDisplay", name: "02-products-03-display" },
  { tab: "products", sub: "editSkus", name: "02-products-04-skus" },
  { tab: "products", sub: "editFields", name: "02-products-05-purchase-fields" },
  { tab: "products", sub: "categories", name: "02-products-06-categories" },
  { tab: "products", sub: "fieldTemplates", name: "02-products-07-field-templates" },
  { tab: "inventory", sub: "list", name: "03-inventory-01-list" },
  { tab: "inventory", sub: "detail", name: "03-inventory-02-detail" },
  { tab: "inventory", sub: "import", name: "03-inventory-03-import" },
  { tab: "inventory", sub: "records", name: "03-inventory-04-records" },
  { tab: "orders", sub: "list", orderTab: "all", name: "04-orders-01-list-all" },
  { tab: "orders", sub: "list", orderTab: "pending_payment", name: "04-orders-02-list-pending-payment" },
  { tab: "orders", sub: "list", orderTab: "undelivered", name: "04-orders-03-list-undelivered" },
  { tab: "orders", sub: "list", orderTab: "delivered", name: "04-orders-04-list-delivered" },
  { tab: "orders", sub: "list", orderTab: "delivery_failed", name: "04-orders-05-list-exception" },
  { tab: "orders", sub: "list", orderTab: "refunded", name: "04-orders-06-list-refunded" },
  { tab: "orders", sub: "detail", name: "04-orders-07-detail" },
  { tab: "orders", sub: "deliveries", name: "04-orders-08-deliveries" },
  { tab: "recharge", sub: "orders", name: "05-recharge-01-orders" },
  { tab: "recharge", sub: "ledger", name: "05-recharge-02-ledger" },
  { tab: "support", sub: "list", name: "06-support-01-list" },
  { tab: "support", sub: "detail", name: "06-support-02-detail" },
  { tab: "support", sub: "types", name: "06-support-03-types" },
  { tab: "users", sub: "list", name: "07-users-01-list" },
  { tab: "users", sub: "detail", name: "07-users-02-detail" },
  { tab: "users", sub: "balance", name: "07-users-03-balance" },
  { tab: "system", sub: "payment", name: "08-system-01-payment" },
  { tab: "system", sub: "rates", name: "08-system-02-rates" },
  { tab: "system", sub: "base", name: "08-system-03-base" },
  { tab: "system", sub: "admins", name: "08-system-04-admins" },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function waitForDebugTarget() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const targets = await getJson(`http://127.0.0.1:${debugPort}/json/list`);
      const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      await sleep(200);
    }
  }
  throw new Error("Chrome DevTools target not ready");
}

function createCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const events = new Map();

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message || JSON.stringify(message.error)));
      else resolve(message.result || {});
      return;
    }
    const callbacks = events.get(message.method);
    if (callbacks) callbacks.forEach((callback) => callback(message.params || {}));
  });

  const ready = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  return {
    ready,
    send(method, params = {}) {
      const commandId = ++id;
      ws.send(JSON.stringify({ id: commandId, method, params }));
      return new Promise((resolve, reject) => pending.set(commandId, { resolve, reject }));
    },
    once(method) {
      return new Promise((resolve) => {
        const callback = (params) => {
          const callbacks = events.get(method) || [];
          events.set(method, callbacks.filter((item) => item !== callback));
          resolve(params);
        };
        events.set(method, [...(events.get(method) || []), callback]);
      });
    },
    close() {
      ws.close();
    },
  };
}

async function waitForExpression(cdp, expression, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const result = await cdp.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
    });
    if (result.result?.value) return;
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${expression}`);
}

async function navigate(cdp, url) {
  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url });
  await loaded.catch(() => {});
  await waitForExpression(cdp, "Boolean(document.querySelector('.admin-shell'))");
  await sleep(700);
}

async function setAdminState(cdp, shot) {
  const state = JSON.stringify(shot);
  await cdp.send("Runtime.evaluate", {
    expression: `
      (() => {
        const shot = ${state};
        localStorage.setItem("adminTab", shot.tab);
        const subTabs = JSON.parse(localStorage.getItem("adminSubTabs") || "{}");
        if (shot.sub) subTabs[shot.tab] = shot.sub;
        localStorage.setItem("adminSubTabs", JSON.stringify(subTabs));
        if (shot.orderTab) localStorage.setItem("adminOrderTab", shot.orderTab);
        location.href = "/admin";
      })()
    `,
  });
  await waitForExpression(cdp, "Boolean(document.querySelector('.admin-shell'))");
  await sleep(900);
}

async function screenshot(cdp, filename) {
  const metrics = await cdp.send("Page.getLayoutMetrics");
  const content = metrics.cssContentSize || metrics.contentSize;
  const width = Math.ceil(Math.max(viewport.width, content.width || viewport.width));
  const height = Math.ceil(Math.max(viewport.height, content.height || viewport.height));
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: viewport.scale,
    mobile: false,
  });
  await sleep(150);
  const result = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
  });
  await writeFile(path.join(outDir, filename), Buffer.from(result.data, "base64"));
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.scale,
    mobile: false,
  });
}

await mkdir(outDir, { recursive: true });

const chrome = spawn(chromePath, [
  "--headless=new",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=/tmp/ichuhai-admin-shots-${debugPort}`,
  "--disable-gpu",
  "--hide-scrollbars",
  `--window-size=${viewport.width},${viewport.height}`,
  `${baseUrl}/admin`,
], { stdio: "ignore" });

try {
  const wsUrl = await waitForDebugTarget();
  const cdp = createCdp(wsUrl);
  await cdp.ready;
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.scale,
    mobile: false,
  });
  await navigate(cdp, `${baseUrl}/admin`);

  for (const shot of pages) {
    await setAdminState(cdp, shot);
    const filename = `${shot.name}.png`;
    await screenshot(cdp, filename);
    console.log(filename);
  }

  cdp.close();
  console.log(`Saved ${pages.length} screenshots to ${outDir}`);
} finally {
  chrome.kill("SIGTERM");
}
