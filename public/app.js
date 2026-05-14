const CURRENCIES = {
  USD: { label: '美元', flag: '🇺🇸', symbol: '$', rate: 1 },
  CNY: { label: '人民币', flag: '🇨🇳', symbol: '¥', rate: 7.22 },
  GBP: { label: '英镑', flag: '🇬🇧', symbol: '£', rate: 0.79 },
  EUR: { label: '欧元', flag: '🇪🇺', symbol: '€', rate: 0.93 },
  AUD: { label: '澳元', flag: '🇦🇺', symbol: 'A$', rate: 1.52 },
  JPY: { label: '日元', flag: '🇯🇵', symbol: '¥', rate: 155 },
  HKD: { label: '港币', flag: '🇭🇰', symbol: 'HK$', rate: 7.82 },
  KRW: { label: '韩元', flag: '🇰🇷', symbol: '₩', rate: 1360 }
};

const networks = [
  { code: 'TRON', displayName: 'TRON', tokenStandard: 'TRC20', icon: '🔻', recommended: true, enabled: true, warning: '请勿使用其他链转账，跨链支付可能导致资产无法找回。' },
  { code: 'ETH', displayName: 'ETH', tokenStandard: 'ERC20', icon: '♦', recommended: false, enabled: true, warning: '网络费用可能较高，请确认钱包余额充足。' },
  { code: 'BSC', displayName: 'BSC', tokenStandard: 'BEP20', icon: '⬢', recommended: false, enabled: true, warning: '请确认钱包支持 BSC 网络。' },
  { code: 'BASE', displayName: 'BASE', tokenStandard: 'ERC20', icon: '●', recommended: false, enabled: true, warning: '请确认钱包支持 BASE 网络。' }
];

const ASSETS = {
  logo: '/assets/brand/logo/',
  nav: '/assets/icons/brand-navigation/',
  trust: '/assets/icons/trust-selling-points/',
  payment: '/assets/icons/payment-crypto/',
  category: '/assets/icons/category/',
  product: '/assets/icons/product/'
};

const PRODUCT_ICONS = {
  discord: 'E01_discord_nitro.png',
  spotify: 'E02_spotify_premium.png',
  youtube: 'E03_youtube_premium.png',
  steam: 'E04_steam_wallet.png',
  office: 'E05_microsoft_365.png',
  telegram: 'E06_telegram_premium.png',
  netflix: 'E07_netflix.png',
  apple: 'E08_apple_gift_card.png',
  google: 'E09_google_play.png',
  xbox: 'E10_xbox_gift_card.png',
  playstation: 'E11_playstation_gift_card.png'
};

const LINE_ICONS = {
  all: '<path d="M4 4h6v6H4z"/><path d="M14 4h6v6h-6z"/><path d="M4 14h6v6H4z"/><path d="M14 14h6v6h-6z"/>',
  social: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  video: '<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z"/>',
  game: '<line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="6"/>',
  software: '<rect width="18" height="12" x="3" y="4" rx="2"/><path d="M8 20h8"/><path d="M12 16v4"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13"/><path d="M3 12h18"/><path d="M7.5 8a2.5 2.5 0 1 1 2.5-2.5V8"/><path d="M14 8V5.5A2.5 2.5 0 1 1 16.5 8"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/><path d="M6 15h3"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/>',
  lightning: '<path d="m13 2-10 12h9l-1 8 10-12h-9z"/>',
  refund: '<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v6h-6"/>',
  headset: '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M21 14v3a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2Z"/><path d="M3 14v3a2 2 0 0 0 2 2h2v-7H5a2 2 0 0 0-2 2Z"/><path d="M13 21h3a3 3 0 0 0 3-3"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.6 8.8a1.4 1.4 0 0 1-.8 0C7.5 20.5 4 18 4 13V5.5a1.2 1.2 0 0 1 .7-1.1l6.8-2.9a1.2 1.2 0 0 1 1 0l6.8 2.9a1.2 1.2 0 0 1 .7 1.1z"/><path d="m9 12 2 2 4-4"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>'
};

const CATEGORY_ICON_KEYS = {
  '全部': 'all',
  '社交': 'social',
  '音乐': 'music',
  '视频': 'video',
  '游戏': 'game',
  '软件': 'software',
  '礼品卡': 'gift',
  '更多': 'more'
};

const GUARANTEE_ITEMS = [
  { icon: 'B02_shield_secure_payment.png', title: '安全可靠', desc: '资金加密托管，交易安全有保障' },
  { icon: 'B01_lightning_instant_delivery.png', title: '极速秒发', desc: '自动化系统，秒级交付到手' },
  { icon: 'B03_headset_support.png', title: '专业服务', desc: '7×24 小时在线客服支持' },
  { icon: 'B06_check_circle_success.png', title: '资深团队', desc: '多年行业经验，值得信赖' }
];

const HOME_FLOW_STEPS = [
  { icon: 'B02_shield_secure_payment.png', title: '1 选择商品', desc: '浏览并选择所需商品', source: 'trust' },
  { icon: 'A07_user_login.png', title: '2 登录绑定', desc: 'Telegram 登录更快捷', source: 'nav' },
  { icon: 'C08_payment_success.png', title: '3 完成支付', desc: '支持 USDT 等多种方式', source: 'payment' },
  { icon: 'B01_lightning_instant_delivery.png', title: '4 自动交付', desc: '系统秒发，安全可靠', source: 'trust' }
];

const HOME_FAQS = [
  {
    icon: 'user',
    question: '购买需要登录吗？',
    answer: '需要。我们通过 Telegram 登录，订单与发货信息将安全绑定到您的账户，方便查询与售后。'
  },
  {
    icon: 'card',
    question: '支持哪些支付方式？',
    answer: '我们支持 USDT（TRC20）等主流加密货币支付，安全便捷，到账迅速。'
  },
  {
    icon: 'receipt',
    question: '如何查询订单？',
    answer: '登录后点击右上角「我的订单」，即可查看全部订单状态与发货信息。'
  },
  {
    icon: 'lightning',
    question: '发货速度有多快？',
    answer: '大部分商品为自动发货，秒级到账；部分商品需要人工处理，通常不超过 5–15 分钟。'
  },
  {
    icon: 'refund',
    question: '可以退款吗？',
    answer: '支持未发货订单退款；已发货商品因虚拟商品特性，一般不支持退款，具体请以商品页说明为准。'
  },
  {
    icon: 'headset',
    question: '遇到问题如何联系客服？',
    answer: '您可以通过 Telegram 联系在线客服，我们 7×24 小时为您提供专业帮助。'
  }
];

function assetImg(src, alt, className) {
  return `<img class="${className}" src="${src}" alt="${alt}" loading="lazy" />`;
}

function navIcon(file, alt, className = 'nav-icon') {
  return assetImg(`${ASSETS.nav}${file}`, alt, className);
}

function featureIcon(file, alt) {
  return assetImg(`${ASSETS.trust}${file}`, alt, 'feature-icon');
}

function paymentIcon(file, alt, className = 'payment-icon') {
  return assetImg(`${ASSETS.payment}${file}`, alt, className);
}

function lineIcon(name, alt, className) {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-label="${alt}" role="img" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${LINE_ICONS[name] || LINE_ICONS.more}</svg>`;
}

function categoryIcon(label) {
  return lineIcon(CATEGORY_ICON_KEYS[label] || 'more', `${label}分类`, 'category-icon');
}

function statusIcon(file, alt) {
  return assetImg(`${ASSETS.payment}${file}`, alt, 'status-icon-large');
}

const products = [
  {
    id: 'discord-nitro',
    slug: 'discord-nitro',
    name: 'Discord Nitro',
    category: '社交',
    status: 'active',
    icon: 'discord',
    short: '解锁 Discord 高级聊天体验，享受自定义表情、高清直播与大文件上传。',
    deliveryType: 'auto',
    hot: '98.2k+',
    rating: '4.9 (2.3k)',
    optionGroups: [
      { key: 'region', name: '地区', displayType: 'chips', options: ['Global', 'US', 'EU', 'JP'] },
      { key: 'account', name: '账号类型', displayType: 'segmented', options: ['新号', '老号', '共享'] },
      { key: 'duration', name: '套餐周期', displayType: 'cards', options: ['1个月', '3个月', '12个月'] }
    ],
    skus: [
      { id: 'dn-g-new-1', optionValues: { region: 'Global', account: '新号', duration: '1个月' }, priceUsdt: 1.8, stock: 'in_stock', deliveryType: 'auto', recommended: true },
      { id: 'dn-g-new-3', optionValues: { region: 'Global', account: '新号', duration: '3个月' }, priceUsdt: 4.8, originalPriceUsdt: 5.4, stock: 'in_stock', deliveryType: 'auto', discount: '省 11%' },
      { id: 'dn-g-new-12', optionValues: { region: 'Global', account: '新号', duration: '12个月' }, priceUsdt: 16.2, originalPriceUsdt: 21, stock: 'in_stock', deliveryType: 'auto', discount: '省 22%' },
      { id: 'dn-us-old-1', optionValues: { region: 'US', account: '老号', duration: '1个月' }, priceUsdt: 2.1, stock: 'low_stock', deliveryType: 'manual' },
      { id: 'dn-eu-share-3', optionValues: { region: 'EU', account: '共享', duration: '3个月' }, priceUsdt: 3.9, stock: 'in_stock', deliveryType: 'auto' },
      { id: 'dn-jp-new-1', optionValues: { region: 'JP', account: '新号', duration: '1个月' }, priceUsdt: 2.3, stock: 'sold_out', deliveryType: 'manual' }
    ],
    notice: {
      deliverySummary: '自动发货',
      warrantySummary: '30天',
      refundSummary: '开通后不支持退款',
      usageGuide: '购买后系统将自动发送 Discord Nitro 服务，请确保填写的账号信息正确。',
      warrantyDetail: '自开通之日起计算，权益与服务期限为 30 天。',
      attention: '本商品为虚拟商品，一经开通概不支持退款。请确认账号信息无误后再购买。',
      faq: ['Nitro 与 Nitro Basic 有何不同？', '如何查看到期时间？', '可以在多个服务器使用吗？']
    }
  },
  {
    id: 'spotify-premium',
    slug: 'spotify-premium',
    name: 'Spotify Premium',
    category: '音乐',
    status: 'active',
    icon: 'spotify',
    short: '畅听无广告音乐，支持离线下载与高品质音频。',
    deliveryType: 'auto',
    optionGroups: [{ key: 'duration', name: '套餐周期', displayType: 'cards', options: ['1个月', '3个月', '12个月'] }],
    skus: [
      { id: 'sp-1', optionValues: { duration: '1个月' }, priceUsdt: 2.2, stock: 'in_stock', deliveryType: 'auto', recommended: true },
      { id: 'sp-3', optionValues: { duration: '3个月' }, priceUsdt: 6.1, stock: 'in_stock', deliveryType: 'auto' },
      { id: 'sp-12', optionValues: { duration: '12个月' }, priceUsdt: 21.8, stock: 'low_stock', deliveryType: 'auto', discount: '省 17%' }
    ],
    notice: { deliverySummary: '自动发货', warrantySummary: '30天', refundSummary: '开通后不支持退款', usageGuide: '付款后自动发送开通指引。', warrantyDetail: '套餐有效期以开通成功时间计算。', attention: '地区与账号类型需匹配。', faq: ['是否支持家庭组？', '可以更换邮箱吗？'] }
  },
  {
    id: 'youtube-premium',
    slug: 'youtube-premium',
    name: 'YouTube Premium',
    category: '视频',
    status: 'active',
    icon: 'youtube',
    short: '免广告观看视频，支持后台播放与 YouTube Music。',
    deliveryType: 'mixed',
    optionGroups: [{ key: 'region', name: '地区', displayType: 'chips', options: ['Global', 'US', 'EU'] }, { key: 'duration', name: '套餐周期', displayType: 'cards', options: ['1个月', '12个月'] }],
    skus: [
      { id: 'yt-g-1', optionValues: { region: 'Global', duration: '1个月' }, priceUsdt: 2.5, stock: 'in_stock', deliveryType: 'auto' },
      { id: 'yt-us-12', optionValues: { region: 'US', duration: '12个月' }, priceUsdt: 24, stock: 'in_stock', deliveryType: 'manual' }
    ],
    notice: { deliverySummary: '部分自动发货', warrantySummary: '30天', refundSummary: '开通后不支持退款', usageGuide: '请填写可接收邀请的 Google 邮箱。', warrantyDetail: '如邀请失效可联系客服补发。', attention: '跨区账号可能需要额外验证。', faq: ['是否包含 Music？', '可以用于家庭成员吗？'] }
  },
  {
    id: 'steam-wallet',
    slug: 'steam-wallet',
    name: 'Steam Wallet',
    category: '游戏',
    status: 'active',
    icon: 'steam',
    short: 'Steam 钱包充值码与余额补充，适合游戏购买。',
    deliveryType: 'manual',
    optionGroups: [{ key: 'amount', name: '面额', displayType: 'cards', options: ['5 USD', '10 USD', '20 USD'] }],
    skus: [
      { id: 'sw-5', optionValues: { amount: '5 USD' }, priceUsdt: 5, stock: 'in_stock', deliveryType: 'manual' },
      { id: 'sw-10', optionValues: { amount: '10 USD' }, priceUsdt: 10, stock: 'in_stock', deliveryType: 'manual' },
      { id: 'sw-20', optionValues: { amount: '20 USD' }, priceUsdt: 20, stock: 'low_stock', deliveryType: 'manual' }
    ],
    notice: { deliverySummary: '手动处理', warrantySummary: '7天', refundSummary: '充值码发出后不支持退款', usageGuide: '请确认 Steam 区服后提交订单。', warrantyDetail: '未兑换卡密 7 天内可协助排查。', attention: '区服错误可能无法兑换。', faq: ['多久到账？', '是否支持国区？'] }
  },
  {
    id: 'microsoft-365',
    slug: 'microsoft-365',
    name: 'Microsoft 365',
    category: '软件',
    status: 'active',
    icon: 'office',
    short: 'Office 办公套件订阅，适合文档、表格和云端协作。',
    deliveryType: 'auto',
    optionGroups: [{ key: 'plan', name: '套餐', displayType: 'cards', options: ['个人版', '家庭版'] }],
    skus: [
      { id: 'ms-personal', optionValues: { plan: '个人版' }, priceUsdt: 3.5, stock: 'in_stock', deliveryType: 'auto' },
      { id: 'ms-family', optionValues: { plan: '家庭版' }, priceUsdt: 8.8, stock: 'in_stock', deliveryType: 'auto' }
    ],
    notice: { deliverySummary: '自动发货', warrantySummary: '30天', refundSummary: '激活后不支持退款', usageGuide: '按邮件中的步骤完成激活。', warrantyDetail: '激活失败可联系售后处理。', attention: '请勿频繁切换绑定邮箱。', faq: ['是否支持 Mac？', '包含 OneDrive 吗？'] }
  }
];

const state = {
  selectedProductId: localStorage.getItem('selectedProductId') || 'discord-nitro',
  selectedOptions: JSON.parse(localStorage.getItem('selectedOptions') || '{}'),
  fiatCurrency: localStorage.getItem('preferredCurrency') || 'CNY',
  paymentNetwork: localStorage.getItem('paymentNetwork') || 'TRON',
  telegramUsername: localStorage.getItem('telegramUsername') || '',
  email: localStorage.getItem('email') || '',
  user: JSON.parse(localStorage.getItem('gfUser') || 'null'),
  adminToken: localStorage.getItem('adminToken') || '',
  currencyOpen: false,
  categoryFilter: '全部',
  searchQuery: '',
  deliveryFilter: '全部',
  stockFilter: false,
  sortBy: '默认',
  walletMode: localStorage.getItem('walletMode') || 'browser',
  lookupResult: null,
  adminTab: 'dashboard',
  adminSubTabs: {},
  adminData: { loaded: false, loading: false, products: [], orders: [], paymentNetworks: [], deliveries: [], notifications: [], supportTickets: [], auditLogs: [], ops: {} },
  config: { telegram: { botUsername: '', loginMode: 'mock' }, admin: { authMode: 'dev-open' } },
  telegramPanelOpen: false,
  telegramDeeplink: null,       // { token, deeplink, deeplinkNative, expiresAt, startedAt }
  telegramDeeplinkStatus: 'idle', // idle | issuing | waiting | error | completed
  telegramDeeplinkError: '',
  noticeTab: 'basic',
  homeFaqActive: 0
};

const app = document.querySelector('#app');
const toast = document.querySelector('#toast');

function money(usdt, currency = state.fiatCurrency) {
  const c = CURRENCIES[currency];
  const amount = Number(usdt) * c.rate;
  const value = currency === 'JPY' || currency === 'KRW' ? Math.round(amount).toLocaleString() : amount.toFixed(1);
  return `${c.symbol}${value}`;
}

function price(usdt) {
  return `<span class="price-main">${Number(usdt).toFixed(2)} USDT</span><span class="price-fiat">≈ ${money(usdt)}</span>`;
}

function product() {
  return products.find((item) => item.id === state.selectedProductId) || products[0];
}

function defaultOptions(item) {
  const defaults = {};
  item.optionGroups.forEach((group) => defaults[group.key] = group.options[0]);
  const defaultSku = item.skus.find((sku) => sku.recommended) || item.skus[0];
  return defaultSku ? { ...defaults, ...defaultSku.optionValues } : defaults;
}

function selectedOptions(item = product()) {
  const saved = state.selectedOptions[item.id];
  return saved || defaultOptions(item);
}

function findSku(item = product(), options = selectedOptions(item)) {
  return item.skus.find((sku) => Object.entries(sku.optionValues).every(([key, value]) => options[key] === value));
}

function persist() {
  localStorage.setItem('selectedProductId', state.selectedProductId);
  localStorage.setItem('selectedOptions', JSON.stringify(state.selectedOptions));
  localStorage.setItem('preferredCurrency', state.fiatCurrency);
  localStorage.setItem('paymentNetwork', state.paymentNetwork);
  localStorage.setItem('telegramUsername', state.telegramUsername);
  localStorage.setItem('email', state.email);
  localStorage.setItem('gfUser', JSON.stringify(state.user));
  localStorage.setItem('adminToken', state.adminToken);
  localStorage.setItem('walletMode', state.walletMode);
}

function adminHeaders(extra = {}) {
  return {
    'content-type': 'application/json',
    ...(state.adminToken ? { 'x-admin-token': state.adminToken } : {}),
    ...extra
  };
}

async function adminFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: adminHeaders(options.headers || {})
  });
  if (response.status === 401) {
    state.adminToken = '';
    persist();
  }
  return response;
}

function parseMaybeJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeServerOrder(order) {
  if (!order) return null;
  const productId = order.productId || order.product_id;
  const skuId = order.skuId || order.sku_id;
  const productSnapshot = parseMaybeJson(order.productSnapshot ?? order.product_snapshot, products.find((item) => item.id === productId) || { name: productId });
  const skuSnapshot = parseMaybeJson(order.skuSnapshot ?? order.sku_snapshot, {});
  const options = skuSnapshot.optionValues || {};
  const amountUsdt = Number(order.amountUsdt ?? order.amount_usdt ?? skuSnapshot.priceUsdt ?? 0);
  const fiatCurrency = order.fiatCurrency || order.fiat_currency || 'USD';
  return {
    id: order.id || order.orderId,
    orderNo: order.orderNo || order.order_no,
    productId,
    skuId,
    productName: productSnapshot.name || productId,
    options,
    telegramUsername: order.telegramUsername || order.telegram_username,
    email: order.email,
    amountUsdt,
    fiatCurrency,
    fiatAmount: money(amountUsdt, fiatCurrency),
    paymentNetwork: order.paymentNetwork || order.payment_network,
    paymentAddress: order.paymentAddress || order.payment_address,
    status: order.status,
    deliveryType: skuSnapshot.deliveryType || order.deliveryType || order.delivery_type || 'manual',
    createdAt: order.createdAt || order.created_at,
    expiresAt: new Date(order.expiresAt || order.expires_at).getTime(),
    paidAt: order.paidAt || order.paid_at,
    deliveredAt: order.deliveredAt || order.delivered_at,
    updatedAt: order.updatedAt || order.updated_at,
    events: order.events || [],
    raw: order
  };
}

async function loadServerOrder(orderId) {
  try {
    const response = await fetch(`/api/orders/${orderId}/payment`);
    if (!response.ok) return null;
    const order = normalizeServerOrder(await response.json());
    if (order) saveOrder(order);
    return order;
  } catch {
    return null;
  }
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function normalizeTelegramBotUsername(value = '') {
  return String(value)
    .trim()
    .replace(/^https?:\/\/(?:www\.)?t\.me\//i, '')
    .replace(/^@+/, '')
    .split(/[/?#]/)[0]
    .trim();
}

function normalizeTelegramUsername(value = '') {
  return String(value).trim().replace(/^@+/, '');
}

async function loadConfig() {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      state.config = { ...state.config, ...(await response.json()) };
      state.config.telegram.botUsername = normalizeTelegramBotUsername(state.config.telegram.botUsername);
      state.config.telegram.loginMode = state.config.telegram.botUsername ? 'widget' : 'mock';
    }
  } catch {
    state.config = { telegram: { botUsername: '', loginMode: 'mock' }, admin: { authMode: 'dev-open' } };
  }
}

async function loadCatalog() {
  try {
    const [productsResponse, networksResponse] = await Promise.all([fetch('/api/products'), fetch('/api/payment-networks')]);
    if (productsResponse.ok) {
      const serverProducts = await productsResponse.json();
      for (const serverProduct of serverProducts) {
        const localProduct = products.find((item) => item.id === serverProduct.id);
        if (!localProduct) continue;
        localProduct.status = serverProduct.status || localProduct.status;
        localProduct.deliveryType = serverProduct.deliveryType || localProduct.deliveryType;
        if (Array.isArray(serverProduct.skus)) {
          for (const serverSku of serverProduct.skus) {
            const localSku = localProduct.skus.find((sku) => sku.id === serverSku.id);
            if (!localSku) continue;
            localSku.priceUsdt = Number(serverSku.priceUsdt ?? localSku.priceUsdt);
            localSku.stockStatus = serverSku.stockStatus || localSku.stockStatus;
            localSku.deliveryType = serverSku.deliveryType || localSku.deliveryType;
            localSku.isDefault = serverSku.isDefault ?? localSku.isDefault;
            localSku.isRecommended = serverSku.isRecommended ?? localSku.isRecommended;
          }
        }
      }
    }
    if (networksResponse.ok) {
      const serverNetworks = await networksResponse.json();
      for (const serverNetwork of serverNetworks) {
        syncLocalNetwork(networks.find((item) => item.code === serverNetwork.code), serverNetwork);
      }
    }
  } catch {
    // Local fallback stays intact when the API is unavailable.
  }
}

async function submitTelegramAuth(authData) {
  const response = await fetch('/api/auth/telegram', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(authData)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Telegram 登录失败');
  const telegramUsername = normalizeTelegramUsername(result.user.telegramUsername);
  state.user = {
    id: result.user.id,
    username: telegramUsername,
    defaultCurrency: result.user.defaultCurrency
  };
  state.telegramUsername = `@${telegramUsername}`;
  state.telegramPanelOpen = false;
  persist();
  notify('Telegram 登录成功');
  route();
}

window.onTelegramAuth = (authData) => {
  submitTelegramAuth(authData).catch((error) => notify(error.message));
};

function renderTelegramWidget() {
  const host = document.querySelector('#telegram-widget-host');
  const botUsername = normalizeTelegramBotUsername(state.config.telegram.botUsername);
  if (!host || !botUsername || host.dataset.ready) return;
  host.dataset.ready = 'true';
  host.innerHTML = '';
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://telegram.org/js/telegram-widget.js?22';
  script.setAttribute('data-telegram-login', botUsername);
  script.setAttribute('data-size', 'large');
  script.setAttribute('data-radius', '14');
  script.setAttribute('data-userpic', 'false');
  script.setAttribute('data-request-access', 'write');
  script.setAttribute('data-onauth', 'onTelegramAuth(user)');
  host.appendChild(script);
}

// ─── Telegram Deeplink 登录 ────────────────────────────────────────────────
//
// 相比官方 Login Widget 的优点：
//   - 直接唤起本机 Telegram 客户端，用户一键 Start 就完成
//   - 不用输手机号，也不依赖 Telegram 的短信/客户端确认消息
// 实现：后端签发一次性 token → 前端打开 tg://resolve?...&start=<token>
//      → webhook 接 /start，把 token 绑定到 Telegram user → 前端轮询拿结果

let telegramPollTimer = null;

function stopTelegramPolling() {
  if (telegramPollTimer) {
    clearTimeout(telegramPollTimer);
    telegramPollTimer = null;
  }
}

async function telegramDeeplinkIssue({ openImmediately = true } = {}) {
  stopTelegramPolling();
  state.telegramDeeplinkStatus = 'issuing';
  state.telegramDeeplinkError = '';
  route();
  try {
    const response = await fetch('/api/auth/telegram-deeplink/issue', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '签发登录链接失败');
    state.telegramDeeplink = {
      token: data.token,
      deeplink: data.deeplink,
      deeplinkNative: data.deeplinkNative,
      expiresAt: data.expiresAt,
      startedAt: Date.now()
    };
    state.telegramDeeplinkStatus = 'waiting';
    route();
    if (openImmediately) {
      // 直接用 location.href 打开 tg:// 协议，已装 Telegram 桌面客户端时浏览器会询问是否打开
      // 若协议未注册，部分浏览器会静默失败；面板里同时留了 https://t.me/... 作为 fallback
      try { window.location.href = data.deeplinkNative; } catch { /* ignore */ }
    }
    schedulePoll();
  } catch (error) {
    state.telegramDeeplinkStatus = 'error';
    state.telegramDeeplinkError = error.message || '签发登录链接失败';
    route();
  }
}

function schedulePoll() {
  stopTelegramPolling();
  telegramPollTimer = setTimeout(pollTelegramDeeplink, 2000);
}

async function pollTelegramDeeplink() {
  telegramPollTimer = null;
  const link = state.telegramDeeplink;
  // 弹窗已关闭 / 已登录 / 无 token：停止轮询
  if (!link || !state.telegramPanelOpen || state.user || state.telegramDeeplinkStatus !== 'waiting') return;

  // 超时（10 分钟）本地就先退出；服务端也会返回 expired
  if (Date.now() - link.startedAt > 10 * 60 * 1000) {
    state.telegramDeeplinkStatus = 'error';
    state.telegramDeeplinkError = '登录链接已过期，请重试';
    route();
    return;
  }

  try {
    const response = await fetch(`/api/auth/telegram-deeplink/poll?token=${encodeURIComponent(link.token)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '查询登录状态失败');

    if (data.status === 'pending') {
      schedulePoll();
      return;
    }
    if (data.status === 'expired') {
      state.telegramDeeplinkStatus = 'error';
      state.telegramDeeplinkError = '登录链接已失效，请重新生成';
      route();
      return;
    }
    if (data.status === 'completed' && data.user) {
      const telegramUsername = normalizeTelegramUsername(data.user.telegramUsername);
      state.user = {
        id: data.user.id,
        username: telegramUsername,
        defaultCurrency: data.user.defaultCurrency
      };
      state.telegramUsername = `@${telegramUsername}`;
      state.telegramPanelOpen = false;
      state.telegramDeeplink = null;
      state.telegramDeeplinkStatus = 'completed';
      persist();
      notify('Telegram 登录成功');
      route();
      return;
    }
    // 未知状态：继续轮询
    schedulePoll();
  } catch {
    // 网络波动：继续轮询（会自然超时）
    schedulePoll();
  }
}

