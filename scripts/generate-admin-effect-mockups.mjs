import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = path.resolve("artifacts/admin-effects");
const htmlDir = path.join(root, "html");
const shotDir = path.join(root, "screenshots");
const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

await mkdir(htmlDir, { recursive: true });
await mkdir(shotDir, { recursive: true });

const nav = ["概览", "商品管理", "库存卡密", "订单管理", "充值流水", "售后工单", "用户管理", "系统设置"];

const tabs = {
  products: ["商品列表", "基础信息", "前台展示", "SKU 规格", "购买字段", "分类管理", "购买字段模板"],
  inventory: ["库存池列表", "库存池详情", "批量导入", "库存记录"],
  orders: ["全部订单", "待支付", "待发货", "已完成", "异常", "退款", "订单详情", "交付记录"],
  recharge: ["充值订单", "余额流水"],
  support: ["工单列表", "工单详情", "问题类型"],
  users: ["用户列表", "用户详情", "余额调整记录"],
  system: ["支付设置", "汇率设置", "基础设置", "管理员账号"],
};

const pageMeta = {
  products: ["商品管理", "维护前台商品、SKU、购买字段与展示内容，优先处理影响上架和交付的问题。"],
  inventory: ["库存卡密", "查看库存可用性、占用状态和导入记录，确保自动发货 SKU 不断货。"],
  orders: ["订单管理", "跟踪商品订单从创建、支付到发货的处理状态。"],
  recharge: ["充值流水", "管理用户充值订单与余额变动，不混入商品订单支付。"],
  support: ["售后工单", "围绕订单、充值和交付异常处理用户问题。"],
  users: ["用户管理", "查看用户交易、售后与余额风险，辅助客服和运营判断。"],
  system: ["系统设置", "维护支付、汇率、基础配置和管理员账号，只保留必要设置入口。"],
};

const tone = {
  good: "正常",
  warn: "需处理",
  muted: "已归档",
  danger: "异常",
  blue: "进行中",
};

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[m]);
}

function shell(page) {
  const [title, desc] = pageMeta[page.section];
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(page.name)}</title><style>${css()}</style></head><body>
  <aside class="side"><div class="brand"><div class="mark">i</div><b>ichuhai</b><span>运营后台</span></div><nav>${nav.map((item) => `<span class="${item === title ? "active" : ""}">${icon(item)}${item}</span>`).join("")}</nav></aside>
  <main class="main">
    <header class="top"><div><small>ichuhai 运营后台 / ${esc(title)}</small><strong>${esc(title)}</strong></div><div class="top-actions"><button class="ghost">bitbernie</button><button class="danger-text">退出登录</button></div></header>
    <section class="content">
      <div class="page-head"><div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div>${page.action ? `<button class="primary">${page.action}</button>` : ""}</div>
      <div class="tabs">${tabs[page.section].map((t) => `<span class="${t === page.tab ? "active" : ""}">${esc(t)}</span>`).join("")}</div>
      ${page.body}
    </section>
  </main></body></html>`;
}

function icon(label) {
  return `<i>${({ "概览": "◇", "商品管理": "▣", "库存卡密": "▤", "订单管理": "▥", "充值流水": "◌", "售后工单": "◎", "用户管理": "♙", "系统设置": "⌑" }[label] || "•")}</i>`;
}

function stat(items) {
  return `<div class="stats">${items.map(([label, value, note, kind = ""]) => `<div class="stat ${kind}"><span>${label}</span><b>${value}</b><small>${note}</small></div>`).join("")}</div>`;
}

function panel(title, desc, content, cls = "") {
  return `<section class="panel ${cls}"><div class="panel-title"><div><h2>${title}</h2>${desc ? `<p>${desc}</p>` : ""}</div></div>${content}</section>`;
}

function toolbar(items, actions = "") {
  return `<div class="toolbar">${items.map((item) => `<label><span>${item[0]}</span><input value="${item[1] || ""}" placeholder="${item[2] || ""}"></label>`).join("")}<div class="toolbar-actions">${actions}</div></div>`;
}

function table(headers, rows) {
  return `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function tag(label, kind = "good") {
  return `<em class="tag ${kind}">${label}</em>`;
}

