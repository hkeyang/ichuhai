# Requirements Document

## Introduction

ichuhai 虚拟商城的"运营后台"目前只是把功能字段堆砌出来，没有按照专业管理后台应有的产品设计、信息架构、组件规范、业务流程来构建，存在以下系统级问题：

- 顶部导航沿用前台导航（含"帮助中心 / Telegram 登录 / CNY / 我的订单"），不像后台。
- 左侧菜单缺乏二级层级，每个"中心"将列表页/详情页/配置页全部塞进一个页面。
- 页面缺少标准的"页面标题 + 说明 + 工具栏 + 表格 + 分页 + 空状态"统一结构，全是大卡片堆砌。
- 表单（尤其是库存导入）字段说明、表单分组、校验、预览、错误提示、批次记录全部缺失。
- 订单中心仅保留 Tab 与"暂无订单"，缺少搜索、筛选、详情、批量操作。
- 支付中心收款地址直接编辑、缺二次确认、缺操作日志、缺只读/编辑区分、缺支付异常列表与人工处理能力。
- 全后台页面宽度、间距、卡片高度、表格、输入框、按钮规格不统一。

本次重构是一次"系统级"的后台再设计：**保留现有后端 API 与数据模型逻辑**，仅重构后台的页面结构、信息架构、UI 组件、操作流程，使其达到专业管理后台水准。

本需求文档把范围限定为后台管理控制台（Admin Console），不涉及前台商城页面与后端业务逻辑。文档同时把 5 个核心页面单独列为 **P0 里程碑**：后台 Layout、商品列表页、商品编辑页、库存导入页、订单详情页。

## Glossary

- **Admin_Console**：本次重构的目标系统，即虚拟商城的运营后台。
- **Admin_User**：通过管理员凭证登录后台、操作业务数据的运营/客服/管理员角色。
- **Admin_Layout**：后台全局布局组件，包含顶部栏、左侧菜单、内容区。
- **Admin_TopBar**：后台顶部栏，承载系统名/面包屑、全局搜索、通知、管理员账号、退出操作。
- **Admin_SideNav**：后台左侧一级菜单与二级菜单。
- **Admin_PageShell**：后台内容区统一容器，提供页面标题、说明、工具栏、内容主体、分页/空状态等结构槽位。
- **Admin_Toolbar**：页面工具栏，承载搜索框、筛选项、批量操作、新增按钮等。
- **Admin_DesignSystem**：后台统一组件库与视觉规范，含 Table、FilterBar、StatusBadge、Button、Input、Select、Textarea、EmptyState、ConfirmModal、Toast、Pagination、Tab、Drawer、Modal、DataCard。
- **Operation_Dashboard**：运营看板模块。
- **Product_Center**：商品中心模块（商品列表、商品分类、商品标签、SKU 管理）。
- **Inventory_Center**：库存中心模块（库存总览、卡密库存、账号库存、导入批次、库存预警、库存占用记录）。
- **Order_Center**：订单中心模块。
- **Payment_Center**：支付中心模块（支付网络、收款地址、到账交易、支付异常）。
- **Shipment_Center**：发货中心模块（发货队列、自动发货日志、人工发货队列、发货失败重试）。
- **AfterSales_Center**：售后中心模块。
- **User_Center**：用户中心模块。
- **Content_Center**：内容中心模块。
- **Marketing_Center**：营销中心模块。
- **Notification_Center**：通知中心模块。
- **System_Settings**：系统设置模块。
- **Audit_Log_Center**：审计日志模块。
- **Inventory_Item**：单条库存数据，类型为卡密或账号。
- **Inventory_Batch**：一次库存导入产生的批次记录。
- **Confirm_Modal**：危险操作的二次确认弹窗（含管理员密码输入或文字确认）。
- **Audit_Log**：高风险操作的审计记录（操作人、操作时间、IP、操作前/后值）。
- **Status_Badge**：表格中显示业务状态的彩色标签组件。
- **Empty_State**：列表/表格无数据时的空状态组件，含图标、说明文案、引导操作。
- **P0_Milestone_Pages**：本次重构的 5 个核心交付页面：后台 Layout、商品列表页、商品编辑页、库存导入页、订单详情页。

## Requirements

---

## 一、全局布局与设计系统需求

### Requirement 1：后台顶部栏（Admin_TopBar）