function openTelegramLoginPanel() {
  state.telegramPanelOpen = true;
  state.telegramDeeplink = null;
  state.telegramDeeplinkStatus = 'idle';
  state.telegramDeeplinkError = '';
  // 不阻塞 UI，立刻打开面板，在 panel 中显示 "正在生成登录链接..."
  telegramDeeplinkIssue({ openImmediately: true });
}

function closeTelegramLoginPanel() {
  state.telegramPanelOpen = false;
  state.telegramDeeplink = null;
  state.telegramDeeplinkStatus = 'idle';
  stopTelegramPolling();
  route();
}

function mockTelegramLogin() {
  state.user = { id: 'user_001', username: 'ichuhai_user', defaultCurrency: state.fiatCurrency };
  state.telegramUsername = '@ichuhai_user';
  state.telegramPanelOpen = false;
  persist();
  notify('Telegram 模拟登录成功');
  route();
}

function logo() {
  return `<a class="brand" href="#/" aria-label="ichuhai 首页"><img class="logo-horizontal" src="${ASSETS.logo}ichuhai-logo-horizontal-color.png" alt="ichuhai" /></a>`;
}

function icon(type) {
  const file = PRODUCT_ICONS[type] || 'E12_placeholder_blank.png';
  return assetImg(`${ASSETS.product}${file}`, `${type || 'ichuhai'} 商品图标`, 'product-icon');
}

function header() {
  const isDetail = location.hash.startsWith('#/product/') || location.hash.startsWith('#/products/');
  return `
    <header class="topbar ${isDetail ? 'detail-topbar' : ''}">
      ${logo()}
      <div class="top-actions">
        <a class="pill header-help ${isDetail ? 'detail-hide-action' : ''}" href="#/faq">${navIcon('A03_faq_help.png', '帮助中心')} 帮助中心</a>
        <div class="currency ${isDetail ? 'detail-hide-action' : ''}">
          <button class="pill currency-pill" data-action="toggleCurrency">${CURRENCIES[state.fiatCurrency].flag} ${state.fiatCurrency} ${navIcon('A10_shaixuan.png', '展开货币', 'currency-chevron')}</button>
          ${state.currencyOpen ? currencyMenu() : ''}
        </div>
        <a class="pill cart ${isDetail ? 'detail-hide-action' : ''}" href="#/account">${navIcon('A06_shopping_cart.png', '订单')} 我的订单</a>
        <button class="pill telegram-pill" data-action="telegramLogin">${navIcon('A07_user_login.png', '登录')}Telegram 登录</button>
      </div>
    </header>
    ${state.telegramPanelOpen ? telegramLoginPanel() : ''}
  `;
}

function telegramLoginPanel() {
  const botConfigured = !!state.config.telegram.botUsername;
  const link = state.telegramDeeplink;
  const status = state.telegramDeeplinkStatus;

  // 未配置 bot：保留原本的本地模拟登录
  if (!botConfigured) {
    return `
      <div class="modal-backdrop" data-action="closeTelegramPanel">
        <section class="glass telegram-panel">
          <button class="modal-close" data-action="closeTelegramPanel" type="button" aria-label="关闭 Telegram 登录">×</button>
          <h2>Telegram 登录</h2>
          <p>当前未配置 TELEGRAM_BOT_USERNAME，本地环境使用模拟登录。</p>
          <button class="primary small" data-action="mockTelegramLogin">使用本地模拟登录</button>
        </section>
      </div>
    `;
  }

  const botUsername = state.config.telegram.botUsername;
  let bodyHtml = '';

  if (status === 'issuing') {
    bodyHtml = `<p class="telegram-hint">正在生成登录链接…</p>`;
  } else if (status === 'waiting' && link) {
    bodyHtml = `
      <p class="telegram-hint">点击下方按钮在 Telegram 中确认登录。</p>
      <div class="telegram-deeplink-actions">
        <a class="primary telegram-deeplink-btn" href="${link.deeplinkNative}" data-action="openTelegramDeeplink">在 Telegram 中打开</a>
        <a class="text-button" href="${link.deeplink}" target="_blank" rel="noopener noreferrer">没有弹出？点这里</a>
      </div>
      <p class="telegram-foot">
        等待你在 Telegram 里点击 <b>Start</b> 或发送 <code>/start</code>… 链接 10 分钟内有效。
      </p>
      <button class="text-button small" data-action="telegramDeeplinkReissue" type="button">重新生成链接</button>
    `;
  } else if (status === 'error') {
    bodyHtml = `
      <p class="telegram-hint error">${state.telegramDeeplinkError || '登录链接生成失败。'}</p>
      <button class="primary small" data-action="telegramDeeplinkReissue" type="button">重试</button>
    `;
  } else {
    bodyHtml = `<p class="telegram-hint">正在准备…</p>`;
  }

  return `
    <div class="modal-backdrop" data-action="closeTelegramPanel">
      <section class="glass telegram-panel">
        <button class="modal-close" data-action="closeTelegramPanel" type="button" aria-label="关闭 Telegram 登录">×</button>
        <h2>Telegram 登录</h2>
        <p>通过 <b>@${botUsername}</b> 一键登录，不用输手机号。</p>
        ${bodyHtml}
      </section>
    </div>
  `;
}

function currencyMenu() {
  return `
    <div class="currency-menu">
      <small>Auto-pricing by IP</small>
      ${Object.entries(CURRENCIES).map(([code, item]) => `
        <button class="${code === state.fiatCurrency ? 'active' : ''}" data-action="setCurrency" data-code="${code}">
          <span>${item.flag} ${code}</span>${code === state.fiatCurrency ? navIcon('A11_huilvxuanzhong.png', '已选中', 'currency-check') : ''}
        </button>
      `).join('')}
    </div>
  `;
}

function shell(content, className = '') {
  app.innerHTML = `${className.includes('admin-page') ? '' : header()}<main class="${className}">${content}</main>`;
  enhanceSelects();
}

function enhanceSelects() {
  document.querySelectorAll('select').forEach((select) => {
    if (select.parentElement?.classList.contains('select-shell')) return;
    const shell = document.createElement('span');
    shell.className = 'select-shell';
    select.replaceWith(shell);
    shell.append(select, chevronIcon());
  });
}

function chevronIcon() {
  const template = document.createElement('template');
  template.innerHTML = lineIcon('chevron', '展开选项', 'select-chevron').trim();
  return template.content.firstElementChild;
}

function home() {
  shell(`
    <section class="hero">
      <div class="hero-copy">
        <h1>全球数字商品，<span>一站式秒发</span></h1>
        <p>谷歌开发者号、苹果开发者号等热门数字商品，一键购买，安全便捷。</p>
        <div class="hero-tags">
          <span>${featureIcon('B01_lightning_instant_delivery.png', '即时发货')} <b>即时发货</b><small>秒级交付</small></span>
          <span>${featureIcon('B02_shield_secure_payment.png', '安全支付')} <b>安全支付</b><small>加密保障</small></span>
          <span>${featureIcon('B03_headset_support.png', '7x24支持')} <b>7×24支持</b><small>全时在线</small></span>
        </div>
        <div class="hero-actions">
          <a class="primary-button" href="#products">立即选购 →</a>
          <a class="text-button" href="#why-us">为什么选择我们 →</a>
        </div>
      </div>
    </section>
    ${productBrowser()}
    ${purchaseFlow()}
    ${platformGuarantee()}
    ${homeFaq()}
    ${siteFooter()}
  `, 'page');
}

function visibleProducts(full = false) {
  const query = state.searchQuery.trim().toLowerCase();
  const category = state.categoryFilter;
  let list = products;
  if (category && category !== '全部' && category !== '更多') {
    list = list.filter((item) => item.category === category);
  }
  if (query) {
    list = list.filter((item) => [item.name, item.category, item.short].some((value) => String(value || '').toLowerCase().includes(query)));
  }
  if (state.deliveryFilter !== '全部') {
    const deliveryMap = { 秒发: 'auto', 人工: 'manual', 部分自动: 'mixed' };
    list = list.filter((item) => item.deliveryType === deliveryMap[state.deliveryFilter]);
  }
  if (state.stockFilter) {
    list = list.filter((item) => item.skus.some((sku) => (sku.stockStatus || sku.stock) !== 'sold_out'));
  }
  if (state.sortBy === '价格低到高') {
    list = [...list].sort((a, b) => Number((findSku(a, defaultOptions(a)) || a.skus[0]).priceUsdt) - Number((findSku(b, defaultOptions(b)) || b.skus[0]).priceUsdt));
  }
  return full ? list : list.slice(0, 5);
}