function form(fields, side = "") {
  return `<div class="form-grid"><div class="form">${fields.map((f) => `<label class="${f.big ? "big" : ""}"><span>${f.label}</span>${f.type === "textarea" ? `<textarea>${esc(f.value || "")}</textarea>` : f.type === "check" ? `<b class="check">${f.value ? "✓" : ""}</b>${esc(f.hint || "")}` : `<input value="${esc(f.value || "")}" placeholder="${esc(f.placeholder || "")}">`}</label>`).join("")}<div class="form-actions"><button class="primary">保存</button><button class="ghost">取消</button></div></div>${side}</div>`;
}

const productRows = [
  ["Discord Nitro", "社交 / 订阅", "自动发货", "<b class='danger-num'>2</b> 件<br><small>3 个 SKU 需补货</small>", tag("已上架"), "编辑 · SKU · 下架"],
  ["Spotify Premium", "音乐 / 订阅", "自动发货", "<b class='danger-num'>0</b> 件<br><small>自动发货不可售</small>", tag("需补货", "warn"), "编辑 · SKU · 下架"],
  ["YouTube Premium", "视频 / 订阅", "部分自动", "<b>0</b> 件<br><small>1 个人工 SKU</small>", tag("可售受限", "warn"), "编辑 · SKU · 下架"],
  ["Steam Wallet", "游戏 / 礼品卡", "人工处理", "<b>0</b> 件<br><small>人工交付</small>", tag("已上架"), "编辑 · SKU · 下架"],
  ["Microsoft 365", "软件 / 账号", "自动发货", "<b class='danger-num'>0</b> 件<br><small>2 个 SKU 需补货</small>", tag("需补货", "warn"), "编辑 · SKU · 下架"],
];

