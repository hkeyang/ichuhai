-- 0006_usdt_trc20_payment_address.sql
-- 切换到真实 TRON / USDT TRC20 固定收款地址。
-- 仅迁移旧默认地址，避免覆盖后台后续人工修改。

UPDATE payment_networks
SET
  address = 'TPPHD2bUCbRLEt7aBMRoWQbD3aY69NnEe6',
  confirmations = 3,
  is_enabled = 1,
  is_recommended = 1,
  updated_at = datetime('now')
WHERE code = 'TRON'
  AND address = 'TXL8d1e7hVKZy8vY8g9a6n3sJX4mP6u6wJ';

UPDATE payment_networks
SET is_enabled = 0, is_recommended = 0, updated_at = datetime('now')
WHERE code <> 'TRON';
