#!/usr/bin/env bash
# scripts/smoke-test.sh
# ichuhai 冒烟测试脚本 — 验证所有 30 个 API 端点
# 用法：
#   BASE_URL=https://ichuhai.shop ADMIN_USERNAME=<用户名> ADMIN_PASSWORD=<密码> INTERNAL_API_SECRET=<密钥> bash scripts/smoke-test.sh
#   本地开发：BASE_URL=http://localhost:8787 ADMIN_USERNAME=admin ADMIN_PASSWORD=dev_admin_password_12 INTERNAL_API_SECRET=dev_internal_api_secret_32_chars__ bash scripts/smoke-test.sh

set -euo pipefail

# ─── 基础变量 ────────────────────────────────────────────────────────────────
BASE_URL="${BASE_URL:-https://ichuhai.shop}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-<ADMIN_PASSWORD>}"
INTERNAL_API_SECRET="${INTERNAL_API_SECRET:-<INTERNAL_API_SECRET>}"

PASS=0
FAIL=0
ERRORS=()

# ─── 辅助函数 ────────────────────────────────────────────────────────────────
green() { printf '\033[0;32m%s\033[0m\n' "$*"; }
red()   { printf '\033[0;31m%s\033[0m\n' "$*"; }

check() {
  local label="$1"
  local result="$2"   # "ok" 或 "fail: <reason>"
  if [[ "$result" == "ok" ]]; then
    green "  PASS  $label"
    ((PASS++))
  else
    red   "  FAIL  $label — ${result#fail: }"
    ((FAIL++))
    ERRORS+=("$label: ${result#fail: }")
  fi
}

# 发送请求并返回 HTTP 状态码 + 响应体（用 ||| 分隔）
req() {
  local method="$1"; shift
  local url="$1";    shift
  # 剩余参数透传给 curl
  curl -s -w "|||%{http_code}" -X "$method" "$url" "$@" 2>/dev/null
}

# 从 req 输出中提取响应体
body_of()  { echo "${1%|||*}"; }
# 从 req 输出中提取状态码
status_of(){ echo "${1##*|||}"; }

# 断言状态码
assert_status() {
  local label="$1" resp="$2" expected="$3"
  local got; got=$(status_of "$resp")
  if [[ "$got" == "$expected" ]]; then
    check "$label" "ok"
  else
    check "$label" "fail: expected HTTP $expected, got $got"
  fi
}

# 断言响应体包含某字段（jq 路径）
assert_field() {
  local label="$1" resp="$2" jq_path="$3"
  local body; body=$(body_of "$resp")
  local val; val=$(echo "$body" | jq -r "$jq_path" 2>/dev/null || echo "")
  if [[ -n "$val" && "$val" != "null" ]]; then
    check "$label" "ok"
  else
    check "$label" "fail: field '$jq_path' missing or null in: $body"
  fi
}

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ichuhai API 冒烟测试"
echo "  BASE_URL: $BASE_URL"
echo "════════════════════════════════════════════════════════════"
echo ""

# ─── 1. 公开端点 ─────────────────────────────────────────────────────────────
echo "▶ 1. 公开端点"

# 1.1 GET /api/config
resp=$(req GET "$BASE_URL/api/config")
assert_status "GET /api/config → 200" "$resp" "200"

# 1.2 GET /api/products
resp=$(req GET "$BASE_URL/api/products")
assert_status "GET /api/products → 200" "$resp" "200"
body=$(body_of "$resp")
product_count=$(echo "$body" | jq 'length' 2>/dev/null || echo "0")
if [[ "$product_count" -gt 0 ]]; then
  check "GET /api/products 返回非空列表" "ok"
else
  check "GET /api/products 返回非空列表" "fail: 列表为空或解析失败"
fi

# 1.3 GET /api/products/discord-nitro
resp=$(req GET "$BASE_URL/api/products/discord-nitro")
assert_status "GET /api/products/discord-nitro → 200" "$resp" "200"
assert_field "GET /api/products/discord-nitro 含 slug 字段" "$resp" ".slug"

# 1.4 GET /api/products/<不存在的 slug>
resp=$(req GET "$BASE_URL/api/products/nonexistent-product-xyz")
assert_status "GET /api/products/nonexistent → 404" "$resp" "404"

# 1.5 GET /api/exchange-rates
resp=$(req GET "$BASE_URL/api/exchange-rates")
assert_status "GET /api/exchange-rates → 200" "$resp" "200"
assert_field "GET /api/exchange-rates 含 CNY 汇率" "$resp" ".rates.CNY // .CNY // .[\"CNY\"]"