function products(tab) {
  const base = { section: "products", tab, action: "新增商品" };
  if (tab === "商品列表") return { ...base, name: "商品列表", body: stat([["上架商品", "5", "前台可见商品"], ["自动发货风险", "3", "库存为 0 的自动 SKU", "warn"], ["待完善字段", "2", "缺少购买字段说明"], ["最低价", "1.80 USDT", "当前可售 SKU"]]) + toolbar([["搜索商品", "", "商品名称 / SKU"], ["分类", "全部分类"], ["状态", "全部状态"], ["发货方式", "全部方式"]], "<button>重置筛选</button>") + panel("商品列表", "优先显示影响售卖与交付的风险，不再把正常项和异常项同权处理。", table(["商品", "类目 / 类型", "履约", "库存 / 价格", "状态", "操作"], productRows)) };
  if (tab === "基础信息") return { ...base, name: "基础信息", body: panel("编辑基础信息", "只保留决定商品是否能上架和交付的核心字段。", form([{ label: "商品名称", value: "Discord Nitro" }, { label: "Slug", value: "discord-nitro" }, { label: "分类", value: "社交 social" }, { label: "商品类型", value: "订阅" }, { label: "发货方式", value: "自动发货" }, { label: "上架状态", value: "已上架" }, { label: "前台展示", type: "check", value: true }, { label: "推荐/热门", type: "check", value: false }], `<aside class="summary">${tag("上架风险", "warn")}<h3>自动发货库存不足</h3><p>该商品 3 个 SKU 可用库存为 0。保存上架前建议先补货或转人工处理。</p></aside>`)) };
  if (tab === "前台展示") return { ...base, name: "前台展示", body: panel("前台展示内容", "把用户会看到的卖点、说明和售后规则集中维护，右侧同步预览。", form([{ label: "短描述", type: "textarea", value: "Discord Nitro 全球区账号权益，支持自动发货和人工补发。" }, { label: "卖点标签", type: "textarea", value: "自动发货，USDT 支付，售后协助" }, { label: "详情说明", type: "textarea", value: "适用于 Discord 账号权益开通。下单前请确认账号地区和套餐时长。" }, { label: "购买须知", type: "textarea", value: "支付成功后自动交付；库存不足会转人工处理。" }, { label: "售后规则", type: "textarea", value: "未使用权益可协助排查，已交付内容不支持无理由退款。" }], `<aside class="preview"><h3>前台预览</h3><b>Discord Nitro</b><p>自动发货 · USDT 支付 · 售后协助</p><small>购买须知和售后规则会显示在商品详情页。</small></aside>`)) };
  if (tab === "SKU 规格") return { ...base, name: "SKU 规格", body: stat([["SKU 总数", "16", "覆盖 5 个商品"], ["无可用库存", "10", "需补货或下架", "warn"], ["人工处理", "4", "需人工发货"], ["价格区间", "1.80-24.00", "USDT"]]) + toolbar([["搜索 SKU", "", "SKU ID / 商品名 / 规格"], ["商品", "全部商品"], ["库存", "全部状态"], ["发货", "全部方式"]], "<button class='primary'>新建 SKU</button><button>批量改价</button><button>批量上下架</button>") + panel("SKU 规格", "库存数量为 0 时不再显示“有货”，避免运营误判。", table(["SKU", "商品", "规格组合", "价格", "可用库存", "预警", "履约", "状态"], [["Global / 新号 / 1个月", "Discord Nitro", "Global / 新号 / 1个月", "1.80 USDT", "2", "5", "自动发货", tag("低于预警", "warn")], ["Global / 新号 / 3个月", "Discord Nitro", "Global / 新号 / 3个月", "4.80 USDT", "<b class='danger-num'>0</b>", "5", "自动发货", tag("无可用库存", "danger")], ["US / 老号 / 1个月", "Discord Nitro", "US / 老号 / 1个月", "2.10 USDT", "0", "5", "人工处理", tag("人工处理", "blue")]])) };
  if (tab === "购买字段") return { ...base, name: "购买字段", body: panel("当前商品购买字段", "先看已配置字段，再新增字段；影响 SKU 的字段会明确标记。", table(["字段", "类型", "选项", "影响 SKU", "前台显示"], [["地区 region", "select", "Global / US / EU / JP", tag("是", "blue"), tag("启用")], ["账号类型 account_type", "radio", "新号 / 老号 / 共享", tag("是", "blue"), tag("启用")], ["备注 note", "textarea", "用户补充说明", tag("否", "muted"), tag("启用")]])) + panel("新增字段", "", form([{ label: "字段 Key", value: "region" }, { label: "字段名称", value: "地区" }, { label: "字段类型", value: "select" }, { label: "选项 JSON", type: "textarea", value: '[{\"label\":\"Global\",\"value\":\"Global\"}]' }, { label: "影响 SKU", type: "check", value: true }])) };
  if (tab === "分类管理") return { ...base, name: "分类管理", body: panel("分类管理", "分类只负责前台分组和筛选，不承载商品类型和履约逻辑。", form([{ label: "分类名称", value: "" }, { label: "分类 Key", value: "" }, { label: "图标", value: "tag" }, { label: "排序", value: "10" }]) + table(["分类", "Key", "图标", "商品数", "状态", "操作"], [["社交", "social", "message-circle", "1", tag("显示"), "隐藏"], ["音乐", "music", "music", "1", tag("显示"), "隐藏"], ["更多", "more", "more-horizontal", "0", tag("建议隐藏", "warn"), "隐藏"]])) };
  return { ...base, name: "购买字段模板", body: panel("购买字段模板", "模板是复用入口，不直接写入商品；应用到商品后再调整字段。", `<div class="template-grid">${["账号信息", "礼品卡充值", "人工处理"].map((t, i) => `<article><h3>${t}</h3><p>${["邮箱、账号 ID、区服、备注", "地区、面额、接收邮箱", "联系方式、需求描述、补充说明"][i]}</p>${tag("可用")}<button>应用到商品</button></article>`).join("")}</div>`) + panel("新增模板字段", "", form([{ label: "模板名称", value: "" }, { label: "字段 Key", value: "region" }, { label: "字段名称", value: "地区" }, { label: "字段类型", value: "select" }, { label: "选项 JSON", type: "textarea", value: "" }])) };
}

