# 实现计划：Homepage Redesign

## 概述

将 ichuhai 虚拟商城首页从"商品发现 + 规格选择 + 快速下单"混合职责页面，重构为职责单一的纯商品广场首页。实现路径为：先添加数据常量和图标，再新增模块函数，然后修改现有函数，最后更新样式。

## 任务

- [x] 1. 新增数据常量与图标定义
  - [x] 1.1 在 `app.js` 的 `LINE_ICONS` 对象中新增 FAQ 所需图标
    - 新增 `user`、`credit-card`、`receipt`、`lightning`、`refund`、`headset` 六个 SVG path 定义
    - 参照设计文档中的 SVG path 数据
    - _需求: 7.9_

  - [x] 1.2 在 `app.js` 中新增 `HOME_FAQS` 和 `GUARANTEE_ITEMS` 数据常量
    - `HOME_FAQS` 包含 6 条平台级 FAQ（icon、question、answer 字段）
    - `GUARANTEE_ITEMS` 包含 3 项平台保障（icon、title、desc 字段）
    - FAQ 内容不得包含特定商品名称
    - _需求: 6.3, 6.4, 6.5, 7.3, 7.7_

- [x] 2. 新增 state 字段
  - [x] 2.1 在 `state` 对象中新增 `homeFaqActive` 字段
    - 默认值为 `0`（展开第一条 FAQ）
    - `null` 表示全部折叠
    - _需求: 7.4_

- [x] 3. 实现新增模块函数
  - [x] 3.1 实现 `platformGuarantee()` 函数
    - 渲染 `<section class="platform-guarantee glass">` 容器
    - 左侧标题"平台保障"，右侧遍历 `GUARANTEE_ITEMS` 渲染三项保障
    - 各项之间用 `<div class="guarantee-divider">` 分隔
    - 使用 `featureIcon()` 渲染图标
    - _需求: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 3.2 实现 `homeFaq()` 函数
    - 渲染 `<section class="home-faq">` 容器，左右两栏布局
    - 左栏：标题"常见问题"、说明文案、三项信任数据、"联系我们"链接（target="_blank" 打开 Telegram）
    - 右栏：遍历 `HOME_FAQS` 渲染手风琴列表
    - 每条 FAQ 带 `data-action="toggleFaq"` 和 `data-index` 属性
    - 根据 `state.homeFaqActive` 判断展开/折叠状态
    - 展开条目渲染 `<div class="faq-answer">` 答案内容
    - 每条标题左侧用 `lineIcon()` 渲染对应图标，右侧渲染 chevron 箭头
    - _需求: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

  - [x] 3.3 实现 `footer()` 函数
    - 渲染 `<footer class="site-footer">` 容器
    - 包含品牌标识"ichuhai"、口号"全球数字商品，一站式秒发"、版权声明"© 2024 ichuhai.com All rights reserved."
    - _需求: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 3.4 为新增模块编写单元测试
    - 测试 `platformGuarantee()` 渲染三项保障内容
    - 测试 `homeFaq()` 渲染 6 条 FAQ，默认展开第一条
    - 测试 `homeFaq()` 不含特定商品名称
    - 测试 `footer()` 包含品牌标识、口号和版权声明
    - _需求: 6.3, 6.4, 6.5, 7.3, 7.4, 7.7, 8.2, 8.3_

- [x] 4. 新增 FAQ 事件处理
  - [x] 4.1 在全局 click 事件委托中新增 `toggleFaq` action 处理
    - 读取 `el.dataset.index` 获取点击的 FAQ 索引
    - 若当前已展开该条目则折叠（设为 `null`），否则展开该条目
    - 调用 `route()` 触发重渲染
    - _需求: 7.5, 7.6_

  - [ ]* 4.2 编写 FAQ 手风琴交互属性测试
    - **Property 6: FAQ 手风琴交互**
    - **验证: 需求 7.5, 7.6**

- [x] 5. 检查点 - 确保新增模块可独立运行
  - 确保所有测试通过，如有问题请询问用户。

- [x] 6. 修改 `card()` 函数
  - [x] 6.1 将 `card(item)` 中的 `<button>` 改为 `<a>` 标签
    - 外层元素改为 `<a class="product-card" href="#/products/${item.slug}">`
    - 移除 `data-action="openProduct"` 和 `data-slug` 属性
    - 移除 `selected` 类名判断逻辑和 `✓` 勾选标记
    - 保留所有展示字段（图标、名称、规格、价格、标签）不变
    - _需求: 5.3, 5.4_

  - [ ]* 6.2 编写商品卡片属性测试
    - **Property 4: 商品卡片字段完整性**
    - **Property 5: 商品卡片导航正确性**
    - **验证: 需求 5.2, 5.3, 5.4**