**User Story:** 作为 Admin_User，我希望进入后台后看到的是"后台顶部栏"而不是前台顶部栏，以便明确当前处于运营后台环境，并能够快速访问全局搜索、通知和账号操作。

#### Acceptance Criteria

1. THE Admin_Console SHALL 在所有后台页面顶部渲染统一的 Admin_TopBar。
2. THE Admin_TopBar SHALL 在左侧区域显示系统名称与当前页面的面包屑路径。
3. THE Admin_TopBar SHALL 在中部区域提供全局搜索框，支持按订单号、商品名、用户标识进行检索。
4. THE Admin_TopBar SHALL 在右侧区域依次显示通知入口、管理员账号信息与退出登录操作。
5. THE Admin_TopBar SHALL 不包含任何面向终端用户的前台导航入口,示例性的不允许元素包括但不限于"帮助中心""Telegram 登录""货币切换""我的订单"。
6. WHEN Admin_User 在 Admin_TopBar 全局搜索框中提交搜索关键词,THE Admin_Console SHALL 跳转到对应的搜索结果页面或在表格中过滤出匹配结果。
7. WHEN Admin_User 触发退出登录操作,THE Admin_Console SHALL 立即清除当前管理员会话并重定向到管理员登录页,且不弹出二次确认。

### Requirement 2：后台左侧菜单（Admin_SideNav）

**User Story:** 作为 Admin_User，我希望左侧菜单具备一级与二级层级结构，每个业务中心都能展开到具体子页面，以便我能在不同列表页、详情页、配置页之间清晰导航。

#### Acceptance Criteria

1. THE Admin_SideNav SHALL 提供以下一级菜单项：运营看板、商品中心、库存中心、订单中心、支付中心、发货中心、售后中心、用户中心、内容中心、营销中心、通知中心、系统设置、审计日志。
2. THE Admin_SideNav SHALL 为每个具有多个子页面的一级菜单项提供二级菜单。
3. THE Admin_SideNav SHALL 保持所有一级菜单项视觉高度一致,且该一致性不因图标尺寸或文本长度差异而改变。
4. WHEN Admin_User 点击某个一级菜单项,THE Admin_Console SHALL 展开该项的二级菜单并跳转到该模块的默认页面。
5. WHEN Admin_User 进入某个二级页面,THE Admin_SideNav SHALL 将对应的一级菜单与二级菜单同时标记为选中态。
6. THE Admin_SideNav SHALL 使用统一的选中态视觉风格,且选中态视觉强度不得喧宾夺主。

### Requirement 3：后台内容区统一布局（Admin_PageShell）

**User Story:** 作为 Admin_User，我希望所有后台业务页面遵循同一种内容区布局，以便在不同模块间切换时不需要重新学习页面结构。

#### Acceptance Criteria

1. THE Admin_PageShell SHALL 自上而下提供以下结构槽位：页面标题、页面说明、工具栏、内容主体、分页或空状态。
2. THE Admin_PageShell SHALL 在所有后台页面采用统一的最大内容宽度。
3. THE Admin_PageShell SHALL 在所有后台页面采用统一的左右外边距。
4. THE Admin_PageShell SHALL 在所有后台页面采用统一的卡片内边距、标题与正文间距、模块之间间距。
5. THE Admin_PageShell SHALL 在所有后台页面采用统一的表格行高、输入框高度、按钮高度。
6. WHERE 某个页面的内容主体为表格,THE Admin_PageShell SHALL 在表格上方渲染 Admin_Toolbar,在表格下方渲染分页组件。
7. WHERE 某个页面的内容主体为表单,THE Admin_PageShell SHALL 在表单底部渲染统一的"保存 / 取消"操作区。

### Requirement 4：后台标准工具栏（Admin_Toolbar）

**User Story:** 作为 Admin_User，我希望每个列表型页面都有一致的工具栏结构，以便我可以用相同的操作模式完成搜索、筛选、批量操作和新增。

#### Acceptance Criteria

1. THE Admin_Toolbar SHALL 自左向右依次容纳：搜索框、筛选项、批量操作下拉、主操作按钮（如"新增"）。
2. WHEN Admin_User 在 Admin_Toolbar 输入搜索关键词,THE Admin_Console SHALL 对当前页面表格执行过滤。
3. WHEN Admin_User 在 Admin_Toolbar 选择某个筛选项,THE Admin_Console SHALL 立即将该筛选条件应用到当前页面表格。
4. WHEN Admin_User 在表格中选中一条或多条记录,THE Admin_Toolbar SHALL 启用批量操作下拉。
5. IF 当前用户不具备执行某项主操作或批量操作的权限,THEN THE Admin_Toolbar SHALL 隐藏该操作或将其置为禁用态。