function inventory(tab) {
  const base = { section: "inventory", tab, action: tab === "批量导入" ? "" : "批量导入" };
  if (tab === "库存池列表") return { ...base, name: "库存池列表", body: stat([["可用库存", "2", "可自动交付"], ["预警 SKU", "10", "低于预警值", "warn"], ["已占用", "0", "支付中订单"], ["已交付", "0", "今日"]]) + toolbar([["搜索库存", "", "卡密 / 商品 / 订单"], ["类型", "全部类型"], ["状态", "全部状态"]]) + panel("库存池列表", "库存明文默认隐藏，正常运营只看状态和关联订单。", table(["库存预览", "商品", "SKU", "类型", "状态", "绑定订单", "操作"], [["DN••••••2A", "Discord Nitro", "dn-g-new-1", "卡密", tag("可用"), "-", "查看明文 · 作废"], ["SP••••••9F", "Spotify Premium", "sp-1", "账号", tag("低库存", "warn"), "-", "查看明文 · 作废"]])) };
  if (tab === "库存池详情") return { ...base, name: "库存池详情", body: panel("库存池详情", "按状态查看占用、交付与可用内容，避免库存被重复发放。", table(["库存", "商品 / SKU", "绑定订单", "状态", "占用时间"], [["暂无占用", "-", "-", tag("空闲", "muted"), "-"]])) };
  if (tab === "批量导入") return { ...base, name: "批量导入", body: `<div class="steps">${["选择商品和 SKU", "选择库存类型", "粘贴库存", "预览校验", "确认导入"].map((s, i) => `<span class="${i < 2 ? "active" : ""}">${i + 1}. ${s}</span>`).join("")}</div>` + panel("批量导入库存", "提交前先校验格式、重复行和 SKU 是否存在。", form([{ label: "商品", value: "Discord Nitro" }, { label: "SKU", value: "Global / 新号 / 1个月" }, { label: "库存类型", value: "卡密 card" }, { label: "库存内容", type: "textarea", value: "CODE-AAAA-BBBB\\nCODE-CCCC-DDDD", big: true }], `<aside class="summary"><h3>解析预览</h3><p>成功 2 行，重复 0 行，错误 0 行。</p>${tag("可导入")}</aside>`)) };
  return { ...base, name: "库存记录", body: panel("库存记录", "每次导入生成批次记录，方便回溯和审计。", table(["批次", "类型", "SKU", "成功", "重复", "失败", "创建时间"], [["7ac91e20", "card", "dn-g-new-1", "20", "0", "0", "今天 13:20"], ["9fb8210a", "account", "sp-1", "8", "1", "0", "昨天 18:02"]])) };
}

function orders(tab) {
  const base = { section: "orders", tab };
  const body = stat([["待支付", "0", "无需人工"], ["待发货", "0", "已支付待处理"], ["异常", "0", "支付或发货异常"], ["今日成交", "0.000", "USDT"]]) + toolbar([["搜索订单", "", "订单号 / 用户 / TXID"], ["支付网络", "全部网络"], ["日期", "今天"]]) + panel(tab, "订单列表只保留处理判断需要的信息，详情和发货动作进入右侧操作。", table(["订单号", "商品", "金额", "支付", "发货", "用户", "时间", "操作"], [["暂无订单", "-", "-", tag("无", "muted"), tag("无", "muted"), "-", "-", ""]]));
  if (tab === "订单详情") return { ...base, name: tab, body: panel("订单详情", "详情页按处理顺序展示：订单、支付、发货、通知、工单和日志。", `<div class="detail-grid"><article><h3>订单信息</h3><p>暂无选中订单。选择订单后显示完整链路。</p></article><article><h3>支付与发货</h3><p>支付确认、库存占用和发货记录会集中展示。</p></article></div>`) };
  if (tab === "交付记录") return { ...base, name: tab, body: panel("交付记录", "只展示脱敏交付结果，明文仍由库存模块管控。", table(["订单", "方式", "内容预览", "状态", "时间"], [["暂无交付记录", "-", "***", tag("无", "muted"), "-"]])) };
  return { ...base, name: tab, body };
}