# 1.6 GET /api/payment-networks
resp=$(req GET "$BASE_URL/api/payment-networks")
assert_status "GET /api/payment-networks → 200" "$resp" "200"
body=$(body_of "$resp")
net_count=$(echo "$body" | jq 'length' 2>/dev/null || echo "0")
if [[ "$net_count" -gt 0 ]]; then
  check "GET /api/payment-networks 返回非空列表" "ok"
else
  check "GET /api/payment-networks 返回非空列表" "fail: 列表为空或解析失败"
fi

echo ""

# ─── 2. 订单流程 ─────────────────────────────────────────────────────────────
echo "▶ 2. 订单流程"

# 2.1 POST /api/orders — 创建订单
CREATE_RESP=$(req POST "$BASE_URL/api/orders" \
  -H "content-type: application/json" \
  -d '{"productId":"discord-nitro","skuId":"dn-g-new-1","paymentNetwork":"TRON","telegramUsername":"@smoke_test","email":"smoke@example.com","fiatCurrency":"CNY"}')
assert_status "POST /api/orders → 201" "$CREATE_RESP" "201"

ORDER_ID=$(body_of "$CREATE_RESP" | jq -r '.orderId // empty' 2>/dev/null || echo "")
ORDER_NO=$(body_of "$CREATE_RESP" | jq -r '.orderNo // empty' 2>/dev/null || echo "")

if [[ -n "$ORDER_ID" ]]; then
  check "POST /api/orders 返回 orderId" "ok"
else
  check "POST /api/orders 返回 orderId" "fail: orderId 缺失"
  ORDER_ID="nonexistent-order-id"
fi

if [[ -n "$ORDER_NO" ]]; then
  check "POST /api/orders 返回 orderNo" "ok"
else
  check "POST /api/orders 返回 orderNo" "fail: orderNo 缺失"
  ORDER_NO="NONEXISTENT"
fi

# 2.2 GET /api/orders/:id/payment
resp=$(req GET "$BASE_URL/api/orders/$ORDER_ID/payment")
assert_status "GET /api/orders/:id/payment → 200" "$resp" "200"
assert_field "GET /api/orders/:id/payment 含 paymentAddress" "$resp" ".paymentAddress // .payment_address"

# 2.3 GET /api/orders/:id/status
resp=$(req GET "$BASE_URL/api/orders/$ORDER_ID/status")
assert_status "GET /api/orders/:id/status → 200" "$resp" "200"
assert_field "GET /api/orders/:id/status 含 status 字段" "$resp" ".status"

# 2.4 GET /api/orders/<不存在的 id>
resp=$(req GET "$BASE_URL/api/orders/nonexistent-order-id-xyz/status")
assert_status "GET /api/orders/nonexistent/status → 404" "$resp" "404"

echo ""

# ─── 3. TxHash 提交 ───────────────────────────────────────────────────────────
echo "▶ 3. TxHash 提交"

TX_HASH="smoke_test_tx_$(date +%s)_$(openssl rand -hex 8 2>/dev/null || echo 'abcdef123456')"

# 3.1 POST /api/orders/:id/txhash
resp=$(req POST "$BASE_URL/api/orders/$ORDER_ID/txhash" \
  -H "content-type: application/json" \
  -d "{\"txHash\":\"$TX_HASH\"}")
assert_status "POST /api/orders/:id/txhash → 200" "$resp" "200"

# 3.2 重复提交同一 txHash 应返回 409
resp=$(req POST "$BASE_URL/api/orders/$ORDER_ID/txhash" \
  -H "content-type: application/json" \
  -d "{\"txHash\":\"$TX_HASH\"}")
status=$(status_of "$resp")
if [[ "$status" == "409" || "$status" == "400" ]]; then
  check "POST /api/orders/:id/txhash 重复提交 → 4xx" "ok"
else
  check "POST /api/orders/:id/txhash 重复提交 → 4xx" "fail: expected 409/400, got $status"
fi

echo ""

# ─── 4. 订单查询 ─────────────────────────────────────────────────────────────
echo "▶ 4. 订单查询"

# 4.1 POST /api/orders/lookup
resp=$(req POST "$BASE_URL/api/orders/lookup" \
  -H "content-type: application/json" \
  -d "{\"orderNo\":\"$ORDER_NO\",\"contact\":\"smoke@example.com\"}")
assert_status "POST /api/orders/lookup → 200" "$resp" "200"
assert_field "POST /api/orders/lookup 返回订单 id" "$resp" ".id"

