# GlassFuture Market 视觉逐页验收

生成时间：2026-05-10T10:29:57.444Z

说明：本报告按 01-05 效果图对应当前页面进行同视口截图。当前脚本做截图尺寸、页面可渲染、布局裁切的自动验收；严格像素差异仍建议由设计侧在截图文件中人工复核，因为页面含动态订单号、时间、倒计时和表单状态。

| 页面 | 路由 | 参考图 | 参考尺寸 | 当前截图 | 当前尺寸 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| home | `#/` | `01.png` | 1586x992 | `artifacts/visual-audit/home.png` | 1586x992 | pass |
| detail | `#/product/discord-nitro` | `02.png` | 1586x992 | `artifacts/visual-audit/detail.png` | 1586x992 | pass |
| checkout | `#/checkout` | `03.png` | 1586x992 | `artifacts/visual-audit/checkout.png` | 1586x992 | pass |
| payment | `#/pay/demo` | `04.png` | 1586x992 | `artifacts/visual-audit/payment.png` | 1586x992 | pass |
| success | `#/order/demo/success` | `05.png` | 1586x992 | `artifacts/visual-audit/success.png` | 1586x992 | pass |
| mobile-home | `#/` | `01 homepage.png` | 1672x941 | `artifacts/visual-audit/mobile-home.png` | 390x844 | pass |

结论：

- 首页、详情、确认、支付、完成页均可在目标视口渲染并输出截图。
- 桌面端按 `1586x992` 视口对齐 01-05 主参考图。
- 移动端首页按 `390x844` 额外截图，确认顶部、Hero、分类区域没有裁切。
- 严格像素级复核的下一步是把 `artifacts/visual-audit/*.png` 与设计稿叠图比较，并确认动态内容允许差异。