function simpleSection(section, tab) {
  const base = { section, tab };
  if (section === "recharge") return { ...base, name: tab, body: stat([["待确认充值", "0", "需要财务处理"], ["今日入账", "0.000", "USDT"], ["余额变动", "0", "今日记录"], ["异常", "0", "金额或链路异常"]]) + panel(tab, "充值与余额流水分离展示，避免和商品订单支付混淆。", table(["对象", "金额", "方式 / 详情", "时间", "状态"], [["暂无记录", "-", "-", "-", tag("无", "muted")]])) };
  if (section === "support") return { ...base, name: tab, body: stat([["待回复", "0", "open / in progress 已改中文"], ["处理中", "0", "客服跟进"], ["紧急", "0", "优先处理"], ["今日关闭", "0", "已解决"]]) + panel(tab, "工单围绕订单和充值处理，不承载营销或内容反馈。", table(["工单", "关联对象", "问题", "状态", "优先级", "操作"], [["暂无工单", "-", "-", tag("无", "muted"), tag("普通", "muted"), "-"]])) };
  if (section === "users") return { ...base, name: tab, body: stat([["用户数", "0", "来自下单记录"], ["有交易用户", "0", "已支付订单"], ["售后用户", "0", "有工单记录"], ["风险用户", "0", "黑名单或异常"]]) + panel(tab, "用户页服务于客服判断，不做无意义用户画像。", table(["用户", "Telegram", "订单数", "成交金额", "售后", "风险", "操作"], [["暂无用户", "-", "0", "0.000 USDT", "0", tag("正常"), "-"]])) };
  return { ...base, name: tab, body: panel(tab, "系统设置只展示必要配置，敏感写操作需要二次确认和审计。", table(["配置项", "当前值", "状态", "说明"], [["USDT TRC20", "已配置", tag("启用"), "新订单使用固定收款地址"], ["汇率", "自动同步", tag("正常"), "前台展示和充值折算"], ["管理员", "只读配置", tag("只读", "muted"), "生产环境通过环境变量管理"]])) };
}

const pages = [
  ...tabs.products.map((tab) => products(tab)),
  ...tabs.inventory.map((tab) => inventory(tab)),
  ...tabs.orders.map((tab) => orders(tab)),
  ...tabs.recharge.map((tab) => simpleSection("recharge", tab)),
  ...tabs.support.map((tab) => simpleSection("support", tab)),
  ...tabs.users.map((tab) => simpleSection("users", tab)),
  ...tabs.system.map((tab) => simpleSection("system", tab)),
];

function fileName(page, index) {
  return `${String(index + 1).padStart(2, "0")}-${page.section}-${page.tab.replace(/[\\s/]+/g, "-")}`;
}

for (const [index, page] of pages.entries()) {
  const base = fileName(page, index);
  const html = shell(page);
  const htmlPath = path.join(htmlDir, `${base}.html`);
  const pngPath = path.join(shotDir, `${base}.png`);
  await writeFile(htmlPath, html);
  execFileSync(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=2",
    "--window-size=1470,845",
    `--screenshot=${pngPath}`,
    `file://${htmlPath}`,
  ], { stdio: "ignore" });
  console.log(pngPath);
}