# 4.2 查询不存在的订单
resp=$(req POST "$BASE_URL/api/orders/lookup" \
  -H "content-type: application/json" \
  -d '{"orderNo":"NONEXISTENT-ORDER","contact":"nobody@example.com"}')
assert_status "POST /api/orders/lookup 不存在 → 404" "$resp" "404"

echo ""

# ─── 5. Telegram 登录（开发模式） ─────────────────────────────────────────────
echo "▶ 5. Telegram 登录（开发模式）"

AUTH_DATE=$(date +%s)
resp=$(req POST "$BASE_URL/api/auth/telegram" \
  -H "content-type: application/json" \
  -d "{\"id\":\"999888777\",\"username\":\"smoke_test_user\",\"first_name\":\"Smoke\",\"auth_date\":\"$AUTH_DATE\",\"hash\":\"dev_mock_hash\"}")
status=$(status_of "$resp")
# 开发模式下可能返回 200（mock 验证通过）或 401（hash 不匹配）
if [[ "$status" == "200" || "$status" == "401" ]]; then
  check "POST /api/auth/telegram → 200 或 401（开发模式）" "ok"
else
  check "POST /api/auth/telegram → 200 或 401（开发模式）" "fail: unexpected status $status"
fi

echo ""

# ─── 6. 管理员登录 ────────────────────────────────────────────────────────────
echo "▶ 6. 管理员登录"

# 6.1 POST /api/admin/login — 正确密码
LOGIN_RESP=$(req POST "$BASE_URL/api/admin/login" \
  -H "content-type: application/json" \
  -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}")
assert_status "POST /api/admin/login → 200" "$LOGIN_RESP" "200"

ADMIN_TOKEN=$(body_of "$LOGIN_RESP" | jq -r '.token // empty' 2>/dev/null || echo "")
if [[ -n "$ADMIN_TOKEN" ]]; then
  check "POST /api/admin/login 返回 token" "ok"
else
  check "POST /api/admin/login 返回 token" "fail: token 缺失"
  ADMIN_TOKEN="invalid-token"
fi

# 6.2 POST /api/admin/login — 错误密码
resp=$(req POST "$BASE_URL/api/admin/login" \
  -H "content-type: application/json" \
  -d '{"password":"wrong-password-xyz"}')
assert_status "POST /api/admin/login 错误密码 → 401" "$resp" "401"

echo ""

# ─── 7. 管理员端点 ────────────────────────────────────────────────────────────
echo "▶ 7. 管理员端点"

# 7.1 GET /api/admin/orders
resp=$(req GET "$BASE_URL/api/admin/orders" -H "x-admin-token: $ADMIN_TOKEN")
assert_status "GET /api/admin/orders → 200" "$resp" "200"

# 7.2 GET /api/admin/orders — 无 token
resp=$(req GET "$BASE_URL/api/admin/orders")
assert_status "GET /api/admin/orders 无 token → 401" "$resp" "401"

# 7.3 PATCH /api/admin/orders/:id/status
resp=$(req PATCH "$BASE_URL/api/admin/orders/$ORDER_ID/status" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"status":"paid","note":"smoke test"}')
status=$(status_of "$resp")
if [[ "$status" == "200" || "$status" == "409" ]]; then
  check "PATCH /api/admin/orders/:id/status → 200 或 409" "ok"
else
  check "PATCH /api/admin/orders/:id/status → 200 或 409" "fail: got $status"
fi

# 7.4 GET /api/admin/payment-networks
resp=$(req GET "$BASE_URL/api/admin/payment-networks" -H "x-admin-token: $ADMIN_TOKEN")
assert_status "GET /api/admin/payment-networks → 200" "$resp" "200"

# 7.5 GET /api/admin/deliveries
resp=$(req GET "$BASE_URL/api/admin/deliveries" -H "x-admin-token: $ADMIN_TOKEN")
assert_status "GET /api/admin/deliveries → 200" "$resp" "200"

# 7.6 GET /api/admin/notifications
resp=$(req GET "$BASE_URL/api/admin/notifications" -H "x-admin-token: $ADMIN_TOKEN")
assert_status "GET /api/admin/notifications → 200" "$resp" "200"

# 7.7 GET /api/admin/support-tickets
resp=$(req GET "$BASE_URL/api/admin/support-tickets" -H "x-admin-token: $ADMIN_TOKEN")
assert_status "GET /api/admin/support-tickets → 200" "$resp" "200"