### Requirement 5：后台设计系统（Admin_DesignSystem）

**User Story:** 作为 Admin_User，我希望所有后台页面使用同一套 UI 组件，以便页面之间的输入、按钮、表格、状态展示风格保持一致。

#### Acceptance Criteria

1. THE Admin_Console SHALL 在所有页面统一使用以下组件：Table、FilterBar、StatusBadge、Button、Input、Select、Textarea、EmptyState、ConfirmModal、Toast、Pagination、Tab、Drawer、Modal、DataCard。
2. THE Admin_DesignSystem SHALL 定义 Button 的 Primary、Secondary、Danger 三种变体，且全后台只允许使用这三种变体。
3. THE Admin_DesignSystem SHALL 为每种业务状态定义统一的 StatusBadge 颜色映射。
4. THE Admin_DesignSystem SHALL 在所有同等用途的输入控件上使用统一尺寸、统一圆角、统一边框。
5. WHEN 任意业务页面新增一种状态文案或操作按钮,THE Admin_Console SHALL 复用 Admin_DesignSystem 已有组件而不引入新的样式分支,且即使部分历史页面仍未完全迁移到统一组件集,也不影响新增页面对统一组件集的复用。

### Requirement 6：后台状态与反馈

**User Story:** 作为 Admin_User，我希望在等待加载、查询为空、操作失败、操作成功等情况下都能收到清晰反馈，以便我对系统状态和操作结果有确定性认知。

#### Acceptance Criteria

1. THE Admin_Console SHALL 为所有数据请求过程提供加载中状态。
2. WHEN 一个列表查询返回零条记录,THE Admin_Console SHALL 渲染 EmptyState 组件并展示与该业务相关的空状态文案。
3. IF 一个数据请求返回错误,THEN THE Admin_Console SHALL 在页面内展示错误状态并提供"重试"操作。
4. WHEN Admin_User 完成一项保存或导入操作,THE Admin_Console SHALL 通过 Toast 反馈成功结果,无论该操作的结果类型是否与触发操作类型一致。
5. IF Admin_User 触发一项保存或导入操作并失败,THEN THE Admin_Console SHALL 通过 Toast 反馈失败结果并显示错误原因。
6. THE Admin_Console SHALL 在长耗时任务进行中时展示"处理中"状态并禁止重复提交。
7. THE Admin_Console SHALL 在权限不足时展示禁用态而不是直接隐藏控件,以便用户理解为何无法操作。

### Requirement 7：危险操作的二次确认与审计

**User Story:** 作为运营负责人，我希望所有可能导致资损或难以回滚的危险操作都强制走二次确认并写入审计日志，以便事后可追溯且降低误操作风险。

#### Acceptance Criteria

1. THE Admin_Console SHALL 将以下操作识别为危险操作：修改收款地址、查看库存明文、手动确认支付、手动绑定支付到订单、删除订单、作废库存、修改支付网络合约地址。
2. WHEN Admin_User 触发任意危险操作,THE Admin_Console SHALL 弹出 Confirm_Modal 要求二次确认。
3. WHERE 危险操作涉及资金或收款配置,THE Confirm_Modal SHALL 要求 Admin_User 输入管理员密码进行二次身份核验。
4. WHEN Admin_User 完成危险操作的二次确认并执行,THE Admin_Console SHALL 写入一条 Audit_Log,记录操作人、操作时间、IP、操作前值、操作后值、操作类型。
5. IF 危险操作的二次确认未通过,THEN THE Admin_Console SHALL 中止本次操作并保持原数据不变。

---

## 二、各模块业务需求

### Requirement 8：运营看板（Operation_Dashboard）

**User Story:** 作为 Admin_User，我希望进入后台的第一屏能够快速看到当日核心运营指标和待处理事项，以便迅速定位到需要人工介入的业务。

#### Acceptance Criteria

