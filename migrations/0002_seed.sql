-- 0002_seed.sql
-- 初始种子数据
-- ichuhai 虚拟数字商品商城

-- 商品（5条）
INSERT OR IGNORE INTO products (id, slug, name, category_id, status, delivery_type) VALUES
  ('discord-nitro',   'discord-nitro',   'Discord Nitro',   'social',   'active', 'auto'),
  ('spotify-premium', 'spotify-premium', 'Spotify Premium', 'music',    'active', 'auto'),
  ('youtube-premium', 'youtube-premium', 'YouTube Premium', 'video',    'active', 'mixed'),
  ('steam-wallet',    'steam-wallet',    'Steam Wallet',    'game',     'active', 'manual'),
  ('microsoft-365',   'microsoft-365',   'Microsoft 365',   'software', 'active', 'auto');

-- SKU（16条）
INSERT OR IGNORE INTO skus (id, product_id, option_values, price_usdt, stock_status, delivery_type, is_default) VALUES
  ('dn-g-new-1',    'discord-nitro',   '{"region":"Global","account_type":"新号","duration":"1个月"}',  '1.80',  'in_stock',  'auto',   1),
  ('dn-g-new-3',    'discord-nitro',   '{"region":"Global","account_type":"新号","duration":"3个月"}',  '4.80',  'in_stock',  'auto',   0),
  ('dn-g-new-12',   'discord-nitro',   '{"region":"Global","account_type":"新号","duration":"12个月"}', '16.20', 'in_stock',  'auto',   0),
  ('dn-us-old-1',   'discord-nitro',   '{"region":"US","account_type":"老号","duration":"1个月"}',      '2.10',  'low_stock', 'manual', 0),
  ('dn-eu-share-3', 'discord-nitro',   '{"region":"EU","account_type":"共享","duration":"3个月"}',      '3.90',  'in_stock',  'auto',   0),
  ('dn-jp-new-1',   'discord-nitro',   '{"region":"JP","account_type":"新号","duration":"1个月"}',      '2.30',  'sold_out',  'manual', 0),
  ('sp-1',          'spotify-premium', '{"duration":"1个月"}',                                           '2.20',  'in_stock',  'auto',   1),
  ('sp-3',          'spotify-premium', '{"duration":"3个月"}',                                           '6.10',  'in_stock',  'auto',   0),
  ('sp-12',         'spotify-premium', '{"duration":"12个月"}',                                          '21.80', 'low_stock', 'auto',   0),
  ('yt-g-1',        'youtube-premium', '{"region":"Global","duration":"1个月"}',                         '2.50',  'in_stock',  'auto',   1),
  ('yt-us-12',      'youtube-premium', '{"region":"US","duration":"12个月"}',                            '24.00', 'in_stock',  'manual', 0),
  ('sw-5',          'steam-wallet',    '{"amount":"5 USD"}',                                             '5.00',  'in_stock',  'manual', 1),
  ('sw-10',         'steam-wallet',    '{"amount":"10 USD"}',                                            '10.00', 'in_stock',  'manual', 0),
  ('sw-20',         'steam-wallet',    '{"amount":"20 USD"}',                                            '20.00', 'low_stock', 'manual', 0),
  ('ms-personal',   'microsoft-365',   '{"plan":"个人版"}',                                              '3.50',  'in_stock',  'auto',   1),
  ('ms-family',     'microsoft-365',   '{"plan":"家庭版"}',                                              '8.80',  'in_stock',  'auto',   0);

-- 支付网络（4条）
INSERT OR IGNORE INTO payment_networks (id, code, display_name, token_standard, is_enabled, is_recommended, address, confirmations) VALUES
  ('net_tron', 'TRON', 'TRON', 'TRC20', 1, 1, 'TPPHD2bUCbRLEt7aBMRoWQbD3aY69NnEe6',              3),
  ('net_eth',  'ETH',  'ETH',  'ERC20', 1, 0, '0x7fE9A4b11cE5A9E2fA40eB3fA2465d9E4c07F001',       12),
  ('net_bsc',  'BSC',  'BSC',  'BEP20', 1, 0, '0xB35b2C2f9B5f3A7D61d5b3f82D82d9a89Ce7b002',       15),
  ('net_base', 'BASE', 'BASE', 'ERC20', 1, 0, '0xBA5E000000000000000000000000000000000001',         12);

-- 汇率（8条）
INSERT OR IGNORE INTO exchange_rates (currency, rate) VALUES
  ('USD', '1'),
  ('CNY', '7.22'),
  ('GBP', '0.79'),
  ('EUR', '0.93'),
  ('AUD', '1.52'),
  ('JPY', '155'),
  ('HKD', '7.82'),
  ('KRW', '1360');