# 7.8 POST /api/admin/products
resp=$(req POST "$BASE_URL/api/admin/products" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"id":"smoke-test-product","slug":"smoke-test-product","name":"Smoke Test Product","categoryId":"more","status":"hidden","deliveryType":"manual"}')
status=$(status_of "$resp")
if [[ "$status" == "201" || "$status" == "409" ]]; then
  check "POST /api/admin/products → 201 或 409（已存在）" "ok"
else
  check "POST /api/admin/products → 201 或 409（已存在）" "fail: got $status"
fi

# 7.9 POST /api/admin/skus
resp=$(req POST "$BASE_URL/api/admin/skus" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"productId":"discord-nitro","optionValues":{"duration":"smoke"},"priceUsdt":"1.00","stockStatus":"in_stock","deliveryType":"manual"}')
status=$(status_of "$resp")
if [[ "$status" == "201" || "$status" == "409" || "$status" == "422" ]]; then
  check "POST /api/admin/skus → 201/409/422" "ok"
else
  check "POST /api/admin/skus → 201/409/422" "fail: got $status"
fi

# 7.10 POST /api/admin/skus/batch-generate
resp=$(req POST "$BASE_URL/api/admin/skus/batch-generate" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"productId":"discord-nitro","options":{"duration":["smoke1","smoke2"]},"priceUsdt":"1.00","deliveryType":"manual"}')
status=$(status_of "$resp")
if [[ "$status" == "201" || "$status" == "409" || "$status" == "422" ]]; then
  check "POST /api/admin/skus/batch-generate → 201/409/422" "ok"
else
  check "POST /api/admin/skus/batch-generate → 201/409/422" "fail: got $status"
fi

# 7.11 POST /api/admin/inventory/import
resp=$(req POST "$BASE_URL/api/admin/inventory/import" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"skuId":"dn-g-new-1","items":["SMOKE-TEST-KEY-001"]}')
status=$(status_of "$resp")
if [[ "$status" == "201" || "$status" == "200" || "$status" == "422" ]]; then
  check "POST /api/admin/inventory/import → 201/200/422" "ok"
else
  check "POST /api/admin/inventory/import → 201/200/422" "fail: got $status"
fi

# 7.12 PATCH /api/admin/payment-networks/:id
resp=$(req PATCH "$BASE_URL/api/admin/payment-networks/net_tron" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"isEnabled":true}')
status=$(status_of "$resp")
if [[ "$status" == "200" || "$status" == "404" ]]; then
  check "PATCH /api/admin/payment-networks/:id → 200 或 404" "ok"
else
  check "PATCH /api/admin/payment-networks/:id → 200 或 404" "fail: got $status"
fi

echo ""

# ─── 8. 内部 API ──────────────────────────────────────────────────────────────
echo "▶ 8. 内部 API"

# 8.1 POST /api/internal/orders/:id/mark-paid
MARK_PAID_RESP=$(req POST "$BASE_URL/api/internal/orders/$ORDER_ID/mark-paid" \
  -H "x-internal-token: $INTERNAL_API_SECRET" \
  -H "content-type: application/json" \
  -d "{\"txHash\":\"internal_smoke_$(date +%s)\"}")
status=$(status_of "$MARK_PAID_RESP")
if [[ "$status" == "200" || "$status" == "409" ]]; then
  check "POST /api/internal/orders/:id/mark-paid → 200 或 409" "ok"
else
  check "POST /api/internal/orders/:id/mark-paid → 200 或 409" "fail: got $status"
fi

# 8.2 POST /api/internal/orders/:id/mark-paid — 无 token
resp=$(req POST "$BASE_URL/api/internal/orders/$ORDER_ID/mark-paid" \
  -H "content-type: application/json" \
  -d '{"txHash":"no_token_test"}')
assert_status "POST /api/internal/mark-paid 无 token → 401" "$resp" "401"

# 8.3 POST /api/internal/orders/:id/deliver
DELIVER_RESP=$(req POST "$BASE_URL/api/internal/orders/$ORDER_ID/deliver" \
  -H "x-internal-token: $INTERNAL_API_SECRET" \
  -H "content-type: application/json")
status=$(status_of "$DELIVER_RESP")
if [[ "$status" == "200" || "$status" == "409" || "$status" == "422" ]]; then
  check "POST /api/internal/orders/:id/deliver → 200/409/422" "ok"
else
  check "POST /api/internal/orders/:id/deliver → 200/409/422" "fail: got $status"
fi

# 8.4 POST /api/internal/orders/:id/deliver — 无 token
resp=$(req POST "$BASE_URL/api/internal/orders/$ORDER_ID/deliver" \
  -H "content-type: application/json")
assert_status "POST /api/internal/deliver 无 token → 401" "$resp" "401"

echo ""