1. THE Operation_Dashboard SHALL 在顶部展示 8 张数据卡片：今日订单、今日成交额、待发货、发货失败、售后待处理、库存预警、支付异常、通知失败。
2. WHEN Admin_User 点击任意一张数据卡片,THE Operation_Dashboard SHALL 跳转到对应模块的列表页并自动应用与卡片含义匹配的筛选条件。
3. THE Operation_Dashboard SHALL 提供"待处理队列"区域,并按"待人工发货""支付异常""发货失败""售后待回复""库存不足"五个分类分别展示。
4. THE Operation_Dashboard SHALL 在每个待处理分类下展示最多 5 条最近记录。
5. THE Operation_Dashboard SHALL 以表格形式展示库存预警,字段包含：商品、SKU、当前库存、预警阈值、发货方式、操作。

### Requirement 9：商品中心（Product_Center）—— 信息架构

**User Story:** 作为 Admin_User，我希望商品相关功能拆分为独立子页面，以便每个页面专注一类操作，不再把列表、配置、SKU 管理混在一起。

#### Acceptance Criteria

1. THE Product_Center SHALL 拆分为四个子页面：商品列表、商品分类、商品标签、SKU 管理。
2. THE Product_Center SHALL 在 Admin_SideNav 中以二级菜单形式列出上述四个子页面。
3. THE Admin_Console SHALL 通过独立路由分别承载上述四个子页面。

### Requirement 10：商品中心 —— 商品列表

**User Story:** 作为 Admin_User，我希望以表格的形式查看和管理所有商品，以便高效完成搜索、筛选、上下架等运营操作。

#### Acceptance Criteria

1. THE Product_Center SHALL 在商品列表页以表格形式展示商品,字段包含：商品、分类、类型、SKU 数、最低价、库存状态、发货方式、状态、前台展示、更新时间、操作。
2. THE Product_Center SHALL 在商品列表页的 Admin_Toolbar 中提供：搜索框、分类筛选、状态筛选、发货方式筛选、新增商品按钮。
3. WHEN Admin_User 在商品列表的搜索框中输入关键词,THE Product_Center SHALL 在商品名与商品描述中执行过滤。
4. THE Product_Center SHALL 为商品列表的"库存状态""发货方式""状态""前台展示"字段使用 StatusBadge 展示。
5. THE Product_Center SHALL 在商品列表底部渲染分页组件。
6. WHEN 商品列表查询返回零条记录,THE Product_Center SHALL 渲染商品维度的 EmptyState。

### Requirement 11：商品中心 —— 商品编辑（Tab 化）

**User Story:** 作为 Admin_User，我希望在商品编辑页通过分组的 Tab 完成不同维度配置，以便复杂的商品配置不再被堆在一个长表单上。

#### Acceptance Criteria

1. THE Product_Center SHALL 在商品编辑页提供以下 7 个 Tab：基础信息、购买字段、SKU 配置、库存绑定、发货规则、购买须知、展示设置。
2. THE Product_Center SHALL 把"购买字段"作为商品级配置而非全局公共配置。
3. WHEN Admin_User 在商品编辑页切换 Tab,THE Product_Center SHALL 保留尚未保存的本地修改并提示存在未保存变更。
4. WHEN Admin_User 在商品编辑页提交保存,THE Product_Center SHALL 校验所有 Tab 的必填字段,在校验失败时把焦点定位到第一个未通过校验的字段,并在校验通过时正常完成保存。
5. IF 在商品编辑页存在未保存的修改且 Admin_User 尝试离开页面,THEN THE Product_Center SHALL 弹出 Confirm_Modal 提示是否放弃修改。

### Requirement 12：商品中心 —— 商品分类

**User Story:** 作为 Admin_User，我希望以表格形式管理商品分类，以便控制前台分类导航与商品归属。

#### Acceptance Criteria

1. THE Product_Center SHALL 在商品分类页以表格形式展示分类,字段包含：分类名称、Key、图标、排序、是否显示、商品数量、操作。
2. THE Product_Center SHALL 在商品分类页的 Admin_Toolbar 中提供"新增分类"按钮。
3. WHEN Admin_User 修改某条分类的"是否显示"开关,THE Product_Center SHALL 立即保存并通过 Toast 反馈结果。

### Requirement 13：商品中心 —— SKU 管理

**User Story:** 作为 Admin_User，我希望在 SKU 管理页对所有 SKU 做跨商品的批量操作，以便提升日常调价、调整预警等运营效率。

#### Acceptance Criteria