function css() {
  return `
  *{box-sizing:border-box}body{margin:0;background:#f6f8fc;color:#142033;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Inter","Segoe UI",sans-serif;font-size:14px;letter-spacing:0}.side{position:fixed;inset:0 auto 0 0;width:238px;background:#fff;border-right:1px solid #e6edf6;padding:34px 24px}.brand{height:138px;display:flex;flex-direction:column;gap:8px;justify-content:center}.mark{width:34px;height:34px;border-radius:10px;background:#635bff;color:#fff;display:grid;place-items:center;font-weight:800}.brand b{font-size:25px}.brand span{color:#64748b;font-weight:600}nav{display:grid;gap:8px;border-top:1px solid #edf2f8;padding-top:22px}nav span{height:48px;display:flex;align-items:center;gap:12px;padding:0 12px;border-radius:10px;color:#475569;font-weight:650}nav i{width:20px;color:#94a3b8;font-style:normal}.active{background:#eef0ff;color:#5b5cf6}.main{margin-left:238px;min-height:100vh}.top{height:76px;background:#fff;border-bottom:1px solid #e6edf6;display:flex;align-items:center;justify-content:space-between;padding:0 32px}.top small{display:block;color:#64748b;font-weight:700}.top strong{display:block;font-size:18px;margin-top:4px}.top-actions{display:flex;gap:12px}.content{padding:28px 32px 40px}.page-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px}.page-head h1{font-size:28px;line-height:1.15;margin:0 0 8px}.page-head p{margin:0;color:#64748b}.tabs{display:flex;gap:6px;margin-bottom:18px}.tabs span{padding:11px 16px;border-radius:10px;color:#334155;font-weight:700}.tabs .active{background:#fff;box-shadow:0 8px 22px rgba(89,99,188,.12);color:#5b5cf6}.primary,button{height:40px;border:1px solid #dbe4ef;background:#fff;border-radius:10px;padding:0 18px;font-weight:750;color:#243044}.primary{background:#5b5cf6;color:#fff;border-color:#5b5cf6}.ghost{background:#fff}.danger-text{border-color:#fecaca;color:#dc2626;background:#fff}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}.stat{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px}.stat span{display:block;color:#64748b;font-weight:700}.stat b{display:block;font-size:27px;margin:8px 0;color:#0f172a}.stat small{color:#64748b}.stat.warn{border-color:#fed7aa;background:#fffaf2}.toolbar{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:16px;display:grid;grid-template-columns:repeat(4,1fr) auto;gap:12px;margin-bottom:16px}.toolbar label span,.form label span{display:block;color:#64748b;font-size:12px;font-weight:750;margin-bottom:7px}input,textarea{width:100%;border:1px solid #dbe4ef;border-radius:10px;height:42px;padding:0 13px;color:#243044;background:#fff;font:inherit}textarea{height:84px;padding:12px;resize:none}.toolbar-actions{display:flex;align-items:end;gap:10px}.panel{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:18px;margin-bottom:16px}.panel-title{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px}.panel-title h2{font-size:18px;margin:0 0 5px}.panel-title p{margin:0;color:#64748b}table{width:100%;border-collapse:separate;border-spacing:0;border:1px solid #e7edf5;border-radius:12px;overflow:hidden}th{background:#f8fafc;color:#64748b;font-size:12px;text-align:left;padding:13px 14px;font-weight:800}td{padding:14px;border-top:1px solid #edf2f7;vertical-align:middle}td small{display:block;color:#8a98aa;margin-top:4px}.tag{display:inline-flex;height:24px;align-items:center;border-radius:999px;padding:0 9px;background:#dcfce7;color:#15803d;font-style:normal;font-size:12px;font-weight:800}.tag.warn{background:#fff3cd;color:#b45309}.tag.danger{background:#fee2e2;color:#dc2626}.tag.blue{background:#dbeafe;color:#2563eb}.tag.muted{background:#f1f5f9;color:#64748b}.danger-num{color:#dc2626}.form-grid{display:grid;grid-template-columns:1fr 310px;gap:18px}.form{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.form label.big,.form-actions{grid-column:1/-1}.check{display:inline-grid;place-items:center;width:18px;height:18px;border-radius:5px;border:1px solid #8da2c0;margin-right:8px;color:#5b5cf6}.summary,.preview{border:1px solid #e2e8f0;border-radius:12px;padding:18px;background:#f8fafc}.summary h3,.preview h3{margin:12px 0 8px}.summary p,.preview p{color:#64748b;line-height:1.6}.template-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.template-grid article,.detail-grid article{border:1px solid #e2e8f0;border-radius:12px;padding:18px;background:#fbfdff}.template-grid h3,.detail-grid h3{margin:0 0 8px}.template-grid p,.detail-grid p{color:#64748b;line-height:1.6}.steps{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px}.steps span{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:13px;color:#64748b;font-weight:750}.steps .active{background:#eef0ff;color:#5b5cf6}.detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}@media(max-width:900px){.side{display:none}.main{margin:0}.toolbar,.stats,.form-grid{grid-template-columns:1fr}.form{grid-template-columns:1fr}}
  `;
}
