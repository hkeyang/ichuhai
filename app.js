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

const CATEGORY_ICONS = {
  '全部': 'D01_all.png',
  '社交': 'D02_social.png',
  '音乐': 'D03_music.png',
  '视频': 'D04_video.png',
  '游戏': 'D05_gaming.png',
  '软件': 'D06_software.png',
  '礼品卡': 'D07_gift_card.png',
  '更多': 'D08_more.png'
};

function assetImg(src, alt, className) {
  return `<img class="${className}" src="${src}" alt="${alt}" loading="lazy" />`;
}

function navIcon(file, alt) {
  return assetImg(`${ASSETS.nav}${file}`, alt, 'nav-icon');
}

function featureIcon(file, alt) {
  return assetImg(`${ASSETS.trust}${file}`, alt, 'feature-icon');
}

function paymentIcon(file, alt, className = 'payment-icon') {
  return assetImg(`${ASSETS.payment}${file}`, alt, className);
}

function categoryIcon(label) {
  return assetImg(`${ASSETS.category}${CATEGORY_ICONS[label] || CATEGORY_ICONS['更多']}`, `${label}分类`, 'category-icon');
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
  config: { telegram: { botUsername: '', loginMode: 'mock' }, admin: { authMode: 'dev-open' } },
  telegramPanelOpen: false
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

function normalizeServerOrder(order) {
  if (!order) return null;
  const productSnapshot = order.productSnapshot || products.find((item) => item.id === order.productId) || { name: order.productId };
  const skuSnapshot = order.skuSnapshot || {};
  const options = skuSnapshot.optionValues || {};
  const amountUsdt = Number(order.amountUsdt || skuSnapshot.priceUsdt || 0);
  return {
    id: order.id,
    orderNo: order.orderNo,
    productId: order.productId,
    skuId: order.skuId,
    productName: productSnapshot.name,
    options,
    telegramUsername: order.telegramUsername,
    email: order.email,
    amountUsdt,
    fiatCurrency: order.fiatCurrency || 'USD',
    fiatAmount: money(amountUsdt, order.fiatCurrency || 'USD'),
    paymentNetwork: order.paymentNetwork,
    paymentAddress: order.paymentAddress,
    status: order.status,
    deliveryType: skuSnapshot.deliveryType || order.deliveryType || 'manual',
    createdAt: order.createdAt,
    expiresAt: new Date(order.expiresAt).getTime(),
    paidAt: order.paidAt,
    deliveredAt: order.deliveredAt,
    updatedAt: order.updatedAt,
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

async function loadConfig() {
  try {
    const response = await fetch('/api/config');
    if (response.ok) state.config = { ...state.config, ...(await response.json()) };
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
  state.user = {
    id: result.user.id,
    username: result.user.telegramUsername,
    defaultCurrency: result.user.defaultCurrency
  };
  state.telegramUsername = `@${result.user.telegramUsername}`;
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
  const botUsername = state.config.telegram.botUsername;
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
  return `
    <header class="topbar">
      ${logo()}
      <nav class="nav">
        <a href="#/products">${navIcon('A02_products.png', '商品')} 商品</a>
        <a href="#/faq">${navIcon('A03_faq_help.png', 'FAQ')} FAQ</a>
        <a href="#/orders/lookup">${navIcon('A04_orders_lookup.png', '订单查询')} 订单查询</a>
      </nav>
      <div class="top-actions">
        <button class="pill" data-action="telegramLogin">${navIcon('A07_user_login.png', '登录')}${state.user ? '@' + state.user.username : 'Telegram 登录'}</button>
        <div class="currency">
          <button class="pill" data-action="toggleCurrency">${navIcon('A08_language_currency.png', '语言货币')} ${CURRENCIES[state.fiatCurrency].flag} ${state.fiatCurrency}⌄</button>
          ${state.currencyOpen ? currencyMenu() : ''}
        </div>
        <a class="pill cart" href="#/account">${navIcon('A06_shopping_cart.png', '订单')} 我的订单</a>
      </div>
    </header>
    ${state.telegramPanelOpen ? telegramLoginPanel() : ''}
  `;
}

function telegramLoginPanel() {
  const configured = !!state.config.telegram.botUsername;
  return `
    <div class="modal-backdrop" data-action="closeTelegramPanel">
      <section class="glass telegram-panel" onclick="event.stopPropagation()">
        <button class="modal-close" data-action="closeTelegramPanel">×</button>
        <h2>Telegram 登录</h2>
        <p>${configured ? '请通过 Telegram 官方授权登录。授权成功后，服务端会校验签名并同步您的 Telegram 账号。' : '当前未配置 TELEGRAM_BOT_USERNAME，本地环境使用模拟登录。'}</p>
        ${configured ? '<div id="telegram-widget-host" class="telegram-widget-host"></div>' : '<button class="primary small" data-action="mockTelegramLogin">使用本地模拟登录</button>'}
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
          <span>${item.flag} ${code}</span>${code === state.fiatCurrency ? '<b>✓</b>' : ''}
        </button>
      `).join('')}
    </div>
  `;
}

function shell(content, className = '') {
  app.innerHTML = `${header()}<main class="${className}">${content}</main>`;
}

function home() {
  const item = product();
  const sku = findSku(item);
  shell(`
    <section class="home-grid">
      <div class="home-main">
        <section class="hero">
          <div>
            <h1>全球数字商品，<span>一站式秒发</span></h1>
            <p>谷歌开发者号、苹果开发者号等热门数字商品，一键购买，安全便捷。</p>
            <div class="hero-tags">
              <span>${featureIcon('B01_lightning_instant_delivery.png', '即时发货')} <b>即时发货</b><small>秒级交付</small></span>
              <span>${featureIcon('B02_shield_secure_payment.png', '安全支付')} <b>安全支付</b><small>加密保障</small></span>
              <span>${featureIcon('B03_headset_support.png', '7x24支持')} <b>7×24支持</b><small>全时在线</small></span>
            </div>
          </div>
        </section>
        ${productBrowser()}
        ${optionPanel(item)}
        ${noticePanel(item)}
        ${flowStrip()}
      </div>
      ${quickOrder(item, sku)}
    </section>
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
    <section class="glass panel product-browser">
      <div class="tabs">
        ${categories.map((c) => `<button class="category-tab ${state.categoryFilter === c ? 'active' : ''}" data-action="filterCategory" data-category="${c}">${categoryIcon(c)}${c}</button>`).join('')}
        <label class="search">${navIcon('A09_search.png', '搜索')} <input data-action="searchProducts" value="${state.searchQuery}" placeholder="搜索商品名称" /></label>
      </div>
      ${full ? `<div class="filter-bar">
        <label>发货<select data-action="filterDelivery"><option>全部</option><option ${state.deliveryFilter === '秒发' ? 'selected' : ''}>秒发</option><option ${state.deliveryFilter === '人工' ? 'selected' : ''}>人工</option><option ${state.deliveryFilter === '部分自动' ? 'selected' : ''}>部分自动</option></select></label>
        <label>排序<select data-action="sortProducts"><option>默认</option><option ${state.sortBy === '价格低到高' ? 'selected' : ''}>价格低到高</option></select></label>
        <label class="check-filter"><input type="checkbox" data-action="stockOnly" ${state.stockFilter ? 'checked' : ''}/> 仅看有货</label>
      </div>` : ''}
      <div class="product-row">
        ${visible.length ? visible.map(card).join('') : '<div class="empty-state">暂无匹配商品</div>'}
        ${!full ? '<a class="round-next" href="#/products">›</a>' : ''}
      </div>
    </section>
  `;
}

function card(item) {
  const sku = findSku(item, defaultOptions(item)) || item.skus[0];
  const spec = sku ? Object.values(sku.optionValues).join(' · ') : '规格待选';
  const deliveryClass = item.deliveryType === 'auto' ? 'auto' : item.deliveryType === 'mixed' ? 'mixed' : 'manual';
  const stock = sku.stockStatus || sku.stock;
  return `
    <button class="product-card ${item.id === state.selectedProductId ? 'selected' : ''}" data-action="openProduct" data-slug="${item.slug}">
      ${item.id === state.selectedProductId ? '<span class="check">✓</span>' : ''}
      ${icon(item.icon)}
      <b>${item.name}</b>
      <span class="product-spec">${spec}</span>
      ${price(sku.priceUsdt)}
      <span class="product-badges"><small>${item.category}</small><em class="${deliveryClass}">${deliveryLabel(item.deliveryType)}</em><i class="stock ${stock}">${stockLabel(stock)}</i></span>
    </button>
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

function optionPanel(item) {
  const opts = selectedOptions(item);
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
                return `<button class="${active ? 'active' : ''} ${possible ? '' : 'disabled'}" data-action="setOption" data-product="${item.id}" data-key="${group.key}" data-value="${option}" title="${possible ? '' : '当前组合暂不可购买'}">
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

function optionLabel(value) {
  const flags = { Global: '🌐', US: '🇺🇸', EU: '🇪🇺', JP: '🇯🇵' };
  return `${flags[value] || ''} ${value}`;
}

function noticePanel(item) {
  const sku = findSku(item);
  const profile = productProfile(item, sku);
  return `
    <section class="glass panel notice">
      <h3>商品说明 <span>（${item.name}）</span></h3>
      <div class="notice-summary">
        <span>${featureIcon(item.notice.deliverySummary.includes('手动') ? 'B10_manual_processing.png' : item.notice.deliverySummary.includes('自动') ? 'B09_auto_delivery.png' : 'B01_lightning_instant_delivery.png', '发货方式')} 发货方式：${item.notice.deliverySummary}</span>
        <span>${featureIcon('B08_warranty_guarantee.png', '质保')} 保质期：${item.notice.warrantySummary}</span>
        <span>${featureIcon('B07_warning_triangle.png', '售后规则')} 售后规则：${item.notice.refundSummary}</span>
      </div>
      <div class="structured-detail">
        ${[
          ['商品类型', profile.type],
          ['你将收到', profile.receives],
          ['预计发货', profile.delivery],
          ['有效期', profile.duration],
          ['使用限制', profile.limits],
          ['用户需提供', profile.required],
          ['售后范围', profile.afterSales],
          ['风险提示', profile.risk]
        ].map(([label, value]) => `<div><span>${label}</span><b>${value}</b></div>`).join('')}
      </div>
      ${['usageGuide', 'warrantyDetail', 'attention'].map((key) => `<details><summary>${{ usageGuide: '使用说明', warrantyDetail: '保质期详情', attention: '注意事项' }[key]}</summary><p>${item.notice[key]}</p></details>`).join('')}
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
  state.selectedProductId = item.id;
  const sku = findSku(item);
  persist();
  shell(`
    <div class="breadcrumb">首页 / 商品 / ${item.name}</div>
    <section class="detail-grid">
      <div class="glass product-visual">
        ${icon(item.icon)}
        <div class="thumbs"><button>‹</button><span>${icon(item.icon)}</span><span>${assetImg(`${ASSETS.logo}ichuhai-logo-icon-color.png`, 'ichuhai 图标', 'logo-icon')}</span><span>${featureIcon('B08_warranty_guarantee.png', '质保')}</span><button>›</button></div>
      </div>
      <div class="glass detail-panel">
        <h1>${item.name}</h1>
        <p>${item.short}</p>
        <div class="mini-tags"><span>${featureIcon('B02_shield_secure_payment.png', '安全保障')} ${item.notice.deliverySummary}</span><span>${featureIcon('B06_check_circle_success.png', '库存充足')} 库存充足</span><span>${featureIcon('B03_headset_support.png', '售后咨询')} 支持售后咨询</span></div>
        <div class="detail-price">${sku ? price(sku.priceUsdt) : ''}</div>
        ${optionPanel(item)}
      </div>
      ${quickOrder(item, sku)}
    </section>
    ${noticePanel(item)}
    <section class="glass panel related"><h3>相关推荐</h3><div class="product-row">${products.filter((p) => p.id !== item.id).slice(0, 4).map(card).join('')}</div></section>
  `, 'page');
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
          <h3>联系信息</h3>
          <div class="form-row"><label>Telegram 用户名 *<input data-field="telegram" value="${state.telegramUsername}" placeholder="例如 @username" /></label><label>邮箱 *<input data-field="email" value="${state.email}" placeholder="例如 name@example.com" /></label></div>
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
        <p class="summary-note">订单创建时锁定 USDT 金额，链上手续费由用户承担。</p>
        <label class="agree"><input type="checkbox" id="agree" /> 我已阅读并同意 <a>购买须知</a> 与 <a>售后规则</a></label>
        <button class="primary" data-action="createOrder">${paymentIcon('C01_usdt.png', 'USDT')} 确认并支付</button>
        <p class="secure">支付通知与发货结果将同时发送至 Telegram 与邮箱</p>
      </aside>
    </section>
  `, 'page');
}

function summaryRows(item, sku) {
  const rows = [
    ['商品', item.name],
    ['规格', Object.values(selectedOptions(item)).join(' / ')],
    ['Telegram 用户名', state.telegramUsername || '@username'],
    ['邮箱', state.email || 'name@example.com'],
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
  const validTg = /^@?[a-zA-Z0-9_]{5,32}$/.test(state.telegramUsername);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);
  if (!validTg) return notify('请填写正确的 Telegram 用户名');
  if (!validEmail) return notify('请填写正确的邮箱');
  const agree = document.querySelector('#agree');
  if (agree && !agree.checked) return notify('请先勾选购买须知与售后规则');
  const item = product();
  const sku = findSku(item);
  if (!sku || (sku.stockStatus || sku.stock) === 'sold_out') return notify('当前 SKU 无法购买，请重新选择规格');
  let serverOrder = null;
  const networkConfirm = document.querySelector('#networkConfirm');
  if (networkConfirm && !networkConfirm.checked) return notify('请先确认支付网络风险');
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productId: item.id,
        skuId: sku.id,
        telegramUsername: state.telegramUsername,
        email: state.email,
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

function renderAdmin() {
  if (isAdminLocked()) {
    shell(adminLoginPanel(), 'page');
    return;
  }
  const tab = state.adminTab;
  shell(`
    <section class="admin-shell">
      <aside class="glass admin-nav"><h2>后台管理</h2>${['dashboard|运营看板', 'products|商品与 SKU', 'orders|订单管理', 'payments|支付配置', 'delivery|发货队列', 'support|售后工单'].map((x) => { const [key, label] = x.split('|'); return `<button class="${tab === key ? 'active' : ''}" data-action="adminTab" data-tab="${key}">${label}</button>`; }).join('')}</aside>
      <section class="glass admin-content">${adminContent(tab)}</section>
    </section>
  `, 'page');
}

function adminContent(tab) {
  const orderList = orders();
  if (tab === 'dashboard') {
    const paid = orderList.filter((o) => ['paid', 'delivering', 'completed'].includes(o.status));
    const revenue = paid.reduce((sum, order) => sum + Number(order.amountUsdt || 0), 0);
    const failedDelivery = orderList.filter((o) => ['failed', 'delivering'].includes(o.status));
    const lowStock = products.flatMap((p) => p.skus.filter((sku) => (sku.stockStatus || sku.stock) === 'low_stock').map((sku) => `${p.name} ${Object.values(sku.optionValues).join('/')}`));
    return `<h1>运营看板</h1><div class="metric-grid">${[
      ['今日订单', orderList.length],
      ['成交金额', `${revenue.toFixed(2)} USDT`],
      ['待处理', orderList.filter((o) => ['paid', 'delivering', 'payment_confirming'].includes(o.status)).length],
      ['库存预警', lowStock.length]
    ].map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('')}</div><h2>处理队列</h2><div class="admin-table">${failedDelivery.map((o) => `<div><b>${o.orderNo}</b><span>${o.productName}</span><span>${statusLabel(o.status)}</span><button data-action="adminDeliver" data-id="${o.id}">处理发货</button><a href="#/order/${o.id}">查看</a></div>`).join('') || '暂无积压订单'}</div><h2>库存预警</h2><p class="warning">${lowStock.join('、') || '暂无库存预警'}</p>`;
  }
  if (tab === 'orders') return `<h1>订单管理</h1><div class="admin-table">${orderList.map((o) => `<div><b>${o.orderNo}</b><span>${o.productName}</span><span>${statusLabel(o.status)}</span><button data-action="adminMarkPaid" data-id="${o.id}">手动标记已支付</button><button data-action="adminDeliver" data-id="${o.id}">手动补发</button><a href="#/order/${o.id}">详情</a></div>`).join('') || '暂无订单'}</div>`;
  if (tab === 'payments') return `<h1>支付配置</h1><div class="admin-table">${networks.map((n) => `<div><b>${n.displayName}</b><span>${n.tokenStandard}</span><span>${(n.enabled ?? n.isEnabled) ? '已启用' : '已关闭'} / ${(n.recommended ?? n.isRecommended) ? '推荐' : '普通'}</span><button data-action="adminToggleNetwork" data-code="${n.code}">${(n.enabled ?? n.isEnabled) ? '关闭网络' : '启用网络'}</button><button data-action="adminRecommendNetwork" data-code="${n.code}">设为推荐</button></div>`).join('')}</div><p class="warning">自动监听校验：地址、网络、USDT 合约、到账金额、确认数、订单有效期与交易 Hash 唯一性。</p>`;
  if (tab === 'delivery') return `<h1>发货队列</h1><div class="admin-table">${orderList.filter((o) => ['paid', 'delivering', 'failed'].includes(o.status)).map((o) => `<div><b>${o.orderNo}</b><span>${o.productName}</span><span>${deliveryLabel(o.deliveryType)} / ${statusLabel(o.status)}</span><button data-action="adminDeliver" data-id="${o.id}">补发/完成</button><a href="#/order/${o.id}">发货记录</a></div>`).join('') || '暂无待发货订单'}</div><h2>发货能力</h2><div class="admin-table">${products.map((p) => `<div><b>${p.name}</b><span>${deliveryLabel(p.deliveryType)}</span><span>卡密库存 / Webhook / 人工队列</span><button>配置库存来源</button><button>查看日志</button></div>`).join('')}</div>`;
  if (tab === 'support') return `<h1>售后工单</h1><div class="admin-table">${(JSON.parse(localStorage.getItem('gfTickets') || '[]')).map((t) => `<div><b>${t.ticketNo}</b><span>${t.type}</span><span>${t.status}</span><button>补发</button><button>关闭</button></div>`).join('') || '暂无售后工单'}</div>`;
  return `<h1>商品与 SKU 配置</h1><div class="admin-table">${products.map((p) => `<div><b>${p.name}</b><span>${p.category}</span><span>${p.skus.length} 个 SKU / ${p.status === 'hidden' ? '已隐藏' : '已上架'}</span><button data-action="selectProduct" data-id="${p.id}">编辑规格</button><button data-action="adminToggleProduct" data-id="${p.id}">${p.status === 'hidden' ? '上架' : '下架'}</button></div>`).join('')}</div>`;
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
  local.enabled = server.isEnabled ?? server.enabled ?? local.enabled;
  local.recommended = server.isRecommended ?? server.recommended ?? local.recommended;
  local.isEnabled = local.enabled;
  local.isRecommended = local.recommended;
  local.address = server.address ?? local.address;
  local.confirmations = server.confirmations ?? local.confirmations;
  local.warning = server.warningText ?? server.warning ?? local.warning;
  return local;
}

function statusLabel(status) {
  return { created: '待付款', pending_payment: '待付款', payment_confirming: '链上确认中', paid: '已付款', delivering: '发货中', completed: '已完成', expired: '已超时', failed: '支付失败', refunding: '退款中', refunded: '已退款' }[status] || status;
}

function timeFrom(iso) {
  return new Date(iso).toLocaleString('zh-CN', { hour12: false });
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
    ['/manage-x0509y', () => renderAdmin()],
    ['/faq', () => faq()]
  ];
  const staticRoute = routes.find(([path]) => path === hash);
  if (staticRoute) return staticRoute[1]();
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
  if (action === 'telegramLogin') { state.telegramPanelOpen = true; route(); return renderTelegramWidget(); }
  if (action === 'mockTelegramLogin') return mockTelegramLogin();
  if (action === 'closeTelegramPanel') { state.telegramPanelOpen = false; return route(); }
  if (action === 'openProduct') { location.hash = `#/product/${el.dataset.slug}`; return; }
  if (action === 'filterCategory') { state.categoryFilter = el.dataset.category; return route(); }
  if (action === 'stockOnly') { state.stockFilter = event.target.checked; return route(); }
  if (action === 'selectProduct') { state.selectedProductId = el.dataset.id; state.selectedOptions[state.selectedProductId] = defaultOptions(product()); persist(); return route(); }
  if (action === 'setOption') { const item = products.find((p) => p.id === el.dataset.product); state.selectedOptions[item.id] = { ...selectedOptions(item), [el.dataset.key]: el.dataset.value }; persist(); return route(); }
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
    notify('已写入手动补发记录');
    return renderAdmin();
  }
  if (action === 'adminToggleProduct') {
    const item = products.find((p) => p.id === el.dataset.id);
    const nextStatus = item.status === 'hidden' ? 'active' : 'hidden';
    const response = await adminFetch(`/api/admin/products/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus })
    });
    const updated = await response.json().catch(() => ({}));
    if (!response.ok) return notify(updated.error || '商品更新失败');
    Object.assign(item, updated);
    notify(item.status === 'hidden' ? '商品已下架' : '商品已上架');
    return renderAdmin();
  }
  if (action === 'adminToggleNetwork') {
    const network = networks.find((n) => n.code === el.dataset.code);
    const nextEnabled = !network.enabled;
    const response = await adminFetch(`/api/admin/payment-networks/${network.code}`, {
      method: 'PATCH',
      body: JSON.stringify({ isEnabled: nextEnabled })
    });
    const updated = await response.json().catch(() => ({}));
    if (!response.ok) return notify(updated.error || '支付网络更新失败');
    syncLocalNetwork(network, updated);
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
    notify('推荐支付网络已更新');
    return renderAdmin();
  }
  if (action === 'home') { location.hash = '#/'; }
  if (action === 'revealSecret') { document.querySelector('.secret').classList.add('revealed'); notify('完整交付内容已解锁'); }
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