1. THE Product_Center SHALL 在 SKU 管理页的 Admin_Toolbar 中提供：搜索框、商品筛选、库存状态筛选、发货方式筛选。
2. THE Product_Center SHALL 在 SKU 管理页支持以下批量操作：批量改价、批量上下架、批量设置预警阈值。
3. WHEN Admin_User 选中一条或多条 SKU 并触发批量操作,THE Product_Center SHALL 在执行前弹出 Confirm_Modal 展示影响范围。
4. WHEN Admin_User 完成批量操作,THE Product_Center SHALL 通过 Toast 反馈成功条数与失败条数。

### Requirement 14：库存中心（Inventory_Center）—— 信息架构

**User Story:** 作为 Admin_User，我希望库存相关功能拆分为独立子页面，以便分别管理卡密、账号、导入批次、预警和占用记录。

#### Acceptance Criteria

1. THE Inventory_Center SHALL 拆分为六个子页面：库存总览、卡密库存、账号库存、导入批次、库存预警、库存占用记录。
2. THE Inventory_Center SHALL 在 Admin_SideNav 中以二级菜单形式列出上述六个子页面。

### Requirement 15：库存中心 —— 库存列表展示

**User Story:** 作为 Admin_User，我希望库存列表默认对敏感字段做脱敏展示，并清晰区分库存的业务状态，以便降低误泄露风险并快速定位异常库存。

#### Acceptance Criteria

1. THE Inventory_Center SHALL 在库存列表中以下列字段展示：库存内容预览（默认脱敏）、商品、SKU、类型、状态、绑定订单、导入批次、创建时间、售出时间、操作。
2. THE Inventory_Center SHALL 为库存列表的"状态"字段使用 StatusBadge 展示,可选值为：未售出、已锁定、已售出、已作废、异常。
3. THE Inventory_Center SHALL 在库存列表中以脱敏形式展示"库存内容预览"。
4. WHEN Admin_User 触发"查看明文"操作,THE Admin_Console SHALL 校验当前管理员是否具备查看明文的权限。
5. IF Admin_User 触发"查看明文"操作但不具备查看明文权限,THEN THE Admin_Console SHALL 拒绝展示并通过 Toast 提示权限不足。
6. WHEN Admin_User 成功查看库存明文,THE Admin_Console SHALL 写入一条 Audit_Log 记录查看动作。

### Requirement 16：库存中心 —— 库存导入分步流程

**User Story:** 作为 Admin_User，我希望库存导入是一个分步骤可预览的流程，以便在真正写入库存前能确认解析结果与查重情况，避免脏数据进入系统。

#### Acceptance Criteria

1. THE Inventory_Center SHALL 在库存导入页采用 5 步流程：选择商品和 SKU、选择库存类型、粘贴或上传、预览解析、确认导入。
2. THE Inventory_Center SHALL 在"粘贴或上传"步骤的输入框旁展示对应库存类型的格式示例。
3. WHERE 库存类型为"卡密",THE Inventory_Center SHALL 展示格式示例 `CODE-AAAA-BBBB`。
4. WHERE 库存类型为"账号",THE Inventory_Center SHALL 展示格式示例 `账号----密码----邮箱----邮箱密码----备注`。
5. WHEN Admin_User 进入"预览解析"步骤,THE Inventory_Center SHALL 解析输入内容并以表格形式展示每一条解析后的库存记录。
6. WHEN Admin_Console 在预览阶段检测到与现有库存或本次输入内的重复条目,THE Inventory_Center SHALL 在预览表格中标记重复并允许 Admin_User 选择跳过或终止。
7. IF 输入内容存在格式错误,THEN THE Inventory_Center SHALL 在预览阶段以行级错误提示展示原因并阻止进入"确认导入"步骤。
8. WHEN Admin_User 在"确认导入"步骤提交,THE Inventory_Center SHALL 创建一条 Inventory_Batch 并写入所有有效库存记录。
9. WHEN Inventory_Batch 创建完成,THE Inventory_Center SHALL 跳转到"导入批次"页并展示该批次。

### Requirement 17：订单中心（Order_Center）—— 列表与筛选

**User Story:** 作为 Admin_User，我希望订单列表具备丰富的筛选与状态切换能力，以便我能快速定位特定状态、特定支付网络、特定时间范围的订单。

#### Acceptance Criteria