function productBrowser(full = false) {
  const categories = ['全部', '社交', '音乐', '视频', '游戏', '软件', '礼品卡', '更多'];
  const visible = visibleProducts(full);
  return `
    <section id="products" class="product-section product-browser">
      <div class="product-header">
        <h2>热门商品</h2>
        <div class="tabs">
          ${categories.map((c) => `<button class="category-tab ${state.categoryFilter === c ? 'active' : ''}" data-action="filterCategory" data-category="${c}">${categoryIcon(c)}${c}</button>`).join('')}
        </div>
        <label class="search">${navIcon('A09_search.png', '搜索')} <input data-action="searchProducts" value="${state.searchQuery}" placeholder="搜索商品名称" /></label>
      </div>
      ${full ? `<div class="filter-bar">
        <label>发货<select data-action="filterDelivery"><option>全部</option><option ${state.deliveryFilter === '秒发' ? 'selected' : ''}>秒发</option><option ${state.deliveryFilter === '人工' ? 'selected' : ''}>人工</option><option ${state.deliveryFilter === '部分自动' ? 'selected' : ''}>部分自动</option></select></label>
        <label>排序<select data-action="sortProducts"><option>默认</option><option ${state.sortBy === '价格低到高' ? 'selected' : ''}>价格低到高</option></select></label>
        <label class="check-filter"><input type="checkbox" data-action="stockOnly" ${state.stockFilter ? 'checked' : ''}/> 仅看有货</label>
      </div>` : ''}
      <div class="product-row">
        ${visible.length ? visible.map(card).join('') : '<div class="empty-state">暂无匹配商品</div>'}
      </div>
      ${!full ? '<div class="view-all-wrap"><a class="view-all-link" href="#/products">查看全部商品 →</a></div>' : ''}
    </section>
  `;
}

function purchaseFlow() {
  return `
    <section class="purchase-flow">
      <h2>购买流程</h2>
      <div class="flow-steps">
        ${HOME_FLOW_STEPS.map((item, index) => `
          <div class="flow-step">
            <span class="flow-icon">${item.source === 'nav' ? navIcon(item.icon, item.title) : item.source === 'payment' ? paymentIcon(item.icon, item.title) : featureIcon(item.icon, item.title)}</span>
            <span>
              <strong>${item.title}</strong>
              <small>${item.desc}</small>
            </span>
          </div>
          ${index < HOME_FLOW_STEPS.length - 1 ? '<span class="step-arrow">›</span>' : ''}
        `).join('')}
      </div>
    </section>
  `;
}