- [x] 7. 修改 `productBrowser()` 函数
  - [x] 7.1 修改 `productBrowser()` 首页模式逻辑
    - 当 `full === false`（首页模式）时，移除"发货筛选"、"排序"、"仅看有货"等高级筛选控件的渲染
    - 在商品列表下方添加"查看全部商品 →"文字链接，链接指向 `#/products`
    - 移除当前首页模式下的 `›` 圆形按钮
    - _需求: 4.8, 5.5, 5.6_

  - [ ]* 7.2 编写分类与搜索过滤属性测试
    - **Property 1: 分类过滤正确性**
    - **Property 2: 搜索过滤正确性**
    - **Property 3: 分类与搜索交集**
    - **验证: 需求 4.3, 4.5, 4.6**

- [x] 8. 修改 `home()` 函数
  - [x] 8.1 重构 `home()` 函数为单栏全宽布局
    - 移除 `const item = product()` 和 `const sku = findSku(item)` 调用
    - 移除 `<section class="home-grid">` 和 `<div class="home-main">` 包裹
    - 移除 `quickOrder(item, sku)`、`optionPanel(item)`、`noticePanel(item)`、`flowStrip()` 调用
    - 保留 Hero Banner 渲染
    - 在 Hero Banner 后依次调用 `productBrowser()`、`platformGuarantee()`、`homeFaq()`、`footer()`
    - 不删除 `quickOrder`、`optionPanel`、`noticePanel`、`flowStrip` 函数源代码
    - _需求: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 9.1_

  - [ ]* 8.2 编写 `home()` 函数单元测试
    - 验证 DOM 中不含 quickOrder/optionPanel/noticePanel/flowStrip 元素
    - 验证 DOM 中不含 home-grid 类名
    - 验证模块渲染顺序：hero → productBrowser → guarantee → faq → footer
    - 验证函数 `quickOrder`、`optionPanel`、`noticePanel`、`flowStrip` 仍可调用
    - _需求: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 9.1_

- [x] 9. 检查点 - 确保 JS 逻辑完整
  - 确保所有测试通过，如有问题请询问用户。

- [x] 10. 更新 styles.css 样式
  - [x] 10.1 移除/调整 `home-grid` 相关样式
    - 移除 `.home-grid` 的 CSS Grid 双栏布局规则
    - 移除 `.home-main` 的样式规则
    - 确保首页主内容区域最大宽度 1200px 居中
    - _需求: 1.5, 9.2_

  - [x] 10.2 新增 `.platform-guarantee` 模块样式
    - 白色圆角卡片，横向单行排列（左标题 + 右三项）
    - 各保障项之间用浅紫色竖线分隔（`.guarantee-divider`）
    - 移动端（< 768px）改为纵向堆叠
    - _需求: 6.6_

  - [x] 10.3 新增 `.home-faq` 模块样式
    - 桌面端左右两栏布局：左侧深色/紫色背景信任区，右侧白色手风琴卡片
    - FAQ 条目展开/折叠动画（chevron 旋转）
    - 移动端（< 768px）改为上下堆叠
    - _需求: 7.1, 9.4_

  - [x] 10.4 新增 `.site-footer` 模块样式
    - 简洁轻量，居中对齐
    - 品牌标识、口号、版权声明排列
    - _需求: 8.4_

  - [x] 10.5 确保响应式断点和整体布局
    - 页面背景色 `#f5f7ff`
    - 各模块卡片白色半透明背景 `rgba(255,255,255,0.92)` 配圆角和阴影
    - 移动端分类 Tab 横向可滚动（`overflow-x: auto`）
    - 商品卡片移动端双列或单列网格
    - 所有模块无横向溢出
    - _需求: 9.3, 9.4, 9.5_

- [x] 11. 最终检查点 - 全面验证
  - 确保所有测试通过，如有问题请询问用户。

## 备注

- 标记 `*` 的任务为可选测试任务，可跳过以加速 MVP 交付
- 每个任务引用了具体的需求编号以确保可追溯性
- 检查点确保增量验证
- 属性测试验证通用正确性属性
- 单元测试验证具体场景和边界条件
- `quickOrder`、`optionPanel`、`noticePanel`、`flowStrip` 函数源代码保留不删除，仅从 `home()` 中移除调用

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "2.1"] },
    { "id": 1, "tasks": ["3.1", "3.2", "3.3"] },
    { "id": 2, "tasks": ["3.4", "4.1"] },
    { "id": 3, "tasks": ["4.2", "6.1"] },
    { "id": 4, "tasks": ["6.2", "7.1"] },
    { "id": 5, "tasks": ["7.2", "8.1"] },
    { "id": 6, "tasks": ["8.2", "10.1", "10.2", "10.3", "10.4"] },
    { "id": 7, "tasks": ["10.5"] }
  ]
}
```