1. THE Order_Center SHALL 在订单列表顶部提供状态 Tab：全部、待支付、已支付、待发货、已发货、发货失败、异常订单、已取消、售后中。
2. THE Order_Center SHALL 在订单列表的 Admin_Toolbar 提供以下筛选项：订单号、用户 Telegram、商品、支付状态、发货状态、支付网络、时间范围。
3. THE Order_Center SHALL 在订单列表表格中以下列字段展示：订单号、用户、商品+SKU、数量、金额、支付状态、发货状态、售后状态、创建时间、操作。
4. THE Order_Center SHALL 为"支付状态""发货状态""售后状态"字段使用 StatusBadge 展示。
5. WHEN Admin_User 切换订单状态 Tab,THE Order_Center SHALL 保留其他已设置的筛选条件并联合应用。
6. WHEN 订单列表查询返回零条记录,THE Order_Center SHALL 渲染订单维度的 EmptyState 并提供与当前筛选条件相关的引导文案。

### Requirement 18：订单中心 —— 订单详情

**User Story:** 作为 Admin_User，我希望在订单详情页能完整追踪一笔订单从创建、支付、发货、通知到售后的全过程，以便对客服与运营提供完整事实依据。

#### Acceptance Criteria

1. THE Order_Center SHALL 在订单详情页展示状态时间线,时间线节点至少包含：创建、支付、发货、完成或异常。
2. THE Order_Center SHALL 在订单详情页展示用户信息区,包含 Telegram 用户名与联系邮箱。
3. THE Order_Center SHALL 在订单详情页展示商品快照与 SKU 快照。
4. THE Order_Center SHALL 在订单详情页展示用户在下单时填写的信息。
5. THE Order_Center SHALL 在订单详情页展示支付信息,包含支付网络、收款地址、交易哈希、付款时间。
6. THE Order_Center SHALL 在订单详情页展示发货信息,包含发货方式、发货时间、发货内容（默认脱敏）。
7. THE Order_Center SHALL 在订单详情页展示售后记录,包含工单号、问题类型、最新状态、最后回复时间。
8. THE Order_Center SHALL 在订单详情页展示通知记录,包含通知渠道、通知类型、状态、错误原因（如有）。
9. THE Order_Center SHALL 在订单详情页展示操作日志,记录管理员对该订单进行过的操作。
10. THE Order_Center SHALL 在订单详情页提供"管理员备注"区域,允许 Admin_User 添加和编辑备注。
11. WHILE 订单详情页中存在缺失数据的区块,THE Order_Center SHALL 在该区块内渲染专业空状态文案而不是空白或纯"暂无数据"。

### Requirement 19：支付中心（Payment_Center）—— 信息架构

**User Story:** 作为 Admin_User，我希望支付相关能力按职责拆分到独立 Tab，以便分别管理支付网络配置、收款地址、到账交易记录与支付异常。

#### Acceptance Criteria

1. THE Payment_Center SHALL 拆分为四个 Tab：支付网络、收款地址、到账交易、支付异常。

### Requirement 20：支付中心 —— 支付网络

**User Story:** 作为 Admin_User，我希望以表格形式查看和管理所有支付网络，以便统一控制启用状态与推荐位。

#### Acceptance Criteria

1. THE Payment_Center SHALL 在支付网络 Tab 以表格形式展示,字段包含：网络、协议、代币、合约地址、确认数、状态、是否推荐、操作。
2. THE Payment_Center SHALL 为"状态"字段使用 StatusBadge 展示。
3. WHEN Admin_User 修改支付网络的合约地址,THE Payment_Center SHALL 将该操作识别为危险操作并执行 Requirement 7 规定的二次确认与审计流程。

### Requirement 21：支付中心 —— 收款地址

**User Story:** 作为运营负责人，我希望收款地址不能被随手编辑，对其修改必须经过身份核验并产生审计记录，以便降低资损风险。

#### Acceptance Criteria

1. THE Payment_Center SHALL 在收款地址 Tab 默认以只读形式展示当前生效的收款地址。
2. WHEN Admin_User 触发收款地址修改操作,THE Payment_Center SHALL 弹出 Confirm_Modal 并要求 Admin_User 输入管理员密码完成身份核验。
3. WHEN 管理员密码核验通过且 Admin_User 提交修改,THE Payment_Center SHALL 写入一条 Audit_Log,记录修改前地址、修改后地址、操作人、操作时间、IP。
4. IF 管理员密码核验失败,THEN THE Payment_Center SHALL 中止本次修改并保持原收款地址不变。

