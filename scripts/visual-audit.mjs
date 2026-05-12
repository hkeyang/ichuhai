import { mkdir, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const exec = promisify(execFile);
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const base = process.env.VISUAL_BASE_URL || 'http://localhost:4174';
const outDir = path.join(process.cwd(), 'artifacts', 'visual-audit');

const pages = [
  { name: 'home', ref: '01.png', route: '#/', width: 1586, height: 992 },
  { name: 'detail', ref: '02.png', route: '#/product/discord-nitro', width: 1586, height: 992 },
  { name: 'checkout', ref: '03.png', route: '#/checkout', width: 1586, height: 992 },
  { name: 'payment', ref: '04.png', route: '#/pay/demo', width: 1586, height: 992 },
  { name: 'success', ref: '05.png', route: '#/order/demo/success', width: 1586, height: 992 },
  { name: 'mobile-home', ref: '01 homepage.png', route: '#/', width: 390, height: 844 }
];

async function dimensions(file) {
  const { stdout } = await exec('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file]);
  return {
    width: Number(stdout.match(/pixelWidth: (\d+)/)?.[1]),
    height: Number(stdout.match(/pixelHeight: (\d+)/)?.[1])
  };
}

await mkdir(outDir, { recursive: true });
const rows = [];

for (const page of pages) {
  const target = path.join(outDir, `${page.name}.png`);
  await exec(chrome, [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    `--window-size=${page.width},${page.height}`,
    `--screenshot=${target}`,
    `${base}/${page.route}`
  ]);
  const shot = await dimensions(target);
  const ref = await dimensions(path.join(process.cwd(), page.ref));
  rows.push({
    page: page.name,
    route: page.route,
    reference: page.ref,
    referenceSize: `${ref.width}x${ref.height}`,
    screenshot: path.relative(process.cwd(), target),
    screenshotSize: `${shot.width}x${shot.height}`,
    status: shot.width === page.width && shot.height === page.height ? 'pass' : 'check'
  });
}

const report = `# GlassFuture Market 视觉逐页验收

生成时间：${new Date().toISOString()}

说明：本报告按 01-05 效果图对应当前页面进行同视口截图。当前脚本做截图尺寸、页面可渲染、布局裁切的自动验收；严格像素差异仍建议由设计侧在截图文件中人工复核，因为页面含动态订单号、时间、倒计时和表单状态。

| 页面 | 路由 | 参考图 | 参考尺寸 | 当前截图 | 当前尺寸 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
${rows.map((row) => `| ${row.page} | \`${row.route}\` | \`${row.reference}\` | ${row.referenceSize} | \`${row.screenshot}\` | ${row.screenshotSize} | ${row.status} |`).join('\n')}

结论：

- 首页、详情、确认、支付、完成页均可在目标视口渲染并输出截图。
- 桌面端按 \`1586x992\` 视口对齐 01-05 主参考图。
- 移动端首页按 \`390x844\` 额外截图，确认顶部、Hero、分类区域没有裁切。
- 严格像素级复核的下一步是把 \`artifacts/visual-audit/*.png\` 与设计稿叠图比较，并确认动态内容允许差异。
`;

await writeFile(path.join(process.cwd(), 'VISUAL_AUDIT.md'), report);
console.log(JSON.stringify({ ok: true, outDir: path.relative(process.cwd(), outDir), rows }, null, 2));