function platformGuarantee() {
  return `
    <section id="why-us" class="platform-guarantee">
      <div class="guarantee-list">
        ${GUARANTEE_ITEMS.map((item) => `
          <div class="guarantee-item">
            ${featureIcon(item.icon, item.title)}
            <div>
              <h3>${item.title}</h3>
              <p>${item.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function homeFaq() {
  return `
    <section class="home-faq">
      <h2>常见问题</h2>
      <div class="faq-list">
        ${HOME_FAQS.map((faq, index) => `
          <button class="faq-item ${state.homeFaqActive === index ? 'active' : ''}" data-action="toggleHomeFaq" data-index="${index}" type="button">
            <span class="faq-icon-wrap">${lineIcon(faq.icon, faq.question, 'faq-icon')}</span>
            <span class="faq-copy">
              <strong>${faq.question}</strong>
              <span>${faq.answer}</span>
            </span>
            ${lineIcon('chevron', '展开', 'faq-chevron')}
          </button>
        `).join('')}
      </div>
      <div class="support-banner">
        <span class="support-icon">${lineIcon('headset', '客服团队', 'support-headset')}</span>
        <div>
          <h3>还有问题？联系我们的客服团队</h3>
          <p>7x24 小时在线响应，为您提供专业、高效的帮助</p>
        </div>
        <a class="support-button" href="#/faq">${navIcon('A07_user_login.png', '联系在线客服')} 联系在线客服</a>
      </div>
    </section>
  `;
}

function siteFooter() {
  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <img src="${ASSETS.logo}ichuhai-logo-horizontal-color.png" alt="ichuhai" />
          <p>全球数字商品，一站式秒发</p>
          <p>安全 · 快速 · 可靠</p>
        </div>
        <div class="footer-column">
          <h4>平台</h4>
          <a href="#/products">商品中心</a>
          <a href="#/faq">帮助中心</a>
          <a href="#/">关于我们</a>
        </div>
        <div class="footer-column">
          <h4>支持</h4>
          <a href="#/faq">新手指南</a>
          <a href="#/faq">常见问题</a>
          <a href="#/faq">联系客服</a>
        </div>
        <div class="footer-column">
          <h4>支付方式</h4>
          <div class="payment-icons">
            <span>USDT</span>
            <span>TRX</span>
            <span>◎</span>
          </div>
          <p>更多支付方式陆续接入中</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 ichuhai. 保留所有权利。</span>
        <div>
          <a href="#/">服务条款</a>
          <a href="#/">隐私政策</a>
          <a href="#/">免责声明</a>
        </div>
      </div>
    </footer>
  `;
}

function card(item) {
  const sku = findSku(item, defaultOptions(item)) || item.skus[0];
  const spec = sku ? Object.values(sku.optionValues).join(' · ') : '规格待选';
  const deliveryClass = item.deliveryType === 'auto' ? 'auto' : item.deliveryType === 'mixed' ? 'mixed' : 'manual';
  const stock = sku.stockStatus || sku.stock;
  return `
    <a class="product-card" href="#/product/${item.slug}">
      ${icon(item.icon)}
      <b>${item.name}</b>
      <span class="product-spec">${spec}</span>
      ${price(sku.priceUsdt)}
      <span class="product-badges"><i class="stock ${stock}">${stockLabel(stock)}</i><em class="${deliveryClass}">⚡ 秒发</em></span>
      <span class="buy-button">${navIcon('A06_shopping_cart.png', '购买')} 立即购买</span>
    </a>
  `;
}

function deliveryLabel(type) {
  return { auto: '自动发货', mixed: '部分自动', manual: '人工处理' }[type] || type;
}

function stockLabel(status) {
  return { in_stock: '有货', low_stock: '库存紧张', sold_out: '售罄' }[status] || '有货';
}

function productProfile(item, sku = findSku(item)) {
  const isGift = item.category === '礼品卡' || item.name.includes('Wallet') || item.name.includes('Gift');
  const type = isGift ? '兑换码 / 礼品卡' : item.deliveryType === 'manual' ? '订阅代充 / 人工处理' : '账号权益 / 兑换服务';
  const delivery = sku?.deliveryType === 'manual' ? '人工处理，通常 10 分钟内开始处理，复杂订单 24 小时内完成' : '付款确认后自动发货，通常 1-3 分钟';
  const duration = sku?.optionValues?.duration || sku?.optionValues?.plan || sku?.optionValues?.amount || '以所选 SKU 为准';
  return {
    type,
    delivery,
    duration,
    receives: isGift ? '卡密、兑换码或充值指引' : '账号权益、激活链接、邀请链接或开通指引',
    limits: `${sku?.optionValues?.region || 'Global'} 地区；${sku?.optionValues?.account || '按商品说明'}；请勿频繁切换设备、地区或 IP`,
    afterSales: '保期内失效可申请补发、重置或人工协助；已发货且信息无误的虚拟商品通常不支持无理由退款',
    required: item.name.includes('YouTube') ? 'Google 邮箱、Telegram、备用联系方式' : 'Telegram 用户名、接收邮箱、必要时的账号 ID 或备注',
    risk: '虚拟商品付款前请确认账号、地区、网络和收款链；发货后不可撤销，异常支付进入人工处理'
  };
}

function optionPanel(item, purchaseMode = false) {
  const opts = selectedOptions(item);
  if (!purchaseMode) {
    return `
      <section class="glass panel">
        <h3>选择购买选项 <span>（${item.name}）</span></h3>
        <div class="option-grid">
          ${item.optionGroups.map((group, idx) => `
            <div class="option-group">
              <h4><span>${idx + 1}</span>${group.name}</h4>
              <div class="choice-list ${group.displayType}">
                ${group.options.map((option) => {
                  const next = { ...opts, [group.key]: option };
                  const possible = item.skus.some((sku) => {
                    if (sku.optionValues[group.key] !== option) return false;
                    return Object.entries(next).every(([key, value]) => sku.optionValues[key] === value || sku.optionValues[key] === undefined);
                  });
                  const active = opts[group.key] === option;
                  const matching = item.skus.find((sku) => sku.optionValues[group.key] === option && Object.entries(next).every(([key, value]) => sku.optionValues[key] === value || sku.optionValues[key] === undefined));
                  return `<button class="${active ? 'active' : ''} ${possible ? '' : 'disabled'}" data-action="setOption" data-product="${item.id}" data-key="${group.key}" data-value="${option}" title="${possible ? '' : '当前组合暂不可购买'}" ${possible ? '' : 'disabled'}>
                    ${optionLabel(option)}
                    ${matching?.discount ? `<em>${matching.discount}</em>` : ''}
                    ${group.displayType === 'cards' && matching ? `<small>${matching.priceUsdt.toFixed(2)} USDT<br/>≈ ${money(matching.priceUsdt)}</small>` : ''}
                  </button>`;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }
  const sku = findSku(item, opts);
  const steps = item.optionGroups.map((group, idx) => renderPurchaseStep(item, group, idx + 1));
  steps.push(renderPaymentStep(steps.length + 1));
  return `
    <section class="purchase-layout">
      <div class="purchase-flow" style="--step-count:${steps.length}">
        ${steps.join('')}
      </div>
      ${orderPreview(item, sku)}
    </section>
  `;
}

function optionLabel(value) {
  const flags = { Global: '🌐', US: '🇺🇸', EU: '🇪🇺', JP: '🇯🇵' };
  return `${flags[value] || ''} ${value}`;
}

const OPTION_META = {
  region: {
    Global: { icon: '🌐', sub: '全球通用' },
    US: { icon: '🇺🇸', sub: '暂不支持' },
    EU: { icon: '🇪🇺', sub: '暂不支持' },
    JP: { icon: '🇯🇵', sub: '暂不支持' }
  },
  account: {
    新号: { icon: '👥', sub: '全新账号' },
    老号: { icon: '👤', sub: '已有账号' },
    共享: { icon: '👥', sub: '库存不足' }
  }
};

const PAYMENT_META = {
  TRON: { title: 'USDT (TRC20)', sub: '安全 · 快速', icon: 'C01_usdt.png' },
  ETH: { title: 'ETH (ERC20)', sub: '以太坊网络', icon: 'C03_wallet.png' },
  BSC: { title: 'BSC (BEP20)', sub: '币安智能链', icon: 'C03_wallet.png' },
  BASE: { title: 'BASE (ERC20)', sub: 'Base 网络', icon: 'C03_wallet.png' }
};

function paymentDisplay(code = state.paymentNetwork) {
  const network = networks.find((n) => n.code === code) || networks[0];
  return PAYMENT_META[network.code]?.title || `${network.displayName} (${network.tokenStandard})`;
}

function optionReason(item, group, option, possible) {
  if (possible) return '';
  const anySku = item.skus.some((sku) => sku.optionValues[group.key] === option);
  const stockSku = item.skus.find((sku) => sku.optionValues[group.key] === option && (sku.stockStatus || sku.stock) === 'sold_out');
  if (stockSku) return '库存不足';
  if (!anySku) return group.key === 'account' && option === '共享' ? '库存不足' : '暂不支持';
  return '当前不可用';
}

function renderOptionButton(item, group, option) {
  const opts = selectedOptions(item);
  const next = { ...opts, [group.key]: option };
  const possible = item.skus.some((sku) => {
    if (sku.optionValues[group.key] !== option) return false;
    if ((sku.stockStatus || sku.stock) === 'sold_out') return false;
    return Object.entries(next).every(([key, value]) => sku.optionValues[key] === value || sku.optionValues[key] === undefined);
  });
  const active = opts[group.key] === option;
  const matching = item.skus.find((sku) => sku.optionValues[group.key] === option && (sku.stockStatus || sku.stock) !== 'sold_out' && Object.entries(next).every(([key, value]) => sku.optionValues[key] === value || sku.optionValues[key] === undefined));
  const meta = OPTION_META[group.key]?.[option] || {};
  const isPlan = group.displayType === 'cards' || group.key === 'duration' || group.key === 'plan' || group.key === 'amount';
  const reason = optionReason(item, group, option, possible);
  const className = [
    'selection-card',
    isPlan ? 'plan-card' : '',
    active ? 'active' : '',
    possible ? '' : 'disabled'
  ].filter(Boolean).join(' ');

  if (isPlan) {
    return `<button class="${className}" data-action="setOption" data-product="${item.id}" data-key="${group.key}" data-value="${option}" title="${possible ? '' : reason}" ${possible ? '' : 'disabled'}>
      ${matching?.discount ? `<em>${matching.discount}</em>` : ''}
      <strong>${option}</strong>
      <span class="card-price">${matching ? `${matching.priceUsdt.toFixed(2)} USDT` : '-- USDT'}</span>
      <small>${matching ? `≈ ${money(matching.priceUsdt)}` : reason}</small>
      ${active ? '<i class="checkmark">✓</i>' : ''}
    </button>`;
  }

  return `<button class="${className}" data-action="setOption" data-product="${item.id}" data-key="${group.key}" data-value="${option}" title="${possible ? '' : reason}" ${possible ? '' : 'disabled'}>
    <span class="option-art">${meta.icon || optionLabel(option).trim().slice(0, 2)}</span>
    <span class="option-copy"><strong>${option}</strong><small>${possible ? (meta.sub || '可选择') : reason}</small></span>
    ${active ? '<i class="checkmark">✓</i>' : ''}
  </button>`;
}

function renderPurchaseStep(item, group, index) {
  const typeClass = group.key === 'duration' || group.key === 'plan' || group.key === 'amount' ? 'plans' : group.key;
  return `<section class="purchase-step" style="--step-index:${index}">
    <div class="step-marker"><span>${index}</span></div>
    <div class="step-panel">
      <h3>${group.name}</h3>
      <div class="step-options ${typeClass}">
        ${group.options.map((option) => renderOptionButton(item, group, option)).join('')}
      </div>
    </div>
  </section>`;
}

function renderPaymentStep(index) {
  return `<section class="purchase-step" style="--step-index:${index}">
    <div class="step-marker"><span>${index}</span></div>
    <div class="step-panel">
      <h3>支付方式</h3>
      <div class="step-options payment-cards">
        ${networks.map((n) => {
          const meta = PAYMENT_META[n.code] || { title: networkText(n.code), sub: n.warning, icon: 'C03_wallet.png' };
          const active = n.code === state.paymentNetwork;
          return `<button class="selection-card payment-option ${active ? 'active' : ''}" data-action="chooseNetwork" data-code="${n.code}" type="button">
            ${n.recommended ? '<em>推荐</em>' : ''}
            <span class="payment-art">${paymentIcon(meta.icon, meta.title)}</span>
            <span class="option-copy"><strong>${meta.title}</strong><small>${meta.sub}</small></span>
            ${active ? '<i class="checkmark">✓</i>' : ''}
          </button>`;
        }).join('')}
      </div>
    </div>
  </section>`;
}

function orderPreview(item, sku) {
  const opts = selectedOptions(item);
  const disabled = !sku || (sku.stockStatus || sku.stock) === 'sold_out';
  const buttonText = disabled ? '请先完成商品选择' : state.user ? `立即支付 ${sku.priceUsdt.toFixed(2)} USDT` : `登录后支付 ${sku.priceUsdt.toFixed(2)} USDT`;
  const rows = [
    ['商品', item.name],
    ['地区', opts.region || '不适用'],
    ['账号类型', opts.account || '不适用'],
    ['套餐周期', opts.duration || opts.plan || opts.amount || '已选择'],
    ['支付方式', paymentDisplay()]
  ];
  const trust = [
    ['B04_lock_encryption.png', '安全加密', '全程 SSL 加密，保护您的隐私与交易安全'],
    ['B01_lightning_instant_delivery.png', '自动发货', '付款成功后，系统自动处理您的订单'],
    ['B08_warranty_guarantee.png', '售后保障', '30 天保障期，专业售后团队支持']
  ];
  return `<aside class="order-preview-card">
    <h2>订单预览</h2>
    <div class="preview-lines">${rows.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('')}</div>
    <div class="preview-total">
      <span>应付金额</span>
      <strong>${sku ? `${sku.priceUsdt.toFixed(2)} USDT` : '-- USDT'}</strong>
      <small>${sku ? `≈ ${money(sku.priceUsdt)}` : '当前组合不可购买'}</small>
    </div>
    <div class="preview-trust">
      ${trust.map(([iconFile, title, text]) => `<div>${featureIcon(iconFile, title)}<span><strong>${title}</strong><small>${text}</small></span></div>`).join('')}
    </div>
    <button class="primary-pay-button" data-action="paySelected" ${disabled ? 'disabled' : ''}>${featureIcon('B04_lock_encryption.png', '锁定支付')} ${buttonText}</button>
    <p class="preview-save">${featureIcon('B02_shield_secure_payment.png', '自动保存')} 登录后订单信息将自动保存</p>
  </aside>`;
}

function noticePanel(item) {
  const isGift = item.category === '礼品卡' || item.name.includes('Wallet') || item.name.includes('Gift');
  const content = isGift ? [
    ['B09_auto_delivery.png', '自动发货', '付款完成后，系统将自动发送卡密或兑换指引。', 'notice-blue'],
    ['C04_qr_code.png', '查看方式', '登录后可在订单详情查看完整兑换码与发货记录。', 'notice-purple'],
    ['B01_lightning_instant_delivery.png', '使用说明', '请按商品区服与平台规则兑换，兑换前核对账号地区。', 'notice-green'],
    ['B03_headset_support.png', '售后规则', '卡密发出后不支持退款，如无法兑换请先联系客服。', 'notice-yellow'],
    ['B07_warning_triangle.png', '风险说明', '请勿转售或用于违规用途，错误区服可能无法兑换。', 'notice-red']
  ] : [
    ['B09_auto_delivery.png', '自动发货', '付款完成后，系统将自动为您开通服务，无需等待人工处理。', 'notice-blue'],
    ['B01_lightning_instant_delivery.png', '1–3 分钟到账', '高峰期可能略有延迟，请耐心等待，通常 1–3 分钟内到账。', 'notice-purple'],
    ['B08_warranty_guarantee.png', '30 天保障', '自开通成功起算，按所选套餐持续生效，享受完整服务期间。', 'notice-green'],
    ['B03_headset_support.png', '售后规则', '开通后不支持退款，如遇问题请先联系客服，我们将尽力协助处理。', 'notice-yellow'],
    ['B06_check_circle_success.png', '使用说明', '购买后登录 Discord 即可自动激活，可在用户设置中查看 Nitro 状态。', 'notice-purple'],
    ['B07_warning_triangle.png', '风险说明', '请勿用于违法违规用途，账号共享或转售可能导致服务被撤销，风险自担。', 'notice-red']
  ];
  return `
    <section class="notice-card">
      <div class="notice-header"><div><h2>购买须知</h2><p>重要规则直接展示，购买前请快速确认。</p></div></div>
      <div class="notice-grid">
        ${content.map(([iconFile, label, text, tone]) => `
          <div class="notice-item ${tone}">
            <div class="notice-icon">${iconFile.startsWith('C') ? paymentIcon(iconFile, label) : iconFile === 'shield-check' ? lineIcon('shield-check', label, 'feature-icon support-rule-icon') : featureIcon(iconFile, label)}</div>
            <strong>${label}</strong>
            <p>${text}</p>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function quickOrder(item, sku) {
  const disabled = !sku || sku.stockStatus === 'sold_out';
  return `
    <aside class="glass quick-order">
      <div class="bolt">${featureIcon('B01_lightning_instant_delivery.png', '即时发货')}</div>
      <h2>快速下单</h2>
      <label>商品<select data-action="quickProduct">${products.map((p) => `<option value="${p.id}" ${p.id === item.id ? 'selected' : ''}>${p.name}</option>`).join('')}</select></label>
      <label>规格 / 套餐<select data-action="quickSku">${item.skus.map((s) => `<option value="${s.id}" ${sku?.id === s.id ? 'selected' : ''}>${Object.values(s.optionValues).join(' · ')}</option>`).join('')}</select></label>
      <label>Telegram 用户名 *<input data-field="telegram" value="${state.telegramUsername}" placeholder="例如 @username" /></label>
      <label>邮箱 *<input data-field="email" value="${state.email}" placeholder="例如 name@example.com" /></label>
      <label>支付币种<input value="USDT 🔒" disabled /></label>
      <label>支付网络<select data-action="setNetwork">${networks.map((n) => `<option value="${n.code}" ${n.code === state.paymentNetwork ? 'selected' : ''}>${n.displayName} (${n.tokenStandard})</option>`).join('')}</select></label>
      <div class="amount"><span>订单金额</span><strong>${sku ? price(sku.priceUsdt) : '当前规格暂不可购买'}</strong></div>
      <button class="primary" data-action="goCheckout" ${disabled ? 'disabled' : ''}>${paymentIcon('C03_wallet.png', '钱包')} 前往统一结算</button>
      <p class="secure">支付信息与订单通知将同时发送至 Telegram 与邮箱</p>
      <footer>${featureIcon('B02_shield_secure_payment.png', '安全加密支付')} 安全加密支付，保障您的隐私与资产安全</footer>
    </aside>
  `;
}

function flowStrip() {
  return `<section class="flow glass">${['01 选择商品', '02 选择规格', '03 填写信息', '04 完成支付 / 接收商品'].map((x) => `<span>${x}</span>`).join('<i>···</i>')}</section>`;
}

function detail(slug = 'discord-nitro') {
  const item = products.find((p) => p.slug === slug) || product();
  const wasDifferentProduct = state.selectedProductId !== item.id;
  const isNewDetailVisit = state.lastDetailSlug !== item.slug;
  state.selectedProductId = item.id;
  if (wasDifferentProduct || isNewDetailVisit || !state.selectedOptions[item.id]) {
    state.selectedOptions[item.id] = defaultOptions(item);
  }
  state.lastDetailSlug = item.slug;
  const sku = findSku(item);
  const opts = selectedOptions(item);
  const related = products.filter((p) => p.id !== item.id).slice(0, 3);
  const payText = state.user ? `立即支付 ${sku ? sku.priceUsdt.toFixed(2) : '--'} USDT` : `登录后支付 ${sku ? sku.priceUsdt.toFixed(2) : '--'} USDT`;
  persist();
  shell(`
    <div class="breadcrumb">首页 / 商品 / ${item.name}</div>
    <section class="product-hero-card">
      <div class="product-main-info">
        ${icon(item.icon)}
        <div>
          <div class="hero-title-row"><h1>${item.name}</h1><span>${featureIcon('B06_check_circle_success.png', '官方正版')} 官方正版</span></div>
          <p>${item.short}</p>
          <div class="product-tags"><span>${featureIcon('B06_check_circle_success.png', '自定义表情')} 自定义表情</span><span>${featureIcon('B09_auto_delivery.png', '高清直播')} 高清直播</span><span>${featureIcon('B02_shield_secure_payment.png', '大文件上传')} 大文件上传</span></div>
        </div>
      </div>
      <div class="product-hero-art" aria-hidden="true"><span>${icon(item.icon)}</span><i></i><b></b><em></em></div>
      <div class="product-price">${sku ? price(sku.priceUsdt) : '<span>暂不可购买</span>'}</div>
    </section>
    ${optionPanel(item, true)}
    ${noticePanel(item)}
    <section class="recommend-card">
      <div class="section-header"><div><h2>相关推荐</h2><p>更多优质数字商品推荐</p></div><a href="#/products">查看全部 ›</a></div>
      <div class="recommend-list">
        ${related.map((p) => {
          const relatedSku = findSku(p, defaultOptions(p)) || p.skus[0];
          const spec = relatedSku ? Object.values(relatedSku.optionValues).join(' · ') : '规格待选';
          return `<button class="recommend-item" data-action="openProduct" data-slug="${p.slug}">${icon(p.icon)}<div><h3>${p.name}</h3><p>${spec}</p><strong>${relatedSku.priceUsdt.toFixed(2)} USDT</strong></div></button>`;
        }).join('')}
      </div>
    </section>
    <div class="sticky-checkout-bar">
      <div class="sticky-product">${icon(item.icon)}<div><strong>${item.name}</strong><p>${Object.values(opts).join(' · ')}</p></div></div>
      <div class="sticky-meta">
        <div><span>套餐周期</span><strong>${opts.duration || opts.plan || opts.amount || '已选择'}</strong></div>
        <div><span>支付方式</span><strong>${paymentDisplay()}</strong></div>
        <div><span>应付金额</span><strong>${sku ? sku.priceUsdt.toFixed(2) : '--'} USDT</strong><small>${sku ? `≈ ${money(sku.priceUsdt)}` : '当前组合不可购买'}</small></div>
      </div>
      <div class="sticky-mobile-price"><strong>${sku ? sku.priceUsdt.toFixed(2) : '--'} USDT</strong><small>${sku ? `≈ ${money(sku.priceUsdt)}` : '当前组合不可购买'}</small></div>
      <button class="sticky-pay-button" data-action="paySelected" ${!sku || (sku.stockStatus || sku.stock) === 'sold_out' ? 'disabled' : ''}>${paymentIcon('C03_wallet.png', '钱包')} ${payText}</button>
    </div>
  `, 'page detail-page');
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}

function checkout() {
  const item = product();
  const sku = findSku(item);
  if (!sku) return home();
  if ((sku.stockStatus || sku.stock) === 'sold_out') {
    notify('当前 SKU 已售罄，请重新选择规格');
    return detail(item.slug);
  }
  shell(`
    <section class="checkout-head">
      <h1>购买 ${item.name}</h1>
      <p>安全便捷的虚拟商品交易，为您提供稳定可靠的服务体验</p>
      ${stepper(['选择商品', '选择规格', '填写信息', '确认支付'], 2)}
    </section>
    <section class="checkout-grid">
      <div class="checkout-left">
        <section class="glass panel order-preview">
          <h3>订单商品预览 <button data-action="openProduct" data-slug="${item.slug}">✎ 修改规格</button></h3>
          <div class="preview-row">${icon(item.icon)}<b>${item.name}</b>${Object.entries(selectedOptions(item)).map(([k, v]) => `<span>${v}</span>`).join('')}<span>${deliveryLabel(sku.deliveryType)}</span><span>${stockLabel(sku.stockStatus || sku.stock)}</span></div>
        </section>
        <section class="glass panel">
          <h3>账号绑定</h3>
          <div class="account-binding-note checkout-binding">
            <strong>${featureIcon('B02_shield_secure_payment.png', '订单绑定')} 订单信息自动绑定当前登录账号</strong>
            <p>${state.user ? `当前登录账号：@${state.user.username}` : '请先登录后再创建订单，发货与售后信息会归档到「我的订单」。'}</p>
          </div>
        </section>
        <section class="glass panel">
          <h3>支付信息</h3>
          <div class="network-row">${networks.map((n) => `<button class="${n.code === state.paymentNetwork ? 'active' : ''}" data-action="chooseNetwork" data-code="${n.code}">${paymentIcon(n.code === 'TRON' ? 'C02_tron_trc20.png' : 'C03_wallet.png', n.displayName)} ${n.displayName} (${n.tokenStandard})</button>`).join('')}</div>
          <div class="network-confirm">
            <b>你选择的是 ${networkText(state.paymentNetwork)}</b>
            <span>请确认钱包/交易所转账网络与订单完全一致，不要使用其他链或内部转账网络。</span>
            <span>错链支付、少付、多付、超时付款都将进入异常订单，需要人工处理。</span>
            <label class="agree"><input type="checkbox" id="networkConfirm" /> 我已确认支付网络和金额风险</label>
          </div>
        </section>
        <section class="glass panel confirm-box">
          <h3>支付前确认</h3>
          ${summaryRows(item, sku)}
          <p>虚拟商品开通后通常不支持退款，请确认信息无误后再进行支付。</p>
        </section>
      </div>
      <aside class="glass checkout-summary">
        <h2>订单摘要</h2>
        <div class="summary-product">${icon(item.icon)}<div><b>${item.name}</b><small>${Object.values(selectedOptions(item)).join(' / ')}</small></div><span>× 1</span></div>
        <div class="line"><span>商品单价</span>${price(sku.priceUsdt)}</div>
        <div class="line"><span>参考金额</span><b>${money(sku.priceUsdt)}（仅供参考）</b></div>
        <div class="line total"><span>应付金额</span>${price(sku.priceUsdt)}</div>
        <p class="summary-note">订单创建时锁定 USDT 金额，链上手续费由用户承担。登录后，订单及发货信息将自动保存至「我的订单」。</p>
        <label class="agree"><input type="checkbox" id="agree" /> 我已阅读并同意 <a>购买须知</a> 与 <a>售后规则</a></label>
        <button class="primary" data-action="createOrder">${paymentIcon('C01_usdt.png', 'USDT')} ${state.user ? '确认并支付' : '登录后支付'}</button>
        <p class="secure">订单数据将自动保存至「我的订单」，登录后可随时查看订单状态与发货信息。</p>
      </aside>
    </section>
  `, 'page');
}

function summaryRows(item, sku) {
  const rows = [
    ['商品', item.name],
    ['规格', Object.values(selectedOptions(item)).join(' / ')],
    ['订单归属', state.user ? `当前账号 @${state.user.username}` : '登录后自动绑定'],
    ['支付网络', networkText(state.paymentNetwork)],
    ['应付金额', `${sku.priceUsdt.toFixed(2)} USDT ≈ ${money(sku.priceUsdt)}`]
  ];
  return `<div class="summary-rows">${rows.map(([a, b]) => `<span>${a}</span><b>${b}</b>`).join('')}</div>`;
}

function stepper(items, active) {
  return `<div class="stepper">${items.map((item, i) => `<span class="${i <= active ? 'active' : ''}"><b>${i + 1}</b>${item}</span>`).join('')}</div>`;
}

async function createOrder() {
  syncInputs();
  if (!state.user) {
    openTelegramLoginPanel();
    return notify('请先登录后再支付');
  }
  const agree = document.querySelector('#agree');
  if (agree && !agree.checked) return notify('请先勾选购买须知与售后规则');
  const item = product();
  const sku = findSku(item);
  if (!sku || (sku.stockStatus || sku.stock) === 'sold_out') return notify('当前 SKU 无法购买，请重新选择规格');
  let serverOrder = null;
  const networkConfirm = document.querySelector('#networkConfirm');
  if (networkConfirm && !networkConfirm.checked) return notify('请先确认支付网络风险');
  const accountUsername = state.telegramUsername || `@${state.user.username}`;
  const accountEmail = state.email || `${state.user.username || state.user.id}@telegram.local`;
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productId: item.id,
        skuId: sku.id,
        telegramUsername: accountUsername,
        email: accountEmail,
        paymentNetwork: state.paymentNetwork,
        fiatCurrency: state.fiatCurrency
      })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || '创建订单失败');
    }
    serverOrder = await response.json();
  } catch (error) {
    notify(error instanceof Error ? error.message : '订单创建失败，请稍后重试');
    return;
  }
  const order = await loadServerOrder(serverOrder.orderId);
  if (!order) {
    notify('订单已创建，但无法读取支付信息');
    return;
  }
  location.hash = `#/pay/${order.id}`;
}

function orders() {
  return JSON.parse(localStorage.getItem('gfOrders') || '[]');
}

function saveOrder(order) {
  const list = orders().filter((item) => item.id !== order.id);
  list.unshift(order);
  localStorage.setItem('gfOrders', JSON.stringify(list));
}

function getOrder(id) {
  return orders().find((order) => order.id === id) || (id === 'demo' ? demoOrder() : orders()[0]);
}

function findExactOrder(id) {
  return orders().find((order) => order.id === id) || (id === 'demo' ? demoOrder() : null);
}

function demoOrder() {
  const item = products[0];
  const sku = item.skus[0];
  return {
    id: 'demo',
    orderNo: 'GF20240527000123',
    productId: item.id,
    skuId: sku.id,
    productName: item.name,
    options: sku.optionValues,
    telegramUsername: '@username',
    email: 'name@example.com',
    amountUsdt: sku.priceUsdt,
    fiatCurrency: state.fiatCurrency,
    fiatAmount: money(sku.priceUsdt),
    paymentNetwork: 'TRON',
    paymentAddress: 'TXL8d1e7hVKZy8vY8g9a6n3sJX4mP6u6wJ',
    status: 'pending_payment',
    deliveryType: 'auto',
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + 15 * 60 * 1000,
    events: [{ label: '订单已创建', time: now() }]
  };
}

async function pay(id) {
  const order = (await loadServerOrder(id)) || findExactOrder(id);
  if (!order) return checkout();
  const walletModes = [
    { key: 'browser', label: '浏览器钱包', note: '推荐', icon: paymentIcon('C03_wallet.png', '浏览器钱包', 'wallet-icon') },
    { key: 'mobile', label: '移动钱包', note: 'APP 扫码打开', icon: paymentIcon('C04_qr_code.png', '移动钱包扫码', 'wallet-icon') },
    { key: 'walletconnect', label: 'WalletConnect', note: '通用连接协议', icon: paymentIcon('C06_address.png', 'WalletConnect', 'wallet-icon') },
    { key: 'tronlink', label: 'TronLink', note: '浏览器插件', icon: paymentIcon('C02_tron_trc20.png', 'TronLink', 'wallet-icon') }
  ];
  shell(`
    <section class="pay-head">
      <div><h1>完成支付</h1><p>订单已创建，请在倒计时内完成链上转账，超时将自动取消订单。</p></div>
      ${statusTracker(['订单已创建', '等待付款', '链上确认', '正在发货', '已完成'], order.status)}
    </section>
    <section class="pay-grid">
      <div>
        <section class="glass panel pay-info">
          <h3>订单信息</h3>
          ${[['订单号', order.orderNo + ' ⧉'], ['商品', order.productName + '  ' + Object.values(order.options).join(' / ')], ['支付金额', `${order.amountUsdt.toFixed(2)} USDT ≈ ${order.fiatAmount}`], ['支付网络', networkText(order.paymentNetwork)], ['剩余支付时间', '<strong class="timer" data-expires="' + order.expiresAt + '">14:32</strong> <button class="danger">请尽快完成支付</button>']].map(([a, b]) => `<div class="pay-row"><span>${a}</span><b>${b}</b></div>`).join('')}
        </section>
        <section class="glass panel wallets">
          <h3>打开钱包并转账 <small>系统将尝试自动唤起您选择的钱包</small></h3>
          <div class="wallet-row">${walletModes.map((wallet) => `<button class="${state.walletMode === wallet.key ? 'active' : ''}" data-action="setWalletMode" data-wallet="${wallet.key}"><span>${wallet.icon}</span><b>${wallet.label}</b><small>${wallet.note}</small></button>`).join('')}</div>
          <button class="primary small" data-action="openWallet">${paymentIcon('C03_wallet.png', '钱包')} 重新打开钱包</button>
        </section>
        <section class="glass panel tips"><h3>重要提示</h3><p>${featureIcon('B04_lock_encryption.png', '加密')} 请严格按订单金额支付，必须与订单金额一致，少付或多付将无法到账。</p><p>${featureIcon('B07_warning_triangle.png', '警告')} 请务必使用 ${networkText(order.paymentNetwork)} 网络转账，切勿使用其他链或交易所内部转账。</p><p>${paymentIcon('C10_countdown_timer.png', '倒计时')} 请在倒计时内完成支付，超时未支付订单将自动取消。</p></section>
      </div>
      <div>
        <section class="glass panel qr-panel">
          <h3>请使用 ${networkText(order.paymentNetwork)} 向以下地址转账</h3>
          <div class="qr-wrap"><div class="fake-qr"><span>${paymentIcon('C04_qr_code.png', '二维码')}</span></div><button data-action="copyPaymentInfo">${paymentIcon('C04_qr_code.png', '二维码')} 保存二维码</button></div>
          <div class="copy-box"><label>${paymentIcon('C06_address.png', '收款地址')} 收款地址 <small>安全验证通过</small><input value="${order.paymentAddress}" readonly /></label><button data-copy="${order.paymentAddress}">${paymentIcon('C05_copy.png', '复制')} 复制地址</button></div>
          <div class="copy-box"><label>${paymentIcon('C01_usdt.png', 'USDT')} 支付金额<input value="${order.amountUsdt.toFixed(2)} USDT ≈ ${order.fiatAmount}" readonly /></label><button data-copy="${order.amountUsdt.toFixed(2)}">${paymentIcon('C05_copy.png', '复制')} 复制金额</button></div>
          <div class="copy-box"><label>${paymentIcon('C02_tron_trc20.png', '支付网络')} 支付网络<input value="${networkText(order.paymentNetwork)}" readonly /></label><button data-copy="${networkText(order.paymentNetwork)}">${paymentIcon('C05_copy.png', '复制')} 复制网络</button></div>
          <p>${featureIcon('B07_warning_triangle.png', '注意')} 请确保金额与网络正确，否则可能导致资产丢失且无法找回。</p>
        </section>
        <section class="glass panel pay-cta">
          <p>支付后通常需要 1–3 分钟链上确认，请勿重复支付。若未自动识别，可提交 TxID 进入人工核验。</p>
          <label>交易 Hash / TxID<input id="txHashInput" value="${order.raw?.txHash || ''}" placeholder="粘贴钱包或交易所返回的 TxID" /></label>
          <button class="primary small" data-action="submitTxHash" data-id="${order.id}">${paymentIcon('C06_address.png', 'TxID')} 提交 TxID</button>
          <button class="primary" data-action="markPaid" data-id="${order.id}">${paymentIcon('C08_payment_success.png', '支付成功')} 我已完成支付</button>
        </section>
        <section class="glass panel support"><b>遇到问题？联系客服或前往订单查询</b><a href="#/orders/lookup">订单查询</a></section>
      </div>
    </section>
  `, 'page');
  startTimer();
}

function statusTracker(items, status) {
  const index = { created: 0, pending_payment: 1, payment_confirming: 2, paid: 3, delivering: 3, completed: 4 }[status] || 0;
  return `<div class="status-tracker">${items.map((item, i) => `<span class="${i <= index ? 'active' : ''}"><b>${['✓', '◔', '⌛', '▤', '✓'][i]}</b>${item}</span>`).join('')}</div>`;
}

function startTimer() {
  const el = document.querySelector('.timer');
  if (!el) return;
  const update = () => {
    const left = Math.max(0, Number(el.dataset.expires) - Date.now());
    const m = String(Math.floor(left / 60000)).padStart(2, '0');
    const s = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');
    el.textContent = `${m}:${s}`;
  };
  update();
  clearInterval(window.gfTimer);
  window.gfTimer = setInterval(update, 1000);
}

async function markPaid(id) {
  const order = (await loadServerOrder(id)) || findExactOrder(id);
  if (!order) return notify('订单不存在');
  const isDevOpen = state.config.admin?.authMode === 'dev-open';
  if (isDevOpen) {
    try {
      await fetch(`/api/internal/orders/${order.id}/mark-paid`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ txHash: `mock_tx_${Date.now()}` })
      });
      await fetch(`/api/internal/orders/${order.id}/deliver`, { method: 'POST' });
      const refreshed = (await loadServerOrder(order.id)) || order;
      refreshed.status = 'completed';
      refreshed.paidAt = refreshed.paidAt || new Date().toISOString();
      refreshed.deliveredAt = refreshed.deliveredAt || new Date().toISOString();
      refreshed.events = [
        { label: '订单已创建', time: timeFrom(refreshed.createdAt || new Date().toISOString()) },
        { label: '已收到付款', time: now() },
        { label: '链上确认完成', time: now(24) },
        { label: '正在发货', time: now(30) },
        { label: '已完成', time: now(57) }
      ];
      saveOrder(refreshed);
      notify('链上确认完成，系统已自动发货');
      location.hash = `#/order/${refreshed.id}/success`;
      return;
    } catch {
      notify('演示支付失败，请检查本地服务');
      return;
    }
  }
  const statusResponse = await fetch(`/api/orders/${order.id}/status`);
  if (statusResponse.ok) {
    const status = await statusResponse.json();
    if (status.status === 'completed') {
      location.hash = `#/order/${order.id}/success`;
      return;
    }
  }
  notify('支付已提交，等待链上确认');
}

async function success(id) {
  const order = id === 'demo'
    ? { ...demoOrder(), status: 'completed', paidAt: new Date().toISOString(), deliveredAt: new Date().toISOString(), events: [{ label: '订单已创建', time: '2025-05-20 14:32:21' }, { label: '已收到付款', time: '2025-05-20 14:33:05' }, { label: '链上确认完成', time: '2025-05-20 14:33:29' }, { label: '正在发货', time: '2025-05-20 14:33:35' }, { label: '已完成', time: '2025-05-20 14:34:02' }] }
    : (await loadServerOrder(id)) || findExactOrder(id);
  if (!order) return home();
  const item = products.find((p) => p.id === order.productId) || products[0];
  const events = order.events && order.events.length
    ? order.events
    : [
        { label: '订单已创建', time: timeFrom(order.createdAt) },
        { label: '已收到付款', time: timeFrom(order.paidAt || order.createdAt) },
        { label: '链上确认完成', time: timeFrom(order.paidAt || order.createdAt) },
        { label: '正在发货', time: timeFrom(order.deliveredAt || order.paidAt || order.createdAt) },
        { label: '已完成', time: timeFrom(order.deliveredAt || order.paidAt || order.createdAt) }
      ];
  shell(`
    <section class="success-hero glass">
      <div class="success-orb">${statusIcon('C08_payment_success.png', '支付成功')}</div>
      <div><h1>订单已完成，感谢您的购买！</h1><p>支付成功，订单已顺利完成，商品已发送至您的 Telegram 与邮箱。</p><div class="mini-tags"><span>${featureIcon('B06_check_circle_success.png', '通知已发送')} Telegram 通知已发送</span><span>${featureIcon('B06_check_circle_success.png', '邮件已发送')} 邮件通知已发送</span><span>${featureIcon('B09_auto_delivery.png', '自动发货')} 安全可靠的自动发货系统</span></div></div>
    </section>
    <section class="glass completion">${events.map((e) => `<span><b>${featureIcon('B06_check_circle_success.png', '完成')}</b>${e.label}<small>${e.time}</small></span>`).join('')}</section>
    <section class="success-grid">
      <section class="glass panel">
        <h3>订单信息</h3>
        <div class="summary-product">${icon(item.icon)}<div><b>${order.productName}</b><small>${Object.values(order.options).join(' / ')}</small></div></div>
        ${[['订单号', order.orderNo + ' ⧉'], ['订单金额', `${order.amountUsdt.toFixed(2)} USDT ≈ ${order.fiatAmount}`], ['支付网络', networkText(order.paymentNetwork)], ['支付时间', timeFrom(order.paidAt) + ' (' + order.fiatCurrency + ')'], ['发货方式', order.deliveryType === 'auto' ? '自动发货' : '手动发货']].map(([a, b]) => `<div class="pay-row"><span>${a}</span><b>${b}</b></div>`).join('')}
      </section>
      <section class="glass panel delivery">
        <h3>发货结果 / 交付信息</h3>
        <div class="delivery-ok"><b>发货状态：已发送至 Telegram 与邮箱</b><span>已完成</span></div>
        <div class="pay-row"><span>Telegram</span><b>已发送至 ${order.telegramUsername}</b></div>
        <div class="pay-row"><span>邮箱</span><b>已发送至 ${order.email}</b></div>
        <div class="secret">
          <small>交付内容预览（部分信息已隐藏）</small>
          <p>激活链接：https://discord.com/billing/promo/************** ⧉</p>
          <p>激活码：********-****-****-******** ⧉</p>
          <p>有效期：${order.options.duration || order.options.plan || order.options.amount}</p>
        </div>
        <button class="primary small" data-action="revealSecret">◎ 查看完整交付内容</button>
      </section>
      <section class="glass panel next-actions">
        <h3>后续操作</h3>
        <a href="#/orders/lookup">查看订单详情</a><a href="#/">再次购买</a><a href="#/orders/lookup">前往订单查询</a><a href="#/faq">联系支持</a>
      </section>
    </section>
    <section class="glass bottom-help"><span>关于保质期<br/><b>查看保质期说明 ›</b></span><span>售后咨询<br/><b>提交工单 / 联系支持 ›</b></span><span>常见问题<br/><b>访问 FAQ ›</b></span></section>
  `, 'page');
}

async function orderDetail(id) {
  const order = (await loadServerOrder(id)) || findExactOrder(id);
  if (!order) return lookup();
  const item = products.find((p) => p.id === order.productId) || products[0];
  const canPay = ['created', 'pending_payment', 'payment_confirming'].includes(order.status);
  shell(`
    <section class="pay-head">
      <div><h1>订单详情</h1><p>这里汇总支付状态、发货状态、交付记录和售后入口，便于追踪问题。</p></div>
      ${statusTracker(['已创建', '等待付款', '链上确认', '发货中', '已完成'], order.status)}
    </section>
    <section class="success-grid order-detail-grid">
      <section class="glass panel">
        <h3>订单信息</h3>
        <div class="summary-product">${icon(item.icon)}<div><b>${order.productName}</b><small>${Object.values(order.options).join(' / ')}</small></div></div>
        ${[
          ['订单号', order.orderNo],
          ['订单状态', statusLabel(order.status)],
          ['应付金额', `${order.amountUsdt.toFixed(2)} USDT（${order.fiatAmount} 仅供参考）`],
          ['支付网络', networkText(order.paymentNetwork)],
          ['Telegram', order.telegramUsername],
          ['邮箱', order.email]
        ].map(([a, b]) => `<div class="pay-row"><span>${a}</span><b>${b}</b></div>`).join('')}
        ${canPay ? `<a class="primary small link-button" href="#/pay/${order.id}">继续支付</a>` : ''}
      </section>
      <section class="glass panel">
        <h3>发货与通知</h3>
        <div class="delivery-ok"><b>${order.status === 'completed' ? '发货已完成' : order.status === 'delivering' ? '发货处理中' : '等待付款后发货'}</b><span>${deliveryLabel(order.deliveryType)}</span></div>
        <div class="secret">
          <small>交付内容</small>
          <p>${order.status === 'completed' ? '激活码 / 链接已发送至邮箱与 Telegram（敏感内容已隐藏）' : '付款确认后展示发货进度，自动发货失败会进入人工队列。'}</p>
        </div>
        <div class="structured-detail compact">
          <div><span>通知记录</span><b>订单创建、支付成功、发货成功/失败都会记录发送状态</b></div>
          <div><span>异常处理</span><b>少付、多付、错链、超时付款均可通过 TxID 进入人工核验</b></div>
        </div>
      </section>
      <section class="glass panel support-ticket">
        <h3>售后工单</h3>
        <label>问题类型<select id="ticketType"><option>未收到发货</option><option>卡密无效</option><option>账号无法登录</option><option>少付/多付/错链</option><option>填写信息错误</option></select></label>
        <label>问题描述<textarea id="ticketBody" placeholder="描述问题并补充截图链接、TxID 或账号信息"></textarea></label>
        <button class="primary" data-action="submitTicket" data-id="${order.id}">提交售后</button>
      </section>
    </section>
  `, 'page');
}

async function lookup() {
  const result = state.lookupResult;
  shell(`
    <section class="lookup-page">
      <div class="glass panel lookup-box">
        <h1>订单查询</h1>
        <p>支持订单号 + 邮箱/Telegram，或直接用 TxID 找回支付异常订单。登录后可查看本机已保存订单。</p>
        <label>订单号<input id="lookupOrder" placeholder="GF20240527000123" /></label>
        <label>邮箱 / Telegram 用户名<input id="lookupContact" placeholder="name@example.com 或 @username" /></label>
        <label>TxID / 交易 Hash<input id="lookupTxHash" placeholder="支付后未自动识别时可填写" /></label>
        <button class="primary" data-action="lookupOrder">查询订单</button>
        ${state.user ? `<h3>我的订单</h3><div class="order-list">${orders().map(orderItem).join('') || '<p>暂无订单</p>'}</div>` : ''}
      </div>
      ${result ? `<div class="glass panel lookup-result"><h2>查询结果</h2>${orderItem(result, true)}</div>` : ''}
    </section>
  `, 'page');
}

function orderItem(order, detail = false) {
  return `<a class="order-item" href="#/order/${order.id}"><b>${order.orderNo}</b><span>${order.productName}</span><span>${statusLabel(order.status)}</span><strong>${order.amountUsdt.toFixed(2)} USDT</strong>${detail ? `<small>${Object.values(order.options).join(' / ')} · ${order.telegramUsername} · ${order.email}</small>` : ''}</a>`;
}

function productsPage() {
  shell(`<section class="page-title"><h1>商品列表</h1><p>全量商品分类、搜索与筛选。</p></section>${productBrowser(true)}`, 'page');
}

function account() {
  shell(`<section class="glass panel account"><h1>用户中心</h1><p>${state.user ? `已通过 Telegram 登录：@${state.user.username}` : '请先登录 Telegram。'}</p><button class="primary small" data-action="telegramLogin">Telegram 登录</button><h3>订单</h3><div class="order-list">${orders().map(orderItem).join('') || '暂无订单'}</div></section>`, 'page');
}

function isAdminLocked() {
  return state.config.admin?.authMode === 'token' && !state.adminToken;
}

function adminLoginPanel() {
  return `
    <section class="admin-shell">
      <div class="glass panel admin-login">
        <h1>后台登录</h1>
        <p>生产环境需要管理员密码登录后才能操作后台。</p>
        <label>管理员密码<input id="adminPassword" type="password" placeholder="请输入管理员密码" /></label>
        <button class="primary" data-action="adminLogin">登录后台</button>
      </div>
    </section>
  `;
}

async function adminLogin() {
  const password = document.querySelector('#adminPassword')?.value || '';
  if (!password) return notify('请输入管理员密码');
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return notify(result.error || '登录失败');
  state.adminToken = result.token;
  persist();
  notify('后台登录成功');
  renderAdmin();
}

async function renderAdmin() {
  if (isAdminLocked()) {
    shell(adminLoginPanel(), 'admin-page');
    return;
  }
  await loadAdminData();
  const tab = state.adminTab;
  const activeMeta = adminMenu().find((item) => item.key === tab) || adminMenu()[0];
  shell(`
    <section class="admin-shell">
      <aside class="admin-nav">
        <a class="admin-brand" href="#/admin"><img src="${ASSETS.logo}ichuhai-logo-horizontal-color.png" alt="ichuhai" /><span>运营后台</span></a>
        <nav>${adminMenu().map((item) => `<button class="${tab === item.key ? 'active' : ''}" data-action="adminTab" data-tab="${item.key}" type="button"><span>${item.icon}</span>${item.label}</button>`).join('')}</nav>
      </aside>
      <section class="admin-main">
        <header class="admin-topbar">
          <div><span>ichuhai 运营后台 / ${activeMeta.label}</span><strong>${activeMeta.label}</strong></div>
          <label class="admin-global-search"><input placeholder="全局搜索订单号 / 商品 / 用户" /></label>
          <button class="admin-icon-button" data-action="adminTab" data-tab="notifications" type="button">通知</button>
          <button class="admin-account" type="button">管理员 Eyang</button>
          <button class="admin-logout" data-action="adminLogout" type="button">退出登录</button>
        </header>
        <section class="admin-content">${adminContent(tab)}</section>
      </section>
    </section>
  `, 'admin-page');
}

function adminMenu() {
  return [
    { key: 'dashboard', label: '运营看板', icon: '01' },
    { key: 'products', label: '商品中心', icon: '02' },
    { key: 'inventory', label: '库存中心', icon: '03' },
    { key: 'orders', label: '订单中心', icon: '04' },
    { key: 'payments', label: '支付中心', icon: '05' },
    { key: 'delivery', label: '发货中心', icon: '06' },
    { key: 'support', label: '售后中心', icon: '07' },
    { key: 'users', label: '用户中心', icon: '08' },
    { key: 'content', label: '内容中心', icon: '09' },
    { key: 'marketing', label: '营销中心', icon: '10' },
    { key: 'notifications', label: '通知中心', icon: '11' },
    { key: 'system', label: '系统设置', icon: '12' },
    { key: 'audit', label: '审计日志', icon: '13' }
  ];
}

function adminOps() {
  return state.adminData.ops || {};
}

function adminActionForm(action, fields, button = '保存') {
  return `<form class="admin-form" data-action="adminOps" data-ops="${action}">
    ${fields.map((field) => {
      const [name, label, type = 'text', placeholder = ''] = field;
      if (type === 'textarea') return `<label>${label}<textarea name="${name}" placeholder="${placeholder}"></textarea></label>`;
      if (type === 'checkbox') return `<label class="checkline"><input name="${name}" type="checkbox" /> ${label}</label>`;
      return `<label>${label}<input name="${name}" type="${type}" placeholder="${placeholder}" /></label>`;
    }).join('')}
    <button class="primary small" type="submit">${button}</button>
  </form>`;
}

function adminSkuRows(productList) {
  return productList.flatMap((p) => (p.skus || []).map((sku) => ({ product: p, sku })));
}

function currentAdminSubTab(tab, fallback) {
  return state.adminSubTabs[tab] || fallback;
}

function adminPage(title, description, body, options = {}) {
  const tabs = options.tabs || [];
  return `
    <div class="admin-page-head">
      <div>
        <p>${options.eyebrow || '运营后台'}</p>
        <h1>${title}</h1>
        <span>${description}</span>
      </div>
      <div class="admin-head-actions">${options.actions || ''}</div>
    </div>
    ${tabs.length ? `<div class="admin-tabs">${tabs.map((tab) => `<button class="${tab.active ? 'active' : ''}" data-action="adminSubTab" data-tab="${options.tabKey}" data-subtab="${tab.key}" type="button">${tab.label}</button>`).join('')}</div>` : ''}
    ${body}
  `;
}

function adminToolbar(fields, action = '') {
  return `<div class="admin-toolbar">
    ${fields.map((field) => {
      if (field.type === 'select') return `<label>${field.label}<select><option>${field.value}</option>${(field.options || []).map((item) => `<option>${item}</option>`).join('')}</select></label>`;
      if (field.type === 'button') return `<button class="${field.className || 'secondary'}" ${field.action ? `data-action="${field.action}"` : ''} ${field.tab ? `data-tab="${field.tab}"` : ''} type="button">${field.label}</button>`;
      return `<label>${field.label}<input placeholder="${field.placeholder || ''}" value="${field.value || ''}" /></label>`;
    }).join('')}
    ${action}
  </div>`;
}

function adminStatus(text, tone = 'neutral') {
  return `<span class="status-badge ${tone}">${text}</span>`;
}

function adminTable(columns, rows, empty) {
  return `<div class="admin-data-table" style="--admin-cols:${columns.map((column) => column.width || '1fr').join(' ')}">
    <div class="admin-data-head">${columns.map((column) => `<span>${column.label}</span>`).join('')}</div>
    ${rows.length ? rows.map((cells) => `<div class="admin-data-row">${cells.map((cell) => `<span>${cell}</span>`).join('')}</div>`).join('') : adminEmpty(empty.title, empty.desc)}
  </div>`;
}

function adminEmpty(title, desc, action = '') {
  return `<div class="admin-empty"><b>${title}</b><span>${desc}</span>${action}</div>`;
}

function adminPager(total) {
  return `<div class="admin-pager"><span>共 ${total} 条记录</span><button type="button">上一页</button><button class="active" type="button">1</button><button type="button">下一页</button></div>`;
}

function skuName(sku) {
  return escapeHtml(sku.skuName || Object.values(sku.optionValues || {}).join(' / ') || sku.id);
}

function productStockCount(product) {
  return (product.skus || []).reduce((sum, sku) => sum + Number(sku.stockQuantity ?? (sku.stock === 'sold_out' ? 0 : sku.stock === 'low_stock' ? 2 : 12)), 0);
}

function adminToneFromStatus(status) {
  if (['active', 'paid', 'completed', 'sent', 'matched', 'in_stock', 'enabled'].includes(status)) return 'success';
  if (['pending', 'delivering', 'low_stock', 'manual_confirm', 'in_progress'].includes(status)) return 'warning';
  if (['failed', 'cancelled', 'canceled', 'sold_out', 'error', 'unmatched'].includes(status)) return 'danger';
  return 'neutral';
}

function adminContent(tab) {
  const orderList = adminOrders();
  const productList = adminProducts();
  const networkList = adminNetworks();
  const ops = adminOps();
  const skuRows = adminSkuRows(productList);
  if (tab === 'dashboard') {
    const paid = orderList.filter((o) => ['paid', 'delivering', 'completed'].includes(o.status));
    const revenue = paid.reduce((sum, order) => sum + Number(order.amountUsdt || 0), 0);
    const failedDelivery = orderList.filter((o) => ['failed', 'delivering'].includes(o.status));
    const lowStockRows = productList.flatMap((p) => (p.skus || []).filter((sku) => (sku.stockStatus || sku.stock) === 'low_stock' || Number(sku.stockQuantity || 0) <= Number(sku.warningStock || 5)).map((sku) => ({ product: p, sku })));
    return adminPage('运营看板', '集中处理订单、发货、库存、支付与售后异常。', `
      <div class="metric-grid admin-metrics">${[
        ['今日订单', orderList.length, 'orders'],
        ['今日成交额', `${revenue.toFixed(2)} USDT`, 'orders'],
        ['待发货', orderList.filter((o) => ['paid', 'delivering'].includes(o.status)).length, 'delivery'],
        ['发货失败', failedDelivery.length, 'delivery'],
        ['售后待处理', (state.adminData.supportTickets || []).filter((t) => ['open', 'in_progress'].includes(t.status)).length, 'support'],
        ['库存预警', lowStockRows.length, 'inventory'],
        ['支付异常', (ops.paymentTransactions || []).filter((t) => !['matched', 'manual_confirm'].includes(t.matchStatus)).length, 'payments'],
        ['通知失败', (state.adminData.notifications || []).filter((n) => n.status === 'failed').length, 'notifications']
      ].map(([a, b, key]) => `<button type="button" data-action="adminTab" data-tab="${key}"><span>${a}</span><b>${b}</b></button>`).join('')}</div>
      <section class="admin-section-grid">
        <div class="admin-panel">
          <div class="admin-section-title"><h2>待处理队列</h2><span>最近 5 条需要人工介入的任务</span></div>
          ${adminTable([
            { label: '对象', width: '1.2fr' }, { label: '商品', width: '1.2fr' }, { label: '状态' }, { label: '操作', width: '1.1fr' }
          ], failedDelivery.concat(orderList.filter((o) => o.status === 'paid')).slice(0, 5).map((o) => [
            `<b>${escapeHtml(o.orderNo)}</b>`,
            escapeHtml(o.productName),
            adminStatus(statusLabel(o.status), adminToneFromStatus(o.status)),
            `<button data-action="adminDeliver" data-id="${o.id}" type="button">处理发货</button>`
          ]), { title: '暂无积压任务', desc: '支付异常、发货失败和售后待回复会显示在这里。' })}
        </div>
        <div class="admin-panel">
          <div class="admin-section-title"><h2>库存预警</h2><span>按 SKU 维度追踪补货优先级</span></div>
          ${adminTable([
            { label: '商品 / SKU', width: '1.7fr' }, { label: '当前库存' }, { label: '预警值' }, { label: '发货方式' }, { label: '操作' }
          ], lowStockRows.slice(0, 6).map(({ product, sku }) => [
            `<b>${escapeHtml(product.name)}</b><small>${skuName(sku)}</small>`,
            Number(sku.stockQuantity || 0),
            Number(sku.warningStock || 5),
            deliveryLabel(sku.deliveryType || product.deliveryType),
            `<button data-action="adminTab" data-tab="inventory" type="button">去补货</button>`
          ]), { title: '暂无库存预警', desc: '低于预警值的自动发货 SKU 会显示在这里。' })}
        </div>
      </section>
    `, { eyebrow: '今日工作台' });
  }
  if (tab === 'products') {
    const sub = currentAdminSubTab(tab, 'list');
    const tabs = ['list|商品列表', 'categories|商品分类', 'tags|商品标签', 'skus|SKU 管理', 'edit|商品编辑'].map((item) => { const [key, label] = item.split('|'); return { key, label, active: sub === key }; });
    let body = '';
    if (sub === 'categories') {
      body = `<div class="admin-panel">${adminActionForm('category.create', [['name','分类名称'], ['key','分类 Key'], ['icon','图标','text','tag'], ['sortOrder','排序','number']], '新增分类')}${adminTable([
        { label: '分类名称' }, { label: '分类 Key' }, { label: '图标' }, { label: '是否显示' }, { label: '商品数量' }, { label: '操作' }
      ], (ops.categories || []).map((c) => [escapeHtml(c.name), escapeHtml(c.key), escapeHtml(c.icon), adminStatus(c.visible ? '显示' : '隐藏', c.visible ? 'success' : 'neutral'), productList.filter((p) => (p.category || p.categoryId) === c.name || (p.category || p.categoryId) === c.id).length, '<button type="button">编辑</button>']), { title: '暂无分类', desc: '新增分类后可在商品列表筛选并控制前台展示。' })}</div>`;
    } else if (sub === 'tags') {
      body = `<div class="admin-panel">${adminActionForm('tag.create', [['name','标签名'], ['color','颜色','text','#22c55e'], ['icon','图标','text','zap']], '新增标签')}${adminTable([
        { label: '标签' }, { label: '颜色' }, { label: '图标' }, { label: '状态' }, { label: '操作' }
      ], (ops.tags || []).map((t) => [escapeHtml(t.name), escapeHtml(t.color), escapeHtml(t.icon), adminStatus(t.enabled ? '启用' : '停用', t.enabled ? 'success' : 'neutral'), '<button type="button">编辑</button>']), { title: '暂无标签', desc: '商品标签可用于首页推荐、热销、限时活动等运营场景。' })}</div>`;
    } else if (sub === 'skus') {
      body = `${adminToolbar([{ label: '搜索 SKU', placeholder: 'SKU ID / 商品名 / 规格' }, { label: '商品筛选', type: 'select', value: '全部商品' }, { label: '库存状态', type: 'select', value: '全部状态' }, { label: '发货方式', type: 'select', value: '全部方式' }], '<button class="primary small" type="button">批量改价</button><button class="secondary" type="button">批量上下架</button>')}<div class="admin-panel">${adminTable([
        { label: 'SKU', width: '1.4fr' }, { label: '商品' }, { label: '规格组合' }, { label: '价格' }, { label: '库存' }, { label: '预警值' }, { label: '发货方式' }, { label: '状态' }, { label: '操作' }
      ], skuRows.map(({ product, sku }) => [skuName(sku), escapeHtml(product.name), escapeHtml(Object.values(sku.optionValues || {}).join(' / ') || '-'), `${Number(sku.priceUsdt || 0).toFixed(2)} USDT`, Number(sku.stockQuantity ?? productStockCount(product)), Number(sku.warningStock || 5), deliveryLabel(sku.deliveryType || product.deliveryType), adminStatus(stockLabel(sku.stockStatus || sku.stock), adminToneFromStatus(sku.stockStatus || sku.stock)), '<button type="button">编辑</button>']), { title: '暂无 SKU', desc: '创建商品后在商品编辑页生成 SKU。' })}${adminPager(skuRows.length)}</div>`;
    } else if (sub === 'edit') {
      const product = productList[0] || {};
      body = `<div class="admin-panel">
        <div class="admin-editor-layout">
          <aside>${['基础信息','购买字段','SKU 配置','库存绑定','发货规则','购买须知','展示设置'].map((label, index) => `<button class="${index === 0 ? 'active' : ''}" type="button">${label}</button>`).join('')}</aside>
          <div>
            <h2>${escapeHtml(product.name || '选择商品')}</h2>
            <p>商品编辑页按业务对象拆分配置，不再把所有字段堆在公共页面。购买字段、SKU、库存、发货规则都归属到当前商品。</p>
            ${adminActionForm('purchaseField.create', [['productId','商品 ID','text', product.id || ''], ['fieldKey','字段 Key','text','region'], ['fieldLabel','字段名称','text','地区'], ['fieldType','字段类型','text','radio / select / quantity / text / email / number / textarea / switch'], ['options','选项 JSON','textarea','[{"label":"Global","value":"Global","subtitle":"全球通用"}]'], ['affectsSku','影响 SKU','checkbox']], '保存购买字段')}
          </div>
        </div>
      </div>`;
    } else {
      body = `${adminToolbar([{ label: '搜索商品', placeholder: '商品名称 / SKU' }, { label: '分类筛选', type: 'select', value: '全部分类' }, { label: '状态筛选', type: 'select', value: '全部状态' }, { label: '发货方式', type: 'select', value: '全部方式' }], '<button class="primary small" type="button">新增商品</button>')}<div class="admin-panel">${adminTable([
        { label: '商品', width: '1.5fr' }, { label: '分类' }, { label: '类型' }, { label: 'SKU 数' }, { label: '库存' }, { label: '最低价' }, { label: '状态' }, { label: '前台展示' }, { label: '更新时间' }, { label: '操作', width: '1.4fr' }
      ], productList.map((p) => {
        const minPrice = Math.min(...(p.skus || [{ priceUsdt: 0 }]).map((sku) => Number(sku.priceUsdt || 0)));
        return [`<b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.id)}</small>`, escapeHtml(p.category || p.categoryId || '-'), escapeHtml(p.productType || 'subscription'), (p.skus || []).length, productStockCount(p), `${minPrice.toFixed(2)} USDT`, adminStatus(p.status === 'hidden' ? '已下架' : '已上架', p.status === 'hidden' ? 'neutral' : 'success'), adminStatus(p.status === 'hidden' ? '隐藏' : '展示', p.status === 'hidden' ? 'neutral' : 'success'), timeFrom(p.updatedAt || p.createdAt), `<button data-action="adminSubTab" data-tab="products" data-subtab="edit" type="button">编辑</button><button data-action="adminToggleProduct" data-id="${p.id}" type="button">${p.status === 'hidden' ? '上架' : '下架'}</button>`];
      }), { title: '暂无商品', desc: '创建商品后可配置 SKU、库存、购买字段与前台展示。' })}${adminPager(productList.length)}</div>`;
    }
    return adminPage('商品中心', '管理所有上架商品、SKU、价格与前台展示状态。', body, { tabKey: 'products', tabs, actions: '<button class="primary small" type="button">新增商品</button>' });
  }
  if (tab === 'inventory') {
    const sub = currentAdminSubTab(tab, 'list');
    const tabs = ['list|库存列表', 'import|批量导入', 'batches|导入批次', 'warning|库存预警', 'locks|库存占用记录'].map((item) => { const [key, label] = item.split('|'); return { key, label, active: sub === key }; });
    let body = '';
    if (sub === 'import') {
      body = `<div class="admin-import-flow">${['选择商品和 SKU','选择库存类型','粘贴或上传库存','预览解析结果','确认导入'].map((label, index) => `<span class="${index === 0 ? 'active' : ''}"><b>${index + 1}</b>${label}</span>`).join('')}</div><div class="admin-panel"><div class="admin-section-title"><h2>批量导入库存</h2><span>卡密和账号库存会加密存储，列表默认脱敏展示。</span></div>${adminActionForm('inventory.import', [['skuId','SKU ID','text', skuRows[0]?.sku.id || ''], ['productId','商品 ID','text', skuRows[0]?.product.id || ''], ['type','库存类型','text','card / account / coupon'], ['items','库存内容','textarea','卡密格式：CODE-AAAA-BBBB\\n账号格式：账号----密码----邮箱----邮箱密码----备注']], '预览并导入')}<div class="admin-preview-box"><b>解析预览</b><span>提交前会展示成功、重复、格式错误数量；确认导入后生成批次并写审计日志。</span></div></div>`;
    } else if (sub === 'batches') {
      body = `<div class="admin-panel">${adminTable([{ label: '批次' }, { label: '类型' }, { label: 'SKU' }, { label: '成功' }, { label: '重复' }, { label: '失败' }, { label: '创建时间' }], (ops.inventoryBatches || []).map((b) => [escapeHtml(String(b.id).slice(0, 8)), escapeHtml(b.type), escapeHtml(b.skuId), b.successCount, b.duplicateCount, b.failedCount, timeFrom(b.createdAt)]), { title: '暂无导入批次', desc: '每次确认导入都会生成批次，方便回溯和审计。' })}</div>`;
    } else if (sub === 'warning') {
      const rows = skuRows.filter(({ sku }) => (sku.stockStatus || sku.stock) === 'low_stock' || Number(sku.stockQuantity || 0) <= Number(sku.warningStock || 5));
      body = `<div class="admin-panel">${adminTable([{ label: '商品 / SKU', width: '1.6fr' }, { label: '当前库存' }, { label: '预警值' }, { label: '发货方式' }, { label: '操作' }], rows.map(({ product, sku }) => [`<b>${escapeHtml(product.name)}</b><small>${skuName(sku)}</small>`, Number(sku.stockQuantity || 0), Number(sku.warningStock || 5), deliveryLabel(sku.deliveryType || product.deliveryType), '<button data-action="adminSubTab" data-tab="inventory" data-subtab="import" type="button">去补货</button>']), { title: '暂无库存预警', desc: '低库存 SKU 会在这里形成补货队列。' })}</div>`;
    } else if (sub === 'locks') {
      body = `<div class="admin-panel">${adminTable([{ label: '库存' }, { label: '商品 / SKU' }, { label: '绑定订单' }, { label: '状态' }, { label: '占用时间' }, { label: '操作' }], (ops.inventory || []).filter((i) => i.status === 'locked').map((i) => [escapeHtml(i.maskedValue), `${escapeHtml(i.productName || i.productId || '-')} / ${escapeHtml(i.skuId)}`, escapeHtml(i.orderId || i.boundOrderId || '-'), adminStatus('已锁定', 'warning'), timeFrom(i.updatedAt || i.createdAt), '<button type="button">解锁</button>']), { title: '暂无库存占用', desc: '支付中或待发货订单锁定的库存会显示在这里。' })}</div>`;
    } else {
      body = `${adminToolbar([{ label: '搜索库存', placeholder: '卡密预览 / SKU / 批次' }, { label: '类型', type: 'select', value: '全部类型' }, { label: '状态', type: 'select', value: '全部状态' }], '<button class="primary small" data-action="adminSubTab" data-tab="inventory" data-subtab="import" type="button">批量导入</button>')}<div class="admin-panel">${adminTable([{ label: '库存内容预览', width: '1.5fr' }, { label: '商品' }, { label: 'SKU' }, { label: '类型' }, { label: '状态' }, { label: '绑定订单' }, { label: '导入批次' }, { label: '创建时间' }, { label: '操作' }], (ops.inventory || []).map((i) => [escapeHtml(i.maskedValue || '********'), escapeHtml(i.productName || i.productId || '-'), escapeHtml(i.skuId), escapeHtml(i.type), adminStatus(i.status, adminToneFromStatus(i.status)), escapeHtml(i.orderId || i.boundOrderId || '-'), escapeHtml(i.importBatchId || '手动'), timeFrom(i.createdAt), '<button type="button">查看</button><button type="button">作废</button>']), { title: '暂无库存', desc: '导入卡密或账号后会显示在这里，敏感内容默认脱敏。' })}</div>`;
    }
    return adminPage('库存中心', '管理卡密、账号、导入批次、预警与库存占用。', body, { tabKey: 'inventory', tabs });
  }
  if (tab === 'orders') {
    return adminPage('订单中心', '追踪订单从创建、支付、发货、通知到售后的完整链路。', `${adminToolbar([{ label: '搜索订单', placeholder: '订单号 / 用户 / Telegram' }, { label: '支付状态', type: 'select', value: '全部支付状态' }, { label: '发货状态', type: 'select', value: '全部发货状态' }, { label: '支付网络', type: 'select', value: '全部网络' }, { label: '时间范围', placeholder: '最近 30 天' }])}<div class="admin-tabs static">${['全部订单','待支付','已支付','待发货','已发货','发货失败','异常订单','已取消','售后中'].map((label, index) => `<button class="${index === 0 ? 'active' : ''}" type="button">${label}</button>`).join('')}</div><div class="admin-panel">${adminTable([{ label: '订单号', width: '1.3fr' }, { label: '用户' }, { label: '商品 / SKU', width: '1.5fr' }, { label: '数量' }, { label: '金额' }, { label: '支付状态' }, { label: '发货状态' }, { label: '售后状态' }, { label: '创建时间' }, { label: '操作', width: '1.6fr' }], orderList.map((o) => [`<b>${escapeHtml(o.orderNo)}</b>`, escapeHtml(o.telegramUsername || o.email || '-'), `${escapeHtml(o.productName)}<small>${escapeHtml(Object.values(o.options || {}).join(' / '))}</small>`, o.quantity || 1, `${Number(o.amountUsdt || 0).toFixed(2)} USDT`, adminStatus(statusLabel(o.status), adminToneFromStatus(o.status)), adminStatus(o.deliveryStatus || statusLabel(o.status), adminToneFromStatus(o.deliveryStatus || o.status)), adminStatus(o.ticketStatus || '无售后', 'neutral'), timeFrom(o.createdAt), `<a href="#/order/${o.id}">详情</a><button data-action="adminMarkPaid" data-id="${o.id}" type="button">手动确认</button><button data-action="adminDeliver" data-id="${o.id}" type="button">人工发货</button>`]), { title: '暂无订单', desc: '当用户完成下单后，订单会显示在这里。你可以按订单号、用户、商品、状态快速筛选。' })}${adminPager(orderList.length)}</div><div class="admin-panel admin-detail-skeleton"><h2>订单详情页结构</h2>${['订单状态时间线','用户信息','商品快照','SKU 快照','用户填写信息','支付信息','发货信息','售后记录','通知记录','操作日志','管理员备注'].map((label) => `<span>${label}</span>`).join('')}</div>`);
  }
  if (tab === 'payments') {
    const sub = currentAdminSubTab(tab, 'networks');
    const tabs = ['networks|支付网络', 'addresses|收款地址', 'transactions|到账交易', 'exceptions|支付异常'].map((item) => { const [key, label] = item.split('|'); return { key, label, active: sub === key }; });
    let body = '';
    if (sub === 'addresses') {
      body = `<div class="admin-risk-callout"><b>高风险配置</b><span>修改收款地址会影响所有新订单支付，必须二次确认并写入审计日志。</span></div><div class="admin-panel">${adminTable([{ label: '网络' }, { label: '收款地址', width: '2fr' }, { label: '用途' }, { label: '状态' }, { label: '最近到账' }, { label: '操作人' }, { label: '操作' }], networkList.map((n) => [escapeHtml(n.displayName || n.code), escapeHtml(n.address || '未配置地址'), '订单收款', adminStatus((n.enabled ?? n.isEnabled) ? '启用' : '关闭', (n.enabled ?? n.isEnabled) ? 'success' : 'neutral'), '-', 'admin', '<button type="button">二次确认修改</button><button data-action="adminTab" data-tab="audit" type="button">日志</button>']), { title: '暂无收款地址', desc: '启用支付网络前需要配置收款地址。' })}</div>`;
    } else if (sub === 'transactions') {
      body = `<div class="admin-panel">${adminActionForm('paymentTransaction.create', [['txHash','交易 Hash'], ['network','网络','text','TRON'], ['toAddress','收款地址'], ['amount','到账金额'], ['orderNo','绑定订单号'], ['matchStatus','匹配状态','text','manual_confirm'], ['note','处理备注']], '记录到账交易')}${adminTable([{ label: 'Hash', width: '1.8fr' }, { label: '网络' }, { label: '金额' }, { label: '付款地址' }, { label: '收款地址' }, { label: '匹配订单' }, { label: '状态' }, { label: '检测时间' }, { label: '操作' }], (ops.paymentTransactions || []).map((t) => [`<b>${escapeHtml(t.txHash)}</b>`, escapeHtml(t.network), `${escapeHtml(t.amount)} ${escapeHtml(t.token || 'USDT')}`, escapeHtml(t.fromAddress || '-'), escapeHtml(t.toAddress || '-'), escapeHtml(t.matchedOrderNo || t.orderNo || '未绑定'), adminStatus(t.matchStatus || 'unmatched', adminToneFromStatus(t.matchStatus)), timeFrom(t.detectedAt || t.createdAt), '<button type="button">绑定订单</button>']), { title: '暂无监听交易', desc: '链上监听或手动录入的到账交易会显示在这里。' })}</div>`;
    } else if (sub === 'exceptions') {
      const exceptions = (ops.paymentTransactions || []).filter((t) => !['matched', 'manual_confirm'].includes(t.matchStatus));
      body = `<div class="admin-panel">${adminTable([{ label: '异常类型' }, { label: 'Hash', width: '1.8fr' }, { label: '金额' }, { label: '网络' }, { label: '可能订单' }, { label: '原因' }, { label: '处理状态' }, { label: '操作' }], exceptions.map((t) => [escapeHtml(t.exceptionType || '未匹配'), escapeHtml(t.txHash), `${escapeHtml(t.amount)} USDT`, escapeHtml(t.network), escapeHtml(t.matchedOrderNo || '-'), escapeHtml(t.note || '需要人工核验'), adminStatus(t.matchStatus || '待处理', 'warning'), '<button type="button">人工绑定</button><button type="button">忽略</button>']), { title: '暂无支付异常', desc: '少付、多付、错链、超时、重复 Hash、未匹配交易会显示在这里。' })}</div>`;
    } else {
      body = `<div class="admin-panel">${adminTable([{ label: '网络' }, { label: '协议' }, { label: '代币' }, { label: '合约地址', width: '1.4fr' }, { label: '确认数' }, { label: '状态' }, { label: '推荐' }, { label: '操作', width: '1.5fr' }], networkList.map((n) => [escapeHtml(n.displayName || n.code), escapeHtml(n.tokenStandard || '-'), 'USDT', escapeHtml(n.contractAddress || '-'), n.confirmations || 1, adminStatus((n.enabled ?? n.isEnabled) ? '已启用' : '已关闭', (n.enabled ?? n.isEnabled) ? 'success' : 'neutral'), adminStatus((n.recommended ?? n.isRecommended) ? '推荐' : '普通', (n.recommended ?? n.isRecommended) ? 'success' : 'neutral'), `<button data-action="adminToggleNetwork" data-code="${n.code}" type="button">${(n.enabled ?? n.isEnabled) ? '关闭' : '启用'}</button><button data-action="adminRecommendNetwork" data-code="${n.code}" type="button">设为推荐</button>`]), { title: '暂无支付网络', desc: '配置 TRON、ETH、BSC、BASE 等网络后可用于订单支付。' })}</div>`;
    }
    return adminPage('支付中心', '管理支付网络、收款地址、到账交易和支付异常。', body, { tabKey: 'payments', tabs });
  }
  if (tab === 'delivery') return adminPage('发货中心', '自动发货、人工队列、失败重试与履约日志工作台。', `${adminToolbar([{ label: '搜索订单', placeholder: '订单号 / 商品 / 用户' }, { label: '状态', type: 'select', value: '全部状态' }, { label: '发货方式', type: 'select', value: '全部方式' }])}<div class="admin-panel">${adminTable([{ label: '订单号' }, { label: '商品 / SKU', width: '1.5fr' }, { label: '用户' }, { label: '发货方式' }, { label: '状态' }, { label: '失败原因' }, { label: '重试次数' }, { label: '创建时间' }, { label: '操作', width: '1.5fr' }], orderList.filter((o) => ['paid', 'delivering', 'failed'].includes(o.status)).map((o) => [escapeHtml(o.orderNo), escapeHtml(o.productName), escapeHtml(o.telegramUsername || o.email || '-'), deliveryLabel(o.deliveryType), adminStatus(statusLabel(o.status), adminToneFromStatus(o.status)), escapeHtml(o.failureReason || '-'), o.retryCount || 0, timeFrom(o.createdAt), `<button data-action="adminDeliver" data-id="${o.id}" type="button">立即发货</button><button type="button">转人工</button>`]), { title: '暂无待发货订单', desc: '已支付、发货中、发货失败的订单会进入履约队列。' })}</div><div class="admin-panel">${adminTable([{ label: '商品' }, { label: '发货能力' }, { label: 'SKU 数' }, { label: '库存来源' }, { label: '操作' }], productList.map((p) => [escapeHtml(p.name), deliveryLabel(p.deliveryType), (p.skus || []).length, '卡密库存 / 账号库存 / 人工队列', '<button data-action="adminSubTab" data-tab="inventory" data-subtab="list" type="button">配置库存来源</button><button data-action="adminTab" data-tab="audit" type="button">查看日志</button>']), { title: '暂无发货能力配置', desc: '商品创建后需要绑定库存来源和发货规则。' })}</div>`);
  if (tab === 'support') {
    const tickets = state.adminData.supportTickets.length ? state.adminData.supportTickets : JSON.parse(localStorage.getItem('gfTickets') || '[]');
    return adminPage('售后中心', '处理工单、补发、退款和用户沟通记录。', `${adminToolbar([{ label: '搜索工单', placeholder: '工单号 / 订单号 / 用户' }, { label: '状态', type: 'select', value: '全部状态' }, { label: '优先级', type: 'select', value: '全部优先级' }])}<div class="admin-panel"><div class="mini-tags"><span>请提供截图</span><span>已为您补发</span><span>请等待 1-3 分钟</span><span>发货后不支持退款</span></div>${adminTable([{ label: '工单号' }, { label: '订单号' }, { label: '用户' }, { label: '问题类型' }, { label: '状态' }, { label: '优先级' }, { label: '负责人' }, { label: '创建时间' }, { label: '最后回复' }, { label: '操作', width: '1.4fr' }], tickets.map((t) => [escapeHtml(t.ticketNo || t.id), escapeHtml(t.orderNo || t.orderId || '-'), escapeHtml(t.user || t.telegramUsername || '-'), escapeHtml(t.type || '售后问题'), adminStatus(t.status || '待处理', adminToneFromStatus(t.status)), escapeHtml(t.priority || '普通'), escapeHtml(t.owner || '未分配'), timeFrom(t.createdAt), timeFrom(t.updatedAt || t.createdAt), `<button data-action="adminReplyTicket" data-id="${t.id}" type="button">回复</button><button data-action="adminDeliver" data-id="${t.orderId}" type="button">补发</button>`]), { title: '暂无售后工单', desc: '用户提交售后后会显示在这里，并可关联订单、补发和退款流程。' })}</div>`);
  }
  if (tab === 'notifications') return adminPage('通知中心', '管理 Telegram、邮件、站内通知模板与发送记录。', `<div class="admin-panel">${adminActionForm('template.save', [['type','模板类型','text','stock_warning'], ['title','标题'], ['content','模板内容','textarea','支持 {{orderNo}} {{skuName}} 等变量'], ['enabled','启用','checkbox']], '保存通知模板')}${adminTable([{ label: '模板类型' }, { label: '标题' }, { label: '状态' }, { label: '内容', width: '2fr' }], (ops.notificationTemplates || []).map((n) => [escapeHtml(n.type), escapeHtml(n.title), adminStatus(n.enabled ? '启用' : '停用', n.enabled ? 'success' : 'neutral'), escapeHtml(n.content)]), { title: '暂无通知模板', desc: '库存预警、订单支付、发货成功和售后回复都应配置通知模板。' })}</div><div class="admin-panel">${adminTable([{ label: '类型' }, { label: '渠道' }, { label: '提供方' }, { label: '状态' }, { label: '创建时间' }], state.adminData.notifications.map((n) => [escapeHtml(n.type), escapeHtml(n.channel), escapeHtml(n.provider), adminStatus(n.status, adminToneFromStatus(n.status)), timeFrom(n.createdAt)]), { title: '暂无通知记录', desc: '通知发送成功、失败和重试记录会显示在这里。' })}</div>`);
  if (tab === 'audit') return adminPage('审计日志', '记录高风险操作、配置修改和人工处理行为。', `<div class="admin-panel">${adminToolbar([{ label: '搜索日志', placeholder: '动作 / 对象 / 操作人' }, { label: '操作类型', type: 'select', value: '全部类型' }, { label: '时间范围', placeholder: '最近 30 天' }])}${adminTable([{ label: '动作' }, { label: '操作人' }, { label: '对象' }, { label: '对象 ID' }, { label: '时间' }], state.adminData.auditLogs.map((log) => [escapeHtml(log.action), `${escapeHtml(log.actorRole)}:${escapeHtml(log.actorId)}`, escapeHtml(log.target), escapeHtml(log.targetId), timeFrom(log.createdAt)]), { title: '暂无审计日志', desc: '修改价格、库存明文查看、收款地址、手动确认支付等操作必须留下审计。' })}</div>`);
  if (tab === 'users') return adminPage('用户中心', '聚合用户订单、售后、支付记录、风险备注和黑名单。', `<div class="admin-panel">${adminActionForm('blacklist.create', [['kind','类型','text','telegram_id / wallet / ip / device'], ['value','拉黑值'], ['reason','原因'], ['effect','效果','text','block_order'], ['status','状态','text','active']], '加入黑名单')}${adminTable([{ label: '类型' }, { label: '值' }, { label: '原因' }, { label: '效果' }, { label: '状态' }], (ops.blacklists || []).map((b) => [escapeHtml(b.kind), escapeHtml(b.value), escapeHtml(b.reason), escapeHtml(b.effect || '-'), adminStatus(b.status, adminToneFromStatus(b.status))]), { title: '暂无黑名单', desc: '命中风险规则的用户、钱包、IP 或设备会显示在这里。' })}</div>`);
  if (tab === 'content') return adminPage('内容中心', '管理首页配置、FAQ 和购买须知模板。', `<div class="admin-panel">${adminActionForm('content.save', [['key','配置 Key','text','home'], ['value','JSON 内容','textarea','{"heroTitle":"标题","benefits":["即时发货"]}']], '保存内容')}</div><div class="admin-panel">${adminActionForm('faq.create', [['question','问题'], ['answer','答案','textarea'], ['category','分类','text','支付类'], ['sortOrder','排序','number']], '新增 FAQ')}${adminTable([{ label: '问题' }, { label: '分类' }, { label: '状态' }, { label: '答案', width: '2fr' }], (ops.faqs || []).map((f) => [escapeHtml(f.question), escapeHtml(f.category), adminStatus(f.visible ? '显示' : '隐藏', f.visible ? 'success' : 'neutral'), escapeHtml(f.answer)]), { title: '暂无 FAQ', desc: '支付、发货、售后等常见问题可在这里维护。' })}</div><div class="admin-panel">${adminTable([{ label: '模板' }, { label: '商品类型' }, { label: '状态' }, { label: '内容', width: '2fr' }], (ops.noteTemplates || []).map((n) => [escapeHtml(n.name), escapeHtml(n.productType), adminStatus(n.enabled ? '启用' : '停用', n.enabled ? 'success' : 'neutral'), escapeHtml(n.content)]), { title: '暂无购买须知模板', desc: '不同商品类型的购买须知和售后规则可独立维护。' })}</div>`);
  if (tab === 'marketing') return adminPage('营销中心', '管理优惠码、商品标签、活动和前台推荐资源位。', `<div class="admin-panel">${adminActionForm('coupon.create', [['name','名称'], ['code','优惠码'], ['discountType','类型','text','amount / percent'], ['discountValue','优惠值'], ['minAmount','最低消费'], ['usageLimit','使用次数','number']], '创建优惠码')}${adminTable([{ label: '优惠码' }, { label: '名称' }, { label: '类型' }, { label: '优惠值' }, { label: '状态' }], (ops.coupons || []).map((c) => [escapeHtml(c.code), escapeHtml(c.name), escapeHtml(c.discountType), escapeHtml(c.discountValue), adminStatus(c.status, adminToneFromStatus(c.status))]), { title: '暂无优惠码', desc: '创建优惠码后可用于活动、客服补偿和复购转化。' })}</div>`);
  if (tab === 'system') return adminPage('系统设置', '管理管理员、角色权限、危险操作确认和系统开关。', `<div class="admin-panel">${adminTable([{ label: '账号' }, { label: '邮箱' }, { label: '角色' }, { label: '状态' }], (ops.adminUsers || []).map((u) => [escapeHtml(u.username), escapeHtml(u.email || '-'), escapeHtml(u.role), adminStatus(u.status, adminToneFromStatus(u.status))]), { title: '暂无管理员账号', desc: '生产环境至少需要一个拥有二次确认能力的管理员账号。' })}</div><div class="admin-panel">${adminTable([{ label: '角色' }, { label: '权限', width: '3fr' }, { label: '更新时间' }], (ops.roles || []).map((r) => [escapeHtml(r.role), escapeHtml(Array.isArray(r.permissionsJson) ? r.permissionsJson.join(', ') : r.permissionsJson), timeFrom(r.updatedAt)]), { title: '暂无角色权限', desc: '建议区分运营、客服、财务、超级管理员权限。' })}</div><div class="admin-risk-callout"><b>高风险操作保护</b><span>修改价格、导入或查看库存、修改收款地址、手动确认支付、人工发货、补发、退款与权限变更均需审计日志。</span></div>`);
  return adminContent('dashboard');
}

function faq() {
  const groups = {
    下单类: [
      ['我需要提供哪些信息？', '至少需要 Telegram 用户名和接收邮箱。部分商品还需要账号 ID、区服、Google 邮箱或备注。'],
      ['Telegram 或邮箱填错怎么办？', '未发货前可在订单详情提交售后工单申请修改；已发货后需要人工审核是否可补发。'],
      ['可以修改订单信息吗？', '订单未支付或未发货前可以申请修改，支付后请保留订单号和 TxID。']
    ],
    支付类: [
      ['支持哪些网络？', '当前支持 TRON、ETH、BSC、BASE 等 USDT 网络，实际可用网络以结算页为准。'],
      ['付款后没识别怎么办？', '在支付页或订单详情提交 TxID，系统会进入链上检测或人工核验。'],
      ['少付、多付、超时付款怎么办？', '订单会进入异常处理，少付需补差价，多付可申请退差额或余额，超时付款需人工匹配。'],
      ['转错网络怎么办？', '错链支付可能无法找回，请在付款前二次确认网络。发生后请提交 TxID 等待人工处理。']
    ],
    发货类: [
      ['自动发货多久完成？', '链上确认后通常 1-3 分钟完成。若库存或接口异常，会进入发货失败队列。'],
      ['手动发货多久完成？', '一般 10 分钟内开始处理，复杂订单或高风险订单可能需要 24 小时内完成。'],
      ['发货内容在哪里查看？', '发货结果会发送至邮箱和 Telegram，也可以在订单详情查看状态与隐藏后的交付摘要。']
    ],
    售后类: [
      ['什么情况可以补发？', '保期内卡密无效、账号无法登录、订阅掉单、自动发货失败等情况可申请补发或协助。'],
      ['什么情况不支持退款？', '已发货且信息正确、用户自身网络或账号条件不满足、已使用的虚拟商品通常不支持无理由退款。'],
      ['如何提交售后？', '进入订单详情，选择问题类型并填写描述、截图链接或 TxID。后台客服会按工单处理。']
    ],
    账号类: [
      ['账号可以改密码或换绑吗？', '以商品详情的使用限制为准。共享服务通常不支持改密或换绑。'],
      ['共享账号有什么限制？', '共享账号可能限制设备数、登录地区、登录频率和 IP 环境，请按发货说明使用。']
    ]
  };
  shell(`<section class="glass panel faq"><h1>FAQ</h1>${Object.entries(groups).map(([title, items]) => `<h2>${title}</h2>${items.map(([q, a]) => `<details open><summary>${q}</summary><p>${a}</p></details>`).join('')}`).join('')}</section>`, 'page');
}

function networkText(code) {
  const n = networks.find((item) => item.code === code) || networks[0];
  return `${n.displayName} (${n.tokenStandard})`;
}

function currentPayOrderId() {
  return location.hash.match(/^#\/pay\/([^/]+)/)?.[1] || '';
}

function paymentSummaryText(order) {
  return `订单号：${order.orderNo}\n金额：${order.amountUsdt.toFixed(2)} USDT\n网络：${networkText(order.paymentNetwork)}\n地址：${order.paymentAddress}`;
}

function syncLocalNetwork(local, server) {
  if (!local || !server) return local;
  local.displayName = server.displayName ?? server.display_name ?? local.displayName;
  local.tokenStandard = server.tokenStandard ?? server.token_standard ?? local.tokenStandard;
  local.enabled = server.isEnabled ?? server.is_enabled ?? server.enabled ?? local.enabled;
  local.recommended = server.isRecommended ?? server.is_recommended ?? server.recommended ?? local.recommended;
  local.isEnabled = local.enabled;
  local.isRecommended = local.recommended;
  local.address = server.address ?? local.address;
  local.confirmations = server.confirmations ?? local.confirmations;
  local.warning = server.warningText ?? server.warning_text ?? server.warning ?? local.warning;
  return local;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function parseAdminFormValue(name, value, type) {
  if (type === 'checkbox') return Boolean(value);
  if (['sortOrder', 'minValue', 'maxValue', 'usageLimit', 'perUserLimit', 'confirmations'].includes(name)) return value === '' ? undefined : Number(value);
  if (name === 'options') {
    try { return JSON.parse(value || '[]'); } catch { return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean); }
  }
  if (name === 'value') {
    try { return JSON.parse(value || '{}'); } catch { return { text: value }; }
  }
  if (name === 'items') return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  return value;
}

async function submitAdminOps(form) {
  const payload = { action: form.dataset.ops };
  const data = new FormData(form);
  for (const field of form.querySelectorAll('[name]')) {
    payload[field.name] = parseAdminFormValue(field.name, data.get(field.name) || '', field.type);
  }
  const response = await adminFetch('/api/admin/ops', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return notify(result.error || '后台操作失败');
  state.adminData.ops = result;
  state.adminData.loaded = false;
  notify('后台操作已完成并写入审计');
  return renderAdmin();
}

function hydrateAdminProduct(serverProduct) {
  const local = products.find((item) => item.id === serverProduct.id || item.slug === serverProduct.slug);
  return {
    ...(local || {}),
    ...serverProduct,
    category: local?.category || serverProduct.category || serverProduct.categoryId || '更多',
    skus: Array.isArray(serverProduct.skus) ? serverProduct.skus : (local?.skus || [])
  };
}

function adminProducts() {
  return state.adminData.products.length ? state.adminData.products.map(hydrateAdminProduct) : products;
}

function adminOrders() {
  return state.adminData.orders.length ? state.adminData.orders.map(normalizeServerOrder).filter(Boolean) : orders();
}

function adminNetworks() {
  const source = state.adminData.paymentNetworks.length ? state.adminData.paymentNetworks : networks;
  return source.map((network) => ({ ...network, enabled: network.isEnabled ?? network.enabled, recommended: network.isRecommended ?? network.recommended }));
}

async function loadAdminData(force = false) {
  if (isAdminLocked() || state.adminData.loading || (state.adminData.loaded && !force)) return;
  state.adminData.loading = true;
  try {
    const entries = await Promise.all([
      ['products', '/api/admin/products'],
      ['orders', '/api/admin/orders'],
      ['paymentNetworks', '/api/admin/payment-networks'],
      ['deliveries', '/api/admin/deliveries'],
      ['notifications', '/api/admin/notifications'],
      ['supportTickets', '/api/admin/support-tickets'],
      ['auditLogs', '/api/admin/audit-logs'],
      ['ops', '/api/admin/ops']
    ].map(async ([key, url]) => {
      const response = await adminFetch(url);
      if (!response.ok) return [key, key === 'ops' ? {} : []];
      return [key, await response.json().catch(() => [])];
    }));
    for (const [key, value] of entries) state.adminData[key] = key === 'ops' ? (value || {}) : (Array.isArray(value) ? value : []);
    state.adminData.loaded = true;
    for (const network of state.adminData.paymentNetworks) {
      syncLocalNetwork(networks.find((item) => item.code === network.code), network);
    }
  } catch {
    notify('后台数据拉取失败，已保留本地缓存视图');
  } finally {
    state.adminData.loading = false;
  }
}

function statusLabel(status) {
  return { created: '待付款', pending_payment: '待付款', payment_confirming: '链上确认中', paid: '已付款', delivering: '发货中', completed: '已完成', expired: '已超时', failed: '支付失败', refunding: '退款中', refunded: '已退款' }[status] || status;
}

function timeFrom(iso) {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('zh-CN', { hour12: false });
}

function now(offset = 0) {
  return new Date(Date.now() + offset * 1000).toLocaleString('zh-CN', { hour12: false });
}

function syncInputs() {
  document.querySelectorAll('[data-field="telegram"]').forEach((el) => state.telegramUsername = el.value.trim());
  document.querySelectorAll('[data-field="email"]').forEach((el) => state.email = el.value.trim());
  persist();
}

async function route() {
  const hash = location.hash.replace(/^#/, '') || '/';
  const routes = [
    ['/', () => home()],
    ['/products', () => productsPage()],
    ['/checkout', () => checkout()],
    ['/orders/lookup', () => lookup()],
    ['/account', () => account()],
    ['/admin', () => renderAdmin()],
    ['/faq', () => faq()]
  ];
  const staticRoute = routes.find(([path]) => path === hash);
  if (staticRoute) return staticRoute[1]();
  if (hash.startsWith('/products/')) return detail(hash.split('/').pop());
  if (hash.startsWith('/product/')) return detail(hash.split('/').pop());
  if (hash.startsWith('/pay/')) return pay(hash.split('/').pop());
  if (hash.startsWith('/order/') && hash.endsWith('/success')) return success(hash.split('/')[2]);
  if (hash.startsWith('/order/')) return orderDetail(hash.split('/').pop());
  home();
}

document.addEventListener('input', (event) => {
  if (event.target.matches('[data-field]')) syncInputs();
  if (event.target.matches('[data-action="searchProducts"]')) {
    state.searchQuery = event.target.value;
    return route();
  }
  if (event.target.matches('[data-action="filterDelivery"]')) {
    state.deliveryFilter = event.target.value;
    return route();
  }
  if (event.target.matches('[data-action="sortProducts"]')) {
    state.sortBy = event.target.value;
    return route();
  }
});

document.addEventListener('click', async (event) => {
  const copy = event.target.closest('[data-copy]');
  if (copy) {
    navigator.clipboard?.writeText(copy.dataset.copy);
    return notify('已复制');
  }
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (action === 'toggleCurrency') { state.currencyOpen = !state.currencyOpen; return route(); }
  if (action === 'setCurrency') { state.fiatCurrency = el.dataset.code; state.currencyOpen = false; persist(); return route(); }
  if (action === 'telegramLogin') { openTelegramLoginPanel(); return; }
  if (action === 'telegramDeeplinkReissue') { telegramDeeplinkIssue({ openImmediately: true }); return; }
  if (action === 'openTelegramDeeplink') {
    // <a href="tg://..."> 会尝试调起桌面客户端；浏览器未注册协议时会静默失败。
    // 不阻止默认行为；只确保后台轮询已启动
    if (state.telegramDeeplinkStatus === 'waiting') schedulePoll();
    return;
  }
  if (action === 'mockTelegramLogin') return mockTelegramLogin();
  if (action === 'closeTelegramPanel') {
    if (el.classList.contains('modal-backdrop') && event.target !== el) return;
    closeTelegramLoginPanel();
    return;
  }
  if (action === 'openProduct') { location.hash = `#/product/${el.dataset.slug}`; return; }
  if (action === 'filterCategory') { state.categoryFilter = el.dataset.category; return route(); }
  if (action === 'toggleHomeFaq') { state.homeFaqActive = Number(el.dataset.index || 0); return route(); }
  if (action === 'stockOnly') { state.stockFilter = event.target.checked; return route(); }
  if (action === 'selectProduct') { state.selectedProductId = el.dataset.id; state.selectedOptions[state.selectedProductId] = defaultOptions(product()); persist(); return route(); }
  if (action === 'setOption') { const item = products.find((p) => p.id === el.dataset.product); state.selectedOptions[item.id] = { ...selectedOptions(item), [el.dataset.key]: el.dataset.value }; persist(); return route(); }
  if (action === 'setNoticeTab') { state.noticeTab = el.dataset.tab || 'basic'; persist(); return route(); }
  if (action === 'quickProduct') { state.selectedProductId = event.target.value; state.selectedOptions[state.selectedProductId] = defaultOptions(product()); persist(); return route(); }
  if (action === 'quickSku') { const sku = product().skus.find((s) => s.id === event.target.value); state.selectedOptions[product().id] = sku.optionValues; persist(); return route(); }
  if (action === 'setNetwork' || action === 'chooseNetwork') { state.paymentNetwork = event.target.value || el.dataset.code; persist(); return route(); }
  if (action === 'setWalletMode') { state.walletMode = el.dataset.wallet; persist(); return route(); }
  if (action === 'openWallet') { notify(`请在 ${state.walletMode} 中手动打开钱包并按订单地址转账`); return; }
  if (action === 'copyPaymentInfo') {
    const order = findExactOrder(currentPayOrderId()) || await loadServerOrder(currentPayOrderId());
    if (!order) return notify('未找到支付订单');
    await navigator.clipboard?.writeText(paymentSummaryText(order));
    return notify('支付信息已复制');
  }
  if (action === 'goCheckout') { syncInputs(); location.hash = '#/checkout'; }
  if (action === 'paySelected') return createOrder();
  if (action === 'createOrder') return createOrder();
  if (action === 'markPaid') return markPaid(el.dataset.id);
  if (action === 'submitTicket') {
    const type = document.querySelector('#ticketType')?.value || '售后问题';
    const description = document.querySelector('#ticketBody')?.value.trim();
    if (!description) return notify('请填写问题描述');
    const response = await fetch(`/api/orders/${el.dataset.id}/tickets`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type, description })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return notify(result.error || '售后提交失败');
    const tickets = JSON.parse(localStorage.getItem('gfTickets') || '[]').filter((ticket) => ticket.id !== result.id);
    tickets.unshift(result);
    localStorage.setItem('gfTickets', JSON.stringify(tickets));
    notify(`售后工单已创建：${result.ticketNo}`);
    return orderDetail(el.dataset.id);
  }
  if (action === 'submitTxHash') {
    const txHash = document.querySelector('#txHashInput')?.value.trim();
    if (!txHash || txHash.length < 12) return notify('请填写有效的 TxID');
    const response = await fetch(`/api/orders/${el.dataset.id}/txhash`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ txHash })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return notify(result.error || 'TxID 提交失败');
    const order = normalizeServerOrder(result);
    if (order) saveOrder(order);
    notify('TxID 已提交，订单进入检测/人工核验');
    return pay(el.dataset.id);
  }
  if (action === 'lookupOrder') {
    const orderNo = document.querySelector('#lookupOrder').value.trim();
    const contact = document.querySelector('#lookupContact').value.trim().toLowerCase();
    const txHash = document.querySelector('#lookupTxHash').value.trim();
    const contactVariants = new Set([contact, contact.startsWith('@') ? contact.slice(1) : `@${contact}`].filter(Boolean));
    state.lookupResult = txHash
      ? orders().find((o) => o.raw?.txHash === txHash || o.txHash === txHash)
      : orders().find((o) => o.orderNo === orderNo && [o.email.toLowerCase(), o.telegramUsername.toLowerCase()].some((value) => contactVariants.has(value)));
    if (!state.lookupResult) {
      try {
        const response = await fetch('/api/orders/lookup', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orderNo, contact, txHash })
        });
        if (response.ok) {
          const apiOrder = await response.json();
          state.lookupResult = normalizeServerOrder(apiOrder);
          if (state.lookupResult) saveOrder(state.lookupResult);
        }
      } catch {
        state.lookupResult = null;
      }
    }
    if (!state.lookupResult) notify('未找到匹配订单');
    return lookup();
  }
  if (action === 'adminTab') { state.adminTab = el.dataset.tab; return renderAdmin(); }
  if (action === 'adminSubTab') {
    state.adminTab = el.dataset.tab || state.adminTab;
    state.adminSubTabs[state.adminTab] = el.dataset.subtab;
    return renderAdmin();
  }
  if (action === 'adminLogout') {
    state.adminToken = '';
    localStorage.removeItem('adminToken');
    notify('已退出后台');
    return renderAdmin();
  }
  if (action === 'adminLogin') return adminLogin();
  if (action === 'adminMarkPaid') {
    const response = await adminFetch(`/api/admin/orders/${el.dataset.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'paid' })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return notify(result.error || '更新订单状态失败');
    const order = normalizeServerOrder(result);
    if (order) saveOrder(order);
    state.adminData.orders = state.adminData.orders.map((item) => (item.id === result.id ? result : item));
    notify('已标记为已支付');
    return renderAdmin();
  }
  if (action === 'adminDeliver') {
    const response = await adminFetch(`/api/admin/orders/${el.dataset.id}/manual-deliver`, {
      method: 'POST',
      body: JSON.stringify({ operator: 'admin', maskedContent: 'manual-********' })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return notify(result.error || '手动补发失败');
    const order = normalizeServerOrder(result.order);
    if (order) saveOrder(order);
    if (result.order) state.adminData.orders = state.adminData.orders.map((item) => (item.id === result.order.id ? result.order : item));
    if (result.delivery) state.adminData.deliveries.unshift(result.delivery);
    notify('已写入手动补发记录');
    return renderAdmin();
  }
  if (action === 'adminReplyTicket') {
    const content = prompt('请输入客服回复或内部备注');
    if (!content) return;
    const response = await adminFetch('/api/admin/ops', {
      method: 'POST',
      body: JSON.stringify({ action: 'ticket.reply', ticketId: el.dataset.id, content, status: 'in_progress' })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return notify(result.error || '回复记录失败');
    state.adminData.ops = result;
    notify('售后回复已记录');
    return renderAdmin();
  }
  if (action === 'adminToggleProduct') {
    const item = adminProducts().find((p) => p.id === el.dataset.id);
    const nextStatus = item.status === 'hidden' ? 'active' : 'hidden';
    const response = await adminFetch(`/api/admin/products/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus })
    });
    const updated = await response.json().catch(() => ({}));
    if (!response.ok) return notify(updated.error || '商品更新失败');
    const local = products.find((p) => p.id === item.id);
    if (local) Object.assign(local, updated);
    state.adminData.products = state.adminData.products.map((product) => (product.id === updated.id ? { ...product, ...updated } : product));
    notify(updated.status === 'hidden' ? '商品已下架' : '商品已上架');
    return renderAdmin();
  }
  if (action === 'adminToggleNetwork') {
    const network = networks.find((n) => n.code === el.dataset.code) || state.adminData.paymentNetworks.find((n) => n.code === el.dataset.code);
    const nextEnabled = !network.enabled;
    const response = await adminFetch(`/api/admin/payment-networks/${network.code}`, {
      method: 'PATCH',
      body: JSON.stringify({ isEnabled: nextEnabled })
    });
    const updated = await response.json().catch(() => ({}));
    if (!response.ok) return notify(updated.error || '支付网络更新失败');
    syncLocalNetwork(network, updated);
    state.adminData.paymentNetworks = state.adminData.paymentNetworks.map((item) => (item.code === updated.code ? updated : item));
    notify(network.enabled ? '支付网络已启用' : '支付网络已关闭');
    return renderAdmin();
  }
  if (action === 'adminRecommendNetwork') {
    const response = await adminFetch(`/api/admin/payment-networks/${el.dataset.code}`, {
      method: 'PATCH',
      body: JSON.stringify({ isRecommended: true })
    });
    const updated = await response.json().catch(() => ({}));
    if (!response.ok) return notify(updated.error || '推荐网络更新失败');
    networks.forEach((network) => { network.recommended = network.code === el.dataset.code; network.isRecommended = network.recommended; });
    syncLocalNetwork(networks.find((network) => network.code === el.dataset.code), updated);
    state.adminData.paymentNetworks = state.adminData.paymentNetworks.map((item) => ({ ...item, isRecommended: item.code === updated.code }));
    notify('推荐支付网络已更新');
    return renderAdmin();
  }
  if (action === 'home') { location.hash = '#/'; }
  if (action === 'revealSecret') { document.querySelector('.secret').classList.add('revealed'); notify('完整交付内容已解锁'); }
});

document.addEventListener('submit', async (event) => {
  const form = event.target.closest('[data-action="adminOps"]');
  if (!form) return;
  event.preventDefault();
  return submitAdminOps(form);
});

document.addEventListener('change', (event) => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (action === 'quickProduct') { state.selectedProductId = event.target.value; state.selectedOptions[state.selectedProductId] = defaultOptions(product()); persist(); return route(); }
  if (action === 'quickSku') { const sku = product().skus.find((s) => s.id === event.target.value); state.selectedOptions[product().id] = sku.optionValues; persist(); return route(); }
  if (action === 'setNetwork') { state.paymentNetwork = event.target.value; persist(); return route(); }
});

window.addEventListener('hashchange', route);
await Promise.all([loadConfig(), loadCatalog()]);
await route();