### Requirement 22：支付中心 —— 到账交易

**User Story:** 作为 Admin_User，我希望以表格形式查看所有到账的链上交易，以便核对资金流入并定位异常交易。

#### Acceptance Criteria

1. THE Payment_Center SHALL 在到账交易 Tab 以表格形式展示,字段包含：Hash、网络、金额、付款地址、收款地址、匹配订单、状态、检测时间、操作。
2. THE Payment_Center SHALL 在到账交易 Tab 的 Admin_Toolbar 中提供按 Hash、网络、状态、时间范围的筛选项。

### Requirement 23：支付中心 —— 支付异常

**User Story:** 作为 Admin_User，我希望系统单独沉淀一份"支付异常"列表并支持人工绑定订单或忽略，以便处理少付、多付、错链、超时、重复 Hash、未匹配等异常资金。

#### Acceptance Criteria

1. THE Payment_Center SHALL 在支付异常 Tab 以表格形式展示,字段包含：异常类型、Hash、金额、网络、可能订单、原因、处理状态、操作。
2. THE Payment_Center SHALL 支持以下异常类型：少付、多付、错链、超时、重复 Hash、未匹配。
3. WHEN Admin_User 触发"人工绑定订单"操作,THE Payment_Center SHALL 弹出 Confirm_Modal 要求确认绑定关系,并在确认后写入 Audit_Log。
4. WHEN Admin_User 触发"忽略"操作,THE Payment_Center SHALL 弹出 Confirm_Modal 要求确认忽略原因,并在确认后写入 Audit_Log。

### Requirement 24：发货中心（Shipment_Center）

**User Story:** 作为 Admin_User，我希望发货相关功能拆分为四个子页面并能够看清失败原因与重试入口，以便处理自动发货失败的订单。

#### Acceptance Criteria

1. THE Shipment_Center SHALL 拆分为四个子页面：发货队列、自动发货日志、人工发货队列、发货失败重试。
2. THE Shipment_Center SHALL 在所有子页面以表格形式展示,字段包含：订单号、商品+SKU、用户、发货方式、状态、失败原因、重试次数、创建时间、操作。
3. THE Shipment_Center SHALL 为"状态"字段使用 StatusBadge 展示,可选值为：待发货、发货中、已发货、发货失败、转人工。
4. WHILE 一条记录的状态为"发货失败",THE Shipment_Center SHALL 在该行展示失败原因。
5. WHEN Admin_User 在一条发货失败记录上触发操作菜单,THE Shipment_Center SHALL 仅在该次触发时显示操作菜单,菜单项包括：重试、转人工、更换库存、标记异常。
6. WHEN Admin_User 触发"更换库存"或"标记异常"操作,THE Shipment_Center SHALL 弹出 Confirm_Modal 进行二次确认并在执行后写入 Audit_Log。

### Requirement 25：售后中心（AfterSales_Center）

**User Story:** 作为 Admin_User，我希望售后工单以表格形式集中展示，并清晰区分状态与负责人，以便高效跟进客户问题。

#### Acceptance Criteria

1. THE AfterSales_Center SHALL 在工单列表中以下列字段展示：工单号、订单号、用户、问题类型、状态、优先级、负责人、创建时间、最后回复、操作。
2. THE AfterSales_Center SHALL 为"状态"字段使用 StatusBadge 展示,可选值为：待处理、处理中、等待用户、已补发、已退款、已关闭。
3. THE AfterSales_Center SHALL 在工单列表的 Admin_Toolbar 中提供按状态、问题类型、负责人、时间范围的筛选项。

### Requirement 26：保留现有后端 API 与数据模型

**User Story:** 作为技术负责人，我希望本次重构仅涉及后台 UI 与页面结构，不改动现有的后端 API 与数据模型，以便降低重构风险并保持线上业务连续性。

#### Acceptance Criteria

1. THE Admin_Console SHALL 复用现有后端 API 完成所有数据读写,不新增改变后端契约的接口。
2. THE Admin_Console SHALL 不改动现有数据库表结构与字段语义。
3. WHERE 现有 API 返回的数据无法满足新页面所需展示字段,THE Admin_Console SHALL 在前端通过组合现有接口或派生字段的方式实现该展示需求,即使需要发起多次接口请求或在客户端做较复杂的数据处理。

---

## 三、P0 里程碑页面