# ─── 9. CORS Preflight ────────────────────────────────────────────────────────
echo "▶ 9. CORS Preflight"

# 9.1 OPTIONS /api/products — 白名单 origin
CORS_RESP=$(curl -s -I -X OPTIONS "$BASE_URL/api/products" \
  -H "Origin: https://ichuhai.shop" \
  -H "Access-Control-Request-Method: GET" 2>/dev/null)
if echo "$CORS_RESP" | grep -qi "access-control-allow-origin"; then
  check "OPTIONS /api/products 白名单 origin → 含 CORS 头" "ok"
else
  check "OPTIONS /api/products 白名单 origin → 含 CORS 头" "fail: 未找到 access-control-allow-origin 头"
fi

# 9.2 OPTIONS /api/orders — 白名单 origin 含 POST 方法
CORS_RESP=$(curl -s -I -X OPTIONS "$BASE_URL/api/orders" \
  -H "Origin: https://ichuhai.shop" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" 2>/dev/null)
if echo "$CORS_RESP" | grep -qi "access-control-allow-methods"; then
  check "OPTIONS /api/orders 含 access-control-allow-methods" "ok"
else
  check "OPTIONS /api/orders 含 access-control-allow-methods" "fail: 未找到 access-control-allow-methods 头"
fi

# 9.3 OPTIONS /api/admin/orders — 含 x-admin-token 头
CORS_RESP=$(curl -s -I -X OPTIONS "$BASE_URL/api/admin/orders" \
  -H "Origin: https://ichuhai.shop" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: x-admin-token" 2>/dev/null)
if echo "$CORS_RESP" | grep -qi "access-control-allow-headers"; then
  check "OPTIONS /api/admin/orders 含 access-control-allow-headers" "ok"
else
  check "OPTIONS /api/admin/orders 含 access-control-allow-headers" "fail: 未找到 access-control-allow-headers 头"
fi

echo ""

# ─── 10. 安全头验证 ───────────────────────────────────────────────────────────
echo "▶ 10. 安全头验证"

HEADERS=$(curl -s -I "$BASE_URL/api/config" 2>/dev/null)

if echo "$HEADERS" | grep -qi "x-content-type-options: nosniff"; then
  check "GET /api/config 含 x-content-type-options: nosniff" "ok"
else
  check "GET /api/config 含 x-content-type-options: nosniff" "fail: 头缺失"
fi

if echo "$HEADERS" | grep -qi "referrer-policy"; then
  check "GET /api/config 含 referrer-policy" "ok"
else
  check "GET /api/config 含 referrer-policy" "fail: 头缺失"
fi

if echo "$HEADERS" | grep -qi "cache-control: no-store"; then
  check "GET /api/config 含 cache-control: no-store" "ok"
else
  check "GET /api/config 含 cache-control: no-store" "fail: 头缺失"
fi

echo ""

# ─── 11. 错误响应格式验证 ─────────────────────────────────────────────────────
echo "▶ 11. 错误响应格式验证"

# 11.1 无效 JSON → 400
resp=$(req POST "$BASE_URL/api/orders" \
  -H "content-type: application/json" \
  -d 'this is not json')
assert_status "POST /api/orders 无效 JSON → 400" "$resp" "400"
body=$(body_of "$resp")
if echo "$body" | jq -e '.error' >/dev/null 2>&1; then
  check "400 响应体含 error 字段" "ok"
else
  check "400 响应体含 error 字段" "fail: 响应体: $body"
fi

# 11.2 管理员 token 过期/无效 → 401
resp=$(req GET "$BASE_URL/api/admin/orders" -H "x-admin-token: invalid.token.here")
assert_status "GET /api/admin/orders 无效 token → 401" "$resp" "401"
body=$(body_of "$resp")
if echo "$body" | jq -e '.error' >/dev/null 2>&1; then
  check "401 响应体含 error 字段" "ok"
else
  check "401 响应体含 error 字段" "fail: 响应体: $body"
fi

echo ""

# ─── 汇总 ────────────────────────────────────────────────────────────────────
echo "════════════════════════════════════════════════════════════"
echo "  测试结果汇总"
echo "════════════════════════════════════════════════════════════"
green "  PASS: $PASS"
if [[ $FAIL -gt 0 ]]; then
  red "  FAIL: $FAIL"
  echo ""
  echo "  失败项目："
  for err in "${ERRORS[@]}"; do
    red "    • $err"
  done
  echo ""
  exit 1
else
  echo "  FAIL: $FAIL"
  echo ""
  green "  ✓ 所有测试通过"
  echo ""
  exit 0
fi