### Requirement 27：P0 里程碑 —— 后台 Layout

**User Story:** 作为 Admin_User，我希望 P0 阶段交付一个统一的后台 Layout，以便后续所有页面都能在该 Layout 上挂载且样式一致。

#### Acceptance Criteria

1. THE Admin_Console SHALL 在 P0 阶段交付 Admin_Layout,Admin_Layout 由 Admin_TopBar、Admin_SideNav、Admin_PageShell 三部分组成。
2. THE Admin_TopBar SHALL 仅包含纯后台功能元素,不包含任何前台导航元素,也不包含在前后台共用的实用入口。
3. THE Admin_SideNav SHALL 在所有页面保持固定且选中态正确联动。
4. THE Admin_PageShell SHALL 在所有页面统一最大宽度、内外边距、卡片内边距、表格行高、按钮高度。
5. THE Admin_DesignSystem SHALL 在 P0 阶段交付页面标题、说明、Button、Input、Select、Table、StatusBadge、EmptyState、ConfirmModal、Toast、Pagination 这些基础组件并被新页面统一使用,允许已有页面在重构尚未覆盖到时仍延续旧组件。

### Requirement 28：P0 里程碑 —— 商品列表页

**User Story:** 作为 Admin_User，我希望 P0 阶段交付一个完整可用的商品列表页，以便我可以以专业后台标准管理商品。

#### Acceptance Criteria

1. THE Product_Center SHALL 在 P0 阶段交付商品列表页,且该页面满足 Requirement 10 全部验收条件。
2. THE Product_Center SHALL 在商品列表页的 Admin_Toolbar 提供搜索、筛选、新增按钮。
3. THE Product_Center SHALL 在商品列表页以表格形式渲染商品并对状态字段使用 StatusBadge。
4. THE Product_Center SHALL 在商品列表页提供分页组件并在零结果时渲染 EmptyState。
5. THE Product_Center SHALL 在商品列表的每一行操作列提供与权限匹配的操作按钮。

### Requirement 29：P0 里程碑 —— 商品编辑页

**User Story:** 作为 Admin_User，我希望 P0 阶段交付一个采用 Tab 化结构的商品编辑页，以便分组管理商品的多维度配置。

#### Acceptance Criteria

1. THE Product_Center SHALL 在 P0 阶段交付商品编辑页,且该页面满足 Requirement 11 全部验收条件。
2. THE Product_Center SHALL 在商品编辑页提供以下 7 个 Tab：基础信息、购买字段、SKU 配置、库存绑定、发货规则、购买须知、展示设置。
3. THE Product_Center SHALL 在商品编辑页底部提供统一的"保存 / 取消"操作区。

### Requirement 30：P0 里程碑 —— 库存导入页

**User Story:** 作为 Admin_User，我希望 P0 阶段交付一个分步骤可预览可查重的库存导入页，以便从根本上避免脏数据进入库存。

#### Acceptance Criteria

1. THE Inventory_Center SHALL 在 P0 阶段交付库存导入页,且该页面满足 Requirement 16 全部验收条件。
2. THE Inventory_Center SHALL 在库存导入页提供分步骤导航,允许 Admin_User 在已完成步骤之间回退。
3. THE Inventory_Center SHALL 在库存导入页提供预览解析与重复检测能力。
4. THE Inventory_Center SHALL 在库存导入页提供"确认导入"步骤并在确认后创建 Inventory_Batch。
5. THE Inventory_Center SHALL 在库存导入页提供入口跳转到"导入批次"列表查看历史导入记录。

### Requirement 31：P0 里程碑 —— 订单详情页

**User Story:** 作为 Admin_User，我希望 P0 阶段交付一个能够完整追踪一笔订单全生命周期的订单详情页，以便客服与运营具备处理任何订单问题的事实依据。

#### Acceptance Criteria

1. THE Order_Center SHALL 在 P0 阶段交付订单详情页,且该页面满足 Requirement 18 全部验收条件。
2. THE Order_Center SHALL 在订单详情页展示状态时间线、用户信息、商品快照、SKU 快照、用户填写信息、支付信息、发货信息、售后记录、通知记录、操作日志、管理员备注。
3. THE Order_Center SHALL 在订单详情页中对发货内容默认脱敏,且仅在管理员同时具备查看明文权限并完成审计写入时才允许查看明文,任一条件不满足都不允许展示明文。
