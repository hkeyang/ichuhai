import qrcode from '/vendor/qrcode.mjs';

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

const PRODUCT_PRICE_CURRENCY = 'USD';
const PRODUCT_PRICE_LABEL = 'USD';
const ACTIVE_PAYMENT_METHODS = ['balance', 'usdt_trc20', 'alipay'];
const CORE_RECOMMENDED_PRODUCTS = new Set(['discord-nitro', 'spotify-premium']);

const networks = [
  { code: 'TRON', displayName: 'TRON', tokenStandard: 'TRC20', icon: '🔻', recommended: true, enabled: true, warning: '仅支持 USDT TRC20，请勿使用其他链转账。' }
];

const ASSETS = {
  logo: '/assets/brand/logo/',
  nav: '/assets/icons/brand-navigation/',
  trust: '/assets/icons/trust-selling-points/',
  payment: '/assets/icons/payment-crypto/',
  category: '/assets/icons/category/',
  product: '/assets/icons/product/'
};

const SUPPORT_TELEGRAM_URL = 'https://t.me/ichuhaikefu';
const SUPPORT_TELEGRAM_HANDLE = '@ichuhaikefu';
const PASSWORD_RULE_RE = /^(?=.{6,}$)(?=.*[A-Za-z])(?=.*\d).+$/;
const DEFAULT_SUPPORT_CHANNEL = {
  title: '客服频道',
  description: '保留订单号、支付截图或收货信息，客服频道可以更快帮你核对。',
  label: SUPPORT_TELEGRAM_HANDLE,
  url: SUPPORT_TELEGRAM_URL
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
  truck: '<path d="M10 17h4V5H2v12h2"/><path d="M14 9h4l3 3v5h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M8 9h2"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  social: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  video: '<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z"/>',
  game: '<line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="6"/>',
  software: '<rect width="18" height="12" x="3" y="4" rx="2"/><path d="M8 20h8"/><path d="M12 16v4"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13"/><path d="M3 12h18"/><path d="M7.5 8a2.5 2.5 0 1 1 2.5-2.5V8"/><path d="M14 8V5.5A2.5 2.5 0 1 1 16.5 8"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  package: '<path d="m7.5 4.3 9 5.2"/><path d="m7.5 19.7 9-5.2"/><path d="M3.3 7.1 12 2l8.7 5.1v9.8L12 22l-8.7-5.1z"/><path d="M12 12v10"/><path d="m3.3 7.1 8.7 5 8.7-5"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.1 2.1h2l2.7 12.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L21 7H5.1"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/><path d="M6 15h3"/>',
  wallet: '<path d="M18 7V6a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h14a2 2 0 0 1 2 2v5a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7"/><path d="M16 14h.01"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/>',
  lightning: '<path d="m13 2-10 12h9l-1 8 10-12h-9z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  qr: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M16 16h.01"/><path d="M21 16h.01"/><path d="M16 21h.01"/><path d="M21 21h.01"/><path d="M18.5 18.5h.01"/>',
  warning: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  refund: '<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v6h-6"/>',
  headset: '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M21 14v3a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2Z"/><path d="M3 14v3a2 2 0 0 0 2 2h2v-7H5a2 2 0 0 0-2 2Z"/><path d="M13 21h3a3 3 0 0 0 3-3"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.6 8.8a1.4 1.4 0 0 1-.8 0C7.5 20.5 4 18 4 13V5.5a1.2 1.2 0 0 1 .7-1.1l6.8-2.9a1.2 1.2 0 0 1 1 0l6.8 2.9a1.2 1.2 0 0 1 .7 1.1z"/><path d="m9 12 2 2 4-4"/>',
  bell: '<path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/><path d="M18 8A6 6 0 0 0 6 8c0 7-3 7-3 9h18c0-2-3-2-3-9"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  telegram: '<path d="M22 3 2 10.5l6 2.2L18 6l-7.5 8.3.3 5.2 3-3.2 4.5 3.3z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M9.88 9.88a3 3 0 0 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>'
};

const NAV_ICON_KEYS = {
  'A02_products.png': 'package',
  'A04_orders_lookup.png': 'receipt',
  'A06_shopping_cart.png': 'cart',
  'A07_user_login.png': 'user',
  'A09_search.png': 'search',
  'A10_shaixuan.png': 'chevron',
  'A11_huilvxuanzhong.png': 'check'
};

const FEATURE_ICON_KEYS = {
  'B01_lightning_instant_delivery.png': 'lightning',
  'B02_shield_secure_payment.png': 'shield-check',
  'B03_headset_support.png': 'headset',
  'B04_lock_encryption.png': 'lock',
  'B05_clock_time.png': 'clock',
  'B06_check_circle_success.png': 'check-circle',
  'B07_warning_triangle.png': 'warning',
  'B08_warranty_guarantee.png': 'shield-check',
  'B09_auto_delivery.png': 'package',
  'B10_manual_processing.png': 'user'
};

const PAYMENT_ICON_KEYS = {
  'C01_usdt.png': 'wallet',
  'C02_tron_trc20.png': 'shield-check',
  'C03_wallet.png': 'wallet',
  'C04_qr_code.png': 'qr',
  'C05_copy.png': 'copy',
  'C06_address.png': 'receipt',
  'C07_blockchain_confirmations.png': 'check-circle',
  'C08_payment_success.png': 'check-circle',
  'C09_payment_failed.png': 'warning',
  'C10_countdown_timer.png': 'clock'
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
  { icon: 'B02_shield_secure_payment.png', title: '1 选商品', desc: '选择套餐', source: 'trust' },
  { icon: 'A07_user_login.png', title: '2 登录账号', desc: '邮箱登录', source: 'nav' },
  { icon: 'C08_payment_success.png', title: '3 去支付', desc: '余额 / USDT / 支付宝', source: 'payment' },
  { icon: 'B01_lightning_instant_delivery.png', title: '4 收权益', desc: '自动发货', source: 'trust' }
];

const HOME_FAQS = [
  {
    icon: 'user',
    question: '购买需要登录吗？',
    answer: '需要。使用邮箱账号登录后，订单、余额、发货内容和售后工单会归档到同一个账户。'
  },
  {
    icon: 'card',
    question: '支持哪些支付方式？',
    answer: '支持余额支付、USDT TRC20 和支付宝。'
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
    answer: '您可以通过帮助中心联系在线客服，我们 7×24 小时为您提供专业帮助。'
  }
];

function assetImg(src, alt, className) {
  return `<img class="${className}" src="${src}" alt="${alt}" loading="lazy" />`;
}

function navIcon(file, alt, className = 'nav-icon') {
  const key = NAV_ICON_KEYS[file];
  return key ? lineIcon(key, alt, className) : assetImg(`${ASSETS.nav}${file}`, alt, className);
}

function featureIcon(file, alt) {
  const key = FEATURE_ICON_KEYS[file];
  return key ? lineIcon(key, alt, 'feature-icon') : assetImg(`${ASSETS.trust}${file}`, alt, 'feature-icon');
}

function paymentIcon(file, alt, className = 'payment-icon') {
  const key = PAYMENT_ICON_KEYS[file];
  return key ? lineIcon(key, alt, className) : assetImg(`${ASSETS.payment}${file}`, alt, className);
}

function lineIcon(name, alt, className) {
  const aria = alt ? `aria-label="${escapeHtml(alt)}" role="img"` : 'aria-hidden="true"';
  return `<svg class="${className}" viewBox="0 0 24 24" ${aria} fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${LINE_ICONS[name] || LINE_ICONS.more}</svg>`;
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
    featureTags: ['自定义表情', '高清直播', '大文件上传'],
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
    featureTags: ['无广告畅听', '离线下载', '高品质音频'],
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
    featureTags: ['免广告观看', '后台播放', 'YouTube Music'],
    deliveryType: 'mixed',
    optionGroups: [{ key: 'region', name: '地区', displayType: 'chips', options: ['Global', 'US', 'EU'] }, { key: 'duration', name: '套餐周期', displayType: 'cards', options: ['1个月', '12个月'] }],
    skus: [
      { id: 'yt-g-1', optionValues: { region: 'Global', duration: '1个月' }, priceUsdt: 2.5, stock: 'in_stock', deliveryType: 'auto' },
      { id: 'yt-us-12', optionValues: { region: 'US', duration: '12个月' }, priceUsdt: 24, stock: 'in_stock', deliveryType: 'manual' }
    ],
    notice: { deliverySummary: '部分自动发货', warrantySummary: '30天', refundSummary: '开通后不支持退款', usageGuide: '请填写可接收邀请的邮箱。', warrantyDetail: '如邀请失效可联系客服补发。', attention: '跨区账号可能需要额外验证。', faq: ['是否包含 Music？', '可以用于家庭成员吗？'] }
  },
  {
    id: 'steam-wallet',
    slug: 'steam-wallet',
    name: 'Steam Wallet',
    category: '游戏',
    status: 'active',
    icon: 'steam',
    short: 'Steam 钱包充值码与余额补充，适合游戏购买。',
    featureTags: ['充值码交付', '区服提示', '售后协助'],
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
    featureTags: ['办公套件', '云端协作', '订阅权益'],
    deliveryType: 'auto',
    optionGroups: [{ key: 'plan', name: '套餐', displayType: 'cards', options: ['个人版', '家庭版'] }],
    skus: [
      { id: 'ms-personal', optionValues: { plan: '个人版' }, priceUsdt: 3.5, stock: 'in_stock', deliveryType: 'auto' },
      { id: 'ms-family', optionValues: { plan: '家庭版' }, priceUsdt: 8.8, stock: 'in_stock', deliveryType: 'auto' }
    ],
    notice: { deliverySummary: '自动发货', warrantySummary: '30天', refundSummary: '激活后不支持退款', usageGuide: '按邮件中的步骤完成激活。', warrantyDetail: '激活失败可联系售后处理。', attention: '请勿频繁切换绑定邮箱。', faq: ['是否支持 Mac？', '包含 OneDrive 吗？'] }
  },
  {
    id: 'telegram-premium',
    slug: 'telegram-premium',
    name: 'Telegram Premium',
    category: '社交',
    status: 'active',
    icon: 'telegram',
    short: 'Telegram 高级会员权益，支持更大上传、专属表情和高速下载。',
    featureTags: ['高速下载', '专属表情', '大文件上传'],
    deliveryType: 'auto',
    optionGroups: [{ key: 'duration', name: '套餐周期', displayType: 'cards', options: ['1个月', '3个月', '12个月'] }],
    skus: [
      { id: 'tg-1', optionValues: { duration: '1个月' }, priceUsdt: 3.2, stock: 'in_stock', deliveryType: 'auto' },
      { id: 'tg-3', optionValues: { duration: '3个月' }, priceUsdt: 9, stock: 'in_stock', deliveryType: 'auto' },
      { id: 'tg-12', optionValues: { duration: '12个月' }, priceUsdt: 32, stock: 'low_stock', deliveryType: 'auto' }
    ],
    notice: { deliverySummary: '自动发货', warrantySummary: '30天', refundSummary: '开通后不支持退款', usageGuide: '请填写可接收开通信息的 Telegram 账号。', warrantyDetail: '权益以平台实际开通时间为准。', attention: '账号地区和风控状态可能影响开通。', faq: ['多久到账？', '需要提供手机号吗？'] }
  },
  {
    id: 'netflix',
    slug: 'netflix',
    name: 'Netflix',
    category: '视频',
    status: 'active',
    icon: 'netflix',
    short: 'Netflix 会员订阅服务，适合影视剧集和多设备观看。',
    featureTags: ['高清观看', '多设备', '订阅权益'],
    deliveryType: 'manual',
    optionGroups: [{ key: 'duration', name: '套餐周期', displayType: 'cards', options: ['1个月', '3个月'] }],
    skus: [
      { id: 'nf-1', optionValues: { duration: '1个月' }, priceUsdt: 4.8, stock: 'in_stock', deliveryType: 'manual' },
      { id: 'nf-3', optionValues: { duration: '3个月' }, priceUsdt: 13.5, stock: 'in_stock', deliveryType: 'manual' }
    ],
    notice: { deliverySummary: '人工处理', warrantySummary: '30天', refundSummary: '开通后不支持退款', usageGuide: '下单后客服会按订单信息完成开通。', warrantyDetail: '保期内异常可协助排查。', attention: '请遵守账号使用规则，避免频繁切换地区。', faq: ['是否支持独享？', '能否更换设备？'] }
  },
  {
    id: 'apple-gift-card',
    slug: 'apple-gift-card',
    name: 'Apple Gift Card',
    category: '礼品卡',
    status: 'active',
    icon: 'apple',
    short: 'Apple 礼品卡兑换码，适合 App Store 与数字内容消费。',
    featureTags: ['兑换码', '区服提示', '快速交付'],
    deliveryType: 'auto',
    optionGroups: [{ key: 'amount', name: '面额', displayType: 'cards', options: ['10 USD', '25 USD', '50 USD'] }],
    skus: [
      { id: 'agc-10', optionValues: { amount: '10 USD' }, priceUsdt: 10, stock: 'in_stock', deliveryType: 'auto' },
      { id: 'agc-25', optionValues: { amount: '25 USD' }, priceUsdt: 25, stock: 'in_stock', deliveryType: 'auto' },
      { id: 'agc-50', optionValues: { amount: '50 USD' }, priceUsdt: 50, stock: 'low_stock', deliveryType: 'auto' }
    ],
    notice: { deliverySummary: '自动发货', warrantySummary: '7天', refundSummary: '卡密发出后不支持退款', usageGuide: '兑换前请确认 Apple ID 地区与卡密地区一致。', warrantyDetail: '未兑换卡密 7 天内可协助排查。', attention: '地区错误可能无法兑换。', faq: ['支持哪些地区？', '兑换失败怎么办？'] }
  }
];

const state = {
  selectedProductId: localStorage.getItem('selectedProductId') || 'discord-nitro',
  selectedOptions: JSON.parse(localStorage.getItem('selectedOptions') || '{}'),
  cart: JSON.parse(localStorage.getItem('gfCart') || '[]'),
  fiatCurrency: CURRENCIES[localStorage.getItem('preferredCurrency')] ? localStorage.getItem('preferredCurrency') : 'USD',
  paymentNetwork: localStorage.getItem('paymentNetwork') || 'TRON',
  paymentMethod: ACTIVE_PAYMENT_METHODS.includes(localStorage.getItem('paymentMethod')) ? localStorage.getItem('paymentMethod') : 'usdt_trc20',
  useBalance: JSON.parse(localStorage.getItem('useBalance') || 'true'),
  telegramUsername: localStorage.getItem('telegramUsername') || '',
  email: localStorage.getItem('email') || '',
  user: JSON.parse(localStorage.getItem('gfUser') || 'null'),
  authMode: 'login',
  loginPasswordVisible: false,
  loginAgree: true,
  loginRemember: false,
  loginCaptcha: null,
  loginReturnTo: '/account',
  loginStep: 'form',          // form | verify | reset
  loginVerifyEmail: '',       // 待验证邮箱
  loginVerifyCode: '',        // 验证码输入暂存
  loginResendAt: 0,           // 下次可重发时间戳
  loginBusy: false,           // 请求中，防重复提交
  messageCenterOpen: false,
  accountSection: localStorage.getItem('accountSection') || 'orders',
  profile: JSON.parse(localStorage.getItem('gfProfile') || '{"nickname":""}'),
  wallet: JSON.parse(localStorage.getItem('gfWallet') || '{"balance":128.6,"ledger":[]}'),
  rechargeDraft: { amount: '20', method: 'alipay' },
  messages: JSON.parse(localStorage.getItem('gfMessages') || '[]'),
  adminToken: localStorage.getItem('adminToken') || '',
  adminUsername: localStorage.getItem('adminUsername') || 'bitbernie',
  currencyOpen: false,
  categoryFilter: '全部',
  searchQuery: '',
  deliveryFilter: '全部',
  stockFilter: false,
  sortBy: '默认排序',
  walletMode: localStorage.getItem('walletMode') || 'browser',
  lookupResult: null,
  accountOrderFilter: 'all',
  accountOrderSearch: '',
  accountOrderStatus: '',
  accountOrderSort: 'newest',
  accountOrderDateFrom: '',
  accountOrderDateTo: '',
  accountSupportTicket: '',
  accountOrders: { loadedFor: '', loading: false, error: '', items: [] },
  accountPrefs: JSON.parse(localStorage.getItem('accountPrefs') || '{"email":true,"site":true,"payment":true,"delivery":true,"support":true,"wallet":true}'),
  adminTab: localStorage.getItem('adminTab') || 'dashboard',
  adminSubTabs: JSON.parse(localStorage.getItem('adminSubTabs') || '{}'),
  adminFilters: JSON.parse(localStorage.getItem('adminFilters') || '{}'),
  adminImportPreview: null,
  adminData: { loaded: false, loading: false, error: '', products: [], orders: [], paymentNetworks: [], deliveries: [], notifications: [], supportTickets: [], auditLogs: [], ops: {} },
  adminDashboard: { loaded: false, loading: false, error: '', metrics: null, queues: null },
  adminPages: {
    orders: { items: [], total: 0, page: 1, pageSize: 20, loading: false, error: '', loaded: false },
    inventory: { items: [], total: 0, page: 1, pageSize: 20, loading: false, error: '', loaded: false },
    transactions: { items: [], total: 0, page: 1, pageSize: 20, loading: false, error: '', loaded: false },
    users: { items: [], total: 0, page: 1, pageSize: 20, loading: false, error: '', loaded: false }
  },
  adminDetail: { kind: '', id: '', loading: false, error: '', data: null },
  adminModal: null,
  adminProductEditId: '',
  adminOrderTab: 'all',
  config: { telegram: { botUsername: '', loginMode: 'mock' }, admin: { authMode: 'dev-open' }, payments: { provider: 'direct', nowpayments: { enabled: false, payCurrencies: {} } }, support: DEFAULT_SUPPORT_CHANNEL },
  telegramPanelOpen: false,
  accountMenuOpen: false,
  telegramDeeplink: null,       // { token, deeplink, deeplinkNative, expiresAt, startedAt, returnTo }
  telegramDeeplinkStatus: 'idle', // idle | issuing | waiting | error | completed
  telegramDeeplinkError: '',
  telegramReturnTo: localStorage.getItem('telegramReturnTo') || '#/account',
  noticeTab: 'basic',
  homeFaqActive: 0,
  detailImageIndex: 0,
  purchaseQuantity: Number(localStorage.getItem('purchaseQuantity') || 1)
};

const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
let productSearchTimer = null;
let adminFilterTimer = null;

function money(usdt, currency = state.fiatCurrency) {
  const c = CURRENCIES[currency] || CURRENCIES.CNY;
  const code = CURRENCIES[currency] ? currency : 'CNY';
  const amount = Number(usdt) * c.rate;
  const value = code === 'JPY' || code === 'KRW' ? Math.round(amount).toLocaleString() : amount.toFixed(1);
  return `${c.symbol}${value}`;
}

function price(usdt) {
  return `<span class="price-main">${Number(usdt).toFixed(2)} ${PRODUCT_PRICE_LABEL}</span><span class="price-fiat">≈ ${money(usdt)}</span>`;
}

function priceFrom(usdt, hasMultiple = false) {
  const suffix = hasMultiple ? ' 起' : '';
  return `<span class="price-main">${Number(usdt).toFixed(2)} ${PRODUCT_PRICE_LABEL}${suffix}</span><span class="price-fiat">≈ ${money(usdt)}</span>`;
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

function productShort(item) {
  return item.shortDescription || item.subtitle || item.short || '';
}

function productFeatureTags(item) {
  const source = item.featureTags || item.tags || item.tagsJson || item.tags_json || [];
  const tags = Array.isArray(source)
    ? source
    : String(source || '').split(/[,，\n]/);
  return tags.map((tag) => String(tag || '').trim()).filter(Boolean).slice(0, 6);
}

function configuredOptions(item, group) {
  const values = new Set(item.skus.map((sku) => sku.optionValues?.[group.key]).filter(Boolean));
  return group.options.filter((option) => values.has(option));
}

function optionMatchesPrior(item, group, option, options, priorKeys) {
  return item.skus.filter((sku) => {
    if (sku.optionValues?.[group.key] !== option) return false;
    return priorKeys.every((key) => !options[key] || sku.optionValues?.[key] === options[key]);
  });
}

function normalizeSelectedOptions(item, options, changedKey) {
  const candidates = item.skus.filter((sku) => sku.optionValues?.[changedKey] === options[changedKey]);
  const sku = candidates.find((entry) => (entry.stockStatus || entry.stock) !== 'sold_out') || candidates[0];
  return sku ? { ...defaultOptions(item), ...sku.optionValues } : options;
}

function cartCount() {
  return state.cart.length;
}

function cartItemKey(productId, skuId, options) {
  return `${productId}:${skuId}:${Object.entries(options).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('|')}`;
}

function cartDetails() {
  return state.cart.map((entry) => {
    const item = products.find((productItem) => productItem.id === entry.productId);
    if (!item) return null;
    const sku = item.skus.find((skuItem) => skuItem.id === entry.skuId) || findSku(item, entry.options);
    if (!sku) return null;
    return { ...entry, product: item, sku };
  }).filter(Boolean);
}

function persistCart() {
  localStorage.setItem('gfCart', JSON.stringify(state.cart));
}

function addSelectedToCart() {
  const item = product();
  const options = selectedOptions(item);
  const sku = findSku(item, options);
  if (!sku) return notify('当前规格暂不可加入购物车');
  if ((sku.stockStatus || sku.stock) === 'sold_out') return notify('当前 SKU 已售罄，请重新选择规格');
  const key = cartItemKey(item.id, sku.id, options);
  const exists = state.cart.some((entry) => entry.key === key);
  if (!exists) {
    state.cart.unshift({
      key,
      productId: item.id,
      skuId: sku.id,
      options: { ...options },
      addedAt: new Date().toISOString()
    });
    persistCart();
  }
  notify(exists ? '购物车中已有该商品' : '已加入购物车');
  route();
}

function removeCartItem(key) {
  state.cart = state.cart.filter((entry) => entry.key !== key);
  persistCart();
  notify('已移出购物车');
  route();
}

function clearCart() {
  state.cart = [];
  persistCart();
  notify('购物车已清空');
  route();
}

function checkoutCartItem(key) {
  const entry = cartDetails().find((item) => item.key === key);
  if (!entry) return notify('购物车商品已失效，请重新添加');
  state.selectedProductId = entry.product.id;
  state.selectedOptions[entry.product.id] = { ...entry.options };
  persist();
  navigate('/checkout');
}

function persist() {
  localStorage.setItem('selectedProductId', state.selectedProductId);
  localStorage.setItem('selectedOptions', JSON.stringify(state.selectedOptions));
  localStorage.setItem('preferredCurrency', state.fiatCurrency);
  localStorage.setItem('paymentNetwork', state.paymentNetwork);
  localStorage.setItem('paymentMethod', normalizePaymentMethod(state.paymentMethod));
  localStorage.setItem('useBalance', JSON.stringify(state.useBalance));
  localStorage.setItem('accountSection', state.accountSection);
  localStorage.setItem('gfProfile', JSON.stringify(state.profile));
  localStorage.setItem('gfWallet', JSON.stringify(state.wallet));
  localStorage.setItem('gfMessages', JSON.stringify(state.messages));
  if (state.telegramUsername) localStorage.setItem('telegramUsername', state.telegramUsername);
  else localStorage.removeItem('telegramUsername');
  localStorage.setItem('email', state.email);
  if (state.user) localStorage.setItem('gfUser', JSON.stringify(state.user));
  else localStorage.removeItem('gfUser');
  localStorage.setItem('adminToken', state.adminToken);
  localStorage.setItem('adminUsername', state.adminUsername || 'bitbernie');
  localStorage.setItem('adminTab', state.adminTab);
  localStorage.setItem('adminSubTabs', JSON.stringify(state.adminSubTabs));
  localStorage.setItem('adminFilters', JSON.stringify(state.adminFilters));
  localStorage.setItem('accountPrefs', JSON.stringify(state.accountPrefs));
  localStorage.setItem('walletMode', state.walletMode);
  localStorage.setItem('purchaseQuantity', String(Math.max(1, Number(state.purchaseQuantity || 1))));
}

function normalizePaymentMethod(method = state.paymentMethod) {
  return ACTIVE_PAYMENT_METHODS.includes(method) ? method : 'usdt_trc20';
}

function balancePaymentSubtext(amount = 0) {
  if (!state.user) return '登录后可用';
  const balance = Number(state.wallet.balance || 0);
  return balance >= Number(amount || 0) ? '' : '余额不足';
}

function userEmail() {
  return state.user?.email || state.email || '';
}

function userNickname() {
  return state.profile.nickname || state.user?.nickname || (userEmail() ? userEmail().split('@')[0] : state.user?.username) || '用户昵称';
}

function demoToken(prefix = 'auth') {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function addMessage(title, text, type = 'system') {
  state.messages = [
    { id: demoToken('msg'), title, text, type, read: false, createdAt: new Date().toISOString() },
    ...state.messages
  ].slice(0, 30);
  persist();
}

function unreadMessages() {
  return state.messages.filter((message) => !message.read).length;
}

function walletLedger(type, amount, note, status = 'completed') {
  const value = Number(amount || 0);
  state.wallet.ledger = [
    { id: demoToken('wl'), type, amount: value, note, status, createdAt: new Date().toISOString() },
    ...(state.wallet.ledger || [])
  ];
  persist();
}

function applyTelegramLogin(result) {
  const telegramUsername = normalizeTelegramUsername(result.user.telegramUsername);
  state.user = {
    id: result.user.id,
    username: telegramUsername,
    defaultCurrency: result.user.defaultCurrency
  };
  state.telegramUsername = `@${telegramUsername}`;
  if (result.token) saveAuthToken(result.token, 30);
  persist();
}

function rememberTelegramReturnTo(returnTo = '/account') {
  state.telegramReturnTo = normalizeRouteTarget(returnTo || '/account');
  localStorage.setItem('telegramReturnTo', state.telegramReturnTo);
}

function clearTelegramReturnTo() {
  state.telegramReturnTo = '/account';
  localStorage.removeItem('telegramReturnTo');
}

function authToken() {
  const token = localStorage.getItem('gfAuthToken') || '';
  const expiresAt = Number(localStorage.getItem('gfAuthExpiresAt') || 0);
  if (token && expiresAt && expiresAt <= Date.now()) {
    logoutAccount(false);
    return '';
  }
  return token;
}

function logoutAccount(showMessage = true) {
  state.user = null;
  state.telegramUsername = '';
  state.email = '';
  state.messageCenterOpen = false;
  state.telegramPanelOpen = false;
  state.telegramDeeplink = null;
  state.telegramDeeplinkStatus = 'idle';
  state.accountOrders = { loadedFor: '', loading: false, error: '', items: [] };
  localStorage.removeItem('gfUser');
  localStorage.removeItem('gfAuthToken');
  localStorage.removeItem('gfAuthExpiresAt');
  localStorage.removeItem('telegramUsername');
  clearTelegramPendingLogin();
  clearTelegramReturnTo();
  stopTelegramPolling();
  persist();
  if (showMessage) notify('已退出登录');
  if (showMessage) navigate('/');
}

function saveAuthToken(token, days = 7) {
  const ttlDays = Number(days) || 7;
  localStorage.setItem('gfAuthToken', token);
  localStorage.setItem('gfAuthExpiresAt', String(Date.now() + ttlDays * 24 * 60 * 60 * 1000));
}

function finishTelegramLogin(result, message = 'Telegram 登录成功') {
  applyTelegramLogin(result);
  state.telegramPanelOpen = false;
  state.telegramDeeplink = null;
  state.telegramDeeplinkStatus = 'completed';
  clearTelegramPendingLogin();
  notify(message);
  const returnTo = normalizeRouteTarget(state.telegramReturnTo || '/account');
  clearTelegramReturnTo();
  if (returnTo && currentAppPath() !== returnTo) {
    navigate(returnTo);
    return;
  }
  route();
}

function adminHeaders(extra = {}) {
  return {
    'content-type': 'application/json',
    ...(state.adminToken ? { 'x-admin-token': state.adminToken } : {}),
    ...(state.adminUsername ? { 'x-admin-username': state.adminUsername } : {}),
    ...extra
  };
}

async function adminFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: adminHeaders(options.headers || {})
  });
  if (response.status === 401) {
    // 登录过期：清空 token，提示并回到登录页，不停留在半残后台
    if (state.adminToken) {
      state.adminToken = '';
      state.adminUsername = '';
      persist();
      notify('登录已过期，请重新登录');
      if (currentAppPath() === '/admin') renderAdmin();
    }
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
  const fiatCurrency = order.fiatCurrency || order.fiat_currency || 'CNY';
  const providerPayload = parseMaybeJson(order.providerPayload ?? order.provider_payload_json, {});
  const payAmount = Number(providerPayload.pay_amount ?? order.payAmount ?? amountUsdt);
  const payCurrency = String(providerPayload.pay_currency ?? order.paymentCurrency ?? order.payment_currency ?? 'USDT').toUpperCase();
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
    paymentProvider: order.paymentProvider || order.payment_provider || null,
    providerPaymentId: order.providerPaymentId || order.provider_payment_id || null,
    providerPaymentStatus: order.providerPaymentStatus || order.provider_payment_status || null,
    providerPaymentUrl: order.providerPaymentUrl || order.provider_payment_url || null,
    providerPayload,
    payAmount: Number.isFinite(payAmount) ? payAmount : amountUsdt,
    payCurrency,
    status: order.status,
    paymentStatus: order.paymentStatus || order.payment_status || 'unpaid',
    deliveryStatus: order.deliveryStatus || order.delivery_status || 'undelivered',
    afterSaleStatus: order.afterSaleStatus || order.after_sale_status || 'none',
    quantity: Number(order.quantity ?? 1) || 1,
    userInput: parseMaybeJson(order.userInput ?? order.user_input_json, {}),
    adminNote: order.adminNote ?? order.admin_note ?? '',
    txHash: order.txHash || order.tx_hash || null,
    deliveryType: skuSnapshot.deliveryType || order.deliveryType || order.delivery_type || 'manual',
    delivery: order.delivery || null,
    createdAt: order.createdAt || order.created_at,
    expiresAt: paymentExpiryMs(order.expiresAt || order.expires_at, order.createdAt || order.created_at),
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
      state.config.support = { ...DEFAULT_SUPPORT_CHANNEL, ...(state.config.support || {}) };
    }
  } catch {
    state.config = { telegram: { botUsername: '', loginMode: 'mock' }, admin: { authMode: 'dev-open' }, support: DEFAULT_SUPPORT_CHANNEL };
  }
}

async function loadExchangeRates() {
  try {
    const response = await fetch('/api/exchange-rates');
    if (!response.ok) return;

    const data = await response.json();
    for (const [code, rate] of Object.entries(data.rates || {})) {
      if (!CURRENCIES[code]) continue;
      const numericRate = Number(rate);
      if (Number.isFinite(numericRate) && numericRate > 0) {
        CURRENCIES[code].rate = numericRate;
      }
    }
  } catch {
    // Keep the bundled fallback rates when the API is unavailable.
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
  finishTelegramLogin(result);
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

function clearTelegramPendingLogin() {
  localStorage.removeItem('telegramPendingLogin');
}

function persistTelegramPendingLogin() {
  if (!state.telegramDeeplink) return clearTelegramPendingLogin();
  localStorage.setItem('telegramPendingLogin', JSON.stringify(state.telegramDeeplink));
}

function restoreTelegramPendingLogin() {
  if (state.user || !state.config.telegram.botUsername) return false;
  try {
    const pending = JSON.parse(localStorage.getItem('telegramPendingLogin') || 'null');
    if (!pending?.token || !pending.expiresAt) return false;
    if (new Date(pending.expiresAt).getTime() <= Date.now()) {
      clearTelegramPendingLogin();
      return false;
    }
    state.telegramDeeplink = {
      token: pending.token,
      deeplink: pending.deeplink,
      deeplinkNative: pending.deeplinkNative,
      expiresAt: pending.expiresAt,
      startedAt: Number(pending.startedAt) || Date.now(),
      returnTo: pending.returnTo || state.telegramReturnTo || '#/account'
    };
    rememberTelegramReturnTo(state.telegramDeeplink.returnTo);
    state.telegramDeeplinkStatus = 'waiting';
    state.telegramPanelOpen = true;
    schedulePoll();
    return true;
  } catch {
    clearTelegramPendingLogin();
    return false;
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
      startedAt: Date.now(),
      returnTo: state.telegramReturnTo || '#/account'
    };
    persistTelegramPendingLogin();
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
    clearTelegramPendingLogin();
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
      clearTelegramPendingLogin();
      route();
      return;
    }
    if (data.status === 'completed' && data.user) {
      finishTelegramLogin(data);
      return;
    }
    // 未知状态：继续轮询
    schedulePoll();
  } catch {
    // 网络波动：继续轮询（会自然超时）
    schedulePoll();
  }
}

function openTelegramLoginPanel(returnTo = '/account') {
  rememberTelegramReturnTo(returnTo);
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
  clearTelegramPendingLogin();
  clearTelegramReturnTo();
  stopTelegramPolling();
  route();
}

function mockTelegramLogin() {
  finishTelegramLogin(
    { token: 'dev.user_001.token', user: { id: 'user_001', telegramUsername: 'ichuhai_user', defaultCurrency: state.fiatCurrency } },
    'Telegram 模拟登录成功'
  );
}

const TELEGRAM_AUTH_FIELDS = ['id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date', 'hash'];

function readTelegramAuthParams() {
  const searchParams = new URLSearchParams(location.search);
  const hashQuery = location.hash.includes('?') ? location.hash.slice(location.hash.indexOf('?') + 1) : '';
  const hashParams = new URLSearchParams(hashQuery);
  const source = searchParams.has('hash') ? searchParams : hashParams;
  if (!source.has('id') || !source.has('auth_date') || !source.has('hash')) return null;
  const authData = {};
  for (const field of TELEGRAM_AUTH_FIELDS) {
    const value = source.get(field);
    if (value) authData[field] = value;
  }
  return authData;
}

function cleanTelegramAuthParamsFromUrl() {
  const url = new URL(location.href);
  TELEGRAM_AUTH_FIELDS.forEach((field) => url.searchParams.delete(field));
  let hash = url.hash;
  if (hash.includes('?')) {
    const [hashPath, hashSearch] = hash.slice(1).split('?');
    const hashParams = new URLSearchParams(hashSearch);
    TELEGRAM_AUTH_FIELDS.forEach((field) => hashParams.delete(field));
    const nextHashSearch = hashParams.toString();
    hash = `#${hashPath}${nextHashSearch ? `?${nextHashSearch}` : ''}`;
  }
  history.replaceState(null, '', `${url.pathname}${url.search}${hash}`);
}

async function handleTelegramRedirectAuth() {
  const authData = readTelegramAuthParams();
  if (!authData) return false;
  cleanTelegramAuthParamsFromUrl();
  try {
    await submitTelegramAuth(authData);
  } catch (error) {
    notify(error.message || 'Telegram 登录失败，请重试');
    route();
  }
  return true;
}

function normalizeRouteTarget(target = '/') {
  const raw = String(target || '/').trim();
  const withoutOrigin = raw.startsWith(location.origin) ? raw.slice(location.origin.length) : raw;
  const path = withoutOrigin.startsWith('#/') ? withoutOrigin.slice(1) : withoutOrigin;
  const clean = path.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  return clean.startsWith('/') ? clean : `/${clean}`;
}

function currentAppPath() {
  const hashPath = location.hash.startsWith('#/') ? location.hash.slice(1) : '';
  return normalizeRouteTarget(hashPath || location.pathname || '/');
}

function navigate(target) {
  const path = normalizeRouteTarget(target);
  if (currentAppPath() !== path || location.hash) {
    history.pushState(null, '', path);
  }
  route();
  window.scrollTo?.(0, 0);
}

function logo() {
  return `<a class="brand" href="/" aria-label="ichuhai 首页"><img class="logo-horizontal" src="${ASSETS.logo}ichuhai-logo-horizontal-color.png" alt="ichuhai" /></a>`;
}

function icon(type) {
  const file = PRODUCT_ICONS[type] || 'E12_placeholder_blank.png';
  return assetImg(`${ASSETS.product}${file}`, `${type || 'ichuhai'} 商品图标`, 'product-icon');
}

function header() {
  const path = currentAppPath();
  const isDetail = path.startsWith('/product/') || path.startsWith('/products/');
  const accountAction = state.user
    ? `<div class="account-popover-wrap">
        <button class="pill account-trigger logged-in" data-action="toggleAccountMenu" type="button">
          ${navIcon('A07_user_login.png', '已登录')}
          <span><b>${escapeHtml(userNickname())}</b><small>余额 ${Number(state.wallet.balance || 0).toFixed(2)} USDT</small></span>
          ${lineIcon('chevron', '展开个人中心', 'account-chevron')}
        </button>
        ${state.accountMenuOpen ? accountDropdown() : ''}
      </div>`
    : `<a class="pill telegram-pill" href="/login">${navIcon('A07_user_login.png', '登录')}登录</a>`;
  const unread = unreadMessages();
  return `
    <header class="topbar ${isDetail ? 'detail-topbar' : ''}">
      ${logo()}
      <nav class="header-nav"></nav>
      <div class="top-actions">
        <div class="currency">
          <button class="pill currency-pill" data-action="toggleCurrency">${CURRENCIES[state.fiatCurrency].flag} ${state.fiatCurrency} ${navIcon('A10_shaixuan.png', '展开货币', 'currency-chevron')}</button>
          ${state.currencyOpen ? currencyMenu() : ''}
        </div>
        <div class="message-center ${state.messageCenterOpen ? 'open' : ''}">
          <button class="pill icon-pill" data-action="toggleMessages" type="button" aria-label="消息中心">${lineIcon('bell', '消息中心', 'message-icon')}${unread ? `<span>${unread}</span>` : ''}</button>
          ${state.messageCenterOpen ? messageCenterPanel() : ''}
        </div>
        ${accountAction}
      </div>
    </header>
    ${state.telegramPanelOpen ? telegramLoginPanel() : ''}
  `;
}

function supportChannel() {
  return {
    ...DEFAULT_SUPPORT_CHANNEL,
    ...(state.config.support || {})
  };
}

function accountDropdown() {
  return `<section class="account-dropdown">
    <div class="account-dropdown-head">
      ${navIcon('A07_user_login.png', '用户', 'account-dropdown-avatar')}
      <span><b>${escapeHtml(userNickname())}</b><small>${escapeHtml(userEmail() || state.user?.username || '')}</small></span>
    </div>
    <a href="/account">${lineIcon('user', '个人中心', 'account-menu-icon')}个人中心</a>
    <button data-action="accountMenuSection" data-section="wallet" type="button">${lineIcon('card', '钱包充值', 'account-menu-icon')}钱包充值</button>
    <hr />
    <button data-action="accountMenuSection" data-section="orders" type="button">${lineIcon('receipt', '我的订单', 'account-menu-icon')}我的订单</button>
    <button data-action="accountMenuSection" data-section="profile" type="button">${lineIcon('shield-check', '账号设置', 'account-menu-icon')}账号设置</button>
    <hr />
    <button class="danger" data-action="logoutAccount" type="button">${lineIcon('refund', '退出登录', 'account-menu-icon')}退出登录</button>
  </section>`;
}

function messageCenterPanel() {
  const messages = state.messages.length ? state.messages : [
    { title: '暂无新消息', text: '订单、售后、充值到账和余额变动会显示在这里。', createdAt: new Date().toISOString(), read: true }
  ];
  return `<section class="message-popover">
    <div class="message-head"><b>消息中心</b><button data-action="markMessagesRead" type="button">全部已读</button></div>
    <div class="message-list">
      ${messages.slice(0, 6).map((message) => `<article class="${message.read ? '' : 'unread'}">
        <b>${escapeHtml(message.title)}</b>
        <span>${escapeHtml(message.text)}</span>
        <small>${escapeHtml(timeFrom(message.createdAt))}</small>
      </article>`).join('')}
    </div>
  </section>`;
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
  document.documentElement.classList.remove('admin-hash-loading');
  document.documentElement.classList.remove('app-booting');
  const hideHeader = className.includes('admin-page') || className.includes('login-page-shell');
  app.innerHTML = `${hideHeader ? '' : header()}<main class="${className}">${content}</main>`;
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

function applyServerLogin(result) {
  // result: { token, user: { id, email, nickname, authType, defaultCurrency } }
  const user = result.user || {};
  state.user = {
    id: user.id,
    email: user.email,
    username: user.email ? user.email.split('@')[0] : (user.nickname || '用户'),
    nickname: user.nickname || (user.email ? user.email.split('@')[0] : '用户'),
    authType: user.authType || 'email',
    defaultCurrency: user.defaultCurrency || state.fiatCurrency
  };
  state.email = user.email || '';
  state.profile.nickname = state.profile.nickname || state.user.nickname;
  if (result.token) saveAuthToken(result.token, result.expiresInDays || (state.loginRemember ? 30 : 7));
  addMessage('账号登录', `${user.email || '账号'} 已登录，订单和余额会绑定到该账户。`, 'account');
  persist();
}

function maskEmail(email = '') {
  const [name = '', domain = ''] = String(email).split('@');
  if (!name || !domain) return escapeHtml(email);
  const prefix = name.slice(0, Math.min(4, name.length));
  return escapeHtml(`${prefix}***@${domain}`);
}

function splitCodeInput({ id, value = '', maxLength = 6, placeholder = '', iconName = 'shield-check', ariaLabel = '验证码', mode = 'slots' }) {
  const safeValue = escapeHtml(String(value || '').slice(0, maxLength));
  if (mode === 'plain') {
    return `<span class="login-code-input login-code-input-plain" data-code-shell data-target="${id}">
    ${lineIcon(iconName, ariaLabel, 'login-field-icon')}
    <input id="${id}" class="code-real-input code-real-input-plain" inputmode="numeric" maxlength="${maxLength}" autocomplete="${id === 'loginCode' ? 'one-time-code' : 'off'}" placeholder="${escapeHtml(placeholder)}" value="${safeValue}" aria-label="${escapeHtml(ariaLabel)}" />
  </span>`;
  }
  return `<span class="login-code-input" data-code-shell data-target="${id}">
    <input id="${id}" class="code-real-input" inputmode="numeric" maxlength="${maxLength}" autocomplete="${id === 'loginCode' ? 'one-time-code' : 'off'}" placeholder="${escapeHtml(placeholder)}" value="${safeValue}" aria-label="${escapeHtml(ariaLabel)}" />
    <span class="code-slots" aria-hidden="true">
      ${Array.from({ length: maxLength }, (_, index) => `<i class="code-slot">${safeValue[index] ? escapeHtml(safeValue[index]) : ''}</i>`).join('')}
    </span>
  </span>`;
}

function makeMathCaptcha() {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  return { question: `${a} + ${b} = ?`, answer: String(a + b) };
}

function ensureLoginCaptcha() {
  if (!state.loginCaptcha) state.loginCaptcha = makeMathCaptcha();
  return state.loginCaptcha;
}

function refreshLoginCaptcha() {
  state.loginCaptcha = makeMathCaptcha();
}

function validateLoginCaptcha() {
  const value = (document.querySelector('#loginCaptcha')?.value || '').trim();
  const answer = String(ensureLoginCaptcha().answer);
  if (value !== answer) {
    refreshLoginCaptcha();
    route();
    notify('验证码答案不正确，请重新计算');
    return false;
  }
  return true;
}

function finishLoginRedirect(message) {
  state.loginPasswordVisible = false;
  stopVerifyCountdown();
  state.loginStep = 'form';
  state.loginVerifyEmail = '';
  state.loginVerifyCode = '';
  state.loginBusy = false;
  notify(message);
  const target = state.loginReturnTo || '/account';
  state.loginReturnTo = '/account';
  navigate(target);
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function submitLoginPageLogin() {
  if (state.loginBusy) return;
  const email = document.querySelector('#loginEmail')?.value.trim().toLowerCase();
  const password = document.querySelector('#loginPassword')?.value || '';
  const remember = !!document.querySelector('#loginRemember')?.checked;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return notify('请输入有效邮箱');
  if (!password) return notify('请输入密码');
  if (!validateLoginCaptcha()) return;
  state.loginRemember = remember;
  state.loginBusy = true;
  try {
    const { response, data } = await postJson('/api/auth/login', { email, password, remember });
    if (!response.ok) {
      state.loginBusy = false;
      return notify(data.error || '登录失败');
    }
    applyServerLogin(data);
    refreshLoginCaptcha();
    finishLoginRedirect('登录成功');
  } catch {
    state.loginBusy = false;
    notify('网络异常，请稍后重试');
  }
}

async function submitLoginPageRegister() {
  if (state.loginBusy) return;
  const email = document.querySelector('#loginEmail')?.value.trim().toLowerCase();
  const password = document.querySelector('#loginPassword')?.value || '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return notify('请输入有效邮箱');
  if (!PASSWORD_RULE_RE.test(password)) return notify('密码至少 6 位，需包含字母和数字，可使用符号');
  if (!validateLoginCaptcha()) return;
  state.loginBusy = true;
  try {
    const { response, data } = await postJson('/api/auth/register', { email, password });
    state.loginBusy = false;
    if (!response.ok) return notify(data.error || '注册失败');
    refreshLoginCaptcha();
    notify('验证码已发送到邮箱');
    startVerifyStep(email, { sendNow: false });
  } catch {
    state.loginBusy = false;
    notify('网络异常，请稍后重试');
  }
}

function startVerifyStep(email, { sendNow } = {}) {
  state.loginStep = 'verify';
  state.loginVerifyEmail = email;
  state.loginVerifyCode = '';
  state.loginResendAt = Date.now() + 60 * 1000;
  route();
  startVerifyCountdown();
  if (sendNow) resendVerifyCode();
}

function startPasswordResetStep(email) {
  state.loginStep = 'reset';
  state.loginVerifyEmail = email;
  state.loginVerifyCode = '';
  state.loginResendAt = Date.now() + 60 * 1000;
  state.loginBusy = false;
  route();
  startVerifyCountdown();
}

function paymentExpiryMs(expiresAt, createdAt) {
  const explicit = new Date(expiresAt).getTime();
  if (Number.isFinite(explicit)) return explicit;
  const created = new Date(createdAt).getTime();
  return Number.isFinite(created) ? created + 15 * 60 * 1000 : Date.now() + 15 * 60 * 1000;
}

function paymentNetworkLabel() {
  return 'USDT-TRC20';
}

function qrSvgMarkup(data) {
  const qr = qrcode(0, 'M');
  qr.addData(String(data || ''));
  qr.make();
  return qr.createSvgTag({ cellSize: 6, margin: 2, alt: '收款地址二维码', title: '收款地址二维码' });
}

function paymentInstructionSteps() {
  return ['确认金额/网络', '扫码或复制地址', '转账', '等待自动确认']
    .map((label, index) => `<span><b>${index + 1}</b>${label}</span>`)
    .join('');
}

function requiredConfirmations(order) {
  const providerConfirmations = Number(order?.providerPayload?.matching?.confirmations);
  const network = networks.find((item) => item.code === (order?.paymentNetwork || state.paymentNetwork));
  const networkConfirmations = Number(network?.confirmations || network?.requiredConfirmations);
  const value = Number.isFinite(providerConfirmations) && providerConfirmations > 0
    ? providerConfirmations
    : Number.isFinite(networkConfirmations) && networkConfirmations > 0
      ? networkConfirmations
      : 3;
  return Math.max(1, Math.floor(value));
}

function payStatusMeta(status = 'pending_payment', required = 3) {
  const total = Math.max(1, Number(required) || 3);
  const map = {
    created: { label: '待付款', desc: '正在监听收款地址', tone: 'waiting', current: 0 },
    pending_payment: { label: '待付款', desc: '正在监听收款地址', tone: 'waiting', current: 0 },
    payment_confirming: { label: '链上确认中', desc: '已监听到交易，等待区块确认', tone: 'processing', current: Math.max(1, total - 1) },
    paid: { label: '已付款', desc: '付款到账，正在准备发货', tone: 'success', current: total },
    delivering: { label: '发货中', desc: '付款已确认，正在自动发货', tone: 'success', current: total },
    completed: { label: '已完成', desc: '订单已完成，即将跳转', tone: 'success', current: total },
    expired: { label: '已超时', desc: '订单支付时间已结束', tone: 'danger', current: 0 },
    failed: { label: '支付失败', desc: '请联系客服核对付款', tone: 'danger', current: 0 }
  };
  const meta = map[status] || map.pending_payment;
  const current = Math.min(total, Math.max(0, meta.current));
  return {
    ...meta,
    confirmations: `${current} / ${total}`,
    required: total,
    progress: Math.round((current / total) * 100)
  };
}

function payStatusHero(order, paymentAmountText, expiresAt) {
  const required = requiredConfirmations(order);
  const meta = payStatusMeta(order.status, required);
  return `
    <section class="pay-status-hero" data-pay-status="${escapeHtml(order.status || 'pending_payment')}" data-required-confirmations="${required}">
      <div class="pay-status-block pay-status-amount">
        <span>支付金额</span>
        <strong>${escapeHtml(paymentAmountText.replace(' USDT', ''))}<small>USDT</small></strong>
        <p>${lineIcon('warning', '提示', 'pay-inline-icon')} 仅接受 USDT-TRC20 转账，其他币种或网络将无法找回</p>
      </div>
      <div class="pay-status-block pay-status-countdown">
        <span>倒计时状态</span>
        <strong class="timer" data-expires="${expiresAt}">15:00</strong>
        <p>后失效，请尽快支付</p>
      </div>
      <div class="pay-status-block pay-status-chain">
        <div class="pay-status-chain-head">
          <span>链上进度</span>
          <b data-pay-confirmations>${meta.confirmations}</b>
        </div>
        <div class="pay-progress" aria-label="链上确认进度"><i data-pay-progress style="width:${meta.progress}%"></i></div>
        <div class="pay-status-order">
          <span>订单状态</span>
          <b class="pay-live-status ${meta.tone}" data-pay-live-status>${meta.label}</b>
        </div>
        <p data-pay-live-desc>需要 ${meta.required} 个区块确认，${meta.desc}</p>
      </div>
    </section>`;
}

// ── 验证码重发倒计时 ──────────────────────────────────────────
// 模板只在 route() 渲染时算一次 resendLeft，定时器每秒刷新按钮 DOM，
// 到点切为可点击，避免整页重渲染闪烁。
function startVerifyCountdown() {
  if (window.verifyTimer) clearInterval(window.verifyTimer);
  const tick = () => {
    const btn = document.querySelector('[data-action="loginResendCode"]');
    if (!btn) { clearInterval(window.verifyTimer); window.verifyTimer = null; return; }
    const left = Math.max(0, Math.ceil((state.loginResendAt - Date.now()) / 1000));
    if (left > 0) {
      btn.disabled = true;
      btn.textContent = `重新发送 (${left}s)`;
    } else {
      btn.disabled = false;
      btn.textContent = '重新发送验证码';
      clearInterval(window.verifyTimer);
      window.verifyTimer = null;
    }
  };
  tick();
  window.verifyTimer = setInterval(tick, 1000);
}

function stopVerifyCountdown() {
  if (window.verifyTimer) { clearInterval(window.verifyTimer); window.verifyTimer = null; }
}

async function submitVerifyCode() {
  if (state.loginBusy) return;
  const code = (document.querySelector('#loginCode')?.value || '').trim();
  if (!/^\d{6}$/.test(code)) return notify('请输入 6 位验证码');
  state.loginBusy = true;
  try {
    const { response, data } = await postJson('/api/auth/verify-email', {
      email: state.loginVerifyEmail,
      code
    });
    if (!response.ok) {
      state.loginBusy = false;
      return notify(data.error || '验证失败');
    }
    applyServerLogin(data);
    finishLoginRedirect('注册成功，已登录');
  } catch {
    state.loginBusy = false;
    notify('网络异常，请稍后重试');
  }
}

async function submitPasswordResetRequest() {
  if (state.loginBusy) return;
  const email = document.querySelector('#loginEmail')?.value.trim().toLowerCase() || state.email.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return notify('请先输入有效邮箱');
  state.loginBusy = true;
  try {
    const { response, data } = await postJson('/api/auth/password-reset/request', { email });
    state.loginBusy = false;
    if (!response.ok) return notify(data.error || '验证码发送失败');
    state.email = email;
    notify('验证码已发送到邮箱');
    startPasswordResetStep(email);
  } catch {
    state.loginBusy = false;
    notify('网络异常，请稍后重试');
  }
}

async function submitPasswordResetConfirm() {
  if (state.loginBusy) return;
  const code = (document.querySelector('#loginCode')?.value || '').trim();
  const password = document.querySelector('#loginPassword')?.value || '';
  if (!/^\d{6}$/.test(code)) return notify('请输入 6 位验证码');
  if (!PASSWORD_RULE_RE.test(password)) return notify('密码至少 6 位，需包含字母和数字，可使用符号');
  state.loginBusy = true;
  try {
    const { response, data } = await postJson('/api/auth/password-reset/confirm', {
      email: state.loginVerifyEmail,
      code,
      password
    });
    state.loginBusy = false;
    if (!response.ok) return notify(data.error || '密码重置失败');
    stopVerifyCountdown();
    state.authMode = 'login';
    state.loginStep = 'form';
    state.loginVerifyEmail = '';
    state.loginVerifyCode = '';
    state.email = data.email || state.email;
    state.loginPasswordVisible = false;
    refreshLoginCaptcha();
    notify('密码已重置，请使用新密码登录');
    route();
  } catch {
    state.loginBusy = false;
    notify('网络异常，请稍后重试');
  }
}

async function resendVerifyCode() {
  try {
    const endpoint = state.loginStep === 'reset' ? '/api/auth/password-reset/request' : '/api/auth/resend-code';
    const { response, data } = await postJson(endpoint, { email: state.loginVerifyEmail });
    if (!response.ok) return notify(data.error || '重发失败');
    state.loginResendAt = Date.now() + 60 * 1000;
    notify('验证码已重新发送');
    route();
    startVerifyCountdown();
  } catch {
    notify('网络异常，请稍后重试');
  }
}

function loginVerifySection() {
  const maskedEmail = maskEmail(state.loginVerifyEmail || '');
  const resendLeft = Math.max(0, Math.ceil((state.loginResendAt - Date.now()) / 1000));
  const isReset = state.loginStep === 'reset';
  const passwordType = state.loginPasswordVisible ? 'text' : 'password';
  return `
    <div class="login-verify">
      <span class="login-verify-icon">${lineIcon('mail', '邮箱验证', 'login-icon')}</span>
      <h2 class="login-verify-title">${isReset ? '重置密码' : '验证您的邮箱'}</h2>
      <p class="login-verify-desc">验证码已发送至 <b>${maskedEmail}</b></p>
      <form class="login-fields" data-action="loginVerifySubmit">
        <label class="login-field">
          <span class="login-field-label">请在 5 分钟内输入 6 位验证码</span>
          ${splitCodeInput({ id: 'loginCode', value: state.loginVerifyCode, maxLength: 6, placeholder: '请输入 6 位验证码', ariaLabel: '邮箱验证码' })}
        </label>
        ${isReset ? `
        <label class="login-field">
          <span class="login-field-label">新密码</span>
          <span class="login-input">
            ${lineIcon('lock', '新密码', 'login-field-icon')}
            <input id="loginPassword" type="${passwordType}" autocomplete="new-password" placeholder="请输入新密码" />
            <button class="login-eye" data-action="toggleLoginPassword" type="button" aria-label="${state.loginPasswordVisible ? '隐藏密码' : '显示密码'}">${lineIcon(state.loginPasswordVisible ? 'eye-off' : 'eye', '切换密码可见', 'login-field-icon')}</button>
          </span>
        </label>
        <small class="login-password-hint">密码至少 6 位，需包含字母和数字，可使用符号。</small>` : ''}
        <button class="login-submit" type="submit" ${state.loginBusy ? 'disabled' : ''}>${isReset ? '重置密码' : '验证并登录'}</button>
      </form>
      <div class="login-verify-actions">
        <button data-action="loginResendCode" type="button" ${resendLeft ? 'disabled' : ''}>${resendLeft ? `重新发送 (${resendLeft}s)` : '重新发送验证码'}</button>
        <button data-action="loginBackToForm" type="button">${isReset ? '返回登录' : '返回修改邮箱'}</button>
      </div>
    </div>`;
}

function loginPage() {
  const isRegister = state.authMode === 'register';
  const passwordType = state.loginPasswordVisible ? 'text' : 'password';
  const captcha = ensureLoginCaptcha();
  shell(`
    <div class="login-page">
      <section class="login-card login-card-reference">
        <aside class="login-brand-reference">
          <a class="login-logo" href="/" aria-label="ichuhai 首页"><img src="${ASSETS.logo}ichuhai-logo-horizontal-color.png" alt="ichuhai" /></a>
          <div class="login-brand-copy">
            <h1>数字产品，轻松拥有</h1>
            <p>自动发货 · 安全可靠 · 专业服务</p>
          </div>
          <div class="login-shop-art" aria-hidden="true">
            <span class="login-bag"><i></i></span>
            <span class="login-float login-float-discord">${icon('discord')}</span>
            <span class="login-float login-float-spotify">${icon('spotify')}</span>
            <span class="login-float login-float-youtube">${icon('youtube')}</span>
            <span class="login-float login-float-steam">${icon('steam')}</span>
            <span class="login-float login-float-office">${icon('office')}</span>
          </div>
        </aside>
        <section class="login-form">
          ${state.loginStep === 'verify' || state.loginStep === 'reset' ? loginVerifySection() : `
          <div class="login-form-title">
            <h1>${isRegister ? '创建账号' : '欢迎回来'}</h1>
            <p>登录后查看订单、余额和自动发货内容。</p>
          </div>
          <div class="login-tabs" role="tablist">
            <button class="login-tab ${isRegister ? '' : 'active'}" data-action="switchAuthMode" data-mode="login" type="button">登录</button>
            <button class="login-tab ${isRegister ? 'active' : ''}" data-action="switchAuthMode" data-mode="register" type="button">创建账号</button>
          </div>
          <form class="login-fields" data-action="loginFormSubmit">
            <label class="login-field">
              <span class="login-field-label">邮箱地址</span>
              <span class="login-input">
                ${lineIcon('mail', '邮箱', 'login-field-icon')}
                <input id="loginEmail" type="email" autocomplete="email" placeholder="请输入您的邮箱地址" value="${escapeHtml(state.email || '')}" />
              </span>
            </label>
            <label class="login-field">
              <span class="login-field-label">密码</span>
              <span class="login-input">
                ${lineIcon('lock', '密码', 'login-field-icon')}
                <input id="loginPassword" type="${passwordType}" autocomplete="${isRegister ? 'new-password' : 'current-password'}" placeholder="请输入密码" />
                <button class="login-eye" data-action="toggleLoginPassword" type="button" aria-label="${state.loginPasswordVisible ? '隐藏密码' : '显示密码'}">${lineIcon(state.loginPasswordVisible ? 'eye-off' : 'eye', '切换密码可见', 'login-field-icon')}</button>
              </span>
            </label>
            ${isRegister ? `<small class="login-password-hint">密码至少 6 位，需包含字母和数字，可使用符号。</small>` : ''}
            <label class="login-field">
              <span class="login-field-label">验证码</span>
              <span class="login-captcha-row">
                ${splitCodeInput({ id: 'loginCaptcha', value: '', maxLength: 2, placeholder: '请输入数字答案', ariaLabel: '验证码', mode: 'plain' })}
                <button class="login-captcha-card" data-action="refreshLoginCaptcha" type="button" aria-label="刷新验证码"><b>${escapeHtml(captcha.question)}</b></button>
              </span>
            </label>
            ${isRegister ? '' : `
            <div class="login-options-row">
              <label class="login-remember"><input id="loginRemember" type="checkbox" data-action="toggleLoginRemember" ${state.loginRemember ? 'checked' : ''}/> 保持登录</label>
              <button class="login-forgot" data-action="loginForgot" type="button">忘记密码?</button>
            </div>`}
            <button class="login-submit" type="submit" ${state.loginBusy ? 'disabled' : ''}>${isRegister ? '创建账号' : '登录'}</button>
          </form>
          <div class="login-switch">
            ${isRegister
              ? '已有账号? <button data-action="switchAuthMode" data-mode="login" type="button">立即登录</button>'
              : '还没有账号? <button data-action="switchAuthMode" data-mode="register" type="button">立即创建</button>'}
          </div>`}
        </section>
      </section>
      <div class="login-footer">
        <a class="login-back" href="/">← 返回 ichuhai 首页</a>
      </div>
    </div>
  `, 'login-page-shell');
}

function home() {
  shell(`
    <section class="catalog-home">
      ${productBrowser(true)}
    </section>
  `, 'page catalog-page');
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

const CATALOG_CATEGORIES = [
  { label: '全部商品', cat: '全部', icon: 'all' },
  { label: '社交平台', cat: '社交', icon: 'social' },
  { label: '音乐音频', cat: '音乐', icon: 'music' },
  { label: '视频会员', cat: '视频', icon: 'video' },
  { label: '游戏娱乐', cat: '游戏', icon: 'game' },
  { label: '软件工具', cat: '软件', icon: 'software' },
  { label: '礼品卡券', cat: '礼品卡', icon: 'gift' },
  { label: '更多分类', cat: '更多', icon: 'more' }
];

const CATALOG_SALE_TAGS = {
  'discord-nitro': '全球通用',
  'spotify-premium': '独享账号',
  'youtube-premium': '独享账号',
  'steam-wallet': '安全可靠',
  'microsoft-365': '官方授权'
};

const CATALOG_TRUST_ITEMS = [
  { icon: 'lightning', title: '自动发货', desc: '下单后自动发货' },
  { icon: 'shield-check', title: '官方正品', desc: '100% 官方授权' },
  { icon: 'lock', title: '安全可靠', desc: '多重加密保护' },
  { icon: 'headset', title: '专业支持', desc: '7×24小时在线服务' }
];

function categoryCount(cat) {
  return cat === '全部' ? products.length : products.filter((item) => item.category === cat).length;
}

function productBrowser(full = false) {
  const visible = visibleProducts(full);
  const categories = CATALOG_CATEGORIES.filter((c) => c.cat === '全部' || categoryCount(c.cat) > 0);
  return `
    <section id="products" class="product-section product-browser catalog-shell ${full ? 'is-full' : ''}">
      <aside class="catalog-sidebar">
        <div class="catalog-sidebar-head">
          ${navIcon('A02_products.png', '商品分类', 'catalog-side-icon')}
          <span><b>商品分类</b><small>Categories</small></span>
        </div>
        <div class="catalog-category-list">
          ${categories.map((c) => `<button class="category-tab ${state.categoryFilter === c.cat ? 'active' : ''}" data-action="filterCategory" data-category="${c.cat}">${lineIcon(c.icon, c.label, 'category-icon')}<span>${c.label}</span><em>${categoryCount(c.cat)}</em></button>`).join('')}
        </div>
        <div class="catalog-help-card">
          <div class="catalog-help-head">
            ${lineIcon('headset', '需要帮助', 'catalog-help-icon')}
            <span><b>需要帮助?</b><small>Need help?</small></span>
          </div>
          <a class="catalog-help-button" href="${escapeHtml(supportChannel().url)}" target="_blank" rel="noopener">${lineIcon('headset', '联系客服', 'catalog-help-button-icon')} 联系客服</a>
          <a class="catalog-help-button secondary" href="/faq">帮助中心 ${lineIcon('chevron', '进入帮助中心', 'catalog-help-arrow')}</a>
        </div>
      </aside>
      <div class="catalog-main">
        <div class="product-header">
          <div class="catalog-tools">
            <label class="search">${navIcon('A09_search.png', '搜索')} <input data-action="searchProducts" value="${escapeHtml(state.searchQuery)}" placeholder="搜索商品名称或关键词" /></label>
            <label class="catalog-sort"><span class="sort-current">${escapeHtml(state.sortBy || '默认排序')}</span>${lineIcon('chevron', '展开排序', 'sort-chevron')}<select data-action="sortProducts" aria-label="排序"><option>默认排序</option><option ${state.sortBy === '价格低到高' ? 'selected' : ''}>价格低到高</option></select></label>
          </div>
        </div>
        <div class="catalog-list-head" aria-hidden="true">
          <span class="col-info">商品信息</span>
          <span class="col-delivery">发货方式</span>
          <span class="col-price">价格</span>
          <span class="col-stock">库存/销量</span>
          <span class="col-buy">操作</span>
        </div>
        <div class="catalog-list" role="list" aria-label="商品列表">
          ${visible.length ? visible.map(card).join('') : '<div class="empty-state">暂无匹配商品</div>'}
        </div>
      </div>
    </section>
  `;
}

function renderProductResults() {
  const list = document.querySelector('.catalog-list');
  if (!list) return route();
  const full = !!document.querySelector('.catalog-shell.is-full');
  const visible = visibleProducts(full);
  list.innerHTML = visible.length ? visible.map(card).join('') : '<div class="empty-state">暂无匹配商品</div>';
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
        <a class="support-button" href="${SUPPORT_TELEGRAM_URL}" target="_blank" rel="noopener">${navIcon('A07_user_login.png', '联系在线客服')} 联系在线客服</a>
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
          <a href="/products">商品中心</a>
          <a href="/faq">帮助中心</a>
          <a href="/">关于我们</a>
        </div>
        <div class="footer-column">
          <h4>支持</h4>
          <a href="/faq">新手指南</a>
          <a href="/faq">常见问题</a>
          <a href="${SUPPORT_TELEGRAM_URL}" target="_blank" rel="noopener">联系客服</a>
        </div>
        <div class="footer-column">
          <h4>支付方式</h4>
          <div class="payment-icons">
            <span>USDT</span>
            <span>TRC20</span>
            <span>◎</span>
          </div>
          <p>余额、USDT TRC20 与支付宝</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 ichuhai. 保留所有权利。</span>
        <div>
          <a href="/">服务条款</a>
          <a href="/">隐私政策</a>
          <a href="/">免责声明</a>
        </div>
      </div>
    </footer>
  `;
}

function activeSkus(item) {
  return (item.skus || []).filter((sku) => (sku.stockStatus || sku.stock) !== 'sold_out');
}

function minSkuPrice(item) {
  const skus = activeSkus(item);
  const candidates = skus.length ? skus : (item.skus || []);
  return Math.min(...candidates.map((sku) => Number(sku.priceUsdt || 0)).filter((value) => Number.isFinite(value)));
}

function formatOptionValue(key, value) {
  if (key === 'region') return { Global: 'Global', US: '美区', EU: '欧区', JP: '日区' }[value] || value;
  return value;
}

function skuSpecSummary(item) {
  const skus = activeSkus(item);
  if (!skus.length) return '';
  const optionKeys = Array.from(new Set(skus.flatMap((sku) => Object.keys(sku.optionValues || {}))));
  if (!optionKeys.length) return '';
  const pieces = optionKeys.slice(0, 2).map((key) => {
    const values = Array.from(new Set(skus.map((sku) => sku.optionValues?.[key]).filter(Boolean)));
    if (!values.length) return '';
    const displayValues = values.map((value) => formatOptionValue(key, value));
    if (key === 'duration' && displayValues.every((value) => /^\d+个月$/.test(value))) {
      return displayValues.map((value) => value.replace('个月', '')).join('/') + '个月';
    }
    return displayValues.slice(0, 4).join(' · ');
  }).filter(Boolean);
  return pieces.join(' · ');
}

function card(item) {
  const sku = findSku(item, defaultOptions(item)) || item.skus[0];
  const spec = skuSpecSummary(item);
  const deliveryAuto = item.deliveryType === 'auto' || item.deliveryType === 'mixed';
  const deliveryClass = deliveryAuto ? 'auto' : 'manual';
  const stock = sku.stockStatus || sku.stock;
  const sold = Math.max(176, Math.round((item.name.length * 137 + Number(sku.priceUsdt || 1) * 89) % 3200));
  const minimumPrice = Number.isFinite(minSkuPrice(item)) ? minSkuPrice(item) : Number(sku.priceUsdt || 0);
  const hasMultiplePrices = (item.skus || []).length > 1;
  return `
    <a class="product-card catalog-card" href="/products/${item.slug}" role="listitem">
      <span class="catalog-card-info">
        <span class="catalog-card-media">${icon(item.icon)}</span>
        <span class="catalog-card-copy">
        <span class="catalog-card-title">
          <b>${escapeHtml(item.name)}</b>
        </span>
        ${spec ? `<small class="catalog-card-spec">${escapeHtml(spec)}</small>` : ''}
        </span>
      </span>
      <span class="catalog-card-delivery">
        <i class="delivery-chip ${deliveryClass}">${lineIcon(deliveryAuto ? 'lightning' : 'clock', deliveryAuto ? '自动发货' : '人工发货', 'delivery-dot')}${escapeHtml(deliveryAuto ? '自动发货' : '人工发货')}</i>
      </span>
      <span class="catalog-card-price">${priceFrom(minimumPrice, hasMultiplePrices)}</span>
      <span class="catalog-card-stock">
        <i class="stock-flag ${stock}">${stockLabel(stock)}</i>
        <small>已售 ${sold.toLocaleString('zh-CN')}</small>
      </span>
      <span class="buy-button">立即购买</span>
    </a>
  `;
}

function deliveryLabel(type) {
  return { auto: '自动发货', mixed: '部分自动', manual: '人工处理' }[type] || type;
}

function productTypeLabel(type) {
  return { subscription: '订阅', card: '礼品卡 / 卡密', account: '账号', recharge: '充值', service: '服务' }[type] || type || '订阅';
}

// 分类 key/中文 互转：英文 key 显示中文名，已是中文则原样返回
function categoryDisplayName(value) {
  if (!value) return '未分类';
  const map = {
    social: '社交', music: '音乐', video: '视频', game: '游戏', software: '软件',
    education: '教育', design: '设计', ai: 'AI 工具', tools: '工具', vpn: '网络', more: '更多'
  };
  return map[value] || value;
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
    required: item.name.includes('YouTube') ? '接收邮箱、备用联系方式' : '接收邮箱、必要时的账号 ID 或备注',
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
                    ${group.displayType === 'cards' && matching ? `<small>${matching.priceUsdt.toFixed(2)} USD<br/>≈ ${money(matching.priceUsdt)}</small>` : ''}
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
  return String(value || '');
}

const PAYMENT_META = {
  TRON: { title: 'USDT', sub: '数字货币支付', icon: 'C01_usdt.png' }
};

function paymentDisplay(code = state.paymentNetwork) {
  const network = networks.find((n) => n.code === code) || networks[0];
  return PAYMENT_META[network.code]?.title || `${network.displayName} (${network.tokenStandard})`;
}

function optionReason(item, group, option, possible) {
  if (possible) return '';
  const stockSku = item.skus.find((sku) => sku.optionValues[group.key] === option && (sku.stockStatus || sku.stock) === 'sold_out');
  if (stockSku) return '库存不足';
  return '暂不可选';
}

function renderOptionButton(item, group, option, priorKeys) {
  const opts = selectedOptions(item);
  const next = { ...opts, [group.key]: option };
  const matches = optionMatchesPrior(item, group, option, next, priorKeys);
  if (!matches.length) return '';
  const possible = matches.some((sku) => (sku.stockStatus || sku.stock) !== 'sold_out');
  const active = opts[group.key] === option;
  const matching = matches.find((sku) => (sku.stockStatus || sku.stock) !== 'sold_out') || matches[0];
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
      <span class="card-price">${matching ? `${matching.priceUsdt.toFixed(2)} USD` : '-- USD'}</span>
      <small>${matching ? `≈ ${money(matching.priceUsdt)}` : reason}</small>
      ${active ? '<i class="checkmark">✓</i>' : ''}
    </button>`;
  }

  return `<button class="${className}" data-action="setOption" data-product="${item.id}" data-key="${group.key}" data-value="${option}" title="${possible ? '' : reason}" ${possible ? '' : 'disabled'}>
    <span class="option-copy"><strong>${option}</strong>${possible ? '' : `<small>${reason}</small>`}</span>
    ${active ? '<i class="checkmark">✓</i>' : ''}
  </button>`;
}

function renderPurchaseStep(item, group, index) {
  const isPlan = group.key === 'duration' || group.key === 'plan' || group.key === 'amount';
  const typeClass = isPlan ? 'plans' : group.key;
  const opts = selectedOptions(item);
  const priorKeys = item.optionGroups.slice(0, index - 1).map((entry) => entry.key);
  const options = configuredOptions(item, group).filter((option) => optionMatchesPrior(item, group, option, opts, priorKeys).length);
  const selectorMode = isPlan && options.length > 5 ? 'table' : options.length >= 6 ? 'select' : 'chips';
  const optionMarkup = selectorMode === 'select'
    ? `<select class="option-select" data-action="setOption" data-product="${item.id}" data-key="${group.key}">${options.map((option) => `<option value="${option}" ${opts[group.key] === option ? 'selected' : ''}>${option}</option>`).join('')}</select>`
    : selectorMode === 'table'
      ? `<div class="plan-table">${options.map((option) => renderOptionButton(item, group, option, priorKeys)).join('')}</div>`
      : options.map((option) => renderOptionButton(item, group, option, priorKeys)).join('');
  return `<section class="purchase-step" style="--step-index:${index}">
    <div class="step-marker"><span>${index}</span></div>
    <div class="step-panel">
      <h3>${group.name}</h3>
      <div class="step-options ${typeClass} ${selectorMode}">
        ${optionMarkup || '<p class="option-empty">当前选择下暂无可购规格</p>'}
      </div>
    </div>
  </section>`;
}

function orderPreview(item, sku) {
  const opts = selectedOptions(item);
  const disabled = !sku || (sku.stockStatus || sku.stock) === 'sold_out';
  const buttonText = disabled ? '请先完成商品选择' : state.user ? `去结算 ${sku.priceUsdt.toFixed(2)} USD` : `登录后结算 ${sku.priceUsdt.toFixed(2)} USD`;
  const rows = [
    ['商品', item.name],
    ['地区', opts.region || '不适用'],
    ['账号类型', opts.account || '不适用'],
    ['套餐周期', opts.duration || opts.plan || opts.amount || '已选择']
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
      <strong>${sku ? `${sku.priceUsdt.toFixed(2)} USD` : '-- USD'}</strong>
      <small>${sku ? `≈ ${money(sku.priceUsdt)}` : '当前组合不可购买'}</small>
    </div>
    <div class="preview-trust">
      ${trust.map(([iconFile, title, text]) => `<div>${featureIcon(iconFile, title)}<span><strong>${title}</strong><small>${text}</small></span></div>`).join('')}
    </div>
    <button class="primary-pay-button" data-action="paySelected" ${disabled ? 'disabled' : ''}>${featureIcon('B04_lock_encryption.png', '安全结算')} ${buttonText}</button>
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
      <label>邮箱账号 *<input data-field="email" value="${state.email || userEmail()}" placeholder="例如 name@example.com" /></label>
      <label>支付币种<input value="USDT 🔒" disabled /></label>
      <label>支付网络<select data-action="setNetwork">${networks.map((n) => `<option value="${n.code}" ${n.code === state.paymentNetwork ? 'selected' : ''}>${n.displayName} (${n.tokenStandard})</option>`).join('')}</select></label>
      <div class="amount"><span>订单金额</span><strong>${sku ? price(sku.priceUsdt) : '当前规格暂不可购买'}</strong></div>
      <button class="primary" data-action="goCheckout" ${disabled ? 'disabled' : ''}>${paymentIcon('C03_wallet.png', '钱包')} 前往统一结算</button>
      <p class="secure">支付信息与订单通知将同步到邮箱和右上角消息中心</p>
      <footer>${featureIcon('B02_shield_secure_payment.png', '安全加密支付')} 安全加密支付，保障您的隐私与资产安全</footer>
    </aside>
  `;
}

function flowStrip() {
  return `<section class="flow glass">${['01 选择商品', '02 选择规格', '03 填写信息', '04 完成支付 / 接收商品'].map((x) => `<span>${x}</span>`).join('<i>···</i>')}</section>`;
}

const REGION_LABELS = { Global: '全球版', US: '美区', EU: '欧区', JP: '日区', HK: '港区', KR: '韩区' };

const DETAIL_TRUST_TAGS = ['自动发货', '官方正版', '安全可靠'];

function detailOptionLabel(key, value) {
  if (key === 'region') return REGION_LABELS[value] || value;
  return value;
}

function detailGalleryFrames(item) {
  return [
    { tone: 'frame-light', label: '' },
    { tone: 'frame-dark frame-dark-a', label: item.name },
    { tone: 'frame-dark frame-dark-b', label: '官方正版' },
    { tone: 'frame-dark frame-dark-c', label: item.name.split(' ')[0] }
  ];
}

function detailGallery(item) {
  const frames = detailGalleryFrames(item);
  const index = Math.max(0, Math.min(frames.length - 1, Number(state.detailImageIndex || 0)));
  const active = frames[index];
  const uploadedImages = item.images || item.galleryImages || [];
  const showArrows = uploadedImages.length > 1;
  return `
    <div class="product-gallery">
      <div class="gallery-main ${active.tone}">
        ${showArrows ? `<button class="gallery-arrow gallery-prev" data-action="detailImagePrev" type="button" aria-label="上一张">${lineIcon('chevron', '上一张', 'gallery-arrow-icon')}</button>` : ''}
        <span class="gallery-art">${icon(item.icon)}</span>
        ${active.label ? `<span class="gallery-caption">${escapeHtml(active.label)}</span>` : ''}
        ${showArrows ? `<button class="gallery-arrow gallery-next" data-action="detailImageNext" type="button" aria-label="下一张">${lineIcon('chevron', '下一张', 'gallery-arrow-icon')}</button>` : ''}
      </div>
      <div class="gallery-thumbs">
        ${frames.map((frame, idx) => `<button class="gallery-thumb ${frame.tone} ${idx === index ? 'active' : ''}" data-action="detailImage" data-index="${idx}" type="button" aria-label="预览图 ${idx + 1}">${icon(item.icon)}</button>`).join('')}
      </div>
    </div>
  `;
}

function detailSpecGroups(item) {
  const opts = selectedOptions(item);
  return item.optionGroups.map((group, idx) => {
    const priorKeys = item.optionGroups.slice(0, idx).map((entry) => entry.key);
    const options = configuredOptions(item, group).filter((option) => optionMatchesPrior(item, group, option, opts, priorKeys).length);
    if (!options.length) return '';
    return `
      <div class="detail-spec-group">
        <span class="detail-spec-label">${escapeHtml(group.name)}</span>
        <div class="detail-spec-options">
          ${options.map((option) => {
            const matches = optionMatchesPrior(item, group, option, { ...opts, [group.key]: option }, priorKeys);
            const possible = matches.some((sku) => (sku.stockStatus || sku.stock) !== 'sold_out');
            const active = opts[group.key] === option;
            return `<button class="detail-spec-pill ${active ? 'active' : ''} ${possible ? '' : 'disabled'}" data-action="setOption" data-product="${item.id}" data-key="${group.key}" data-value="${option}" type="button" ${possible ? '' : 'disabled'}>
              <b>${escapeHtml(detailOptionLabel(group.key, option))}</b>
              ${possible ? '' : '<small>暂缺</small>'}
            </button>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');
}

function detail(slug = 'discord-nitro') {
  const item = products.find((p) => p.slug === slug) || product();
  const wasDifferentProduct = state.selectedProductId !== item.id;
  const isNewDetailVisit = state.lastDetailSlug !== item.slug;
  state.selectedProductId = item.id;
  if (wasDifferentProduct || isNewDetailVisit || !state.selectedOptions[item.id]) {
    state.selectedOptions[item.id] = defaultOptions(item);
    state.purchaseQuantity = 1;
  }
  state.paymentMethod = normalizePaymentMethod(state.paymentMethod);
  if (!state.user && state.paymentMethod === 'balance') state.paymentMethod = 'usdt_trc20';
  state.lastDetailSlug = item.slug;
  const sku = findSku(item);
  const opts = selectedOptions(item);
  const stock = sku?.stockStatus || sku?.stock || 'in_stock';
  const disabled = !sku || stock === 'sold_out';
  const sold = Math.max(176, Math.round((item.name.length * 137 + Number(sku?.priceUsdt || 1) * 89) % 3200));
  const detailDescription = item.detailDescription || item.description || item.detail || item.notice?.usageGuide || productShort(item);
  const currentSelection = Object.values(opts || {}).filter(Boolean).join(' / ');
  persist();
  shell(`
    <div class="breadcrumb"><a href="/">首页</a> / <a href="/products">全部商品</a> / <span>${escapeHtml(item.name)}</span></div>
    <section class="product-detail-layout">
      <div class="product-detail-visual">
        ${detailGallery(item)}
      </div>
      <div class="product-purchase-panel">
        <h1>${escapeHtml(item.name)}</h1>
        <div class="product-tags detail-tags">
          ${DETAIL_TRUST_TAGS.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="detail-price-block">
          <div class="detail-price-main">
            ${sku ? price(sku.priceUsdt) : '<strong>暂不可购买</strong>'}
            ${sku ? `<small class="detail-current-selection">当前选择：${escapeHtml(currentSelection || '默认规格')}</small>` : ''}
          </div>
          <div class="detail-stock-info">
            <i class="stock-flag ${stock}">${stockLabel(stock)}</i>
            <small>已售 ${sold.toLocaleString('zh-CN')}</small>
          </div>
        </div>
        ${detailSpecGroups(item)}
        <div class="detail-spec-group">
          <span class="detail-spec-label">数量</span>
          <span class="quantity-stepper">
            <button data-action="quantityMinus" type="button" aria-label="减少">−</button>
            <input value="${Math.max(1, Number(state.purchaseQuantity || 1))}" inputmode="numeric" data-action="quantityInput" aria-label="购买数量" />
            <button data-action="quantityPlus" type="button" aria-label="增加">+</button>
          </span>
        </div>
        <div class="detail-spec-group">
          <span class="detail-spec-label">支付方式</span>
          <div class="detail-payment-methods">
            ${[
              ['balance', '余额支付', balancePaymentSubtext(sku?.priceUsdt || 0), !state.user],
              ['usdt_trc20', 'USDT-TRC20', '手续费低', false],
              ['alipay', '支付宝', '', false]
            ].map(([key, label, sub, disabledPayment]) => `<button class="${state.paymentMethod === key ? 'active' : ''} ${disabledPayment ? 'is-disabled' : ''}" data-action="setPaymentMethod" data-method="${key}" type="button" ${disabledPayment ? 'disabled' : ''}><b>${escapeHtml(label)}</b>${sub ? `<small>${escapeHtml(sub)}</small>` : ''}</button>`).join('')}
          </div>
        </div>
        <button class="detail-buy-button" data-action="paySelected" ${disabled ? 'disabled' : ''}>${disabled ? '当前商品不可购买' : '立即支付'}</button>
      </div>
    </section>
    <section class="product-detail-info">
      <h2>商品说明</h2>
      <p class="detail-info-text">${escapeHtml(detailDescription)}</p>
    </section>
  `, 'page detail-page');
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}

function checkoutBalanceUse(total) {
  const amount = Number(total || 0);
  const balance = Number(state.wallet.balance || 0);
  if (state.paymentMethod === 'balance') return Math.min(balance, amount);
  if (state.useBalance) return Math.min(balance, amount);
  return 0;
}

function checkoutRemainder(total) {
  return Math.max(0, Number(total || 0) - checkoutBalanceUse(total));
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
          <h3>账号信息</h3>
          <div class="account-binding-note checkout-binding">
            <strong>${featureIcon('B02_shield_secure_payment.png', '订单绑定')} 订单信息自动绑定当前登录账号</strong>
            <p>${state.user ? `当前邮箱账号：${escapeHtml(userEmail())}` : '请先登录后再创建订单，发货与售后信息会归档到「我的订单」。'}</p>
          </div>
        </section>
        <section class="glass panel">
          <h3>支付信息</h3>
          <div class="payment-method-row">
            ${[
              ['balance', '余额支付', balancePaymentSubtext(sku.priceUsdt), !state.user],
              ['usdt_trc20', 'USDT-TRC20', '数字货币支付', false],
              ['alipay', '支付宝', '适合支付宝用户', false]
            ].map(([key, label, desc, disabledPayment]) => `<button class="${state.paymentMethod === key ? 'active' : ''} ${disabledPayment ? 'is-disabled' : ''}" data-action="setPaymentMethod" data-method="${key}" type="button" ${disabledPayment ? 'disabled' : ''}><b>${label}</b><span>${desc}</span></button>`).join('')}
          </div>
          ${state.paymentMethod !== 'balance' ? `<label class="agree balance-offset"><input type="checkbox" data-action="toggleUseBalance" ${state.useBalance ? 'checked' : ''}/> 使用余额抵扣，剩余部分通过${state.paymentMethod === 'alipay' ? '支付宝' : 'USDT'}支付</label>` : ''}
          ${state.paymentMethod === 'usdt_trc20' ? `
            <div class="network-row">${networks.map((n) => `<button class="${n.code === state.paymentNetwork ? 'active' : ''}" data-action="chooseNetwork" data-code="${n.code}">${n.displayName} ${n.tokenStandard}</button>`).join('')}</div>
            <div class="network-confirm">
              <b>请使用 ${networkText(state.paymentNetwork)} 完成支付</b>
              <span>请按支付页显示的金额付款，并确认钱包网络一致。</span>
              <label class="agree"><input type="checkbox" id="networkConfirm" /> 我已确认支付金额和钱包网络</label>
            </div>
          ` : ''}
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
        <div class="line"><span>余额抵扣</span><b>${checkoutBalanceUse(sku.priceUsdt).toFixed(2)} USDT</b></div>
        <div class="line"><span>剩余支付</span><b>${checkoutRemainder(sku.priceUsdt).toFixed(2)} USDT</b></div>
        <div class="line total"><span>应付金额</span>${price(sku.priceUsdt)}</div>
        <p class="summary-note">提交订单后会锁定应付金额。登录后，订单及发货信息将自动保存至「我的订单」。</p>
        <label class="agree"><input type="checkbox" id="agree" /> 我已阅读并同意 <a>购买须知</a> 与 <a>售后规则</a></label>
        <button class="primary" data-action="createOrder">${featureIcon('B04_lock_encryption.png', '安全支付')} ${state.user ? '确认并支付' : '登录后支付'}</button>
        <p class="secure">订单数据将自动保存至「我的订单」，登录后可随时查看订单状态与发货信息。</p>
      </aside>
    </section>
  `, 'page');
}

function cartPage() {
  const items = cartDetails();
  const total = items.reduce((sum, item) => sum + Number(item.sku.priceUsdt || 0), 0);
  shell(`
    <section class="cart-page">
      <div class="cart-head">
        <div>
          <p class="eyebrow">Shopping cart</p>
          <h1>购物车</h1>
        </div>
        <div class="cart-head-actions">
          ${items.length ? '<button class="secondary" data-action="clearCart" type="button">清空购物车</button>' : ''}
        </div>
      </div>
      ${items.length ? `
        <section class="cart-layout">
          <div class="cart-list">
            ${items.map((entry) => {
              const soldOut = (entry.sku.stockStatus || entry.sku.stock) === 'sold_out';
              return `
                <article class="cart-item">
                  <div class="cart-product">
                    ${icon(entry.product.icon)}
                    <div>
                      <h2>${entry.product.name}</h2>
                      <p>${Object.values(entry.options).join(' / ')}</p>
                      <div class="mini-tags"><span>${deliveryLabel(entry.sku.deliveryType)}</span><span>${stockLabel(entry.sku.stockStatus || entry.sku.stock)}</span></div>
                    </div>
                  </div>
                  <div class="cart-price">${price(entry.sku.priceUsdt)}</div>
                  <div class="cart-actions">
                    <button class="primary small" data-action="checkoutCartItem" data-key="${entry.key}" ${soldOut ? 'disabled' : ''}>去结算</button>
                    <button class="secondary small" data-action="removeCartItem" data-key="${entry.key}" type="button">移除</button>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
          <aside class="cart-summary glass">
            <h2>购物车摘要</h2>
            <div class="line"><span>商品数量</span><b>${items.length}</b></div>
            <div class="line"><span>预估金额</span><b>${total.toFixed(2)} USD</b></div>
            <div class="line total"><span>参考金额</span><b>${money(total)}</b></div>
            <p>当前订单系统按单个商品结算；如果需要购买多件，请逐项进入结算。</p>
          </aside>
        </section>
      ` : `
        <section class="empty-cart glass">
          ${navIcon('A06_shopping_cart.png', '空购物车', 'empty-cart-icon')}
          <h2>购物车还是空的</h2>
          <a class="primary link-button" href="/products">去选购商品</a>
        </section>
      `}
    </section>
  `, 'page');
}

function summaryRows(item, sku) {
  const rows = [
    ['商品', item.name],
    ['规格', Object.values(selectedOptions(item)).join(' / ')],
    ['订单归属', state.user ? `当前账号 @${state.user.username}` : '登录后自动绑定'],
    ['支付方式', state.paymentMethod === 'alipay' ? '支付宝' : state.paymentMethod === 'balance' ? '余额支付' : 'USDT-TRC20'],
    ['应付金额', `${sku.priceUsdt.toFixed(2)} USD ≈ ${money(sku.priceUsdt)}`]
  ];
  return `<div class="summary-rows">${rows.map(([a, b]) => `<span>${a}</span><b>${b}</b>`).join('')}</div>`;
}

function stepper(items, active) {
  return `<div class="stepper">${items.map((item, i) => `<span class="${i <= active ? 'active' : ''}"><b>${i + 1}</b>${item}</span>`).join('')}</div>`;
}

function createLocalOrder(item, sku) {
  const amount = Number(sku.priceUsdt || 0);
  const balanceUsed = checkoutBalanceUse(amount);
  const remainder = checkoutRemainder(amount);
  const paidByBalance = state.paymentMethod === 'balance' && remainder <= 0;
  if (state.paymentMethod === 'balance' && remainder > 0) {
    notify('余额不足，请选择支付宝或 USDT 组合支付');
    return null;
  }
  if (balanceUsed > 0) {
    state.wallet.balance = Number((Number(state.wallet.balance || 0) - balanceUsed).toFixed(2));
    walletLedger('订单消费', -balanceUsed, `${item.name} 余额抵扣`);
  }
  const id = `local_${Date.now()}`;
  const order = {
    id,
    orderNo: `CH${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Date.now()).slice(-5)}`,
    productName: item.name,
    productId: item.id,
    skuId: sku.id,
    icon: item.icon,
    options: selectedOptions(item),
    amountUsdt: amount,
    fiatCurrency: state.fiatCurrency,
    fiatAmount: money(amount),
    paymentMethod: state.paymentMethod,
    paymentNetwork: 'TRON',
    paymentAddress: 'TPPHD2bUCbRLEt7aBMRoWQbD3aY69NnEe6',
    payAmount: remainder || amount,
    payCurrency: 'USDT',
    balanceUsed,
    email: userEmail(),
    telegramUsername: state.user.username || userEmail().split('@')[0],
    deliveryType: sku.deliveryType,
    status: paidByBalance ? 'completed' : 'pending_payment',
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + 15 * 60 * 1000,
    updatedAt: new Date().toISOString(),
    paidAt: paidByBalance ? new Date().toISOString() : null,
    deliveredAt: paidByBalance ? new Date().toISOString() : null
  };
  saveOrder(order);
  addMessage(paidByBalance ? '订单已完成' : '订单已创建', paidByBalance ? `${item.name} 已使用余额支付并生成交付内容。` : `${item.name} 剩余 ${remainder.toFixed(2)} USDT 待支付。`, 'order');
  return order;
}

async function createOrder() {
  syncInputs();
  if (!state.user) {
    state.loginReturnTo = currentAppPath().startsWith('/products/') ? currentAppPath() : '/products';
    notify('请先使用邮箱登录后再支付');
    return navigate('/login');
  }
  const agree = document.querySelector('#agree');
  if (agree && !agree.checked) return notify('请先勾选购买须知与售后规则');
  const item = product();
  const sku = findSku(item);
  if (!sku || (sku.stockStatus || sku.stock) === 'sold_out') return notify('当前 SKU 无法购买，请重新选择规格');
  let serverOrder = null;
  const networkConfirm = document.querySelector('#networkConfirm');
  if (state.paymentMethod === 'usdt_trc20' && networkConfirm && !networkConfirm.checked) return notify('请先确认支付金额和钱包网络');
  if (state.user.authType === 'email') {
    const localOrder = createLocalOrder(item, sku);
    if (!localOrder) return;
    notify(localOrder.status === 'completed' ? '余额支付成功，订单已完成' : '订单已创建，请继续完成剩余支付');
    navigate(localOrder.status === 'completed' ? `/order/${localOrder.id}/success` : `/pay/${localOrder.id}`);
    return;
  }
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
  navigate(`/pay/${order.id}`);
}

function orders() {
  return JSON.parse(localStorage.getItem('gfOrders') || '[]');
}

function userOrderKey(order) {
  return order.id || order.orderNo;
}

function localOrdersForUser() {
  if (!state.user) return [];
  const username = normalizeTelegramUsername(state.user.username || '').toLowerCase();
  const email = userEmail().toLowerCase();
  return orders().filter((order) => {
    const orderUser = normalizeTelegramUsername(order.telegramUsername || '').toLowerCase();
    const orderEmail = String(order.email || '').toLowerCase();
    return (username && orderUser === username) || (email && orderEmail === email);
  });
}

function accountOrders() {
  const merged = new Map();
  [...state.accountOrders.items, ...localOrdersForUser()].forEach((order) => {
    if (order) merged.set(userOrderKey(order), order);
  });
  return [...merged.values()].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function filteredAccountOrders() {
  const list = accountOrders();
  const query = String(state.accountOrderSearch || '').trim().toLowerCase();
  const dateFrom = state.accountOrderDateFrom ? new Date(`${state.accountOrderDateFrom}T00:00:00`).getTime() : 0;
  const dateTo = state.accountOrderDateTo ? new Date(`${state.accountOrderDateTo}T23:59:59`).getTime() : 0;
  const groups = {
    paying: ['created', 'pending_payment', 'payment_confirming'],
    processing: ['paid', 'delivering'],
    done: ['completed'],
    issue: ['expired', 'failed', 'refunding', 'refunded']
  };
  const statusGroup = state.accountOrderStatus || state.accountOrderFilter;
  const filtered = list.filter((order) => {
    if (statusGroup && statusGroup !== 'all') {
      const allowed = groups[statusGroup] || [statusGroup];
      if (!allowed.includes(order.status)) return false;
    }
    if (query) {
      const haystack = [
        order.orderNo,
        order.productName,
        Object.values(order.options || {}).join(' '),
        order.email,
        order.telegramUsername,
        order.txHash
      ].join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    const created = new Date(order.createdAt || 0).getTime();
    if (dateFrom && created < dateFrom) return false;
    if (dateTo && created > dateTo) return false;
    return true;
  });
  return filtered.sort((a, b) => {
    if (state.accountOrderSort === 'amount_desc') return Number(b.amountUsdt || 0) - Number(a.amountUsdt || 0);
    if (state.accountOrderSort === 'amount_asc') return Number(a.amountUsdt || 0) - Number(b.amountUsdt || 0);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
}

function accountStats(list = accountOrders()) {
  return {
    total: list.length,
    paying: list.filter((order) => ['created', 'pending_payment', 'payment_confirming'].includes(order.status)).length,
    completed: list.filter((order) => order.status === 'completed').length,
    support: JSON.parse(localStorage.getItem('gfTickets') || '[]').length
  };
}

async function loadAccountOrders({ force = false } = {}) {
  if (!state.user || !authToken()) return;
  const loadedFor = `${state.user.id}:${authToken()}`;
  if (!force && (state.accountOrders.loading || state.accountOrders.loadedFor === loadedFor)) return;
  state.accountOrders = { ...state.accountOrders, loading: true, error: '' };
  if (currentAppPath() === '/account') route();
  try {
    const response = await fetch('/api/me/orders', {
      headers: { authorization: `Bearer ${authToken()}` }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || '订单同步失败');
    state.accountOrders = {
      loadedFor,
      loading: false,
      error: '',
      items: Array.isArray(data.orders) ? data.orders.map(normalizeServerOrder).filter(Boolean) : []
    };
  } catch (error) {
    state.accountOrders = {
      ...state.accountOrders,
      loadedFor: '',
      loading: false,
      error: error instanceof Error ? error.message : '订单同步失败'
    };
  }
  if (currentAppPath() === '/account') route();
}

async function saveAccountPreferences() {
  const select = document.querySelector('[data-action="accountCurrency"]');
  const nextCurrency = select?.value || state.fiatCurrency;
  const nicknameInput = document.querySelector('#profileNickname');
  const nextNickname = nicknameInput?.value.trim() || userNickname();
  if (nicknameInput && (!nextNickname || nextNickname.length > 20)) return notify('昵称需为 1-20 个字符');
  state.fiatCurrency = nextCurrency;
  state.profile.nickname = nextNickname;
  if (state.user) state.user.nickname = nextNickname;
  persist();
  if (!authToken()) {
    notify('偏好已保存在本机');
    return route();
  }
  try {
    const profileResponse = await fetch('/api/me/profile', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${authToken()}`
      },
      body: JSON.stringify({ nickname: nextNickname })
    });
    const profileData = await profileResponse.json().catch(() => ({}));
    if (!profileResponse.ok) throw new Error(profileData.error || '资料保存失败');

    const response = await fetch('/api/me/preferences', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${authToken()}`
      },
      body: JSON.stringify({ defaultCurrency: nextCurrency })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || '偏好保存失败');
    state.user.defaultCurrency = nextCurrency;
    state.user.nickname = profileData.user?.nickname || nextNickname;
    persist();
    notify('账号资料已保存');
    route();
  } catch (error) {
    notify(error instanceof Error ? error.message : '资料保存失败');
  }
}

async function changeAccountPassword() {
  const currentPassword = document.querySelector('#oldPassword')?.value || '';
  const newPassword = document.querySelector('#newPassword')?.value || '';
  if (!currentPassword) return notify('请输入旧密码');
  if (!PASSWORD_RULE_RE.test(newPassword)) return notify('新密码至少 6 位，需包含字母和数字');
  if (!authToken()) return notify('请先登录后修改密码');
  try {
    const response = await fetch('/api/me/password', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${authToken()}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || '密码修改失败');
    addMessage('密码已修改', '你的邮箱登录密码已更新。', 'account');
    notify('密码已修改');
    return route();
  } catch (error) {
    notify(error instanceof Error ? error.message : '密码修改失败');
  }
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
    paymentAddress: 'TPPHD2bUCbRLEt7aBMRoWQbD3aY69NnEe6',
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
  const paymentAmountValue = Number(order.payAmount || order.amountUsdt).toFixed(3);
  const paymentAmountText = `${paymentAmountValue} USDT`;
  const expiresAt = paymentExpiryMs(order.expiresAt, order.createdAt);
  const qrData = order.paymentAddress || paymentSummaryText(order);
  shell(`
    <section class="pay-waiting-layout">
      ${payStatusHero(order, paymentAmountText, expiresAt)}
      <section class="glass panel pay-info">
        <h3>订单信息</h3>
        ${[['订单号', order.orderNo + ' ⧉'], ['商品', `${order.productName}  ${Object.values(order.options || {}).join(' / ')}`], ['创建时间', timeFrom(order.createdAt)]].map(([a, b]) => `<div class="pay-row"><span>${a}</span><b>${b}</b></div>`).join('')}
      </section>
      <section class="glass panel qr-panel">
        <div class="qr-panel-title">
          <h3>请使用 ${paymentNetworkLabel()} 向以下地址转账</h3>
          <p>确认金额/网络 → 扫码或复制地址 → 转账 → 等待自动确认</p>
        </div>
        <div class="qr-wrap"><div class="real-qr" aria-label="收款地址二维码">${qrSvgMarkup(qrData)}</div></div>
        <div class="pay-fields">
          <div class="pay-copy-line pay-address-line">
            <label>${paymentIcon('C06_address.png', '收款地址')} 收款地址</label>
            <button class="copy-icon-button" data-copy="${escapeHtml(order.paymentAddress || '')}" type="button" aria-label="复制地址">${lineIcon('copy', '复制地址', 'copy-line-icon')}</button>
            <strong data-copy-dbl="${escapeHtml(order.paymentAddress || '')}" title="双击复制">${escapeHtml(order.paymentAddress || '')}</strong>
          </div>
          <div class="pay-copy-line">
            <label>${paymentIcon('C01_usdt.png', 'USDT')} 精确支付金额</label>
            <strong data-copy-dbl="${paymentAmountValue}" title="双击复制">${paymentAmountText} <small>≈ ${escapeHtml(order.fiatAmount || '')}</small></strong>
          </div>
          <div class="pay-copy-line">
            <label>${paymentIcon('C02_tron_trc20.png', '支付网络')} 支付网络</label>
            <strong data-copy-dbl="${paymentNetworkLabel()}" title="双击复制">${paymentNetworkLabel()}</strong>
          </div>
        </div>
        <div class="pay-flow-line">${paymentInstructionSteps()}</div>
        <p class="pay-auto-note">${lineIcon('clock', '自动确认', 'pay-note-icon')} 付款完成后无需点击按钮，系统链上校验成功后会自动跳转到订单详情。</p>
      </section>
      <section class="glass panel support"><b>遇到问题？联系在线客服 ${SUPPORT_TELEGRAM_HANDLE}</b><a href="${SUPPORT_TELEGRAM_URL}" target="_blank" rel="noopener">联系客服</a></section>
    </section>
  `, 'page');
  startTimer();
  startPaymentStatusPolling(order.id);
}

function statusTracker(items, status) {
  const index = { created: 0, pending_payment: 1, payment_confirming: 2, paid: 3, delivering: 3, completed: 4 }[status] || 0;
  return `<div class="status-tracker">${items.map((item, i) => `<span class="${i <= index ? 'active' : ''}"><b>${['✓', '◔', '⌛', '▤', '✓'][i]}</b>${item}</span>`).join('')}</div>`;
}

function startTimer() {
  const el = document.querySelector('.timer');
  if (!el) return;
  const update = () => {
    const expires = Number(el.dataset.expires);
    const left = Math.max(0, (Number.isFinite(expires) ? expires : Date.now() + 15 * 60 * 1000) - Date.now());
    const m = String(Math.floor(left / 60000)).padStart(2, '0');
    const s = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');
    el.textContent = `${m}:${s}`;
  };
  update();
  clearInterval(window.gfTimer);
  window.gfTimer = setInterval(update, 1000);
}

function stopPaymentStatusPolling() {
  if (window.gfPaymentPoller) {
    clearInterval(window.gfPaymentPoller);
    window.gfPaymentPoller = null;
  }
}

async function checkPaymentStatus(orderId, { silent = false } = {}) {
  if (!orderId) return;
  try {
    const response = await fetch(`/api/orders/${orderId}/status`);
    if (!response.ok) return;
    const status = await response.json();
    updatePayStatusUi(status.status);
    const paidStatuses = new Set(['payment_confirming', 'paid', 'delivering', 'completed']);
    if (paidStatuses.has(status.status)) {
      stopPaymentStatusPolling();
      notify('付款已确认，正在进入订单详情');
      navigate(`/order/${orderId}`);
    } else if (status.status === 'expired' && !silent) {
      notify('订单已超时，请重新下单');
    }
  } catch {
    if (!silent) notify('订单状态检查失败，请稍后重试');
  }
}

function updatePayStatusUi(status) {
  const root = document.querySelector('.pay-status-hero');
  const required = Number(root?.dataset.requiredConfirmations || 3);
  const meta = payStatusMeta(status, required);
  if (root) root.dataset.payStatus = status || 'pending_payment';
  const live = document.querySelector('[data-pay-live-status]');
  if (live) {
    live.textContent = meta.label;
    live.className = `pay-live-status ${meta.tone}`;
  }
  const desc = document.querySelector('[data-pay-live-desc]');
  if (desc) desc.textContent = `需要 ${meta.required} 个区块确认，${meta.desc}`;
  const confirmations = document.querySelector('[data-pay-confirmations]');
  if (confirmations) confirmations.textContent = meta.confirmations;
  const progress = document.querySelector('[data-pay-progress]');
  if (progress) progress.style.width = `${meta.progress}%`;
}

function startPaymentStatusPolling(orderId) {
  stopPaymentStatusPolling();
  checkPaymentStatus(orderId, { silent: true });
  window.gfPaymentPoller = setInterval(() => {
    if (currentAppPath() !== `/pay/${orderId}`) return stopPaymentStatusPolling();
    checkPaymentStatus(orderId, { silent: true });
  }, 5000);
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
        body: JSON.stringify({})
      });
      const deliveryResponse = await fetch(`/api/internal/orders/${order.id}/deliver`, { method: 'POST' });
      const deliveryResult = await deliveryResponse.json().catch(() => ({}));
      const refreshed = (await loadServerOrder(order.id)) || order;
      if (!deliveryResponse.ok || deliveryResult.nextAction === 'manual_delivery_required') {
        refreshed.status = deliveryResult.order?.status || refreshed.status || 'paid';
        saveOrder(refreshed);
        notify('订单已支付，当前 SKU 需要人工发货');
        navigate(`/order/${refreshed.id}`);
        return;
      }
      refreshed.status = 'completed';
      refreshed.paidAt = refreshed.paidAt || new Date().toISOString();
      refreshed.deliveredAt = refreshed.deliveredAt || new Date().toISOString();
      refreshed.events = [
        { label: '订单已创建', time: timeFrom(refreshed.createdAt || new Date().toISOString()) },
        { label: '已收到付款', time: now() },
        { label: '付款确认完成', time: now(24) },
        { label: '正在发货', time: now(30) },
        { label: '已完成', time: now(57) }
      ];
      saveOrder(refreshed);
      refreshed.delivery = refreshed.delivery || deliveryResult.delivery || null;
      notify('付款已确认，系统已自动发货');
      navigate(`/order/${refreshed.id}/success`);
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
      navigate(`/order/${order.id}/success`);
      return;
    }
  }
  notify('支付已提交，等待确认');
}

async function success(id) {
  const order = id === 'demo'
    ? { ...demoOrder(), status: 'completed', paidAt: new Date().toISOString(), deliveredAt: new Date().toISOString(), events: [{ label: '订单已创建', time: '2025-05-20 14:32:21' }, { label: '已收到付款', time: '2025-05-20 14:33:05' }, { label: '付款确认完成', time: '2025-05-20 14:33:29' }, { label: '正在发货', time: '2025-05-20 14:33:35' }, { label: '已完成', time: '2025-05-20 14:34:02' }] }
    : (await loadServerOrder(id)) || findExactOrder(id);
  if (!order) return home();
  const item = products.find((p) => p.id === order.productId) || products[0];
  const deliveryContent = order.delivery?.deliveryContent || '';
  const deliveryPreview = order.delivery?.maskedContent || (deliveryContent ? deliveryContent.slice(0, 3) + '***' : '等待发货记录');
  const events = order.events && order.events.length
    ? order.events
    : [
        { label: '订单已创建', time: timeFrom(order.createdAt) },
        { label: '已收到付款', time: timeFrom(order.paidAt || order.createdAt) },
        { label: '付款确认完成', time: timeFrom(order.paidAt || order.createdAt) },
        { label: '正在发货', time: timeFrom(order.deliveredAt || order.paidAt || order.createdAt) },
        { label: '已完成', time: timeFrom(order.deliveredAt || order.paidAt || order.createdAt) }
      ];
  shell(`
    <section class="success-hero glass">
      <div class="success-orb">${statusIcon('C08_payment_success.png', '支付成功')}</div>
      <div><h1>订单已完成，感谢您的购买！</h1><p>支付成功，订单已顺利完成，交付内容已归档到您的邮箱账号。</p><div class="mini-tags"><span>${featureIcon('B06_check_circle_success.png', '通知已发送')} 站内通知已发送</span><span>${featureIcon('B06_check_circle_success.png', '邮件已发送')} 邮件通知已发送</span><span>${featureIcon('B09_auto_delivery.png', '自动发货')} 安全可靠的自动发货系统</span></div></div>
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
        <div class="delivery-ok"><b>发货状态：已归档到邮箱账号</b><span>已完成</span></div>
        <div class="pay-row"><span>站内消息</span><b>已发送至右上角消息中心</b></div>
        <div class="pay-row"><span>邮箱</span><b>已发送至 ${order.email}</b></div>
        <div class="secret ${deliveryContent ? 'revealed' : ''}">
          <small>交付内容</small>
          <pre>${escapeHtml(deliveryContent || deliveryPreview)}</pre>
        </div>
        ${deliveryContent ? `<button class="secondary small" data-copy="${escapeHtml(deliveryContent)}" type="button">复制交付内容</button>` : '<a class="primary small link-button" href="/order/' + order.id + '">查看订单详情</a>'}
      </section>
      <section class="glass panel next-actions">
        <h3>后续操作</h3>
        <a href="/account">查看订单详情</a><a href="/">再次购买</a><a href="/account">前往个人中心</a><a href="${SUPPORT_TELEGRAM_URL}" target="_blank" rel="noopener">联系支持</a>
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
  const action = orderPrimaryAction(order);
  const deliveryContent = order.delivery?.deliveryContent || '';
  const deliverySummary = order.delivery?.maskedContent || (order.status === 'completed' ? '发货内容已发送，请联系售后补查。' : '付款确认后展示发货进度；自动发货失败会进入后台人工队列。');
  const events = order.events && order.events.length
    ? order.events
    : [
        { label: '订单创建', time: timeFrom(order.createdAt) },
        { label: statusLabel(order.status), time: timeFrom(order.updatedAt || order.paidAt || order.createdAt) },
        { label: order.status === 'completed' ? '交付完成' : '等待下一步', time: timeFrom(order.deliveredAt || order.updatedAt) }
      ];
  shell(`
    <section class="order-detail-page pro-page">
      <header class="pro-hero order-detail-hero">
        <div>
          <span class="pro-kicker">Order Detail</span>
          <h1>${escapeHtml(order.orderNo)}</h1>
          <p>${escapeHtml(order.productName)} · ${escapeHtml(Object.values(order.options || {}).join(' / ') || '标准规格')}</p>
        </div>
        <div class="pro-hero-actions">
          <a class="primary small link-button" href="${action.href}">${action.label}</a>
          <a class="secondary" href="/account">返回个人中心</a>
        </div>
      </header>

      <section class="order-state-panel">
        <div>
          <span>当前状态</span>
          <b class="order-status ${escapeHtml(order.status)}">${statusLabel(order.status)}</b>
          <small>${canPay ? '请在订单有效期内完成支付，超时需重新下单。' : '支付、发货和售后记录均会关联到该订单。'}</small>
        </div>
        ${statusTracker(['已创建', '等待付款', '确认付款', '发货中', '已完成'], order.status)}
      </section>

      <section class="order-detail-layout">
        <div class="order-detail-main">
          <section class="detail-panel-block">
            <div class="account-section-head"><div><h2>商品与金额</h2><p>下单时的商品快照和支付金额。</p></div></div>
            <div class="summary-product">${icon(item.icon)}<div><b>${escapeHtml(order.productName)}</b><small>${escapeHtml(Object.values(order.options || {}).join(' / '))}</small></div></div>
            <div class="detail-kv-grid">
              ${[
                ['订单金额', `${Number(order.amountUsdt || 0).toFixed(2)} USDT`],
                ['折合法币', order.fiatAmount || money(order.amountUsdt || 0, order.fiatCurrency)],
                ['支付网络', networkText(order.paymentNetwork)],
                ['发货方式', deliveryLabel(order.deliveryType)]
              ].map(([a, b]) => `<div><span>${a}</span><b>${escapeHtml(b)}</b></div>`).join('')}
            </div>
          </section>

          <section class="detail-panel-block">
            <div class="account-section-head"><div><h2>进度时间线</h2><p>用于排查支付识别、发货和售后节点。</p></div></div>
            <div class="detail-timeline">${events.map((event) => `<div><b>${escapeHtml(event.label)}</b><span>${escapeHtml(event.time || '-')}</span></div>`).join('')}</div>
          </section>

          <section class="detail-panel-block">
            <div class="account-section-head"><div><h2>交付与通知</h2><p>虚拟商品敏感内容会隐藏展示，完整内容通过邮箱与站内消息归档。</p></div></div>
            <div class="delivery-ok"><b>${order.status === 'completed' ? '发货已完成' : order.status === 'delivering' ? '发货处理中' : '等待付款后发货'}</b><span>${deliveryLabel(order.deliveryType)}</span></div>
            <div class="secret ${order.status === 'completed' ? 'revealed' : ''}">
              <small>交付摘要</small>
              ${deliveryContent ? `<pre>${escapeHtml(deliveryContent)}</pre><button class="secondary small" data-copy="${escapeHtml(deliveryContent)}" type="button">复制交付内容</button>` : `<p>${escapeHtml(deliverySummary)}</p>`}
            </div>
          </section>

          <section class="detail-panel-block">
            <div class="account-section-head"><div><h2>售后记录</h2><p>这里提交的工单会进入后台售后中心。</p></div></div>
            <div class="ticket-list">${ticketCardsForOrder(order)}</div>
          </section>
        </div>

        <aside class="order-detail-side">
          <section class="detail-panel-block">
            <h2>订单资料</h2>
            ${[
              ['订单号', order.orderNo],
              ['邮箱账号', order.email || userEmail()],
              ['邮箱', order.email || '-'],
              ['创建时间', timeFrom(order.createdAt)],
              ['更新时间', timeFrom(order.updatedAt)]
            ].map(([a, b]) => `<div class="account-field"><span>${a}</span><b>${escapeHtml(b)}</b></div>`).join('')}
            ${canPay ? `<a class="primary small link-button" href="/pay/${order.id}">继续支付</a>` : ''}
          </section>
          <section class="detail-panel-block support-ticket">
            <h2>提交售后</h2>
            <label>问题类型<select id="ticketType"><option>未收到发货</option><option>卡密无效</option><option>账号无法登录</option><option>少付/多付/错链</option><option>填写信息错误</option></select></label>
            <label>问题描述<textarea id="ticketBody" placeholder="描述问题，并补充截图链接、订单号或账号信息"></textarea></label>
            <button class="primary" data-action="submitTicket" data-id="${order.id}" type="button">提交售后工单</button>
          </section>
        </aside>
      </section>
    </section>
  `, 'page order-detail-shell');
}

async function lookup() {
  const result = state.lookupResult;
  const savedOrders = state.user ? accountOrders() : orders();
  shell(`
    <section class="lookup-page pro-page">
      <header class="pro-hero lookup-hero">
        <div>
          <span class="pro-kicker">Order Service</span>
          <h1>个人中心订单与售后</h1>
          <p>用订单号、邮箱或 TxID 查看订单；查询结果可直接继续支付、查看发货或提交售后。</p>
        </div>
        <div class="pro-hero-actions">
          <a class="secondary" href="/account">返回个人中心</a>
          <a class="primary small link-button" href="${SUPPORT_TELEGRAM_URL}" target="_blank" rel="noopener">联系支持</a>
        </div>
      </header>

      <section class="lookup-workbench">
        <div class="lookup-card">
          <div class="lookup-card-head">
            <div><h2>查询条件</h2><p>订单号与联系方式组合查询更安全，支付异常请联系人工客服核验。</p></div>
            <span>支持前台订单接口</span>
          </div>
          <div class="lookup-form-grid">
            <label>订单号<input id="lookupOrder" autocomplete="off" placeholder="GF20240527000123" /></label>
            <label>邮箱账号<input id="lookupContact" autocomplete="off" placeholder="name@example.com" /></label>
          </div>
          <button class="primary lookup-submit" data-action="lookupOrder" type="button">查询订单</button>
          <div class="lookup-rules">
            <span><b>1</b> 待付款订单可回到支付页</span>
            <span><b>2</b> 已发货订单可查看交付摘要</span>
            <span><b>3</b> 异常订单可提交售后工单</span>
          </div>
        </div>

        <aside class="lookup-side">
          <section>
            <h2>处理范围</h2>
            <div class="support-route"><b>未到账 / 少付 / 多付</b><span>联系人工客服进入支付核验。</span></div>
            <div class="support-route"><b>未收到发货</b><span>订单详情内提交售后，后台售后中心承接。</span></div>
            <div class="support-route"><b>信息填写错误</b><span>未发货前可申请人工修改。</span></div>
          </section>
        </aside>
      </section>

      ${result ? `<section class="lookup-result pro-section">
        <div class="account-section-head"><div><h2>查询结果</h2><p>已匹配到订单，可继续处理当前状态。</p></div><a href="/order/${result.id}">查看完整详情</a></div>
        ${accountOrderCard(result)}
      </section>` : ''}

      <section class="pro-section">
        <div class="account-section-head">
          <div><h2>${state.user ? '我的订单' : '本机订单'}</h2><p>${state.user ? '展示当前邮箱账号与本机缓存订单。' : '登录后可同步当前邮箱账号的线上订单。'}</p></div>
          ${state.user ? '<button class="secondary" data-action="refreshAccountOrders" type="button">同步订单</button>' : '<a class="secondary" href="/login">邮箱登录</a>'}
        </div>
        <div class="account-order-stack">${savedOrders.length ? savedOrders.slice(0, 8).map(accountOrderCard).join('') : accountEmptyOrders()}</div>
      </section>
    </section>
  `, 'page lookup-shell');
}

function orderItem(order, detail = false) {
  const canPay = ['created', 'pending_payment', 'payment_confirming'].includes(order.status);
  return `<a class="order-item" href="/order/${order.id}">
    <b>${order.orderNo}</b>
    <span>${order.productName}</span>
    <span class="order-status ${order.status}">${statusLabel(order.status)}</span>
    <strong>${Number(order.amountUsdt || 0).toFixed(2)} USDT</strong>
    ${canPay ? '<em>继续支付</em>' : ''}
    ${detail ? `<small>${Object.values(order.options || {}).join(' / ')} · ${order.telegramUsername || '-'} · ${order.email || '-'}</small>` : ''}
  </a>`;
}

function orderPrimaryAction(order) {
  if (!order) return { label: '查看详情', href: '/account', tone: 'neutral' };
  if (['created', 'pending_payment', 'payment_confirming'].includes(order.status)) return { label: '继续支付', href: `/pay/${order.id}`, tone: 'warning' };
  if (['paid', 'delivering'].includes(order.status)) return { label: '查看发货', href: `/order/${order.id}`, tone: 'info' };
  if (order.status === 'completed') return { label: '查看交付', href: `/order/${order.id}`, tone: 'success' };
  return { label: '处理异常', href: `/order/${order.id}`, tone: 'danger' };
}

function accountTimeline(orderList) {
  const tickets = JSON.parse(localStorage.getItem('gfTickets') || '[]');
  const orderEvents = orderList.slice(0, 4).map((order) => ({
    title: statusLabel(order.status),
    text: `${order.orderNo} · ${order.productName}`,
    time: order.updatedAt || order.createdAt,
    tone: orderPrimaryAction(order).tone
  }));
  const ticketEvents = tickets.slice(0, 2).map((ticket) => ({
    title: '售后工单',
    text: `${ticket.ticketNo || ticket.id} · ${ticket.orderNo || ticket.orderId || '订单待关联'}`,
    time: ticket.updatedAt || ticket.createdAt,
    tone: 'info'
  }));
  return [...orderEvents, ...ticketEvents]
    .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
    .slice(0, 5);
}

function accountOrderCard(order) {
  const action = orderPrimaryAction(order);
  const specs = Object.values(order.options || {}).filter(Boolean).join(' / ') || '标准规格';
  return `<article class="account-order-card">
    <div class="account-order-top">
      <div><span>${escapeHtml(timeFrom(order.createdAt))}</span><b>${escapeHtml(order.orderNo)}</b></div>
      <em class="order-status ${escapeHtml(order.status)}">${statusLabel(order.status)}</em>
    </div>
    <div class="account-order-body">
      <div>
        <strong>${escapeHtml(order.productName)}</strong>
        <small>${escapeHtml(specs)}</small>
      </div>
      <div class="account-order-money"><b>${Number(order.amountUsdt || 0).toFixed(2)} USDT</b><span>${escapeHtml(order.fiatAmount || money(order.amountUsdt || 0, order.fiatCurrency))}</span></div>
    </div>
    <div class="account-order-meta">
      <span>网络 ${escapeHtml(networkText(order.paymentNetwork || state.paymentNetwork))}</span>
      <span>发货 ${escapeHtml(deliveryLabel(order.deliveryType))}</span>
      <span>${escapeHtml(order.telegramUsername || '-')}</span>
      <a class="${action.tone}" href="${action.href}">${action.label}</a>
    </div>
  </article>`;
}

function accountDemoOrders() {
  return [
    { icon: 'discord', productName: 'Discord Nitro', specs: 'Global · 1个月', orderNo: 'CH20250528D0001', createdAt: '2025-05-28 14:32:18', amountUsdt: 1.8, delivery: '自动发货', payMethod: 'USDT (TRC20)', status: '已完成', statusTone: 'success', deliveredAt: '2025-05-28 14:32:25' },
    { icon: 'spotify', productName: 'Spotify Premium', specs: '个人版 · 1个月', orderNo: 'CH20250527Q0045', createdAt: '2025-05-27 11:08:36', amountUsdt: 2.2, delivery: '自动发货', payMethod: 'USDT (TRC20)', status: '已完成', statusTone: 'success' },
    { icon: 'youtube', productName: 'YouTube Premium', specs: '个人版 · 1个月', orderNo: 'CH20250526Q0112', createdAt: '2025-05-26 09:16:05', amountUsdt: 2.5, delivery: '自动发货', payMethod: 'USDT (TRC20)', status: '已完成', statusTone: 'success' },
    { icon: 'steam', productName: 'Steam Wallet', specs: '5 USD', orderNo: 'CH20250525Q0303', createdAt: '2025-05-25 18:42:31', amountUsdt: 5, delivery: '人工处理', payMethod: 'USDT (TRC20)', status: '处理中', statusTone: 'warning' },
    { icon: 'office', productName: 'Microsoft 365', specs: '个人版 · 1年', orderNo: 'CH20250524Q0777', createdAt: '2025-05-24 21:27:19', amountUsdt: 35, delivery: '自动发货', payMethod: 'USDT (TRC20)', status: '已完成', statusTone: 'success' }
  ];
}

function accountStatCards() {
  return [
    ['receipt', '全部订单', '128', '所有时间'],
    ['card', '待支付', '5', '等待支付'],
    ['headset', '处理中', '12', '已付款，处理中'],
    ['shield-check', '已完成', '98', '已发货，交易完成'],
    ['refund', '售后', '3', '申请中或待处理']
  ].map(([iconName, title, value, desc]) => `
    <article class="member-stat-card">
      <span>${lineIcon(iconName, title, 'member-stat-icon')}</span>
      <div><b>${escapeHtml(title)}</b><strong>${escapeHtml(value)}</strong><small>${escapeHtml(desc)}</small></div>
    </article>
  `).join('');
}

function accountOverviewCards(userName) {
  const cards = [
    ['个人信息', `<div class="overview-profile"><span><b>${escapeHtml(userName)}</b><small>ID：${escapeHtml(state.user?.id || '12345678')}</small></span></div>`, '编辑资料', 'profile'],
    ['账户余额', '<strong>128.60 <span>USDT</span></strong><div class="overview-actions"><button data-action="selectAccountSection" data-section="wallet" type="button">充值</button><button data-action="accountDemoAction" data-message="提现功能需要完成财务审核后开放" type="button">提现</button></div>', '', ''],
    ['邮箱账号', `<b>${escapeHtml(userEmail() || 'user@example.com')}</b><em class="bound">已绑定</em><small>暂不支持更换</small>`, ''],
    ['默认货币', `<b>${(CURRENCIES[state.user?.defaultCurrency] ? state.user.defaultCurrency : state.fiatCurrency)}</b>`, '更改货币', 'profile'],
    ['最近登录', '<b>2025-05-28 18:24</b><small>London, United Kingdom</small>', '查看登录记录', 'security'],
    ['通知设置', '<b>邮箱通知、订单更新、活动提醒等</b><em class="bound">已开启</em><label class="overview-switch"><input checked type="checkbox" /><span></span></label>', '']
  ];
  return cards.map(([title, body, action, section]) => `
    <article class="overview-card">
      <h3>${title}</h3>
      <div class="overview-body">${body}</div>
      ${action ? `<button data-action="selectAccountSection" data-section="${escapeHtml(section || 'profile')}" type="button">${action}</button>` : ''}
    </article>
  `).join('');
}

function accountOrderRows() {
  const rows = filteredAccountOrders();
  if (state.accountOrders.loading) return '<div class="account-empty"><b>正在同步订单</b><span>请稍候，正在拉取当前账号订单。</span></div>';
  if (state.accountOrders.error) return `<div class="account-empty"><b>订单同步失败</b><span>${escapeHtml(state.accountOrders.error)}</span><div><button class="primary small" data-action="refreshAccountOrders" type="button">重新同步</button></div></div>`;
  if (!rows.length) return accountEmptyOrders();
  return rows.map(accountOrderCard).join('');
}

function accountExpandedOrder(order) {
  return `
    <section class="expanded-detail">
      <div class="detail-column">
        <h3>订单信息</h3>
        ${[
          ['订单号', order.orderNo],
          ['下单时间', order.createdAt],
          ['支付方式', order.payMethod],
          ['支付金额', `${Number(order.amountUsdt).toFixed(2)} USDT`],
          ['订单状态', order.status]
        ].map(([label, value]) => `<p><span>${label}</span><b>${escapeHtml(value)}</b></p>`).join('')}
      </div>
      <div class="detail-column">
        <h3>商品信息</h3>
        <div class="detail-product">${icon(order.icon)}<span><b>${escapeHtml(order.productName)}</b><small>${escapeHtml(order.specs)}</small></span></div>
        <p><span>数量</span><b>x 1</b></p>
        <p><span>价格</span><b>${Number(order.amountUsdt).toFixed(2)} USDT</b></p>
      </div>
      <div class="detail-column delivery-content">
        <h3>交付内容</h3>
        <div class="masked-delivery">
          <p>**************************************</p>
          <p>**************************************</p>
          <p>**************************************</p>
          <p>**************************************</p>
          <button class="icon-only" data-action="accountDemoAction" data-message="真实订单交付后可显示完整内容" type="button">${lineIcon('eye', '显示内容', 'field-icon')}</button>
          <button class="icon-only" data-copy="Discord-Nitro-2025!" type="button">${lineIcon('copy', '复制内容', 'field-icon')}</button>
        </div>
        <div class="delivery-actions"><button class="primary small" data-action="accountDemoAction" data-message="真实订单交付后可显示完整内容" type="button">显示内容</button><button class="secondary small" data-action="accountDemoAction" data-message="凭证下载会在真实订单交付后开放" type="button">下载凭证</button><a class="secondary small link-button" href="${SUPPORT_TELEGRAM_URL}" target="_blank" rel="noopener">联系客服</a></div>
      </div>
    </section>
  `;
}

function accountSections() {
  return [
    { key: 'orders', label: '我的订单', icon: 'receipt', desc: '查看和管理您的订单，追踪订单状态与售后进度。' },
    { key: 'wallet', label: '余额中心', icon: 'card', desc: '管理 USDT 余额、充值记录、消费流水和组合支付。' },
    { key: 'support', label: '售后服务', icon: 'headset', desc: '如需对订单或充值相关问题发起售后申请，欢迎随时与我们联系。' },
    { key: 'profile', label: '账号设置', icon: 'shield-check', desc: '管理您的账号与安全设置，保障账号安全与使用体验。' },
    { key: 'help', label: '帮助中心', icon: 'more', desc: '查看购买、充值、TRC20 支付、发货和售后规则。' }
  ];
}

function accountSectionPanel(section) {
  const map = {
    orders: accountOrdersPanel,
    content: accountContentPanel,
    wallet: accountWalletPanel,
    walletLedger: accountWalletLedgerPanel,
    support: accountSupportPanel,
    supportDetail: accountSupportDetailPanel,
    profile: accountProfilePanel,
    security: accountSecurityPanel,
    notifications: accountNotificationsPanel,
    help: accountHelpPanel
  };
  return (map[section] || accountOrdersPanel)();
}

function accountSectionMeta(section) {
  if (section === 'walletLedger') {
    return { key: 'walletLedger', label: '全部流水', desc: '查看账户全部余额流水、充值记录与消费记录。' };
  }
  if (section === 'supportDetail') {
    return { key: 'supportDetail', label: '售后详情', desc: '查看售后工单进度、问题描述与处理记录。' };
  }
  return accountSections().find((item) => item.key === section) || accountSections()[0];
}

function accountOrdersPanel() {
  const filters = [
    ['all', '全部订单'],
    ['paying', '待支付'],
    ['processing', '处理中'],
    ['done', '已完成'],
    ['issue', '售后/异常']
  ];
  const rows = filteredAccountOrders();
  return `
    <nav class="order-tabs">
      ${filters.map(([value, label]) => `<button class="${state.accountOrderFilter === value ? 'active' : ''}" data-action="accountOrderFilter" data-filter="${value}" type="button">${label}</button>`).join('')}
    </nav>
    <section class="order-filter-bar">
      <label>${navIcon('A09_search.png', '搜索', 'filter-icon')}<input data-action="accountOrderSearch" value="${escapeHtml(state.accountOrderSearch)}" placeholder="搜索订单号或商品名称" /></label>
      <label class="date-range"><input data-action="accountOrderDateFrom" type="date" value="${escapeHtml(state.accountOrderDateFrom)}" /><span>至</span><input data-action="accountOrderDateTo" type="date" value="${escapeHtml(state.accountOrderDateTo)}" /></label>
      <select data-action="accountOrderStatus">${optionHtml([{ label: '全部状态', value: '' }, { label: '待支付', value: 'paying' }, { label: '处理中', value: 'processing' }, { label: '已完成', value: 'done' }, { label: '异常/售后', value: 'issue' }], state.accountOrderStatus)}</select>
      <select data-action="accountOrderSort">${optionHtml([{ label: '最新下单', value: 'newest' }, { label: '金额从高到低', value: 'amount_desc' }, { label: '金额从低到高', value: 'amount_asc' }], state.accountOrderSort)}</select>
      <button data-action="exportAccountOrders" type="button">导出订单</button>
      <button data-action="refreshAccountOrders" type="button">同步订单</button>
    </section>
    <section class="member-order-list">
      ${accountOrderRows()}
    </section>
    <section class="member-pagination">
      <span>共 ${rows.length} 条订单</span>
      <div><button disabled type="button">‹</button><button class="active" type="button" disabled>1</button><button disabled type="button">›</button></div>
      <select disabled><option>当前全部显示</option></select>
    </section>
  `;
}

function exportAccountOrders() {
  const rows = filteredAccountOrders();
  if (!rows.length) return notify('当前筛选下没有可导出的订单');
  const header = ['订单号', '商品', '规格', '状态', '金额 USDT', '邮箱', 'Telegram', '创建时间'];
  const csvRows = rows.map((order) => [
    order.orderNo,
    order.productName,
    Object.values(order.options || {}).join(' / '),
    statusLabel(order.status),
    Number(order.amountUsdt || 0).toFixed(2),
    order.email || '',
    order.telegramUsername || '',
    timeFrom(order.createdAt)
  ]);
  const csv = [header, ...csvRows]
    .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ichuhai-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  notify('订单 CSV 已导出');
}

function accountContentPanel() {
  const items = [
    ['卡密', 'Discord Nitro', 'DNBP-XXXX-XXXX-XXXX'],
    ['账号密码', 'Spotify Premium', 'sp_user@example.com / ********'],
    ['兑换码', 'Steam Wallet', 'STEAM-5USD-2025'],
    ['链接', 'YouTube Premium', 'https://youtube.com/redeem'],
    ['文字说明', 'Microsoft 365', '按发货邮件步骤登录并激活，首次使用请勿切换地区。']
  ];
  return `<section class="member-panel">
    <div class="section-toolbar"><b>已交付内容</b><select><option>全部商品</option><option>卡密</option><option>账号密码</option><option>兑换码</option><option>链接</option></select></div>
    <div class="content-grid">
      ${items.map(([type, productName, content]) => `<article class="content-card">
        <span>${escapeHtml(type)}</span>
        <h3>${escapeHtml(productName)}</h3>
        <p>${escapeHtml(content)}</p>
        <div><button data-copy="${escapeHtml(content)}" type="button">复制</button><button data-action="selectAccountSection" data-section="support" type="button">申请售后</button></div>
      </article>`).join('')}
    </div>
  </section>`;
}

function accountWalletPanel() {
  return `<section class="wallet-dashboard">
    <section class="wallet-hero-card">
      <div>
        <span>当前余额</span>
        <strong>${Number(state.wallet.balance || 0).toFixed(2)} <small>USDT</small></strong>
        <p>≈ ¥813.42 CNY ${lineIcon('eye-off', '隐藏折算金额', 'wallet-eye-icon')}</p>
      </div>
      <i></i>
    </section>
    <form class="wallet-recharge-card">
      <h3>充值</h3>
      <label>充值金额<div class="wallet-amount-field"><input id="rechargeAmount" type="number" min="1" step="0.01" value="100" /><b>USDT</b></div></label>
      <div class="wallet-method-block">
        <span>充值方式</span>
        <div class="wallet-methods">
          ${walletPaymentMethod('alipay', '支付宝', '即时到账，推荐使用', true)}
          ${walletPaymentMethod('usdt_trc20', 'USDT-TRC20', '链上转账，低手续费', false)}
        </div>
      </div>
      <button class="wallet-submit" data-action="createRecharge" type="button">立即充值</button>
      <small>${lineIcon('warning', '提示', 'wallet-note-icon')} 选择支付方式，系统会按实时汇率结算人民币支付金额。</small>
    </form>
    <section class="wallet-ledger-card">
      <div class="wallet-section-head"><h2>余额流水</h2><button data-action="selectAccountSection" data-section="walletLedger" type="button">查看全部 ${lineIcon('chevron', '查看全部', 'wallet-link-icon')}</button></div>
      ${walletLedgerTable(accountWalletLedgerEntries().slice(0, 5), { compact: true })}
    </section>
  </section>`;
}

function walletPaymentMethod(value, title, desc, active) {
  const checked = state.rechargeDraft.method === value || (!state.rechargeDraft.method && active);
  return `<button class="${checked ? 'active' : ''}" data-action="setRechargeMethod" data-method="${escapeHtml(value)}" type="button">
    <i>${value === 'alipay' ? '支' : ''}</i>
    <span><b>${escapeHtml(title)}</b><small>${escapeHtml(desc)}</small></span>
  </button>`;
}

function accountWalletLedgerEntries() {
  const demo = [
    { type: '充值', amount: 13.85, method: '支付宝', detail: '订单号：CZ250623001234', time: '2025-06-23 20:10:32', status: '成功', tone: 'success', icon: 'card' },
    { type: '订单支付', amount: -1.8, method: '', detail: '订单号：CH20260623001234', time: '2025-06-23 20:09:15', status: '成功', tone: 'success', icon: 'cart' },
    { type: '充值', amount: 20, method: 'USDT-TRC20', detail: 'TxID：7f9ca...afb2c3d4e5f6', time: '2025-05-22 18:21:44', status: '成功', tone: 'success', icon: 'card' },
    { type: '退款', amount: 1.8, method: '订单号：CH20205220000987', detail: '退款至：钱包', time: '2025-05-22 16:33:21', status: '成功', tone: 'success', icon: 'refund' },
    { type: '充值', amount: 15, method: 'USDT-TRC20', detail: 'TxID：7e6b...9d8a7f96d5b4c3', time: '2025-05-22 16:10:05', status: '待确认', tone: 'warning', icon: 'card' },
    { type: '订单支付', amount: -3.9, method: '', detail: '订单号：CH20260622001032', time: '2025-05-21 14:22:11', status: '成功', tone: 'success', icon: 'cart' },
    { type: '充值', amount: 50, method: '支付宝', detail: '订单号：CZ250620008765', time: '2025-05-20 09:43:08', status: '成功', tone: 'success', icon: 'card' },
    { type: '提现退款', amount: 5, method: '系统退款', detail: '备注：支付失败返还', time: '2025-05-18 16:51:20', status: '已完成', tone: 'success', icon: 'refund' }
  ];
  const local = (state.wallet.ledger || []).map((item) => ({
    type: item.type || '余额变动',
    amount: Number(item.amount || 0),
    method: item.note || '',
    detail: '',
    time: timeFrom(item.createdAt || new Date().toISOString()),
    status: item.status === 'pending' ? '待确认' : '成功',
    tone: item.status === 'pending' ? 'warning' : 'success',
    icon: Number(item.amount || 0) < 0 ? 'cart' : 'card'
  }));
  return local.length ? demo.concat(local).slice(0, 12) : demo;
}

function walletLedgerTable(rows, options = {}) {
  return `<div class="wallet-ledger-table ${options.compact ? 'compact' : ''}">
    <div class="wallet-ledger-head"><span>类型</span><span>金额</span><span>方式 / 详情</span><span>时间</span><span>状态</span></div>
    ${rows.map((item) => `<div class="wallet-ledger-row">
      <div class="wallet-ledger-type"><i>${lineIcon(item.icon || 'card', item.type, 'wallet-row-icon')}</i><b>${escapeHtml(item.type)}</b></div>
      <strong class="${Number(item.amount) >= 0 ? 'positive' : 'negative'}">${Number(item.amount) >= 0 ? '+' : '-'}${Math.abs(Number(item.amount)).toFixed(Number.isInteger(Math.abs(Number(item.amount))) ? 2 : 2)} USDT</strong>
      <p><b>${escapeHtml(item.method || item.detail)}</b>${item.method && item.detail ? `<small>${escapeHtml(item.detail)}</small>` : ''}</p>
      <time>${escapeHtml(item.time)}</time>
      <em class="${escapeHtml(item.tone)}">${escapeHtml(item.status)}</em>
    </div>`).join('')}
  </div>`;
}

function accountWalletLedgerPanel() {
  return `<section class="wallet-all-page">
    <section class="wallet-ledger-filter">
      <label>${lineIcon('search', '搜索', 'filter-icon')}<input placeholder="搜索订单号 / TxID / 备注" /></label>
      <label class="date-range">${lineIcon('calendar', '日期', 'filter-icon')}<input placeholder="开始日期" /><span>-</span><input placeholder="结束日期" />${lineIcon('calendar', '日期', 'filter-icon')}</label>
      <select><option>全部类型</option><option>充值</option><option>订单支付</option><option>退款</option></select>
      <select><option>全部状态</option><option>成功</option><option>待确认</option><option>已完成</option></select>
      <select><option>最新记录</option><option>金额从高到低</option></select>
      <button data-action="accountDemoAction" data-message="导出记录需要真实流水接口接入后生成文件" type="button">${lineIcon('download', '导出记录', 'wallet-export-icon')} 导出记录</button>
    </section>
    <section class="wallet-ledger-card all">
      <div class="wallet-section-head"><h2>余额流水</h2><span>共 128 条记录</span></div>
      ${walletLedgerTable(accountWalletLedgerEntries())}
      <section class="member-pagination wallet-pagination">
        <span></span>
        <div><button data-action="accountDemoAction" data-message="已经是第一页" type="button">‹</button><button class="active" type="button" disabled>1</button><button data-action="accountDemoAction" data-message="演示数据仅展示第一页" type="button">2</button><button data-action="accountDemoAction" data-message="演示数据仅展示第一页" type="button">3</button><button data-action="accountDemoAction" data-message="演示数据仅展示第一页" type="button">4</button><button data-action="accountDemoAction" data-message="演示数据仅展示第一页" type="button">5</button><em>...</em><button data-action="accountDemoAction" data-message="演示数据仅展示第一页" type="button">13</button><button data-action="accountDemoAction" data-message="演示数据仅展示第一页" type="button">›</button></div>
        <select><option>10 条/页</option></select>
      </section>
    </section>
  </section>`;
}

function accountSupportPanel() {
  const ordersForSelect = accountOrders();
  const tickets = accountSupportTickets();
  return `<section class="support-service-page">
    <form class="support-apply-card">
      <h3>发起售后申请</h3>
      <label><span><i>*</i> 关联订单</span><select id="supportOrder"><option value="">请选择关联订单</option>${ordersForSelect.map((order) => `<option value="${escapeHtml(order.orderNo)}">${escapeHtml(order.orderNo)} · ${escapeHtml(order.productName || '')}</option>`).join('')}</select></label>
      <label><span><i>*</i> 问题类型</span><select id="supportType"><option value="">请选择问题类型</option><option>充值未到账</option><option>商品未到账</option><option>支付成功未到账</option><option>充值金额错误</option></select></label>
      <label class="support-desc"><span><i>*</i> 问题描述</span><textarea id="supportBody" maxlength="500" placeholder="请详细描述您遇到的问题，以便我们更好地为您提供帮助（最多 500 字）"></textarea><em>0 / 500</em></label>
      <button class="support-submit" data-action="createSupportTicket" type="button">提交申请</button>
      <small>${lineIcon('warning', '提示', 'support-note-icon')} 提交后我们将在 24 小时内处理，请耐心等待。</small>
    </form>
    <section class="support-record-card">
      <h3>售后记录</h3>
      <div class="support-record-table">
        <div class="support-record-head"><span>工单号</span><span>关联订单</span><span>问题类型</span><span>提交时间</span><span>状态</span><span>操作</span></div>
        ${tickets.length ? tickets.map((ticket) => `<div class="support-record-row">
          <b>${escapeHtml(ticket.ticketNo)}</b>
          <span>${escapeHtml(ticket.orderNo)}</span>
          <span>${escapeHtml(ticket.type)}</span>
          <time>${escapeHtml(timeFrom(ticket.createdAt))}</time>
          <em class="${escapeHtml(ticket.tone || 'pending')}">${escapeHtml(ticket.status)}</em>
          <button data-action="openSupportDetail" data-ticket="${escapeHtml(ticket.ticketNo)}" type="button">查看详情</button>
        </div>`).join('') : '<div class="account-empty"><b>暂无售后记录</b><span>提交后会在这里跟进处理进度。</span></div>'}
      </div>
      <section class="support-table-foot">
        <span>共 ${tickets.length} 条</span>
        <div><button disabled type="button">‹</button><button class="active" disabled type="button">1</button><button disabled type="button">›</button></div>
        <select><option>10 条/页</option></select>
      </section>
    </section>
  </section>`;
}

function accountSupportTickets() {
  return JSON.parse(localStorage.getItem('gfTickets') || '[]')
    .map((ticket) => ({
      ...ticket,
      ticketNo: ticket.ticketNo || ticket.ticket_no || ticket.id,
      orderNo: ticket.orderNo || ticket.order_no || ticket.orderId || '',
      type: ticket.type || '其他问题',
      status: ticket.status || '待处理',
      tone: ticket.tone || (ticket.status === '已解决' ? 'resolved' : 'pending'),
      createdAt: ticket.createdAt || ticket.created_at || new Date().toISOString(),
      notes: Array.isArray(ticket.notes) ? ticket.notes : []
    }))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function accountSupportDetailPanel() {
  const tickets = accountSupportTickets();
  const ticket = tickets.find((item) => item.ticketNo === state.accountSupportTicket) || tickets[0];
  if (!ticket) return `<section class="member-panel"><div class="account-empty"><b>暂无售后详情</b><span>请先提交售后申请。</span><div><button class="primary small" data-action="selectAccountSection" data-section="support" type="button">返回售后服务</button></div></div></section>`;
  const notes = ticket.notes || [];
  return `<section class="support-detail-page">
    <section class="support-detail-summary">
      <div class="support-detail-kv">
        ${[
          ['工单号', ticket.ticketNo],
          ['关联订单', ticket.orderNo],
          ['提交时间', timeFrom(ticket.createdAt)],
          ['问题类型', ticket.type],
          ['当前状态', `<em class="${escapeHtml(ticket.tone || 'pending')}">${escapeHtml(ticket.status)}</em>`]
        ].map(([label, value]) => `<p><span>${label}</span><b>${value}</b></p>`).join('')}
      </div>
      <div class="support-progress">
        <div class="support-progress-line"></div>
        ${[
          ['✓', '已提交', timeFrom(ticket.createdAt), 'done'],
          ['2', ticket.status === '已解决' ? '已解决' : '处理中', timeFrom(ticket.updatedAt || ticket.createdAt), 'active'],
          ['3', '已解决', '待完成', '']
        ].map(([num, title, time, cls]) => `<div class="support-step ${cls}">
          <i>${escapeHtml(num)}</i><b>${escapeHtml(title)}</b><span>${escapeHtml(time)}</span>
        </div>`).join('')}
      </div>
    </section>
    <section class="support-detail-grid">
      <article class="support-info-card problem">
        <h3>问题详情</h3>
        <p>${escapeHtml(ticket.description || '暂无问题描述')}</p>
        <div><span>提交人</span><b>${escapeHtml(userNickname())}</b></div>
      </article>
      <article class="support-info-card order">
        <h3>关联订单信息</h3>
        ${[
          ['订单号', ticket.orderNo],
          ['类型', ticket.type],
          ['账号', userEmail()],
          ['当前状态', ticket.status],
          ['更新时间', timeFrom(ticket.updatedAt || ticket.createdAt)]
        ].map(([label, value]) => `<p><span>${label}</span><b>${value}</b></p>`).join('')}
      </article>
    </section>
    <section class="support-process-card">
      <h3>处理记录</h3>
      ${[
        ['check', timeFrom(ticket.createdAt), '用户提交售后申请', 'submit'],
        ['clock', timeFrom(ticket.updatedAt || ticket.createdAt), '系统已受理，等待客服处理', 'system'],
        ...notes.map((note) => ['headset', timeFrom(note.createdAt), note.text, 'reply'])
      ].map(([iconName, time, text, cls]) => `<div class="support-process-row ${cls}">
        <i>${lineIcon(iconName, text, 'support-process-icon')}</i><time>${escapeHtml(time)}</time><b>${escapeHtml(text)}</b>
      </div>`).join('')}
    </section>
    <section class="support-supplement-card">
      <h3>补充说明</h3>
      <textarea id="supportSupplement" maxlength="500" placeholder="请补充更多信息，以便我们更快为您处理（最多 500 字）"></textarea>
      <em>0/500</em>
      <button data-action="appendSupportNote" data-ticket="${escapeHtml(ticket.ticketNo)}" type="button">提交补充说明</button>
    </section>
  </section>`;
}

function accountProfilePanel() {
  return `<section class="account-settings-card">
    <form class="account-password-form">
      <label><span>昵称</span><input id="profileNickname" maxlength="20" value="${escapeHtml(userNickname())}" placeholder="请输入昵称" /></label>
      <label><span>邮箱账号</span><input value="${escapeHtml(userEmail())}" disabled /></label>
      <label><span>默认货币</span><select data-action="accountCurrency">${optionHtml(Object.keys(CURRENCIES).map((code) => ({ label: `${CURRENCIES[code].flag} ${code}`, value: code })), state.fiatCurrency)}</select></label>
      <button class="settings-submit" data-action="saveAccountPrefs" type="button">保存账号资料</button>
    </form>
    ${accountNotificationsPanel()}
    <form class="account-password-form">
      <label><span>旧密码</span><div class="settings-password-field"><input id="oldPassword" type="password" placeholder="请输入旧密码" />${lineIcon('eye', '显示旧密码', 'settings-eye-icon')}</div></label>
      <label><span>新密码</span><div class="settings-password-field"><input id="newPassword" type="password" placeholder="请输入新密码" />${lineIcon('eye', '显示新密码', 'settings-eye-icon')}</div></label>
      <button class="settings-submit" data-action="changePassword" type="button">修改密码</button>
    </form>
  </section>`;
}

function accountSecurityPanel() {
  return `<section class="support-layout">
    <form class="member-panel support-form">
      <h3>修改密码</h3>
      <label>当前密码<input id="oldPassword" type="password" /></label>
      <label>新密码<input id="newPassword" type="password" /></label>
      <button class="primary" data-action="changePassword" type="button">更新密码</button>
    </form>
    <section class="member-panel">
      <div class="section-toolbar"><b>最近登录记录</b><button data-action="logoutAccount" type="button">退出当前设备</button></div>
      <div class="ledger-list">
        <div><span>邮箱密码登录</span><b>${escapeHtml(userEmail())}</b><small>${escapeHtml(timeFrom(new Date().toISOString()))} · 当前浏览器</small><em>正常</em></div>
      </div>
      <p class="muted">暂不启用 2FA。后续可接入设备会话管理和退出其他设备接口。</p>
    </section>
  </section>`;
}

function accountNotificationsPanel() {
  const prefs = [
    ['email', '邮件通知', '订单、充值、售后结果发送到邮箱'],
    ['site', '站内通知', '右上角消息中心展示通知记录'],
    ['payment', '订单支付', '待支付、支付成功和支付失败提醒'],
    ['delivery', '发货完成', '自动/人工发货完成提醒'],
    ['support', '售后回复', '工单状态变化和客服回复提醒'],
    ['wallet', '余额变动', '充值、消费、退款和后台调整提醒']
  ];
  return `<section class="member-panel">
    <div class="account-pref-list">
      ${prefs.map(([key, title, text]) => `<label class="account-pref"><input type="checkbox" data-action="toggleAccountPref" data-pref="${key}" ${state.accountPrefs[key] ? 'checked' : ''}/><span><b>${title}</b><small>${text}</small></span></label>`).join('')}
    </div>
    <button class="primary small" data-action="saveAccountPrefs" type="button">保存通知设置</button>
  </section>`;
}

function accountHelpPanel() {
  const faqs = [
    ['购买说明', '选择商品和规格后进入结算，订单会绑定当前邮箱账号。'],
    ['充值说明', '余额单位为 USDT，支付宝通过第三方聚合支付折算入账。'],
    ['USDT TRC20 支付说明', '仅支持 TRC20，转账金额和网络必须与订单一致，到账后进入确认。'],
    ['发货说明', '自动发货会展示卡密、账号密码、兑换码、链接或文字说明；人工商品由后台处理。'],
    ['售后规则', '用户提交工单后，后台人工处理补发、退款、驳回或继续沟通。']
  ];
  return `<section class="member-panel help-list">
    ${faqs.map(([title, text]) => `<article><b>${escapeHtml(title)}</b><p>${escapeHtml(text)}</p></article>`).join('')}
    <a class="secondary small link-button" href="${SUPPORT_TELEGRAM_URL}" target="_blank" rel="noopener">联系客服</a>
  </section>`;
}

function ticketCardsForOrder(order) {
  const tickets = JSON.parse(localStorage.getItem('gfTickets') || '[]')
    .filter((ticket) => {
      const ticketOrderId = ticket.orderId || ticket.order_id;
      const ticketOrderNo = ticket.orderNo || ticket.order_no;
      return [ticketOrderId, ticketOrderNo].includes(order.id) || [ticketOrderId, ticketOrderNo].includes(order.orderNo);
    });
  if (!tickets.length) return '<div class="detail-empty">暂无售后工单，遇到发货、兑换或支付问题可在右侧提交。</div>';
  return tickets.map((ticket) => `<div class="ticket-card">
    <b>${escapeHtml(ticket.ticketNo || ticket.ticket_no || ticket.id)}</b>
    <span>${escapeHtml(ticket.type || '售后问题')} · ${escapeHtml(ticket.status || 'open')}</span>
    <small>${escapeHtml(ticket.description || '')}</small>
  </div>`).join('');
}

function productsPage() {
  shell(`<section class="catalog-home">${productBrowser(true)}</section>`, 'page catalog-page');
}

function account() {
  if (!state.user) {
    shell(`
      <section class="account-console account-console-guest">
        <div class="account-console-panel">
          <span class="console-eyebrow">Account Center</span>
          <h1>登录后管理订单、余额与售后</h1>
          <p>使用邮箱账号登录。注册后系统会分配昵称，邮箱作为登录账号暂时不能更换。</p>
          <div class="console-actions">
            <a class="primary account-login" href="/login">${navIcon('A07_user_login.png', '登录')} 邮箱登录</a>
            <a class="secondary" href="/login">创建账号</a>
            <a class="secondary" href="/account">查看订单</a>
          </div>
        </div>
        <div class="account-guest-modules">
          ${[
            ['订单', '查看待付款、发货中和已完成订单'],
            ['余额', '充值、流水和组合支付记录'],
            ['内容', '查看卡密、账号密码、兑换码、链接和文字说明'],
            ['售后', '提交工单并跟进后台人工处理']
          ].map(([title, text]) => `<div><b>${title}</b><span>${text}</span></div>`).join('')}
        </div>
      </section>
    `, 'page account-console-shell');
    return;
  }

  const userName = userNickname();
  const section = state.accountSection || 'orders';
  const sectionMeta = accountSectionMeta(section);
  const isProfileSection = section === 'profile';
  shell(`
    <section class="member-center ${isProfileSection ? 'settings-member-center' : ''}">
      <aside class="member-sidebar">
        ${isProfileSection ? `
          <div class="member-user settings-user">
            ${icon('discord')}
            <h2>${escapeHtml(userName)}</h2>
            <p>${escapeHtml(userEmail())}</p>
            <em>ID： ${escapeHtml(state.user.id)}</em>
            <div class="member-balance"><span>账户余额</span><b>${Number(state.wallet.balance || 0).toFixed(2)} USDT</b><button data-action="selectAccountSection" data-section="wallet" type="button">充值</button></div>
          </div>
        ` : `
          <div class="member-user">
            <h2>${escapeHtml(userName)}</h2>
            <div class="member-balance"><span>账户余额</span><b>${Number(state.wallet.balance || 0).toFixed(2)} USDT</b></div>
            <button data-action="selectAccountSection" data-section="wallet" type="button">充值</button>
          </div>
        `}
        <nav class="member-nav">
          ${accountSections().map((item) => `<button class="${item.key === section || (item.key === 'wallet' && section === 'walletLedger') || (item.key === 'support' && section === 'supportDetail') ? 'active' : ''}" data-action="selectAccountSection" data-section="${item.key}" type="button">${lineIcon(item.icon, item.label, 'member-nav-icon')}${item.label}</button>`).join('')}
        </nav>
        <button class="member-logout" data-action="logoutAccount" type="button">退出登录</button>
      </aside>

      <section class="member-main">
        <header class="member-title">
          <h1>${isProfileSection ? escapeHtml(sectionMeta.label) : `个人中心 / ${escapeHtml(sectionMeta.label)}`}</h1>
          <p>${escapeHtml(sectionMeta.desc)}</p>
        </header>

        ${accountSectionPanel(section)}
      </section>
    </section>
  `, 'member-page');

  if (state.user) queueMicrotask(() => loadAccountOrders());
}

function accountEmptyOrders() {
  return `
    <div class="account-empty">
      <b>当前账号暂无订单</b>
      <span>购买后订单会自动出现在这里；如果你在其他设备下过单，可用订单号和邮箱找回。</span>
      <div><a class="primary small link-button" href="/products">去选购商品</a><a class="secondary link-button" href="/account">查看订单</a></div>
    </div>
  `;
}

function isAdminLocked() {
  return state.config.admin?.authMode === 'token' && !state.adminToken;
}

function adminLoginPanel() {
  return `
    <section class="admin-shell admin-login-shell">
      <div class="admin-login-visual">
        <a class="admin-brand login-brand" href="/"><img src="${ASSETS.logo}ichuhai-logo-horizontal-color.png" alt="ichuhai" /><span>运营控制台</span></a>
        <div class="admin-login-copy">
          <span class="admin-login-eyebrow">Secure operation desk</span>
          <h1>虚拟商品运营后台</h1>
          <p>订单、库存、支付、发货、售后和审计集中在一个可操作工作台。</p>
        </div>
        <div class="admin-login-metrics" aria-label="后台状态">
          <span><b>12h</b><small>会话有效期</small></span>
          <span><b>HMAC</b><small>签名令牌</small></span>
          <span><b>Audit</b><small>操作留痕</small></span>
        </div>
        <div class="admin-login-points">
          <span>${lineIcon('shield-check', '安全校验', 'admin-login-point-icon')}用户名密码校验</span>
          <span>${lineIcon('receipt', '订单审计', 'admin-login-point-icon')}敏感操作审计</span>
          <span>${lineIcon('lightning', '批量处理', 'admin-login-point-icon')}库存批量导入</span>
        </div>
      </div>
      <form class="admin-login-card" data-action="adminLoginForm">
        <span class="admin-form-kicker">Admin Console</span>
        <h2>登录后台</h2>
        <p>使用管理员用户名和密码进入控制台。登录后才能查看敏感运营数据和执行人工操作。</p>
        <label>用户名<input id="adminUsername" name="username" value="${escapeHtml(state.adminUsername || 'bitbernie')}" type="text" placeholder="bitbernie" autocomplete="username" /></label>
        <label>密码<input id="adminPassword" name="password" type="password" placeholder="输入管理员密码" autocomplete="current-password" /></label>
        <button class="primary" data-action="adminLogin" type="submit">登录后台</button>
        <small class="admin-login-hint">生产环境请配置 ADMIN_USERNAME、ADMIN_PASSWORD 和 ADMIN_SESSION_SECRET。</small>
      </form>
    </section>
  `;
}

async function adminLogin() {
  const username = document.querySelector('#adminUsername')?.value.trim() || '';
  const password = document.querySelector('#adminPassword')?.value || '';
  if (!username) return notify('请输入管理员用户名');
  if (!password) return notify('请输入管理员密码');
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return notify(result.error || '登录失败');
  state.adminUsername = username;
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
  let tab = state.adminTab;
  if (!adminMenu().some((item) => item.key === tab)) {
    tab = 'dashboard';
    state.adminTab = tab;
    persist();
  }
  // 按当前 tab 加载服务端分页/聚合数据
  if (tab === 'dashboard') { await loadAdminDashboard(); await loadAdminPage('orders'); }
  else if (tab === 'orders') await loadAdminPage('orders');
  else if (tab === 'inventory') { await loadAdminPage('inventory'); if (currentAdminSubTab('inventory', 'list') === 'warning') await loadAdminDashboard(); }
  else if (tab === 'recharge') await loadAdminPage('transactions');
  else if (tab === 'users') await loadAdminPage('users');
  const activeMeta = adminMenu().find((item) => item.key === tab) || adminMenu()[0];
  const globalFilters = adminFiltersFor('global');
  shell(`
    <section class="admin-shell">
      <aside class="admin-nav">
        <a class="admin-brand" href="/admin"><img src="${ASSETS.logo}ichuhai-logo-horizontal-color.png" alt="ichuhai" /><span>运营后台</span></a>
        <nav>${adminMenu().map((item) => `<button class="${tab === item.key ? 'active' : ''}" data-action="adminTab" data-tab="${item.key}" type="button"><span>${lineIcon(item.icon, '', 'admin-nav-svg')}</span>${item.label}</button>`).join('')}</nav>
      </aside>
      <section class="admin-main">
        <header class="admin-topbar">
          <div><span>ichuhai 运营后台</span><strong>${activeMeta.label}</strong></div>
          ${adminShowsGlobalSearch(tab) ? `<label class="admin-global-search"><input data-action="adminGlobalSearch" name="q" value="${escapeHtml(adminGlobalSearchValue(tab))}" placeholder="搜索订单号 / TXID / 用户，回车跳转" /></label>` : '<div class="admin-topbar-spacer"></div>'}
          <button class="admin-account" data-action="adminTab" data-tab="system" type="button">${escapeHtml(state.adminUsername || '管理员')}</button>
          <button class="admin-logout" data-action="adminLogout" type="button">退出登录</button>
        </header>
        ${state.adminData.error ? `<div class="admin-risk-callout danger"><b>部分后台数据加载失败</b><span>${escapeHtml(state.adminData.error)}</span></div>` : ''}
        <section class="admin-content">${adminContent(tab)}</section>
      </section>
    </section>
    ${adminModalMarkup()}
  `, 'admin-page');
}

function adminMenu() {
  return [
    { key: 'dashboard', label: '概览', icon: 'all' },
    { key: 'products', label: '商品管理', icon: 'package' },
    { key: 'inventory', label: '库存管理', icon: 'gift' },
    { key: 'orders', label: '订单管理', icon: 'receipt' },
    { key: 'recharge', label: '充值流水', icon: 'wallet' },
    { key: 'support', label: '售后工单', icon: 'headset' },
    { key: 'users', label: '用户管理', icon: 'user' },
    { key: 'system', label: '系统设置', icon: 'shield-check' }
  ];
}

// 仅在订单/支付/客户/工单相关页面显示顶部全局搜索（方案 A）
function adminShowsGlobalSearch(tab) {
  return ['orders', 'recharge', 'users', 'support'].includes(tab);
}

// 全局搜索映射到当前页面主筛选 scope 的 q
function adminGlobalSearchScope(tab) {
  if (tab === 'recharge') return adminFilterScope('recharge', currentAdminSubTab('recharge', 'orders'));
  return tab;
}

function adminGlobalSearchValue(tab) {
  return String(adminFiltersFor(adminGlobalSearchScope(tab)).q || '');
}

// 后端错误信息转人话
function adminFriendlyError(message, status) {
  const raw = String(message || '').trim();
  if (status === 401 || /admin auth required/i.test(raw)) return '登录已过期，请重新登录';
  if (/internal server error/i.test(raw)) return '服务异常，请稍后重试或联系技术处理';
  if (/internal auth required/i.test(raw)) return '内部接口鉴权失败';
  if (!raw) return '操作失败，请稍后重试';
  return raw;
}

function adminOps() {
  return state.adminData.ops || {};
}

function adminContentSetting(key, fallback = {}) {
  const entry = (adminOps().content || []).find((item) => item.key === key);
  return { ...fallback, ...(entry?.valueJson || entry?.value || {}) };
}

function adminFilterScope(tab = state.adminTab, sub = state.adminSubTabs[tab] || '') {
  return sub ? `${tab}:${sub}` : tab;
}

function adminFiltersFor(scope) {
  return state.adminFilters[scope] || {};
}

function setAdminFilter(scope, name, value) {
  state.adminFilters[scope] = { ...adminFiltersFor(scope), [name]: value };
  persist();
}

function adminGlobalQuery() {
  return String(adminFiltersFor('global').q || '').trim().toLowerCase();
}

function searchable(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return Object.values(value).map(searchable).join(' ');
  return String(value).toLowerCase();
}

function matchesQuery(item, query) {
  const q = String(query || '').trim().toLowerCase();
  return !q || searchable(item).includes(q);
}

function optionHtml(options = [], selected = '') {
  return options.map((item) => {
    const option = typeof item === 'object' ? item : { label: item, value: item };
    const value = option.value ?? option.label;
    return `<option value="${escapeHtml(value)}" ${String(selected) === String(value) ? 'selected' : ''}>${escapeHtml(option.label)}</option>`;
  }).join('');
}

function adminFilterValue(scope, field) {
  return adminFiltersFor(scope)[field.name] ?? field.value ?? '';
}

function adminActionForm(action, fields, button = '保存') {
  return `<form class="admin-form" data-action="adminOps" data-ops="${action}">
    ${fields.map((field) => {
      const [name, label, type = 'text', placeholder = ''] = field;
      if (type === 'textarea') return `<label class="admin-field-wide">${label}<textarea name="${name}" placeholder="${placeholder}"></textarea></label>`;
      if (type === 'checkbox') return `<label class="checkline"><input name="${name}" type="checkbox" /> ${label}</label>`;
      return `<label>${label}<input name="${name}" type="${type}" placeholder="${placeholder}" /></label>`;
    }).join('')}
    <div class="admin-form-actions"><button class="primary small" type="submit">${button}</button></div>
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
        ${options.eyebrow ? `<p>${options.eyebrow}</p>` : ''}
        <h1>${title}</h1>
        <span>${description}</span>
      </div>
      <div class="admin-head-actions">${options.actions || ''}</div>
    </div>
    ${tabs.length ? `<div class="admin-tabs">${tabs.map((tab) => `<button class="${tab.active ? 'active' : ''}" data-action="adminSubTab" data-tab="${options.tabKey}" data-subtab="${tab.key}" type="button">${tab.label}</button>`).join('')}</div>` : ''}
    ${body}
  `;
}

function adminToolbar(fields, action = '', scope = adminFilterScope()) {
  return `<div class="admin-toolbar admin-toolbar-count-${fields.length}">
    <div class="admin-toolbar-fields" style="--admin-toolbar-field-count:${Math.min(Math.max(fields.length, 1), 4)}">
    ${fields.map((field) => {
      const value = adminFilterValue(scope, field);
      const name = field.name || field.label;
      const labelClass = field.hideLabel ? ' class="admin-field-no-label"' : '';
      const labelText = field.hideLabel ? '' : field.label;
      if (field.type === 'select') return `<label${labelClass}>${labelText}<select data-action="adminFilter" data-filter-scope="${scope}" name="${name}">${optionHtml([field.value || '全部', ...(field.options || [])], value)}</select></label>`;
      if (field.type === 'button') return `<button class="${field.className || 'secondary'}" ${field.action ? `data-action="${field.action}"` : ''} ${field.tab ? `data-tab="${field.tab}"` : ''} type="button">${field.label}</button>`;
      if (field.type === 'date') return `<label${labelClass}>${labelText}<input type="date" data-action="adminFilter" data-filter-scope="${scope}" name="${name}" value="${escapeHtml(value)}" /></label>`;
      return `<label${labelClass}>${labelText}<input data-action="adminFilter" data-filter-scope="${scope}" name="${name}" placeholder="${field.placeholder || ''}" value="${escapeHtml(value)}" /></label>`;
    }).join('')}
    </div>
    <div class="admin-toolbar-actions">
      <button class="secondary" data-action="adminClearFilters" data-filter-scope="${scope}" type="button">重置</button>
      ${action}
    </div>
  </div>`;
}

function adminStatus(text, tone = 'neutral') {
  return `<span class="status-badge ${tone}">${text}</span>`;
}

function adminTable(columns, rows, empty) {
  // 用列定义生成 grid 模板；标记最后一个 sticky 列用于固定操作列
  const template = columns.map((c) => c.width || '1fr').join(' ');
  const stickyIndex = columns.reduce((acc, c, i) => (c.sticky ? i : acc), -1);
  const cellClass = (i) => {
    const classes = [];
    if (i === stickyIndex) classes.push('admin-sticky-col');
    if (i === columns.length - 1) classes.push('admin-actions-cell');
    return classes.length ? ` class="${classes.join(' ')}"` : '';
  };
  const headCells = columns.map((c, i) => `<span${cellClass(i)}>${c.label}</span>`).join('');
  const bodyRows = rows.length
    ? rows.map((cells) => `<div class="admin-data-row" style="grid-template-columns:${template}">${cells.map((cell, i) => `<span${cellClass(i)}>${cell}</span>`).join('')}</div>`).join('')
    : adminEmpty(empty.title, empty.desc, empty.action || '');
  return `<div class="admin-data-table admin-cols-${columns.length}${stickyIndex >= 0 ? ' has-sticky' : ''}">
    <div class="admin-data-head" style="grid-template-columns:${template}">${headCells}</div>
    ${bodyRows}
  </div>`;
}

function adminEmpty(title, desc, action = '') {
  return `<div class="admin-empty"><b>${title}</b><span>${desc}</span>${action}</div>`;
}

function adminPager(total) {
  return `<div class="admin-pager"><span>共 ${total} 条记录</span></div>`;
}

function skuName(sku) {
  return escapeHtml(sku.skuName || Object.values(sku.optionValues || {}).join(' / ') || sku.id);
}

function adminOptionLabel(key) {
  return { region: '地区', account: '账号类型', account_type: '账号类型', duration: '套餐周期', plan: '套餐', amount: '面额' }[key] || key;
}

function adminSkuCombination(sku) {
  const values = sku.optionValues || {};
  return Object.entries(values).map(([key, value]) => `${adminOptionLabel(key)}：${value}`).join(' / ') || (sku.skuName || sku.id);
}

function adminSkuSales(product, sku) {
  return Math.max(12, Math.round((String(product.name || '').length * 137 + Number(sku.priceUsdt || 1) * 89 + Number(sku.sortOrder || 0) * 17) % 3200));
}

function adminProductSales(product) {
  return (product.skus || []).reduce((sum, sku) => sum + adminSkuSales(product, sku), 0);
}

function adminSkuInventoryPool(product, sku) {
  const source = `${product.slug || product.id || 'product'}-${Object.values(sku.optionValues || {}).join('-') || sku.id}`;
  return source.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 34) || 'SKU_POOL';
}

function adminProductThumb(product) {
  const src = product.iconUrl || product.coverUrl;
  if (src) return `<img src="${escapeHtml(src)}" alt="${escapeHtml(product.name || '商品')}" loading="lazy" />`;
  const file = adminProductIconFile(product.icon || product.slug || product.name || product.category);
  return `<img src="${ASSETS.product}${file}" alt="${escapeHtml(product.name || '商品')}" loading="lazy" />`;
}

function adminProductIconFile(value) {
  const raw = String(value || '').toLowerCase();
  const key = Object.keys(PRODUCT_ICONS).find((item) => raw.includes(item));
  return PRODUCT_ICONS[key] || 'E12_placeholder_blank.png';
}

function adminPurchaseFields(product, ops = {}) {
  const fromOps = (ops.purchaseFields || ops.purchase_fields || []).filter((field) => String(field.productId || field.product_id || '') === String(product.id || ''));
  if (fromOps.length) return fromOps.map((field, index) => ({
    id: field.id || `${field.fieldKey || field.field_key || index}`,
    fieldKey: field.fieldKey || field.field_key || '',
    fieldLabel: field.fieldLabel || field.field_label || '购买字段',
    fieldType: field.fieldType || field.field_type || 'select',
    required: field.required !== false && field.required !== 0,
    placeholder: field.placeholder || '',
    defaultValue: field.defaultValue || field.default_value || '',
    options: Array.isArray(field.options) ? field.options : parseJsonSafe(field.optionsJson || field.options_json, []),
    sortOrder: Number(field.sortOrder || field.sort_order || index + 1),
    visible: field.visible !== false && field.visible !== 0
  }));
  const skus = product.skus || [];
  const optionKeys = [...new Set(skus.flatMap((sku) => Object.keys(sku.optionValues || {})))];
  const generated = optionKeys.map((key, index) => ({
    id: `${product.id}-${key}`,
    fieldKey: key,
    fieldLabel: adminOptionLabel(key),
    fieldType: 'select',
    required: true,
    placeholder: `请选择${adminOptionLabel(key)}`,
    defaultValue: '',
    options: [...new Set(skus.map((sku) => sku.optionValues?.[key]).filter(Boolean))].map((value) => ({ label: value, value })),
    sortOrder: index + 1,
    visible: true
  }));
  return generated.length ? generated : [
    { id: `${product.id}-email`, fieldKey: 'email', fieldLabel: '邮箱', fieldType: 'email', required: true, placeholder: '请输入接收邮箱', defaultValue: '', options: [], sortOrder: 1, visible: true },
    { id: `${product.id}-note`, fieldKey: 'note', fieldLabel: '备注', fieldType: 'textarea', required: false, placeholder: '补充账号或订单要求', defaultValue: '', options: [], sortOrder: 2, visible: true }
  ];
}

function parseJsonSafe(value, fallback) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function fieldTypeLabel(type) {
  return { select: '下拉框', radio: '单选项', text: '输入框', email: '邮箱', textarea: '文本框', number: '数字', quantity: '数量', switch: '开关' }[type] || type || '输入框';
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

function filterAdminProducts(list, filters) {
  const query = filters.q || filters['搜索商品'] || '';
  return list.filter((p) => {
    if (!matchesQuery(p, query || adminGlobalQuery())) return false;
    if (filters.category && !['全部分类', '全部'].includes(filters.category) && String(p.category || p.categoryId) !== filters.category) return false;
    if (filters.status && !['全部状态', '全部'].includes(filters.status)) {
      const status = p.status === 'hidden' ? '已下架' : '已上架';
      if (status !== filters.status) return false;
    }
    if (filters.delivery && !['全部方式', '全部'].includes(filters.delivery) && deliveryLabel(p.deliveryType) !== filters.delivery) return false;
    return true;
  });
}

function filterAdminSkuRows(rows, filters) {
  const query = filters.q || filters['搜索 SKU'] || '';
  return rows.filter(({ product, sku }) => {
    if (!matchesQuery({ product, sku }, query || adminGlobalQuery())) return false;
    if (filters.product && !['全部商品', '全部'].includes(filters.product) && product.id !== filters.product) return false;
    if (filters.stock && !['全部状态', '全部'].includes(filters.stock) && stockLabel(sku.stockStatus || sku.stock) !== filters.stock) return false;
    if (filters.delivery && !['全部方式', '全部'].includes(filters.delivery) && deliveryLabel(sku.deliveryType || product.deliveryType) !== filters.delivery) return false;
    return true;
  });
}

function filterAdminOrders(list, filters) {
  const query = filters.q || filters['搜索订单'] || filters['搜索订单号'] || '';
  return list.filter((o) => {
    if (!matchesQuery(o, query || adminGlobalQuery())) return false;
    if (filters.status && !['全部状态', '全部支付状态', '全部发货状态', '全部'].includes(filters.status) && statusLabel(o.status) !== filters.status) return false;
    if (filters.network && !['全部网络', '全部'].includes(filters.network) && String(o.paymentNetwork || '').toUpperCase() !== filters.network) return false;
    return true;
  });
}

function filterAdminInventory(list, filters) {
  const query = filters.q || filters['搜索库存'] || '';
  return list.filter((item) => {
    if (!matchesQuery(item, query || adminGlobalQuery())) return false;
    if (filters.type && !['全部类型', '全部'].includes(filters.type) && item.type !== filters.type) return false;
    if (filters.status && !['全部状态', '全部'].includes(filters.status) && item.status !== filters.status) return false;
    return true;
  });
}

function filterSimpleAdminRows(list, filters, searchKey = 'q') {
  const query = filters[searchKey] || filters.q || adminGlobalQuery();
  return list.filter((item) => matchesQuery(item, query));
}

function parseInventoryLines(raw, type, existing = []) {
  const seen = new Set();
  const existingValues = new Set(existing.map((item) => String(item.maskedValue || item.encryptedValue || item.value || '').trim()).filter(Boolean));
  return String(raw || '').split(/\r?\n/).map((line, index) => {
    const value = line.trim();
    const parts = value.split('----').map((part) => part.trim()).filter(Boolean);
    const errors = [];
    if (!value) errors.push('空行');
    if (type === 'account' && parts.length < 2) errors.push('账号库存至少需要账号和密码');
    if (type === 'card' && value && value.length < 6) errors.push('卡密长度过短');
    if (seen.has(value)) errors.push('本次重复');
    if (existingValues.has(value)) errors.push('库存已存在');
    seen.add(value);
    return { line: index + 1, value, errors, valid: value && !errors.length };
  }).filter((item) => item.value || item.errors.length);
}

function buildInventoryPreview(form) {
  const data = new FormData(form);
  const skuId = String(data.get('skuId') || '').trim();
  const productId = String(data.get('productId') || '').trim();
  const type = String(data.get('type') || 'card').trim();
  const items = String(data.get('items') || '');
  const productList = adminProducts();
  const skuRows = adminSkuRows(productList);
  const rows = parseInventoryLines(items, type, adminOps().inventory || []);
  const errors = [];
  if (!skuRows.some(({ sku }) => sku.id === skuId)) errors.push('SKU ID 不存在');
  if (!productList.some((product) => product.id === productId)) errors.push('商品 ID 不存在');
  if (!['card', 'account', 'coupon'].includes(type)) errors.push('库存类型必须是 card / account / coupon');
  if (!rows.some((row) => row.valid)) errors.push('没有可导入的有效库存行');
  if (rows.some((row) => !row.valid)) errors.push('存在格式错误或重复库存行');
  return {
    skuId,
    productId,
    type,
    items,
    rows,
    errors,
    success: rows.filter((row) => row.valid).length,
    duplicate: rows.filter((row) => row.errors.includes('本次重复') || row.errors.includes('库存已存在')).length,
    failed: rows.filter((row) => !row.valid).length
  };
}

function inventoryPreviewPanel(preview) {
  if (!preview) return `<div class="admin-preview-box"><b>解析预览</b><span>粘贴库存后点击“校验格式”，系统会先检查 SKU、商品、类型、重复行和格式错误。</span></div>`;
  const tone = preview.errors.length ? 'danger' : 'success';
  return `<div class="admin-preview-box ${tone}">
    <b>校验结果：${preview.errors.length ? '需要修正' : '可以导入'}</b>
    <span>有效 ${preview.success} 条，重复 ${preview.duplicate} 条，失败 ${preview.failed} 条。</span>
    ${preview.errors.length ? `<small>${preview.errors.map(escapeHtml).join(' / ')}</small>` : ''}
    <div class="admin-preview-list">${preview.rows.slice(0, 8).map((row) => `<span><b>${row.line}</b>${escapeHtml(row.value.slice(0, 42))}<em>${row.valid ? '通过' : row.errors.join(', ')}</em></span>`).join('')}</div>
  </div>`;
}

// ── 后台弹窗 / 二次确认基础设施 ──────────────────────────────
// state.adminModal = { kind, title, desc, fields:[{name,label,type,placeholder,value,options,required}],
//                      confirm:{ requireText }, danger, submitLabel, context }
function openAdminModal(modal) {
  state.adminModal = modal;
  renderAdmin();
}

function closeAdminModal() {
  state.adminModal = null;
  renderAdmin();
}

function adminModalMarkup() {
  const m = state.adminModal;
  if (!m) return '';
  const fields = (m.fields || []).map((f) => {
    const val = f.value != null ? String(f.value) : '';
    if (f.type === 'textarea') {
      return `<label class="admin-field-wide">${escapeHtml(f.label)}${f.required ? ' *' : ''}<textarea name="${f.name}" placeholder="${escapeHtml(f.placeholder || '')}">${escapeHtml(val)}</textarea></label>`;
    }
    if (f.type === 'select') {
      return `<label>${escapeHtml(f.label)}${f.required ? ' *' : ''}<select name="${f.name}">${optionHtml(f.options || [], val)}</select></label>`;
    }
    if (f.type === 'static') {
      return `<div class="admin-modal-static"><span>${escapeHtml(f.label)}</span><b>${escapeHtml(val)}</b></div>`;
    }
    return `<label class="admin-field-wide">${escapeHtml(f.label)}${f.required ? ' *' : ''}<input name="${f.name}" type="${f.type || 'text'}" placeholder="${escapeHtml(f.placeholder || '')}" value="${escapeHtml(val)}" autocomplete="off" /></label>`;
  }).join('');
  const confirmText = m.confirm?.requireText
    ? `<label class="admin-field-wide">请输入「${escapeHtml(m.confirm.requireText)}」以确认<input name="__confirmText" placeholder="${escapeHtml(m.confirm.requireText)}" autocomplete="off" /></label>`
    : '';
  return `
    <div class="admin-modal-backdrop">
      <form class="admin-modal ${m.danger ? 'danger' : ''}" data-admin-modal-form>
        <div class="admin-modal-head"><h2>${escapeHtml(m.title || '确认操作')}</h2>${m.desc ? `<p>${escapeHtml(m.desc)}</p>` : ''}</div>
        <div class="admin-modal-body">${fields}${confirmText}</div>
        <div class="admin-modal-actions">
          <button class="secondary" type="button" data-action="adminModalClose">取消</button>
          <button class="${m.danger ? 'danger' : 'primary'} small" data-action="adminModalSubmit" type="submit">${escapeHtml(m.submitLabel || '确认')}</button>
        </div>
      </form>
    </div>`;
}

// 收集弹窗字段值并执行回调（在 click handler 中调用）
async function submitAdminModal(form) {
  const m = state.adminModal;
  if (!m) return;
  const data = new FormData(form);
  const values = {};
  for (const f of (m.fields || [])) values[f.name] = String(data.get(f.name) ?? '').trim();
  // 校验必填
  for (const f of (m.fields || [])) {
    if (f.required && !values[f.name]) return notify(`请填写：${f.label}`);
  }
  if (m.confirm?.requireText) {
    const typed = String(data.get('__confirmText') ?? '').trim();
    if (typed !== m.confirm.requireText) return notify(`请输入「${m.confirm.requireText}」确认`);
  }
  const handler = ADMIN_MODAL_HANDLERS[m.kind];
  if (!handler) return notify('未知操作');
  await handler(values, m.context || {});
}

// 弹窗提交后的实际 API 调用。每个 handler 负责请求、错误提示、刷新数据、关闭弹窗。
const ADMIN_MODAL_HANDLERS = {
  async confirmPayment(values, ctx) {
    const body = { txHash: values.txHash || '', amount: values.amount || ctx.amount || '', fromAddress: values.fromAddress || '', reason: values.reason || '' };
    if (!body.txHash && !body.reason) return notify('无 txHash 时必须填写确认原因');
    const response = await adminFetch(`/api/admin/orders/${ctx.id}/confirm-payment`, { method: 'POST', body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(data.error || '确认到账失败');
    state.adminModal = null;
    await loadAdminPage('orders', { force: true });
    notify('已确认到账并写入到账交易');
    return renderAdmin();
  },
  async manualDeliver(values, ctx) {
    const body = { operator: state.adminUsername || 'admin', deliveryContent: values.deliveryContent };
    if (ctx.unpaid) {
      if (String(values.force).trim().toLowerCase() !== 'force') { return notify('未支付订单需输入 force 确认'); }
      body.force = true;
    }
    const response = await adminFetch(`/api/admin/orders/${ctx.id}/manual-deliver`, { method: 'POST', body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(data.error || '人工发货失败');
    state.adminModal = null;
    await loadAdminPage('orders', { force: true });
    const notifFailed = (data.notification && data.notification.status === 'failed');
    notify(notifFailed ? '已发货，但邮件通知失败（已记录）' : '已写入发货记录并发送通知');
    return renderAdmin();
  },
  async inventoryReveal(values, ctx) {
    const response = await adminFetch(`/api/admin/inventory/${ctx.id}/reveal`, { method: 'POST', body: JSON.stringify({ reason: values.reason }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(data.error || '查看明文失败');
    // 明文仅短时显示，不落本地缓存
    state.adminModal = {
      kind: 'inventoryRevealResult', title: '库存明文（请勿截图外传）', desc: '该明文不会缓存，关闭后需重新查看。本次查看已写入审计。',
      submitLabel: '我已复制', danger: true, context: {},
      fields: [{ name: 'value', label: '明文', type: 'textarea', value: data.value }]
    };
    return renderAdmin();
  },
  async inventoryRevealResult() {
    state.adminModal = null;
    return renderAdmin();
  },
  async inventoryRevoke(values, ctx) {
    const response = await adminFetch(`/api/admin/inventory/${ctx.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'revoked', remark: values.remark || '' }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(data.error || '作废失败');
    state.adminModal = null;
    await loadAdminPage('inventory', { force: true });
    notify('库存已作废，自动发货不会再领取该库存');
    return renderAdmin();
  },
  async purchaseFieldDraft() {
    state.adminModal = null;
    notify('购买字段配置已生成，保存接口接入后会自动写入字段表');
    return renderAdmin();
  },
  async paymentBind(values, ctx) {
    const response = await adminFetch(`/api/admin/payment-transactions/${ctx.id}`, { method: 'PATCH', body: JSON.stringify({ action: 'bind', orderId: values.orderId, reason: values.reason }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(data.error || '绑定失败');
    state.adminModal = null;
    await loadAdminPage('transactions', { force: true });
    notify('已绑定订单并标记已支付');
    return renderAdmin();
  },
  async paymentIgnore(values, ctx) {
    const response = await adminFetch(`/api/admin/payment-transactions/${ctx.id}`, { method: 'PATCH', body: JSON.stringify({ action: 'ignore', reason: values.reason }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(data.error || '操作失败');
    state.adminModal = null;
    await loadAdminPage('transactions', { force: true });
    notify('已忽略该支付异常');
    return renderAdmin();
  },
  async editConfirmations(values, ctx) {
    const confirmations = Math.max(1, Math.floor(Number(values.confirmations)));
    if (!Number.isFinite(confirmations)) return notify('确认数无效');
    const response = await adminFetch(`/api/admin/payment-networks/${ctx.code}`, { method: 'PATCH', body: JSON.stringify({ confirmations }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(data.error || '修改确认数失败');
    state.adminModal = null;
    await loadAdminData(true);
    notify('确认数已更新');
    return renderAdmin();
  },
  async toggleNetwork(values, ctx) {
    const response = await adminFetch(`/api/admin/payment-networks/${ctx.code}`, { method: 'PATCH', body: JSON.stringify({ isEnabled: ctx.nextEnabled }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(data.error || '支付网络更新失败');
    state.adminModal = null;
    await loadAdminData(true);
    notify(ctx.nextEnabled ? '支付网络已启用' : '支付网络已关闭');
    return renderAdmin();
  },
  async productCreate(values) {
    const response = await adminFetch('/api/admin/products', { method: 'POST', body: JSON.stringify({ name: values.name, slug: values.slug, categoryId: values.categoryId || 'more', productType: values.productType, deliveryType: values.deliveryType, baseCurrency: 'USDT' }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(data.error || '创建商品失败');
    state.adminModal = null;
    await loadAdminData(true);
    notify('商品已创建');
    return renderAdmin();
  },
  async skuCreate(values, ctx) {
    let optionValues = {};
    try { optionValues = JSON.parse(values.optionValues || '{}'); } catch { return notify('规格 JSON 格式错误'); }
    const response = await adminFetch('/api/admin/skus', { method: 'POST', body: JSON.stringify({ productId: values.productId || ctx.productId, optionValues, priceUsdt: values.priceUsdt, deliveryType: values.deliveryType, stockStatus: values.stockStatus }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(data.error || '创建 SKU 失败');
    state.adminModal = null;
    await loadAdminData(true);
    notify('SKU 已创建');
    return renderAdmin();
  },
  async skuEdit(values, ctx) {
    let optionValues;
    if (values.optionValues) { try { optionValues = JSON.parse(values.optionValues); } catch { return notify('规格 JSON 格式错误'); } }
    const body = { priceUsdt: values.priceUsdt, deliveryType: values.deliveryType, stockStatus: values.stockStatus, warningStock: Number(values.warningStock) || 5, isRecommended: values.isRecommended === '1' };
    if (optionValues) body.optionValues = optionValues;
    const response = await adminFetch(`/api/admin/skus/${ctx.id}`, { method: 'PATCH', body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(data.error || '保存 SKU 失败');
    state.adminModal = null;
    await loadAdminData(true);
    notify('SKU 已保存');
    return renderAdmin();
  },
  async skuBatchPrice(values) {
    const product = adminProducts().find((p) => p.id === values.productId);
    if (!product || !(product.skus || []).length) { state.adminModal = null; return notify('该商品没有 SKU'); }
    const num = Number(values.value);
    if (!Number.isFinite(num)) return notify('数值无效');
    let failed = 0;
    for (const sku of product.skus) {
      const price = values.mode === 'percent' ? Number(sku.priceUsdt || 0) * (1 + num / 100) : num;
      const response = await adminFetch(`/api/admin/skus/${sku.id}`, { method: 'PATCH', body: JSON.stringify({ priceUsdt: price.toFixed(2) }) });
      if (!response.ok) failed += 1;
    }
    state.adminModal = null;
    await loadAdminData(true);
    notify(failed ? `批量改价完成，${failed} 个失败` : '批量改价完成');
    return renderAdmin();
  },
  async skuBatchStatus(values) {
    const product = adminProducts().find((p) => p.id === values.productId);
    if (!product || !(product.skus || []).length) { state.adminModal = null; return notify('该商品没有 SKU'); }
    let failed = 0;
    for (const sku of product.skus) {
      const response = await adminFetch(`/api/admin/skus/${sku.id}`, { method: 'PATCH', body: JSON.stringify({ stockStatus: values.stockStatus }) });
      if (!response.ok) failed += 1;
    }
    state.adminModal = null;
    await loadAdminData(true);
    notify(failed ? `批量更新完成，${failed} 个失败` : '批量更新完成');
    return renderAdmin();
  },
  async blacklistCreate(values) {
    const response = await adminFetch('/api/admin/ops', { method: 'POST', body: JSON.stringify({ action: 'blacklist.create', kind: values.kind, value: values.value, effect: values.effect, reason: values.reason, status: 'active' }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(adminFriendlyError(data.error, response.status));
    state.adminModal = null;
    state.adminData.ops = data;
    notify('已加入黑名单');
    return renderAdmin();
  },
  async blacklistToggle(values, ctx) {
    const response = await adminFetch(`/api/admin/blacklists/${ctx.id}`, { method: 'PATCH', body: JSON.stringify({ status: ctx.status }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(adminFriendlyError(data.error, response.status));
    state.adminModal = null;
    await loadAdminData(true);
    notify(ctx.status === 'active' ? '已启用黑名单' : '已停用黑名单');
    return renderAdmin();
  },
  async blacklistEdit(values, ctx) {
    const response = await adminFetch(`/api/admin/blacklists/${ctx.id}`, { method: 'PATCH', body: JSON.stringify({ effect: values.effect, reason: values.reason }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(adminFriendlyError(data.error, response.status));
    state.adminModal = null;
    await loadAdminData(true);
    notify('黑名单已更新');
    return renderAdmin();
  }
};

// 后台分页控件：0 条不显示；单页只显示统计；多页显示翻页
function adminPagerServer(kind) {
  const slice = state.adminPages[kind];
  if (!slice) return '';
  const total = slice.total || 0;
  if (total === 0) return '';
  const totalPages = Math.max(1, Math.ceil(total / (slice.pageSize || 20)));
  const page = slice.page || 1;
  if (totalPages <= 1) {
    return `<div class="admin-pager"><span>共 ${total} 条记录</span></div>`;
  }
  return `<div class="admin-pager">
    <span>共 ${total} 条记录 · 第 ${page}/${totalPages} 页</span>
    <button type="button" data-action="adminPage" data-kind="${kind}" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>上一页</button>
    <button class="active" type="button" disabled>${page}</button>
    <button type="button" data-action="adminPage" data-kind="${kind}" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>下一页</button>
  </div>`;
}

// 订单详情抽屉：复盘支付与发货链路
function adminOrderDetailPanel() {
  const d = state.adminDetail;
  if (d.kind !== 'order' || !d.id) return '';
  if (d.loading && !d.data) {
    return `<div class="admin-drawer-backdrop"><div class="admin-drawer"><div class="admin-empty"><b>加载中…</b><span>正在加载订单数据...</span></div></div></div>`;
  }
  if (d.error && !d.data) {
    return `<div class="admin-drawer-backdrop"><div class="admin-drawer"><div class="admin-empty"><b>详情加载失败</b><span>${escapeHtml(d.error)}</span></div></div></div>`;
  }
  if (!d.data) return '';
  const o = normalizeServerOrder(d.data.order) || {};
  const deliveries = d.data.deliveries || [];
  const notifications = d.data.notifications || [];
  const transactions = d.data.transactions || [];
  const tickets = d.data.supportTickets || [];
  const audits = d.data.auditLogs || [];
  const section = (title, inner) => `<div class="admin-drawer-section"><h3>${title}</h3>${inner}</div>`;
  const kv = (rows) => `<div class="admin-kv">${rows.map(([k, v]) => `<div><span>${escapeHtml(k)}</span><b>${v}</b></div>`).join('')}</div>`;
  const lastDelivery = deliveries[0] || {};
  const lastTransaction = transactions[0] || {};
  const deliveryContent = lastDelivery.maskedContent || lastDelivery.contentMasked || o.delivery?.maskedContent || '未发货';
  return `<div class="admin-drawer-backdrop">
    <div class="admin-drawer">
      <div class="admin-drawer-head"><div><h2>订单号：${escapeHtml(o.orderNo)}</h2><span>${adminStatus(deliveryStatusLabel(o.deliveryStatus), deliveryTone(o.deliveryStatus))}</span></div><button class="secondary" data-action="adminDetailClose" type="button">关闭</button></div>
      <div class="admin-drawer-body">
        <div class="admin-order-detail-grid">
        ${section('基础信息', kv([
          ['订单号', escapeHtml(o.orderNo)],
          ['订单状态', adminStatus(statusLabel(o.status), adminToneFromStatus(o.status))],
          ['商品', escapeHtml(o.productName)],
          ['SKU', escapeHtml(Object.values(o.options || {}).join(' / ') || o.skuId || '-')],
          ['用户', `${escapeHtml(o.email || '-')}<small>${escapeHtml(o.telegramUsername || '')}</small>`],
          ['创建时间', timeFrom(o.createdAt)]
        ]))}
        ${section('支付信息', kv([
          ['支付方式', paymentChannelLabel(o)],
          ['支付金额', `${formatUsdt(o.payAmount || o.amountUsdt)} USDT`],
          ['支付时间', timeFrom(o.paidAt || lastTransaction.detectedAt)],
          ['TXID', escapeHtml(o.txHash || lastTransaction.txHash || '-')],
          ['区块网络', escapeHtml(o.paymentNetwork || o.network || 'TRON')]
        ]))}
        ${section('发货信息', kv([
          ['发货方式', deliveryLabel(o.deliveryType)],
          ['发货时间', timeFrom(o.deliveredAt || lastDelivery.createdAt)],
          ['发货结果', adminStatus(deliveryStatusLabel(o.deliveryStatus), deliveryTone(o.deliveryStatus))],
          ['卡密预览', escapeHtml(deliveryContent)]
        ]))}
        ${section('售后记录', kv([
          ['工单数', tickets.length],
          ['退款状态', adminStatus(o.status === 'refunded' ? '已退款' : o.status === 'refunding' ? '退款中' : '无退款', ['refunded'].includes(o.status) ? 'success' : o.status === 'refunding' ? 'warning' : 'neutral')],
          ['处理结果', adminStatus(afterSaleStatusLabel(o.afterSaleStatus), o.afterSaleStatus === 'none' ? 'neutral' : 'warning')]
        ]))}
        </div>
        ${tickets.length ? section('售后工单明细', adminTable([{ label: '工单号' }, { label: '类型' }, { label: '状态' }], tickets.map((t) => [escapeHtml(t.ticketNo || t.id), escapeHtml(t.type), adminStatus(t.status, adminToneFromStatus(t.status))]), { title: '暂无工单', desc: '' })) : ''}
        ${audits.length ? section('操作日志', adminTable([{ label: '动作' }, { label: '操作人' }, { label: '时间' }], audits.map((a) => [escapeHtml(a.action), `${escapeHtml(a.actorRole)}:${escapeHtml(a.actorId)}`, timeFrom(a.createdAt)]), { title: '暂无操作日志', desc: '' })) : ''}
      </div>
    </div>
  </div>`;
}

// 用户详情/风险档案抽屉
function adminUserDetailPanel() {
  const d = state.adminDetail;
  if (d.kind !== 'user' || !d.id) return '';
  if (d.loading && !d.data) {
    return `<div class="admin-drawer-backdrop"><div class="admin-drawer"><div class="admin-empty"><b>加载中…</b><span>正在拉取用户档案。</span></div></div></div>`;
  }
  if (d.error && !d.data) {
    return `<div class="admin-drawer-backdrop"><div class="admin-drawer"><div class="admin-empty"><b>用户档案加载失败</b><span>${escapeHtml(d.error)}</span></div></div></div>`;
  }
  if (!d.data) return '';
  const p = d.data.profile || {};
  const orders = (d.data.orders || []).map(normalizeServerOrder).filter(Boolean);
  const notifications = d.data.notifications || [];
  const tickets = d.data.supportTickets || [];
  const hits = d.data.blacklistHits || [];
  const section = (title, inner) => `<div class="admin-drawer-section"><h3>${title}</h3>${inner}</div>`;
  const kv = (rows) => `<div class="admin-kv">${rows.map(([k, v]) => `<div><span>${escapeHtml(k)}</span><b>${v}</b></div>`).join('')}</div>`;
  const recentLedger = adminUserLedgerRows(p.email, 5);
  return `<div class="admin-drawer-backdrop">
    <div class="admin-drawer">
      <div class="admin-drawer-head"><div><h2>${escapeHtml(p.email)}</h2><span>${escapeHtml(p.telegramUsername || '')}</span></div><button class="secondary" data-action="adminDetailClose" type="button">关闭</button></div>
      <div class="admin-drawer-body">
        ${section('基础信息', kv([
          ['邮箱', escapeHtml(p.email)],
          ['Telegram', escapeHtml(p.telegramUsername || '-')],
          ['注册时间', timeFrom(p.firstOrderAt)],
          ['最近消费时间', timeFrom(p.lastOrderAt)],
          ['风险等级', adminUserRiskBadge(p)]
        ]))}
        <div class="admin-user-overview">
          ${adminUserMetric('累计消费', `${formatUsdt(p.paidAmountUsdt)} USDT`)}
          ${adminUserMetric('订单数', p.orderCount)}
          ${adminUserMetric('售后数', p.afterSaleCount)}
          ${adminUserMetric('当前余额', p.balanceUsdt === undefined ? '-' : `${formatUsdt(p.balanceUsdt)} USDT`)}
        </div>
        ${section('钱包/支付地址', (p.walletAddresses || []).length ? `<div class="admin-kv">${(p.walletAddresses || []).map((a) => `<div><span>收款地址</span><b>${escapeHtml(a)}</b></div>`).join('')}</div>` : '<p class="admin-muted">暂无记录。</p>')}
        ${section('最近订单', orders.length ? adminTable([{ label: '订单号' }, { label: '商品' }, { label: '金额' }, { label: '时间' }, { label: '状态' }], orders.slice(0, 5).map((o) => [escapeHtml(o.orderNo), escapeHtml(o.productName || '-'), `${formatUsdt(o.payAmount || o.amountUsdt)} USDT`, timeFrom(o.createdAt), adminStatus(statusLabel(o.status), adminToneFromStatus(o.status))]), { title: '暂无订单', desc: '' }) : '<p class="admin-muted">暂无订单历史。</p>')}
        ${section('最近余额流水', recentLedger.length ? adminTable([{ label: '变动类型' }, { label: '金额' }, { label: '来源', width: '2fr' }, { label: '时间' }, { label: '状态' }], recentLedger.map((item) => [escapeHtml(item.type), adminLedgerAmount(item.amount), escapeHtml(item.source), escapeHtml(item.time || '-'), adminStatus(item.status || '成功', adminLedgerTone(item))]), { title: '暂无余额流水', desc: '' }) : '<p class="admin-muted">暂无余额变动记录。</p>')}
        ${section('风险记录', hits.length ? adminTable([{ label: '类型' }, { label: '值' }, { label: '效果' }, { label: '原因' }], hits.map((h) => [escapeHtml(h.kind), escapeHtml(h.value), escapeHtml(h.effect), escapeHtml(h.reason)]), { title: '无命中', desc: '' }) : '<p class="admin-muted">未命中黑名单。</p>')}
        ${section('售后记录', tickets.length ? adminTable([{ label: '工单号' }, { label: '类型' }, { label: '状态' }], tickets.map((t) => [escapeHtml(t.ticketNo || t.id), escapeHtml(t.type), adminStatus(t.status, adminToneFromStatus(t.status))]), { title: '无售后', desc: '' }) : '<p class="admin-muted">暂无售后记录。</p>')}
        ${notifications.length ? section('通知记录', adminTable([{ label: '类型' }, { label: '渠道' }, { label: '状态' }, { label: '时间' }], notifications.map((n) => [escapeHtml(n.type), escapeHtml(n.channel), adminStatus(n.status, adminToneFromStatus(n.status)), timeFrom(n.createdAt)]), { title: '无通知', desc: '' })) : ''}
      </div>
    </div>
  </div>`;
}

function adminUserMetric(label, value) {
  return `<div><span>${escapeHtml(label)}</span><b>${value}</b></div>`;
}

function adminUserRiskState(user = {}) {
  if (user.riskStatus === 'blacklisted') return ['限制', 'danger'];
  if (Number(user.afterSaleCount || 0) > 0) return ['关注', 'warning'];
  return ['正常', 'success'];
}

function adminUserRiskBadge(user = {}) {
  const [label, tone] = adminUserRiskState(user);
  return adminStatus(label, tone);
}

function adminUserIdentity(user = {}) {
  const email = escapeHtml(user.email || '-');
  const contact = escapeHtml(user.telegramUsername ? `@${String(user.telegramUsername).replace(/^@/, '')}` : '未绑定 Telegram');
  const letter = escapeHtml((user.email || user.telegramUsername || '?').trim().slice(0, 1).toUpperCase());
  return `<div class="admin-user-cell"><i>${letter}</i><span><b>${email}</b><small>${contact}</small></span></div>`;
}

function adminLedgerType(type = '') {
  const raw = String(type || '');
  if (raw.includes('订单')) return '订单消费';
  if (raw.includes('提现')) return '充值退款';
  if (raw.includes('退款')) return '订单退款';
  if (raw.includes('充值')) return '余额充值';
  if (raw.includes('系统')) return '系统退款';
  return raw || '余额变动';
}

function adminLedgerSource(item = {}) {
  const text = [item.method, item.detail].filter(Boolean).join(' ');
  if (!text) return '-';
  return text.replace(/^订单号：?/, '订单号 ').replace(/^TxID：?/, 'TxID ');
}

function adminLedgerAmount(value) {
  const n = Number(value || 0);
  const sign = n > 0 ? '+' : '';
  const cls = n < 0 ? 'negative' : 'positive';
  return `<b class="admin-ledger-amount ${cls}">${sign}${n.toFixed(2)} USDT</b>`;
}

function adminLedgerTone(item = {}) {
  if (item.tone === 'warning' || item.status === '待确认') return 'warning';
  if (item.tone === 'danger' || item.status === '失败') return 'danger';
  return 'success';
}

function adminUserLedgerRows(email = '', limit = 12) {
  const names = ['Eyang Lu', 'Eyang Lu', 'zoro.eth', 'testuser@gmail.com', 'Eyang Lu', 'zoro.eth', 'Eyang Lu', 'testuser@gmail.com'];
  const normalized = String(email || '').toLowerCase();
  return accountWalletLedgerEntries().map((item, index) => ({
    user: names[index % names.length],
    type: adminLedgerType(item.type),
    amount: Number(item.amount || 0),
    source: adminLedgerSource(item),
    time: item.time,
    status: item.status,
    tone: item.tone
  })).filter((item) => !normalized || item.user.toLowerCase() === normalized || item.user === email || item.user === 'Eyang Lu').slice(0, limit);
}

function adminAuditDetailPanel() {
  const d = state.adminDetail;
  if (d.kind !== 'audit' || !d.id) return '';
  const log = (state.adminData.auditLogs || []).find((l) => l.id === d.id);
  if (!log) return '';
  const section = (title, inner) => `<div class="admin-drawer-section"><h3>${title}</h3>${inner}</div>`;
  const kv = (rows) => `<div class="admin-kv">${rows.map(([k, v]) => `<div><span>${escapeHtml(k)}</span><b>${v}</b></div>`).join('')}</div>`;
  const meta = log.metadata || {};
  const metaRows = Object.entries(meta).map(([k, v]) => [k, escapeHtml(typeof v === 'object' ? JSON.stringify(v) : String(v))]);
  return `<div class="admin-drawer-backdrop">
    <div class="admin-drawer">
      <div class="admin-drawer-head"><div><h2>${auditActionRisk(log.action) ? '<span class="admin-risk-dot"></span>' : ''}${auditActionLabel(log.action)}</h2><span>${escapeHtml(log.action)}</span></div><button class="secondary" data-action="adminDetailClose" type="button">关闭</button></div>
      <div class="admin-drawer-body">
        ${section('基础信息', kv([
          ['操作人', auditActorLabel(log)],
          ['对象', escapeHtml(log.target || '-')],
          ['对象 ID', escapeHtml(log.targetId || '-')],
          ['IP', escapeHtml(log.ip || '-')],
          ['时间', timeFrom(log.createdAt)]
        ]))}
        ${section('User Agent', `<p class="admin-muted">${escapeHtml(log.userAgent || '-')}</p>`)}
        ${section('详细数据', metaRows.length ? kv(metaRows) : '<p class="admin-muted">无附加数据。</p>')}
      </div>
    </div>
  </div>`;
}

// 状态文案
function paymentStatusLabel(s) {
  return { unpaid: '未支付', confirming: '确认中', paid: '已支付', failed: '支付失败', exception: '支付异常' }[s] || s || '未支付';
}
function deliveryStatusLabel(s) {
  return { undelivered: '未发货', manual_required: '待人工发货', delivering: '发货中', delivered: '已发货', failed: '发货失败' }[s] || s || '未发货';
}
function afterSaleStatusLabel(s) {
  return { none: '无售后', open: '售后待处理', in_progress: '售后处理中', resolved: '已解决', closed: '已关闭' }[s] || s || '无售后';
}
function inventoryStatusLabel(s) {
  return { available: '可售', reserved: '订单占用', delivered: '已发货', revoked: '已作废' }[s] || s;
}
function inventoryTypeLabel(t) {
  return { card: '卡密', account: '账号', coupon: '优惠码' }[t] || t || '卡密';
}
function inventorySkuText(sku = {}) {
  const values = sku.optionValues || {};
  const ordered = ['region', 'account_type', 'account', 'duration', 'plan', 'amount']
    .map((key) => values[key])
    .filter(Boolean);
  const rest = Object.entries(values)
    .filter(([key, value]) => value && !['region', 'account_type', 'account', 'duration', 'plan', 'amount'].includes(key))
    .map(([, value]) => value);
  return String(sku.skuName || [...ordered, ...rest].join(' / ') || sku.skuId || sku.id || '-');
}
function inventorySkuCell(sku = {}) {
  return `<b>${escapeHtml(inventorySkuText(sku))}</b><small>内部编码：${escapeHtml(sku.skuId || sku.id || '-')}</small>`;
}
function adminInventorySummaryTone(row) {
  if ((row.deliveryType || row.productDeliveryType) === 'manual') return 'neutral';
  if (Number(row.available || 0) <= 0) return 'danger';
  if (Number(row.available || 0) <= Number(row.warningStock || 5)) return 'warning';
  return 'success';
}
function blacklistKindLabel(k) {
  return { telegram_username: 'Telegram 用户名', telegram_id: 'Telegram ID', email: '邮箱', wallet: '钱包地址', ip: 'IP', device: '设备' }[k] || k;
}
function blacklistEffectLabel(e) {
  return { block_order: '拒绝下单', require_manual_review: '需人工审核', block_payment: '拒绝支付' }[e] || e || '拒绝下单';
}
// 审计动作中文映射 + 风险等级
const AUDIT_ACTION_META = {
  'product.update': { label: '商品修改', risk: false },
  'sku.update': { label: 'SKU 修改', risk: false },
  'sku.create': { label: 'SKU 新增', risk: false },
  'inventory.import': { label: '库存导入', risk: false },
  'inventory.reveal': { label: '查看库存明文', risk: true },
  'inventory.revoke': { label: '作废库存', risk: true },
  'order.confirm_payment': { label: '手动确认支付', risk: true },
  'order.manual_deliver': { label: '人工发货', risk: true },
  'order.status_update': { label: '订单状态变更', risk: false },
  'payment.bind_order': { label: '支付绑定订单', risk: true },
  'payment.ignore': { label: '忽略支付异常', risk: true },
  'payment.rescan': { label: '支付重扫', risk: false },
  'payment_network.update': { label: '支付配置变更', risk: true },
  'blacklist.create': { label: '黑名单新增', risk: true },
  'blacklist.update': { label: '黑名单变更', risk: true },
  'category.update': { label: '分类变更', risk: false },
  'tag.update': { label: '标签变更', risk: false }
};
function auditActionLabel(action) {
  return (AUDIT_ACTION_META[action] || {}).label || action;
}
function auditActionRisk(action) {
  return !!(AUDIT_ACTION_META[action] || {}).risk;
}
// 截断长 ID，hover 显示完整
function truncateId(value, len = 10) {
  const v = String(value || '');
  if (v.length <= len) return escapeHtml(v);
  return `<span class="admin-trunc" title="${escapeHtml(v)}">${escapeHtml(v.slice(0, len))}…</span>`;
}
// 审计操作人显示：优先真实用户名
function auditActorLabel(log) {
  const id = log.actorId || '';
  const role = { admin: '管理员', system: '系统', internal: '内部', customer: '用户', 'payment-listener': '支付监听' }[log.actorRole] || log.actorRole || '';
  if (!id || id === 'admin') return role || '管理员';
  return `${escapeHtml(id)}<small>${role}</small>`;
}
function matchStatusLabel(s) {
  return { matched: '已匹配', manual_confirm: '人工确认', confirming: '确认中', duplicate: '重复交易', exception: '异常', unmatched: '未匹配', ignored: '已忽略', resolved: '已处理' }[s] || s;
}
function exceptionTypeLabel(s) {
  return { confirming: '等待确认', duplicate_tx: '重复 Hash', amount_collision: '金额冲突', overpaid: '多付', underpaid: '少付', unmatched: '未匹配' }[s] || s || '-';
}
function paymentToneFromMatch(s) {
  if (['matched', 'manual_confirm', 'resolved'].includes(s)) return 'success';
  if (['confirming'].includes(s)) return 'warning';
  if (['ignored'].includes(s)) return 'neutral';
  return 'danger';
}
function deliveryTone(s) {
  if (s === 'delivered') return 'success';
  if (['delivering', 'manual_required'].includes(s)) return 'warning';
  if (s === 'failed') return 'danger';
  return 'neutral';
}
function paymentTone(s) {
  if (s === 'paid') return 'success';
  if (s === 'confirming') return 'warning';
  if (['failed', 'exception'].includes(s)) return 'danger';
  return 'neutral';
}
function formatUsdt(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return '0.000';
  // 保留三位以体现尾差金额（如 1.801），这是链上自动匹配的关键。
  return n.toFixed(3);
}

function adminContent(tab) {
  const orderList = adminOrders();
  const productList = adminProducts();
  const networkList = adminNetworks();
  const ops = adminOps();
  const skuRows = adminSkuRows(productList);
  if (tab === 'dashboard') {
    const d = state.adminDashboard;
    if (d.loading && !d.metrics) {
      return adminPage('运营看板', '集中处理订单、发货、库存、支付与售后异常。', `<div class="admin-panel"><div class="admin-empty"><b>加载中…</b><span>正在拉取今日运营指标。</span></div></div>`, { eyebrow: '今日工作台' });
    }
    if (d.error && !d.metrics) {
      return adminPage('运营看板', '集中处理订单、发货、库存、支付与售后异常。', `<div class="admin-panel"><div class="admin-empty"><b>看板加载失败</b><span>${escapeHtml(d.error)}</span><button class="primary small" data-action="adminReloadDashboard" type="button">重试</button></div></div>`, { eyebrow: '今日工作台' });
    }
    const m = d.metrics || {};
    const queues = d.queues || {};
    const metricCards = [
      ['今日订单', m.todayOrders ?? 0, 'orders', 'all', '今日创建的订单数'],
      ['今日收入', `${formatUsdt(m.todayRevenueUsdt)} USDT`, 'orders', 'paid', '已支付订单金额'],
      ['待处理订单', (m.pendingPayment ?? 0) + (m.paidPendingDelivery ?? 0) + (m.deliveryFailed ?? 0), 'orders', 'undelivered', '待支付、待发货、失败'],
      ['待回复工单', m.supportPending ?? 0, 'support', '', 'open / in_progress']
    ];
    const tasks = [
      ...(queues.deliveryTasks || []).slice(0, 4).map((o) => ({
        title: o.orderNo,
        desc: `${o.productName || '订单'} · ${o.telegramUsername || o.email || '-'}`,
        status: deliveryStatusLabel(o.deliveryStatus),
        tone: deliveryTone(o.deliveryStatus),
        action: `<button data-action="adminDeliver" data-id="${escapeHtml(o.id)}" type="button">发货</button>`
      })),
      ...(queues.paymentExceptions || []).slice(0, 3).map((t) => ({
        title: String(t.txHash || '').slice(0, 16) + '…',
        desc: `${formatUsdt(t.amount)} USDT · ${exceptionTypeLabel(t.exceptionType || t.matchStatus)}`,
        status: '支付异常',
        tone: 'warning',
        action: `<button data-action="adminDashboardJump" data-target="system:payment" type="button">处理</button>`
      })),
      ...(queues.supportTickets || []).slice(0, 3).map((t) => ({
        title: t.ticketNo || t.id,
        desc: `${t.orderNo || '-'} · ${t.type || '售后'}`,
        status: '待回复',
        tone: 'warning',
        action: `<button data-action="adminTab" data-tab="support" type="button">回复</button>`
      }))
    ].slice(0, 8);
    const healthRows = [
      ['支付异常', m.paymentExceptions ?? 0, 'system:payment', (m.paymentExceptions ?? 0) ? 'warning' : 'success'],
      ['库存预警', m.lowStockSkuCount ?? 0, 'inventory:list', (m.lowStockSkuCount ?? 0) ? 'warning' : 'success'],
      ['通知失败', m.notificationFailed ?? 0, 'system:base', (m.notificationFailed ?? 0) ? 'danger' : 'success'],
      ['发货失败', m.deliveryFailed ?? 0, 'orders', (m.deliveryFailed ?? 0) ? 'danger' : 'success']
    ];
    return adminPage('概览', '今天需要处理的订单、工单、库存和系统异常。', `
      <div class="metric-grid admin-metrics">${metricCards.map(([label, value, target, orderTab]) =>
        `<button type="button" data-action="adminDashboardJump" data-target="${target}" data-order-tab="${orderTab}"><span>${label}</span><b>${value}</b><small>${metricCards.find((item) => item[0] === label)?.[4] || ''}</small></button>`
      ).join('')}</div>
      <section class="admin-section-grid">
        <div class="admin-panel">
          <div class="admin-section-title"><h2>待处理任务</h2><span>按影响用户交付优先排序</span></div>
          ${adminTable([
            { label: '对象', width: 'minmax(220px, 1.4fr)' }, { label: '说明', width: 'minmax(220px, 1.3fr)' }, { label: '状态', width: 'minmax(110px, .7fr)' }, { label: '操作', width: 'minmax(110px, .6fr)' }
          ], tasks.map((task) => [
            `<b>${escapeHtml(task.title)}</b>`,
            escapeHtml(task.desc),
            adminStatus(task.status, task.tone),
            task.action
          ]), { title: '暂无待处理任务', desc: '支付、发货、工单暂时没有需要人工介入的事项。' })}
        </div>
        <div class="admin-panel">
          <div class="admin-section-title"><h2>系统健康</h2><span>异常项会进入对应处理页面</span></div>
          ${adminTable([
            { label: '项目', width: 'minmax(120px, 1fr)' }, { label: '数量', width: 'minmax(90px, .6fr)' }, { label: '状态', width: 'minmax(100px, .8fr)' }, { label: '操作', width: 'minmax(90px, .6fr)' }
          ], healthRows.map(([label, value, target, tone]) => [
            escapeHtml(label),
            `<b>${value}</b>`,
            adminStatus(Number(value) ? '需要关注' : '正常', tone),
            `<button data-action="adminDashboardJump" data-target="${target}" type="button">查看</button>`
          ]), { title: '暂无待发货任务', desc: '已支付待发货、人工介入、发货失败的订单会显示在这里。' })}
        </div>
      </section>
      <div class="admin-panel">
        <div class="admin-section-title"><h2>最近订单</h2><span>用于快速确认今日运营状态</span></div>
        ${adminTable([
          { label: '订单号', width: 'minmax(170px, 1.2fr)' }, { label: '商品', width: 'minmax(180px, 1.3fr)' }, { label: '金额', width: 'minmax(110px, .7fr)' }, { label: '支付', width: 'minmax(110px, .7fr)' }, { label: '发货', width: 'minmax(110px, .7fr)' }, { label: '用户', width: 'minmax(150px, 1fr)' }, { label: '时间', width: 'minmax(120px, .8fr)' }, { label: '操作', width: 'minmax(92px, .6fr)' }
        ], orderList.slice(0, 8).map((o) => [
          `<b>${escapeHtml(o.orderNo)}</b>`,
          escapeHtml(o.productName || '-'),
          `${formatUsdt(o.payAmount || o.amountUsdt)} USDT`,
          adminStatus(paymentStatusLabel(o.paymentStatus), paymentTone(o.paymentStatus)),
          adminStatus(deliveryStatusLabel(o.deliveryStatus), deliveryTone(o.deliveryStatus)),
          escapeHtml(o.telegramUsername || o.email || '-'),
          timeFrom(o.createdAt),
          `<button data-action="adminOrderDetail" data-id="${escapeHtml(o.id)}" type="button">详情</button>`
        ]), { title: '暂无最近订单', desc: '有用户下单后会显示在这里。' })}
      </div>
      ${adminOrderDetailPanel()}
    `, { eyebrow: '今日工作台' });
  }
  if (tab === 'products') {
    const sub = currentAdminSubTab(tab, 'list');
    const tabs = ['list|商品列表', 'editBase|基础信息', 'editDisplay|前台展示', 'editSkus|SKU 规格', 'editFields|购买字段', 'categories|分类管理', 'fieldTemplates|购买字段模板'].map((item) => { const [key, label] = item.split('|'); return { key, label, active: sub === key }; });
    const scope = adminFilterScope(tab, sub);
    const filters = adminFiltersFor(scope);
    let body = '';
    if (sub === 'categories') {
      body = `<div class="admin-panel">${adminActionForm('category.create', [['name','分类名称'], ['sortOrder','排序','number']], '新增分类')}${adminTable([
        { label: '分类名称' }, { label: '排序' }, { label: '显示状态' }, { label: '商品数量' }, { label: '操作' }
      ], (ops.categories || []).map((c) => [`${escapeHtml(categoryDisplayName(c.name || c.key))}`, Number(c.sortOrder || c.sort_order || 0), adminStatus(c.visible === false ? '隐藏' : '显示', c.visible === false ? 'neutral' : 'success'), productList.filter((p) => (p.category || p.categoryId) === c.name || (p.category || p.categoryId) === c.id || (p.category || p.categoryId) === c.key).length, `<button data-action="adminCategoryToggle" data-id="${escapeHtml(c.id || c.key)}" data-visible="${c.visible === false ? '1' : '0'}" type="button">${c.visible === false ? '显示' : '隐藏'}</button>`]), { title: '暂无分类', desc: '新增分类后可在商品列表筛选并控制前台展示。' })}</div>`;
    } else if (sub === 'fieldTemplates') {
      body = `<div class="admin-panel">
        <div class="admin-section-title"><h2>购买字段模板</h2><span>复用常见购买字段组合，商品编辑页可按需创建字段。</span></div>
        ${adminTable([{ label: '模板' }, { label: '适用场景' }, { label: '字段示例', width: '2fr' }, { label: '状态' }], [
          ['账号信息模板', '账号 / 订阅 / 服务', '邮箱、账号 ID、地区、备注', adminStatus('可用', 'success')],
          ['礼品卡模板', '卡密 / 充值', '地区、面额、接收邮箱', adminStatus('可用', 'success')],
          ['人工处理模板', '服务 / 复杂交付', '联系方式、需求描述、补充说明', adminStatus('可用', 'success')]
        ], { title: '暂无购买字段模板', desc: '可先用上方表单为具体商品沉淀常用字段。' })}
      </div>`;
    } else if (sub === 'editSkus') {
      const visibleSkuRows = filterAdminSkuRows(skuRows, filters);
      body = `${adminToolbar([{ name: 'q', label: '搜索 SKU', placeholder: 'SKU ID / 商品名 / 规格' }, { name: 'product', label: '商品筛选', type: 'select', value: '全部商品', options: productList.map((p) => ({ label: p.name, value: p.id })) }, { name: 'stock', label: 'SKU 状态', type: 'select', value: '全部状态', options: ['有货','库存紧张','售罄'] }, { name: 'delivery', label: '发货方式', type: 'select', value: '全部方式', options: ['自动发货','人工处理','部分自动'] }], `<button class="primary small" data-action="adminSkuCreate" type="button">新增 SKU</button><button class="secondary" data-action="adminSkuBatchPrice" type="button">批量改价</button><button class="secondary" data-action="adminSkuBatchStatus" type="button">批量上下架</button>`, scope)}<div class="admin-panel">${adminTable([
        { label: 'SKU 规格组合', width: '1.45fr' }, { label: '地区' }, { label: '账号类型' }, { label: '套餐周期' }, { label: '价格' }, { label: '库存池', width: '1.4fr' }, { label: '库存' }, { label: '销量' }, { label: '状态' }, { label: '排序' }, { label: '操作', width: 'minmax(140px,.8fr)' }
      ], visibleSkuRows.map(({ product, sku }) => [
        `<b>${escapeHtml(adminSkuCombination(sku))}</b><small>${escapeHtml(product.name)}</small>`,
        escapeHtml(sku.optionValues?.region || '全球版'),
        escapeHtml(sku.optionValues?.account || sku.optionValues?.account_type || '默认'),
        escapeHtml(sku.optionValues?.duration || sku.optionValues?.plan || sku.optionValues?.amount || '-'),
        `<b>${Number(sku.priceUsdt || 0).toFixed(2)} USD</b><small>≈ $${Number(sku.priceUsdt || 0).toFixed(2)}</small>`,
        `<span class="admin-code">${escapeHtml(adminSkuInventoryPool(product, sku))}</span>`,
        Number(sku.availableInventory ?? sku.stockQuantity ?? 0),
        adminSkuSales(product, sku).toLocaleString('zh-CN'),
        adminStatus(stockLabel(sku.stockStatus || sku.stock), adminToneFromStatus(sku.stockStatus || sku.stock)),
        Number(sku.sortOrder || 0) || 1,
        `<button data-action="adminSkuEdit" data-id="${escapeHtml(sku.id)}" data-product="${escapeHtml(product.id)}" type="button">编辑</button>`
      ]), { title: '没有匹配的 SKU', desc: '调整搜索、商品、库存状态或发货方式后重试。' })}${adminPager(visibleSkuRows.length)}</div>`;
    } else if (['editBase', 'editDisplay', 'editFields'].includes(sub)) {
      const product = productList.find((p) => p.id === state.adminProductEditId) || productList[0] || {};
      const productTags = productFeatureTags(product).join('，');
      const productNotice = product.purchaseNotice || product.notice?.usageGuide || '';
      const afterSaleRule = product.afterSaleRule || product.notice?.refundRule || product.notice?.attention || '';
      const skuList = product.skus || [];
      const autoNoStock = (product.deliveryType === 'auto' || product.deliveryType === 'mixed') && skuList.length > 0 && skuList.every((s) => Number(s.availableInventory ?? 0) <= 0);
      const categoryOptions = [...new Set(productList.map((p) => p.categoryId || p.category).filter(Boolean))];
      const editorHead = `<div class="admin-section-title"><h2>编辑商品</h2><span>商品负责前台展示、购买选项；SKU 负责价格、规格和库存池绑定。</span>
          <div class="admin-section-actions">
            <button class="ghost" data-action="adminProductBackList" type="button">返回商品列表</button>
            <label class="admin-inline-select">切换商品<select data-action="adminSelectEditProduct">${optionHtml(productList.map((p) => ({ label: p.name, value: p.id })), product.id || '')}</select></label>
          </div>
        </div>
        ${autoNoStock ? `<div class="admin-risk-callout danger"><b>上架风险提示</b><span>该商品为自动发货，但所有 SKU 当前可用库存为 0，上架后用户下单将无法自动发货。请先补货或转人工。</span></div>` : ''}`;
      if (sub === 'editBase') body = `<div class="admin-panel">
        ${editorHead}
        <form class="admin-form admin-product-base-form" data-action="adminProductBase" data-id="${escapeHtml(product.id || '')}">
          <label>商品名称<input name="name" value="${escapeHtml(product.name || '')}" /></label>
          <label>Slug<input name="slug" value="${escapeHtml(product.slug || '')}" placeholder="小写字母数字与连字符" /></label>
          <label>分类<select name="categoryId">${optionHtml(categoryOptions.map((c) => ({ label: c, value: c })), product.categoryId || product.category || '')}</select></label>
          <label>商品类型<select name="productType">${optionHtml([{label:'订阅 subscription',value:'subscription'},{label:'礼品卡/卡密 card',value:'card'},{label:'账号 account',value:'account'},{label:'充值 recharge',value:'recharge'},{label:'服务 service',value:'service'}], product.productType || 'subscription')}</select></label>
          <label>发货方式<select name="deliveryType">${optionHtml([{label:'自动发货 auto',value:'auto'},{label:'人工处理 manual',value:'manual'},{label:'部分自动 mixed',value:'mixed'}], product.deliveryType || 'manual')}</select></label>
          <label>上架状态<select name="status">${optionHtml([{label:'已上架 active',value:'active'},{label:'已隐藏 hidden',value:'hidden'},{label:'已归档 archived',value:'archived'}], product.status || 'active')}</select></label>
          <label class="checkline"><input name="isHomeVisible" type="checkbox" ${product.isHomeVisible === false ? '' : 'checked'} /> 前台展示</label>
          <label>商品排序<input name="sortOrder" type="number" value="${Number(product.sortOrder || 0)}" /></label>
          <label class="checkline"><input name="isRecommended" type="checkbox" ${product.isRecommended ? 'checked' : ''} /> 首页推荐</label>
          <div class="admin-form-actions"><button class="primary small" type="submit">保存基础信息</button></div>
        </form>
      </div>`;
      else if (sub === 'editDisplay') body = `<div class="admin-panel">
        ${editorHead}
        <div class="admin-product-display-layout">
          <form class="admin-form admin-product-content-form" data-action="adminProductContent" data-id="${escapeHtml(product.id || '')}">
            <label class="admin-field-wide">商品短描述<textarea name="shortDescription" placeholder="一句话介绍商品">${escapeHtml(product.shortDescription || product.subtitle || product.short || '')}</textarea></label>
            <label class="admin-field-wide">商品卖点标签<textarea name="featureTags" placeholder="最多 6 个，用逗号或换行分隔">${escapeHtml(productTags)}</textarea></label>
            <label class="admin-field-wide">商品详情说明<textarea name="detailDescription" placeholder="商品详情、适用场景、使用限制">${escapeHtml(product.detailDescription || product.description || '')}</textarea></label>
            <label class="admin-field-wide">购买须知<textarea name="purchaseNotice" placeholder="购买前需要用户确认的规则">${escapeHtml(productNotice)}</textarea></label>
            <label class="admin-field-wide">售后规则<textarea name="afterSaleRule" placeholder="保修、补发、退款等规则">${escapeHtml(afterSaleRule)}</textarea></label>
            <div class="admin-form-actions"><button class="primary small" type="submit">保存前台展示</button></div>
          </form>
          <aside class="admin-image-panel">
            <h3>商品图片</h3>
            <div class="admin-main-image">${adminProductThumb(product)}</div>
            <div class="admin-thumb-row">${[product.iconUrl, product.coverUrl].filter(Boolean).map((src) => `<img src="${escapeHtml(src)}" alt="缩略图" />`).join('') || `${adminProductThumb(product)}<button type="button">+</button>`}</div>
            <small>建议尺寸：800*800px，支持 JPG / PNG / WebP，最大 2MB</small>
            <h3>卖点标签（最多 6 个）</h3>
            <div class="admin-tag-list">${productFeatureTags(product).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('') || '<span>自动发货</span><span>安全可靠</span>'}<button type="button">+ 添加标签</button></div>
          </aside>
        </div>
      </div>`;
      else body = `<div class="admin-panel">
        <div class="admin-section-title"><h2>编辑商品</h2><span>选择商品后可修改基础信息、前台文案与购买字段。所有价格以 USDT 结算。</span>
          <div class="admin-section-actions">
            <button class="ghost" data-action="adminProductBackList" type="button">返回商品列表</button>
            <label class="admin-inline-select">切换商品<select data-action="adminSelectEditProduct">${optionHtml(productList.map((p) => ({ label: p.name, value: p.id })), product.id || '')}</select></label>
          </div>
        </div>
        <div class="admin-section-title"><h2>购买字段</h2><span>配置用户下单时填写或选择的业务字段，系统自动生成前台表单配置。</span><div class="admin-section-actions"><button class="primary small" data-action="adminPurchaseFieldEdit" data-product="${escapeHtml(product.id || '')}" type="button">新增字段</button></div></div>
        ${adminTable([{ label: '字段名称' }, { label: '类型' }, { label: '必填' }, { label: '选项数量' }, { label: '提示文案', width: '1.6fr' }, { label: '排序' }, { label: '操作' }], adminPurchaseFields(product, ops).map((field) => [
          `<b>${escapeHtml(field.fieldLabel)}</b><small>${escapeHtml(field.fieldKey)}</small>`,
          fieldTypeLabel(field.fieldType),
          adminStatus(field.required ? '是' : '否', field.required ? 'success' : 'neutral'),
          field.options?.length ? `${field.options.length} 个` : '-',
          escapeHtml(field.placeholder || field.defaultValue || '-'),
          Number(field.sortOrder || 0),
          `<button data-action="adminPurchaseFieldEdit" data-product="${escapeHtml(product.id || '')}" data-field="${escapeHtml(field.id)}" type="button">编辑</button><button class="danger-text" type="button">删除</button>`
        ]), { title: '暂无购买字段', desc: '新增地区、账号类型、邮箱或备注等字段后，用户下单时会按表单填写。' })}
      </div>`;
    } else {
      const categories = [...new Set(productList.map((p) => p.category || p.categoryId).filter(Boolean))];
      const visibleProducts = filterAdminProducts(productList, filters);
      body = `${adminToolbar([{ name: 'q', label: '搜索商品', placeholder: '搜索商品名称' }, { name: 'category', label: '全部分类', type: 'select', value: '全部分类', options: categories.map((c) => ({ label: categoryDisplayName(c), value: c })) }, { name: 'delivery', label: '全部发货方式', type: 'select', value: '全部方式', options: ['自动发货','人工处理','部分自动'] }, { name: 'status', label: '全部状态', type: 'select', value: '全部状态', options: ['已上架','已下架'] }], '', scope)}<div class="admin-panel">${adminTable([
        { label: '商品', width: '1.7fr' }, { label: '分类' }, { label: 'SKU 数量' }, { label: '库存总量' }, { label: '最低售价' }, { label: '发货方式' }, { label: '状态' }, { label: '销量' }, { label: '更新时间' }, { label: '操作', width: 'minmax(210px, 1.3fr)', sticky: true }
      ], visibleProducts.map((p) => {
        const skus = p.skus || [];
        const minPrice = skus.length ? Math.min(...skus.map((sku) => Number(sku.priceUsdt || 0))) : 0;
        const sellable = p.sellableSkuCount ?? skus.filter((s) => (s.stockStatus || s.stock) !== 'sold_out').length;
        const available = p.availableInventory ?? 0;
        const listed = p.status === 'active';
        return [
          `<span class="admin-product-cell"><span class="admin-product-thumb">${adminProductThumb(p)}</span><span><b>${escapeHtml(p.name)}</b><small>${escapeHtml(Object.values(skus[0]?.optionValues || {}).slice(0, 3).join(' / ') || p.slug || p.id)}</small></span></span>`,
          adminStatus(categoryDisplayName(p.category || p.categoryId), 'neutral'),
          `<b>${skus.length}</b><small>可售 ${sellable}</small>`,
          `<b class="${available <= 0 ? 'admin-text-danger' : ''}">${available.toLocaleString('zh-CN')}</b>`,
          `<b>${minPrice.toFixed(2)} USD</b><small>≈ $${minPrice.toFixed(2)}</small>`,
          adminStatus(deliveryLabel(p.deliveryType), p.deliveryType === 'manual' ? 'warning' : 'success'),
          `${adminStatus(listed ? '已上架' : (p.status === 'archived' ? '已归档' : '已下架'), listed ? 'success' : 'neutral')}<small>${p.isHomeVisible === false ? '前台隐藏' : '前台展示'}</small>`,
          adminProductSales(p).toLocaleString('zh-CN'),
          timeFrom(p.updatedAt || p.createdAt),
          `<button data-action="adminProductEdit" data-id="${escapeHtml(p.id)}" type="button">编辑</button><button class="ghost" data-action="adminProductSkus" data-id="${escapeHtml(p.id)}" type="button">管理 SKU</button>`
        ];
      }), { title: visibleProducts.length ? '没有匹配商品' : '暂无商品', desc: (filters.q || filters.category || filters.status || filters.delivery) ? '调整分类、状态、发货方式或关键词后重试。' : '点击右上角“新增商品”创建第一个商品。' })}${adminPager(visibleProducts.length)}</div>`;
    }
    return adminPage('商品管理', '管理前台展示商品、购买选项、SKU 价格规格与库存池绑定。', body, { tabKey: 'products', tabs, actions: '<button class="primary small" data-action="adminProductCreate" type="button">新增商品</button>' });
  }
  if (tab === 'inventory') {
    const sub = currentAdminSubTab(tab, 'list');
    const tabs = ['list|库存列表', 'import|批量导入', 'records|导入记录'].map((item) => { const [key, label] = item.split('|'); return { key, label, active: sub === key }; });
    const scope = adminFilterScope(tab, sub);
    const filters = adminFiltersFor(scope);
    const invSlice = state.adminPages.inventory;
    let body = '';
    if (sub === 'import') {
      const preview = state.adminImportPreview;
      const selectedProductId = preview?.productId || filters.productId || skuRows[0]?.product.id || '';
      const importProduct = productList.find((p) => p.id === selectedProductId) || productList[0] || {};
      const importSkuRows = skuRows.filter(({ product }) => !selectedProductId || product.id === selectedProductId);
      const selectedSkuId = preview?.skuId || filters.skuId || importSkuRows[0]?.sku.id || skuRows[0]?.sku.id || '';
      const selectedSku = skuRows.find(({ sku }) => sku.id === selectedSkuId)?.sku || importSkuRows[0]?.sku || {};
      const selectedDeliveryType = selectedSku.deliveryType || importProduct.deliveryType || 'manual';
      const isManualOnly = selectedDeliveryType === 'manual';
      body = `<div class="admin-import-flow">${['选择商品和 SKU','选择库存类型','粘贴或上传库存','预览解析结果','确认导入'].map((label, index) => `<span class="${index <= (preview ? 3 : 1) ? 'active' : ''}"><b>${index + 1}</b>${label}</span>`).join('')}</div><div class="admin-panel"><div class="admin-section-title"><h2>批量导入库存</h2><span>卡密和账号库存会加密存储，提交前先完成格式校验和重复检测。</span></div>
        <div class="admin-kv-strip">
          <span><small>当前商品</small><b>${escapeHtml(importProduct.name || '-')}</b></span>
          <span><small>发货方式</small><b>${deliveryLabel(selectedDeliveryType)}</b></span>
          <span><small>SKU</small><b>${escapeHtml(inventorySkuText(selectedSku))}</b></span>
        </div>
        ${isManualOnly ? `<div class="admin-risk-callout warning"><b>人工发货 SKU</b><span>该 SKU 不依赖库存池发货，已隐藏导入入口，避免误导入卡密。</span></div>` : `
        <form class="admin-form admin-import-form" data-action="adminInventoryImport">
          <label>商品<select name="productId" data-action="adminImportProductSelect">${optionHtml(productList.map((p) => ({ label: p.name, value: p.id })), selectedProductId)}</select></label>
          <label>SKU<select name="skuId" data-action="adminImportSkuSelect">${optionHtml(importSkuRows.map(({ sku }) => ({ label: inventorySkuText(sku), value: sku.id })), selectedSkuId)}</select><small>内部编码：${escapeHtml(selectedSkuId || '-')}</small></label>
          <label>库存类型<select name="type">${optionHtml([{ label: '卡密 card', value: 'card' }, { label: '账号 account', value: 'account' }, { label: '优惠码 coupon', value: 'coupon' }], preview?.type || 'card')}</select></label>
          <label class="wide">库存内容<textarea name="items" placeholder="卡密格式：CODE-AAAA-BBBB&#10;账号格式：账号----密码----邮箱----邮箱密码----备注">${escapeHtml(preview?.items || '')}</textarea></label>
          <div class="admin-form-actions"><button class="secondary" data-import-mode="preview" type="submit">校验格式</button><button class="primary small" data-import-mode="commit" type="submit" ${preview && !preview.errors.length ? '' : 'disabled'}>确认导入</button></div>
        </form>${inventoryPreviewPanel(preview)}`}</div>`;
    } else if (sub === 'records') {
      const skuById = new Map(skuRows.map(({ product, sku }) => [sku.id, { product, sku }]));
      body = `<div class="admin-panel">${adminTable([{ label: '导入批次' }, { label: '商品 / SKU', width: '1.5fr' }, { label: '导入结果' }, { label: '总条数' }, { label: '成功' }, { label: '重复' }, { label: '失败' }, { label: '导入时间' }, { label: '操作' }], (ops.inventoryBatches || []).map((b) => {
        const mapped = skuById.get(b.skuId) || {};
        return [
          `<b>${escapeHtml(String(b.id).slice(0, 14))}</b><small>${inventoryTypeLabel(b.type)}</small>`,
          `<b>${escapeHtml(mapped.product?.name || b.productId || '-')}</b><small>${escapeHtml(inventorySkuText(mapped.sku || { skuId: b.skuId }))}</small>`,
          adminStatus(Number(b.failedCount || 0) ? '部分成功' : '成功', Number(b.failedCount || 0) ? 'warning' : 'success'),
          b.totalCount ?? 0,
          `<b class="admin-text-success">${b.successCount ?? 0}</b>`,
          `<b class="admin-text-warning">${b.duplicateCount ?? 0}</b>`,
          `<b class="admin-text-danger">${b.failedCount ?? 0}</b>`,
          timeFrom(b.createdAt),
          `<button class="ghost" data-action="adminGoImport" data-sku="${escapeHtml(b.skuId || '')}" data-product="${escapeHtml(b.productId || '')}" type="button">继续导入</button>`
        ];
      }), { title: '暂无导入记录', desc: '每次确认导入都会生成批次记录，方便回溯和审计。' })}</div>`;
    } else {
      const rows = invSlice.items || [];
      const errorBanner = invSlice.error ? `<div class="admin-risk-callout danger"><b>库存加载失败</b><span>${escapeHtml(invSlice.error)}</span></div>` : '';
      body = `${adminToolbar([{ name: 'q', label: '搜索库存', placeholder: '商品 / SKU 规格 / 内部编码' }, { name: 'productId', label: '商品', type: 'select', value: '全部商品', options: productList.map((p) => ({ label: p.name, value: p.id })) }, { name: 'status', label: '状态', type: 'select', value: '全部状态', options: [{label:'可售',value:'available'},{label:'订单占用',value:'reserved'},{label:'已发货',value:'delivered'},{label:'已作废',value:'revoked'}] }], '<button class="primary small" data-action="adminSubTab" data-tab="inventory" data-subtab="import" type="button">批量导入</button>', scope)}${errorBanner}<div class="admin-panel">${invSlice.loading ? '<div class="admin-empty"><b>加载中…</b><span>正在拉取库存列表。</span></div>' : adminTable([{ label: '商品', width: '1.2fr' }, { label: 'SKU', width: '1.45fr' }, { label: '发货方式' }, { label: '可售' }, { label: '锁定' }, { label: '已售' }, { label: '状态' }, { label: '更新时间' }, { label: '操作', width: 'minmax(140px, .9fr)', sticky: true }], rows.map((i) => [
        `<b>${escapeHtml(i.productName || i.productId || '-')}</b><small>${escapeHtml(i.productId || '')}</small>`,
        inventorySkuCell(i),
        deliveryLabel(i.deliveryType || i.productDeliveryType),
        `<b class="${Number(i.available || 0) <= 0 ? 'admin-text-danger' : 'admin-text-success'}">${Number(i.available || 0)}</b>`,
        `<b class="${Number(i.reserved || 0) ? 'admin-text-warning' : ''}">${Number(i.reserved || 0)}</b>`,
        `<b>${Number(i.delivered || 0)}</b>`,
        adminStatus(Number(i.available || 0) <= 0 ? '缺货' : (Number(i.available || 0) <= Number(i.warningStock || 5) ? '库存紧张' : '正常'), adminInventorySummaryTone(i)),
        timeFrom(i.updatedAt),
        (i.deliveryType || i.productDeliveryType) === 'manual'
          ? `<button class="ghost" data-action="adminProductSkus" data-id="${escapeHtml(i.productId || '')}" type="button">查看 SKU</button>`
          : `<button data-action="adminGoImport" data-sku="${escapeHtml(i.skuId || '')}" data-product="${escapeHtml(i.productId || '')}" type="button">补货</button>`
      ]), { title: rows.length ? '没有匹配库存' : '暂无库存 SKU', desc: (filters.q || filters.productId || filters.status) ? '调整商品、状态或关键词后重试。' : '自动发货 SKU 会在这里按商品和 SKU 聚合显示。' })}${adminPagerServer('inventory')}</div>`;
    }
    return adminPage('库存管理', '管理商品 SKU 的可售、订单占用、已发货和作废状态，系统将在订单支付后自动发货。', body, { tabKey: 'inventory', tabs });
  }
  if (tab === 'orders') {
    let sub = currentAdminSubTab(tab, 'list');
    if (!['list', 'deliveries'].includes(sub)) {
      state.adminSubTabs.orders = 'list';
      sub = 'list';
    }
    const tabs = ['list|商品订单', 'deliveries|交付记录'].map((item) => { const [key, label] = item.split('|'); return { key, label, active: sub === key }; });
    const scope = adminFilterScope(tab, sub === 'list' ? '' : sub);
    const filters = adminFiltersFor(scope);
    const slice = state.adminPages.orders;
    const orderTab = state.adminOrderTab || 'all';
    const orderTabs = [
      ['all', '全部'],
      ['pending_payment', '待支付'],
      ['undelivered', '待发货'],
      ['delivered', '已发货'],
      ['delivery_failed', '发货异常'],
      ['refunded', '退款']
    ];
    const orderTabCount = (key) => key === orderTab ? (slice.total || orderList.length || 0) : 0;
    const errorBanner = slice.error ? `<div class="admin-risk-callout danger"><b>订单加载失败</b><span>${escapeHtml(adminFriendlyError(slice.error))}</span></div>` : '';
    const orderRowActions = (o) => {
      const btns = [`<button data-action="adminOrderDetail" data-id="${escapeHtml(o.id)}" type="button">查看</button>`];
      const paid = o.paymentStatus === 'paid' || ['paid', 'delivering', 'completed'].includes(o.status);
      if (!paid) btns.push(`<button class="ghost" data-action="adminConfirmPayment" data-id="${escapeHtml(o.id)}" type="button">确认支付</button>`);
      if (paid && o.deliveryStatus !== 'delivered') btns.push(`<button class="ghost" data-action="adminDeliver" data-id="${escapeHtml(o.id)}" type="button">发货</button>`);
      if (['completed', 'delivered'].includes(o.deliveryStatus) || ['completed'].includes(o.status)) btns.push(`<button class="ghost" data-action="adminOrderAfterSale" data-id="${escapeHtml(o.id)}" type="button">售后</button>`);
      return btns.join('');
    };
    const rows = orderList.map((o) => [
      `<b>${escapeHtml(o.orderNo)}</b><small>${escapeHtml(String(o.id).slice(0, 8))}</small>`,
      `${escapeHtml(o.productName)}<small>${escapeHtml(Object.values(o.options || {}).join(' / '))}</small>`,
      `<b>${formatUsdt(o.payAmount || o.amountUsdt)}</b> USDT<small>原价 ${Number(o.amountUsdt || 0).toFixed(2)}</small>`,
      adminStatus(paymentStatusLabel(o.paymentStatus), paymentTone(o.paymentStatus)),
      adminStatus(deliveryStatusLabel(o.deliveryStatus), deliveryTone(o.deliveryStatus)),
      `${escapeHtml(o.telegramUsername || '-')}<small>${escapeHtml(o.email || '')}</small>`,
      timeFrom(o.createdAt),
      orderRowActions(o)
    ]);
    const hasFilter = !!(filters.q || filters.range || orderTab !== 'all');
    const emptyState = hasFilter
      ? { title: '没有匹配订单', desc: '清空筛选或切换状态后重试。' }
      : { title: '暂无订单数据', desc: '前台产生订单后将在这里显示。', action: '<a class="primary small link-button" href="/" target="_blank" rel="noopener">去前台查看</a>' };
    let body = '';
    if (sub === 'deliveries') {
      const deliveries = state.adminData.deliveries || [];
      const ordersById = new Map(orderList.map((o) => [String(o.id), o]));
      body = `<div class="admin-panel"><div class="admin-section-title"><h2>交付记录</h2><span>查看订单发货结果与交付状态。</span></div>${adminTable([{ label: '订单号' }, { label: '商品' }, { label: '发货方式' }, { label: '发货结果' }, { label: '交付时间' }], deliveries.map((d) => {
        const matchedOrder = ordersById.get(String(d.orderId || '')) || {};
        return [
          escapeHtml(d.orderNo || matchedOrder.orderNo || d.orderId || '-'),
          escapeHtml(d.productName || matchedOrder.productName || d.productId || '-'),
          d.method === 'auto' ? '自动发货' : d.method === 'manual' ? '人工发货' : escapeHtml(d.method || '-'),
          adminStatus(d.status === 'sent' ? '发货成功' : d.status === 'failed' ? '发货失败' : d.status, d.status === 'sent' ? 'success' : adminToneFromStatus(d.status)),
          timeFrom(d.createdAt)
        ];
      }), { title: '暂无发货记录', desc: '订单完成发货后将在这里显示。', action: '<a class="primary small link-button" href="/" target="_blank" rel="noopener">去前台查看</a>' })}</div>`;
    } else {
      body = `${adminToolbar([{ name: 'q', label: '关键词搜索', placeholder: '搜索订单号、用户 UID、Telegram 或 TXID' }, { name: 'range', label: '时间范围', type: 'select', value: '近7天', options: ['今天','近30天','自定义'] }], '', scope)}<div class="admin-tabs static admin-status-tabs">${orderTabs.map(([key, label]) => `<button class="${orderTab === key ? 'active' : ''}" data-action="adminOrderTab" data-order-tab="${key}" type="button">${label}（${orderTabCount(key)}）</button>`).join('')}</div>${errorBanner}<div class="admin-panel admin-orders-panel">${slice.loading ? '<div class="admin-empty"><b>加载中…</b><span>正在加载订单数据...</span></div>' : adminTable([{ label: '订单号', width: '1.1fr' }, { label: '商品', width: '1.2fr' }, { label: '金额', width: '.72fr' }, { label: '支付状态', width: '.68fr' }, { label: '发货状态', width: '.68fr' }, { label: '用户', width: '1fr' }, { label: '创建时间', width: '.86fr' }, { label: '操作', width: '.9fr', sticky: true }], rows, emptyState)}${adminPagerServer('orders')}</div>${adminOrderDetailPanel()}`;
    }
    return adminPage('订单管理', '统一管理订单状态、支付结果与发货记录。', body, { tabKey: 'orders', tabs });
  }
  if (tab === 'recharge') {
    const sub = currentAdminSubTab(tab, 'orders');
    const tabs = ['orders|充值订单', 'ledger|余额流水'].map((item) => { const [key, label] = item.split('|'); return { key, label, active: sub === key }; });
    const scope = adminFilterScope(tab, sub);
    const filters = adminFiltersFor(scope);
    const ledgerRows = accountWalletLedgerEntries().filter((item) => {
      const q = String(filters.q || '').toLowerCase();
      const isRecharge = item.type === '充值' || item.type === '充值订单' || item.type === '充值入账';
      if (sub === 'orders' && !isRecharge) return false;
      if (filters.method && !['全部方式', '全部'].includes(filters.method) && !String(item.method || item.detail || '').toLowerCase().includes(String(filters.method).toLowerCase())) return false;
      if (filters.status && !['全部状态', '全部'].includes(filters.status) && String(item.status || '成功') !== filters.status) return false;
      return !q || [item.type, item.method, item.detail, item.status].some((v) => String(v || '').toLowerCase().includes(q));
    });
    const body = `${adminToolbar([{ name: 'q', label: sub === 'orders' ? '搜索充值订单' : '搜索余额流水', placeholder: '订单号 / TxID / 类型 / 状态' }, { name: 'method', label: '支付方式', type: 'select', value: '全部方式', options: ['USDT','支付宝','余额'] }, { name: 'status', label: '状态', type: 'select', value: '全部状态', options: ['成功','待确认','失败'] }], '', scope)}
      <div class="admin-panel">${adminTable([{ label: sub === 'orders' ? '充值单' : '流水类型' }, { label: '金额' }, { label: '方式 / 详情', width: '2fr' }, { label: '时间' }, { label: '状态' }], ledgerRows.map((item) => [
        `<b>${escapeHtml(item.type)}</b>`,
        `<b>${Number(item.amount || 0).toFixed(2)}</b> USDT`,
        `${escapeHtml(item.method || '-')}<small>${escapeHtml(item.detail || '')}</small>`,
        escapeHtml(item.time || '-'),
        adminStatus(item.status || '成功', item.tone === 'warning' || item.status === '待确认' ? 'warning' : item.tone === 'danger' || item.status === '失败' ? 'danger' : 'success')
      ]), { title: sub === 'orders' ? '暂无充值订单' : '暂无余额流水', desc: sub === 'orders' ? '用户创建充值单后会显示在这里。' : '充值、消费、退款和后台调整会沉淀为余额流水。' })}${adminPager(ledgerRows.length)}</div>`;
    return adminPage('充值流水', '只管理充值订单和用户余额变化，不混入商品订单支付处理。', body, { tabKey: 'recharge', tabs });
  }
  if (tab === 'payments') {
    const sub = currentAdminSubTab(tab, 'networks');
    const tabs = ['networks|支付网络', 'addresses|收款地址', 'transactions|到账交易', 'exceptions|支付异常'].map((item) => { const [key, label] = item.split('|'); return { key, label, active: sub === key }; });
    const providerBanner = `<div class="admin-risk-callout"><b>当前支付通道：USDT TRC20 直付</b><span>新订单使用固定 TRON 收款地址、三位小数尾差和 TronGrid 轮询自动确认。</span></div>`;
    const txSlice = state.adminPages.transactions;
    const scope = adminFilterScope(tab, sub);
    let body = '';
    if (sub === 'addresses') {
      body = `${providerBanner}<div class="admin-panel"><div class="admin-section-title"><h2>USDT TRC20 收款配置</h2><span>固定地址收款，订单通过精确金额自动匹配。修改地址、确认数均需二次确认并写审计。</span></div>${adminPaymentAddressForm(networkList)}${adminTable([{ label: '网络' }, { label: '收款地址', width: '2fr' }, { label: '用途' }, { label: '状态' }, { label: '确认数' }, { label: '操作' }], networkList.map((n) => [escapeHtml(n.displayName || n.code), escapeHtml(n.address || '-'), '订单收款', adminStatus((n.enabled ?? n.isEnabled) ? '启用' : '关闭', (n.enabled ?? n.isEnabled) ? 'success' : 'neutral'), n.confirmations || 3, `<button data-action="adminEditConfirmations" data-code="${escapeHtml(n.code)}" data-confirmations="${n.confirmations || 3}" type="button">修改确认数</button>`]), { title: '暂无收款地址', desc: '启用支付网络前需要配置收款地址。' })}</div>`;
    } else if (sub === 'transactions') {
      const errorBanner = txSlice.error ? `<div class="admin-risk-callout danger"><b>到账交易加载失败</b><span>${escapeHtml(txSlice.error)}</span></div>` : '';
      body = `${adminToolbar([{ name: 'q', label: '搜索交易', placeholder: 'txHash / 地址 / 订单号' }, { name: 'matchStatus', label: '匹配状态', type: 'select', value: '全部状态', options: [{label:'已匹配 matched',value:'matched'},{label:'人工确认 manual_confirm',value:'manual_confirm'},{label:'确认中 confirming',value:'confirming'},{label:'重复 duplicate',value:'duplicate'},{label:'异常 exception',value:'exception'},{label:'未匹配 unmatched',value:'unmatched'},{label:'已忽略 ignored',value:'ignored'}] }], '<button class="primary small" data-action="adminRescanPayments" type="button">重新扫描链上</button>', scope)}${errorBanner}<div class="admin-panel">${txSlice.loading ? '<div class="admin-empty"><b>加载中…</b><span>正在拉取到账交易。</span></div>' : adminTable([{ label: 'Hash', width: '1.8fr' }, { label: '网络' }, { label: '金额' }, { label: '付款地址' }, { label: '收款地址' }, { label: '匹配订单' }, { label: '确认数' }, { label: '状态' }, { label: '检测时间' }], (txSlice.items || []).map((t) => [`<b>${escapeHtml(String(t.txHash).slice(0, 18))}…</b>`, escapeHtml(t.network), `${formatUsdt(t.amount)} ${escapeHtml(t.token || 'USDT')}`, escapeHtml(t.fromAddress || '-'), escapeHtml(t.toAddress || '-'), escapeHtml(t.matchedOrderNo || '未绑定'), t.confirmations ?? 0, adminStatus(matchStatusLabel(t.matchStatus), paymentToneFromMatch(t.matchStatus)), timeFrom(t.detectedAt || t.createdAt)]), { title: '暂无到账交易', desc: 'TronGrid 监听或重新扫描会写入到账交易记录。' })}${adminPagerServer('transactions')}</div>`;
    } else if (sub === 'exceptions') {
      const errorBanner = txSlice.error ? `<div class="admin-risk-callout danger"><b>支付异常加载失败</b><span>${escapeHtml(txSlice.error)}</span></div>` : '';
      body = `${adminToolbar([{ name: 'q', label: '搜索异常', placeholder: 'txHash / 订单号' }, { name: 'exceptionType', label: '异常类型', type: 'select', value: '全部类型', options: [{label:'等待确认 confirming',value:'confirming'},{label:'重复 Hash',value:'duplicate_tx'},{label:'金额冲突',value:'amount_collision'},{label:'多付',value:'overpaid'},{label:'少付',value:'underpaid'},{label:'未匹配',value:'unmatched'}] }], '<button class="secondary" data-action="adminRescanPayments" type="button">重新扫描</button>', scope)}${errorBanner}<div class="admin-panel">${txSlice.loading ? '<div class="admin-empty"><b>加载中…</b><span>正在拉取支付异常。</span></div>' : adminTable([{ label: '异常类型' }, { label: 'Hash', width: '1.6fr' }, { label: '金额' }, { label: '可能订单' }, { label: '原因' }, { label: '状态' }, { label: '操作', width: '1.4fr' }], (txSlice.items || []).map((t) => [exceptionTypeLabel(t.exceptionType || t.matchStatus), `${escapeHtml(String(t.txHash).slice(0, 16))}…`, `${formatUsdt(t.amount)} USDT`, escapeHtml(t.matchedOrderNo || '-'), escapeHtml(t.note || '需要人工核验'), adminStatus(matchStatusLabel(t.matchStatus), paymentToneFromMatch(t.matchStatus)), `<button data-action="adminPaymentBind" data-id="${escapeHtml(t.id)}" data-tx="${escapeHtml(t.txHash)}" data-amount="${escapeHtml(t.amount)}" type="button">人工绑定</button><button class="danger-text" data-action="adminPaymentIgnore" data-id="${escapeHtml(t.id)}" type="button">忽略</button>`]), { title: '暂无支付异常', desc: '少付、多付、金额冲突、重复 Hash、未匹配交易会显示在这里。' })}${adminPagerServer('transactions')}</div>`;
    } else {
      body = `${providerBanner}<div class="admin-panel">${adminTable([{ label: '网络' }, { label: '协议' }, { label: '币种' }, { label: '固定收款地址', width: '1.6fr' }, { label: '确认数' }, { label: '状态' }, { label: '推荐' }, { label: '操作', width: '1.6fr' }], networkList.map((n) => [escapeHtml(n.displayName || n.code), escapeHtml(n.tokenStandard || '-'), 'USDT', escapeHtml(n.address || '-'), n.confirmations || 3, adminStatus((n.enabled ?? n.isEnabled) ? '已启用' : '已关闭', (n.enabled ?? n.isEnabled) ? 'success' : 'neutral'), adminStatus((n.recommended ?? n.isRecommended) ? '推荐' : '普通', (n.recommended ?? n.isRecommended) ? 'success' : 'neutral'), `<button class="${(n.enabled ?? n.isEnabled) ? 'danger-text' : ''}" data-action="adminToggleNetwork" data-code="${escapeHtml(n.code)}" type="button">${(n.enabled ?? n.isEnabled) ? '关闭' : '启用'}</button><button data-action="adminEditConfirmations" data-code="${escapeHtml(n.code)}" data-confirmations="${n.confirmations || 3}" type="button">确认数</button>`]), { title: '暂无支付网络', desc: '当前只开放 TRON / USDT TRC20。' })}</div>`;
    }
    return adminPage('支付中心', '管理支付网络、收款地址、到账交易和支付异常。', body, { tabKey: 'payments', tabs });
  }
  if (tab === 'delivery') {
    const sub = currentAdminSubTab(tab, 'queue');
    const tabs = ['queue|待发货队列', 'failed|自动发货失败', 'logs|发货日志', 'capacity|商品发货能力'].map((item) => { const [key, label] = item.split('|'); return { key, label, active: sub === key }; });
    const deliveries = state.adminData.deliveries || [];
    let body = '';
    if (sub === 'failed') {
      const rows = orderList.filter((o) => o.deliveryStatus === 'failed' || (o.deliveryStatus === 'manual_required' && (o.deliveryType === 'auto' || o.deliveryType === 'mixed')));
      body = `<div class="admin-panel"><div class="admin-section-title"><h2>自动发货失败 / 待人工介入</h2><span>自动发货失败或库存不足转人工的订单，可人工发货补救。</span></div>${adminTable([{ label: '订单号' }, { label: '商品' }, { label: '用户' }, { label: '发货状态' }, { label: '时间' }, { label: '操作', width: 'minmax(132px, .9fr)', sticky: true }], rows.map((o) => [escapeHtml(o.orderNo), escapeHtml(o.productName), escapeHtml(o.telegramUsername || o.email || '-'), adminStatus(deliveryStatusLabel(o.deliveryStatus), deliveryTone(o.deliveryStatus)), timeFrom(o.createdAt), `<button data-action="adminDeliver" data-id="${escapeHtml(o.id)}" type="button">人工发货</button>`]), { title: '暂无失败发货', desc: '自动发货失败或库存为空转人工的订单会进入这里。' })}</div>`;
    } else if (sub === 'logs') {
      body = `<div class="admin-panel"><div class="admin-section-title"><h2>发货日志</h2><span>自动与人工发货记录（脱敏）。</span></div>${adminTable([{ label: '订单' }, { label: '方式' }, { label: '内容(脱敏)' }, { label: '操作人' }, { label: '状态' }, { label: '时间' }], deliveries.map((dv) => [escapeHtml(dv.orderId ? String(dv.orderId).slice(0, 8) : '-'), dv.method === 'auto' ? '自动' : '人工', escapeHtml(dv.maskedContent || '***'), escapeHtml(dv.operator || '-'), adminStatus(dv.status === 'sent' ? '已发送' : dv.status, dv.status === 'sent' ? 'success' : 'warning'), timeFrom(dv.createdAt)]), { title: '暂无发货日志', desc: '每次自动或人工发货都会留下记录。' })}</div>`;
    } else if (sub === 'capacity') {
      body = `<div class="admin-panel"><div class="admin-section-title"><h2>商品发货能力</h2><span>查看各商品发货方式与库存来源。</span></div>${adminTable([{ label: '商品' }, { label: '发货能力' }, { label: 'SKU 数' }, { label: '可用库存' }, { label: '操作', width: 'minmax(150px, 1fr)', sticky: true }], productList.map((p) => [escapeHtml(p.name), deliveryLabel(p.deliveryType), (p.skus || []).length, p.availableInventory ?? 0, `<button class="ghost" data-action="adminProductSkus" data-id="${escapeHtml(p.id)}" type="button">配置库存来源</button>`]), { title: '暂无商品', desc: '商品创建后需要绑定库存来源和发货规则。' })}</div>`;
    } else {
      const rows = orderList.filter((o) => (o.paymentStatus === 'paid' || ['paid', 'delivering'].includes(o.status)) && o.deliveryStatus !== 'delivered');
      body = `<div class="admin-panel"><div class="admin-section-title"><h2>待发货队列</h2><span>已支付待发货订单，可人工发货。</span></div>${adminTable([{ label: '订单号' }, { label: '商品 / SKU', width: '1.5fr' }, { label: '用户' }, { label: '发货方式' }, { label: '发货状态' }, { label: '创建时间' }, { label: '操作', width: 'minmax(176px, 1.15fr)', sticky: true }], rows.map((o) => [escapeHtml(o.orderNo), `${escapeHtml(o.productName)}<small>${escapeHtml(Object.values(o.options || {}).join(' / '))}</small>`, escapeHtml(o.telegramUsername || o.email || '-'), deliveryLabel(o.deliveryType), adminStatus(deliveryStatusLabel(o.deliveryStatus), deliveryTone(o.deliveryStatus)), timeFrom(o.createdAt), `<button data-action="adminDeliver" data-id="${escapeHtml(o.id)}" type="button">人工发货</button><button class="ghost" data-action="adminOrderDetail" data-id="${escapeHtml(o.id)}" type="button">详情</button>`]), { title: '暂无待发货订单', desc: '已支付待发货的订单会进入履约队列。' })}</div>`;
    }
    return adminPage('发货中心', '自动发货、人工队列、失败重试与履约日志工作台。人工发货需二次确认并写审计。', body, { tabKey: 'delivery', tabs });
  }
  if (tab === 'support') {
    const sub = currentAdminSubTab(tab, 'list');
    const tabs = ['list|工单列表', 'detail|工单详情', 'types|问题类型'].map((item) => { const [key, label] = item.split('|'); return { key, label, active: sub === key }; });
    const scope = adminFilterScope(tab, sub === 'list' ? '' : sub);
    const filters = adminFiltersFor(scope);
    const allTickets = state.adminData.supportTickets || [];
    const statusMap = { open: '待处理', in_progress: '处理中', replied: '已回复', resolved: '已解决', closed: '已关闭' };
    const priorityMap = { normal: '普通', high: '高', urgent: '紧急' };
    const tickets = allTickets.filter((t) => {
      const q = (filters.q || '').toLowerCase();
      if (q && ![t.ticketNo, t.id, t.orderNo, t.orderId, t.user, t.telegramUsername].some((v) => String(v || '').toLowerCase().includes(q))) return false;
      if (filters.status && !['全部状态', '全部'].includes(filters.status) && (statusMap[t.status] || t.status) !== filters.status) return false;
      if (filters.priority && !['全部优先级', '全部'].includes(filters.priority) && (priorityMap[t.priority] || t.priority || '普通') !== filters.priority) return false;
      return true;
    });
    const hasFilter = !!(filters.q || (filters.status && !['全部状态','全部'].includes(filters.status)) || (filters.priority && !['全部优先级','全部'].includes(filters.priority)));
    const emptyState = hasFilter
      ? { title: '没有匹配工单', desc: '当前筛选条件下没有工单，可清除筛选或切换状态。' }
      : { title: '暂无售后工单', desc: '工单来自用户在订单详情页提交的售后申请。如需测试，可在前台创建订单后提交售后。' };
    let body = '';
    if (sub === 'types') {
      body = `<div class="admin-panel"><div class="admin-section-title"><h2>问题类型</h2><span>围绕订单和充值处理，不开放营销、内容类工单。</span></div>${adminTable([{ label: '类型' }, { label: '适用对象' }, { label: '处理建议', width: '2fr' }, { label: '状态' }], [
        ['商品未到账', '商品订单', '先查交付记录，再按订单补发'],
        ['卡密无效', '商品订单', '核对库存明文查看审计，必要时作废并补发'],
        ['支付成功未到账', '商品订单 / 充值', '核对 TxID、金额和匹配状态'],
        ['充值未到账', '充值订单', '核对充值单与余额流水'],
        ['余额调整', '充值 / 余额', '核对原因后走余额调整记录']
      ].map((row) => [escapeHtml(row[0]), escapeHtml(row[1]), escapeHtml(row[2]), adminStatus('启用', 'success')]), { title: '暂无问题类型', desc: '默认问题类型会覆盖订单和充值售后。' })}</div>`;
    } else if (sub === 'detail') {
      body = `<div class="admin-panel">${adminTable([{ label: '工单号' }, { label: '订单/充值' }, { label: '问题' }, { label: '状态' }, { label: '最近更新' }, { label: '操作', sticky: true }], tickets.map((t) => [escapeHtml(t.ticketNo || t.id), escapeHtml(t.orderNo || t.orderId || '-'), escapeHtml(t.type || '售后问题'), adminStatus(statusMap[t.status] || t.status || '待处理', adminToneFromStatus(t.status)), timeFrom(t.updatedAt || t.createdAt), `<button data-action="adminReplyTicket" data-id="${escapeHtml(t.id)}" type="button">处理</button>`]), emptyState)}</div>`;
    } else {
      body = `${adminToolbar([{ name: 'q', label: '搜索工单', placeholder: '工单号 / 订单号 / 用户' }, { name: 'status', label: '状态', type: 'select', value: '全部状态', options: ['待处理','处理中','已回复','已解决','已关闭'] }, { name: 'priority', label: '优先级', type: 'select', value: '全部优先级', options: ['普通','高','紧急'] }], '', scope)}<div class="admin-panel">${adminTable([{ label: '工单号' }, { label: '订单号' }, { label: '用户' }, { label: '问题类型' }, { label: '状态' }, { label: '优先级' }, { label: '负责人' }, { label: '创建时间' }, { label: '操作', width: 'minmax(180px, 1.3fr)', sticky: true }], tickets.map((t) => [escapeHtml(t.ticketNo || t.id), escapeHtml(t.orderNo || t.orderId || '-'), escapeHtml(t.user || t.telegramUsername || '-'), escapeHtml(t.type || '售后问题'), adminStatus(statusMap[t.status] || t.status || '待处理', adminToneFromStatus(t.status)), adminStatus(priorityMap[t.priority] || t.priority || '普通', t.priority === 'urgent' ? 'danger' : (t.priority === 'high' ? 'warning' : 'neutral')), escapeHtml(t.owner || '未分配'), timeFrom(t.createdAt), `<button data-action="adminReplyTicket" data-id="${escapeHtml(t.id)}" type="button">回复</button>${t.orderId ? `<button class="ghost" data-action="adminDeliver" data-id="${escapeHtml(t.orderId)}" type="button">补发</button>` : ''}`]), emptyState)}</div>`;
    }
    return adminPage('售后工单', '围绕商品订单、充值订单和余额变化处理售后问题。', body, { tabKey: 'support', tabs });
  }
  if (tab === 'notifications') return adminPage('通知中心', '管理 Telegram、邮件、站内通知模板与发送记录。', `<div class="admin-panel">${adminActionForm('template.save', [['type','模板类型','text','stock_warning'], ['title','标题'], ['content','模板内容','textarea','支持 {{orderNo}} {{skuName}} 等变量'], ['enabled','启用','checkbox']], '保存通知模板')}${adminTable([{ label: '模板类型' }, { label: '标题' }, { label: '状态' }, { label: '内容', width: '2fr' }], (ops.notificationTemplates || []).map((n) => [escapeHtml(n.type), escapeHtml(n.title), adminStatus(n.enabled ? '启用' : '停用', n.enabled ? 'success' : 'neutral'), escapeHtml(n.content)]), { title: '暂无通知模板', desc: '库存预警、订单支付、发货成功和售后回复都应配置通知模板。' })}</div><div class="admin-panel">${adminTable([{ label: '类型' }, { label: '渠道' }, { label: '提供方' }, { label: '状态' }, { label: '创建时间' }], state.adminData.notifications.map((n) => [escapeHtml(n.type), escapeHtml(n.channel), escapeHtml(n.provider), adminStatus(n.status, adminToneFromStatus(n.status)), timeFrom(n.createdAt)]), { title: '暂无通知记录', desc: '通知发送成功、失败和重试记录会显示在这里。' })}</div>`);
  if (tab === 'audit') {
    const scope = adminFilterScope(tab);
    const filters = adminFiltersFor(scope);
    const all = state.adminData.auditLogs || [];
    const actionOptions = [
      { label: '商品修改', value: 'product.update' }, { label: 'SKU 修改', value: 'sku.update' },
      { label: '库存导入', value: 'inventory.import' }, { label: '查看库存明文', value: 'inventory.reveal' },
      { label: '作废库存', value: 'inventory.revoke' }, { label: '手动确认支付', value: 'order.confirm_payment' },
      { label: '人工发货', value: 'order.manual_deliver' }, { label: '黑名单变更', value: 'blacklist.create' },
      { label: '支付配置变更', value: 'payment_network.update' }, { label: '权限/角色变更', value: 'tag.update' }
    ];
    const rangeMap = { '今天': 1, '近 7 天': 7, '近 30 天': 30 };
    const now = Date.now();
    const logs = all.filter((log) => {
      const q = (filters.q || '').toLowerCase();
      if (q && ![log.action, log.target, log.targetId, log.actorId].some((v) => String(v || '').toLowerCase().includes(q))) return false;
      if (filters.action && !['全部类型', '全部'].includes(filters.action) && log.action !== filters.action) return false;
      if (filters.range && rangeMap[filters.range]) {
        const ts = new Date(log.createdAt).getTime();
        if (Number.isFinite(ts) && now - ts > rangeMap[filters.range] * 86400000) return false;
      }
      return true;
    });
    const hasFilter = !!(filters.q || (filters.action && !['全部类型','全部'].includes(filters.action)) || (filters.range && filters.range !== '全部时间'));
    return adminPage('审计', '记录高风险操作、配置修改和人工处理行为。高风险操作以红色标记。', `${adminToolbar([{ name: 'q', label: '搜索日志', placeholder: '动作 / 对象 / 操作人' }, { name: 'action', label: '操作类型', type: 'select', value: '全部类型', options: actionOptions }, { name: 'range', label: '时间范围', type: 'select', value: '全部时间', options: ['今天','近 7 天','近 30 天'] }], '', scope)}<div class="admin-panel">${adminTable([{ label: '动作' }, { label: '操作人' }, { label: '对象' }, { label: '对象 ID' }, { label: '时间' }, { label: '操作', sticky: true }], logs.map((log) => [`${auditActionRisk(log.action) ? '<span class="admin-risk-dot"></span>' : ''}${auditActionLabel(log.action)}<small>${escapeHtml(log.action)}</small>`, auditActorLabel(log), escapeHtml(log.target || '-'), truncateId(log.targetId), timeFrom(log.createdAt), `<button class="ghost" data-action="adminAuditDetail" data-id="${escapeHtml(log.id)}" type="button">详情</button>`]), hasFilter ? { title: '没有匹配日志', desc: '调整操作类型、时间范围或关键词后重试。' } : { title: '暂无审计日志', desc: '修改价格、库存明文查看、收款地址、手动确认支付等操作必须留下审计。' })}</div>${adminAuditDetailPanel()}`);
  }
  if (tab === 'users') {
    const requestedSub = currentAdminSubTab(tab, 'list');
    const sub = requestedSub === 'balance' ? 'balance' : 'list';
    const tabs = ['list|客户列表', 'balance|余额流水'].map((item) => { const [key, label] = item.split('|'); return { key, label, active: sub === key }; });
    const scope = adminFilterScope(tab, sub);
    let body = '';
    if (sub === 'balance') {
      const filters = adminFiltersFor(scope);
      const ledger = adminUserLedgerRows('', 12).filter((item) => matchesQuery(item, filters.q || ''));
      body = `<div class="admin-users-surface">${adminToolbar([{ name: 'q', label: '流水搜索', hideLabel: true, placeholder: '搜索邮箱、Telegram 用户名、订单号' }], '', scope)}<div class="admin-panel admin-users-panel">${adminTable([{ label: '用户', width: '1.25fr' }, { label: '变动类型' }, { label: '金额' }, { label: '来源', width: '2fr' }, { label: '时间' }, { label: '状态' }], ledger.map((item) => [escapeHtml(item.user), escapeHtml(item.type), adminLedgerAmount(item.amount), escapeHtml(item.source), escapeHtml(item.time || '-'), adminStatus(item.status || '成功', adminLedgerTone(item))]), { title: '暂无余额变动记录', desc: '用户充值、消费和退款后将在这里显示。' })}</div></div>`;
    } else {
      const slice = state.adminPages.users;
      const uq = adminFiltersFor(scope).q;
      const errorBanner = slice.error ? `<div class="admin-risk-callout danger"><b>用户加载失败</b><span>${escapeHtml(adminFriendlyError(slice.error))}</span></div>` : '';
      const usersEmpty = uq
        ? { title: '没有匹配客户', desc: '当前搜索条件下没有客户，可清空搜索后重试。' }
        : { title: '暂无客户数据', desc: '客户将在首次下单后自动创建。' };
      body = `<div class="admin-users-surface">${adminToolbar([{ name: 'q', label: '搜索客户', hideLabel: true, placeholder: '搜索邮箱、Telegram 用户名' }], '', scope)}${errorBanner}<div class="admin-panel admin-users-panel">${slice.loading ? '<div class="admin-empty"><b>加载中…</b><span>正在拉取客户列表。</span></div>' : adminTable([{ label: '客户', width: '1.6fr' }, { label: '累计消费 (USDT)' }, { label: '订单数' }, { label: '最近消费时间', width: '1.18fr' }, { label: '售后数' }, { label: '风险' }, { label: '操作', width: 'minmax(118px, .8fr)', sticky: true }], (slice.items || []).map((u) => [adminUserIdentity(u), `${formatUsdt(u.paidAmountUsdt)}`, u.orderCount, timeFrom(u.lastOrderAt), u.afterSaleCount, adminUserRiskBadge(u), `<button data-action="adminUserDetail" data-id="${escapeHtml(u.email)}" type="button">查看详情</button>`]), usersEmpty)}${adminPagerServer('users')}</div></div>`;
    }
    return adminPage('用户管理', '查看客户消费、余额和风险情况。', `${body}${adminUserDetailPanel()}`, { tabKey: 'users', tabs });
  }
  if (tab === 'content') {
    const support = adminContentSetting('support_channel', DEFAULT_SUPPORT_CHANNEL);
    return adminPage('内容中心', '管理帮助中心、客服频道和商品详情说明模板。', `
      <div class="admin-panel">
        <div class="admin-section-title"><h2>客服频道配置</h2><span>前台帮助中心侧栏、首页轻分类卡片会读取这里的链接。</span></div>
        <form class="admin-form" data-action="adminOps" data-ops="content.save">
          <input name="key" type="hidden" value="support_channel" />
          <label>标题<input name="value.title" value="${escapeHtml(support.title || DEFAULT_SUPPORT_CHANNEL.title)}" placeholder="客服频道" /></label>
          <label>显示名称<input name="value.label" value="${escapeHtml(support.label || DEFAULT_SUPPORT_CHANNEL.label)}" placeholder="@ichuhaikefu" /></label>
          <label>频道链接<input name="value.url" value="${escapeHtml(support.url || DEFAULT_SUPPORT_CHANNEL.url)}" placeholder="https://t.me/xxxx" /></label>
          <label class="admin-field-wide">说明<textarea name="value.description" placeholder="客服频道说明">${escapeHtml(support.description || DEFAULT_SUPPORT_CHANNEL.description)}</textarea></label>
          <div class="admin-form-actions"><button class="primary small" type="submit">保存客服频道</button></div>
        </form>
      </div>
      <div class="admin-panel">${adminActionForm('faq.create', [['question','问题'], ['answer','答案','textarea'], ['category','分类','text','支付类'], ['sortOrder','排序','number']], '新增 FAQ')}${adminTable([{ label: '问题' }, { label: '分类' }, { label: '状态' }, { label: '答案', width: '2fr' }], (ops.faqs || []).map((f) => [escapeHtml(f.question), escapeHtml(f.category), adminStatus(f.visible ? '显示' : '隐藏', f.visible ? 'success' : 'neutral'), escapeHtml(f.answer)]), { title: '暂无 FAQ', desc: '支付、发货、售后等常见问题可在这里维护，并展示到帮助中心。' })}</div>
      <div class="admin-panel">${adminTable([{ label: '模板' }, { label: '商品类型' }, { label: '状态' }, { label: '内容', width: '2fr' }], (ops.noteTemplates || []).map((n) => [escapeHtml(n.name), escapeHtml(n.productType), adminStatus(n.enabled ? '启用' : '停用', n.enabled ? 'success' : 'neutral'), escapeHtml(n.content)]), { title: '暂无商品详情说明模板', desc: '不同商品类型的说明、售后规则和注意事项可独立维护。' })}</div>
    `);
  }
  if (tab === 'marketing') return adminPage('营销中心', '管理优惠码、商品标签、活动和前台推荐资源位。', `<div class="admin-panel">${adminActionForm('coupon.create', [['name','名称'], ['code','优惠码'], ['discountType','类型','text','amount / percent'], ['discountValue','优惠值'], ['minAmount','最低消费'], ['usageLimit','使用次数','number']], '创建优惠码')}${adminTable([{ label: '优惠码' }, { label: '名称' }, { label: '类型' }, { label: '优惠值' }, { label: '状态' }], (ops.coupons || []).map((c) => [escapeHtml(c.code), escapeHtml(c.name), escapeHtml(c.discountType), escapeHtml(c.discountValue), adminStatus(c.status, adminToneFromStatus(c.status))]), { title: '暂无优惠码', desc: '创建优惠码后可用于活动、客服补偿和复购转化。' })}</div>`);
  if (tab === 'system') {
    const sub = currentAdminSubTab(tab, 'payment');
    const tabs = ['payment|支付设置', 'rates|汇率设置', 'base|基础设置', 'admins|管理员账号'].map((item) => { const [key, label] = item.split('|'); return { key, label, active: sub === key }; });
    let body = '';
    if (sub === 'payment') {
      body = `<div class="admin-risk-callout"><b>支付配置已归入系统设置</b><span>新订单使用 USDT TRC20 固定地址、尾差金额和链上轮询确认；修改地址、确认数会写入审计。</span></div>
        <div class="admin-panel"><div class="admin-section-title"><h2>USDT TRC20 收款配置</h2><span>地址修改只影响新订单。</span></div>${adminPaymentAddressForm(networkList)}${adminTable([{ label: '网络' }, { label: '协议' }, { label: '固定收款地址', width: '2fr' }, { label: '确认数' }, { label: '状态' }, { label: '操作' }], networkList.map((n) => [escapeHtml(n.displayName || n.code), escapeHtml(n.tokenStandard || '-'), escapeHtml(n.address || '-'), n.confirmations || 3, adminStatus((n.enabled ?? n.isEnabled) ? '启用' : '关闭', (n.enabled ?? n.isEnabled) ? 'success' : 'neutral'), `<button data-action="adminEditConfirmations" data-code="${escapeHtml(n.code)}" data-confirmations="${n.confirmations || 3}" type="button">修改确认数</button>`]), { title: '暂无支付网络', desc: '当前只开放 TRON / USDT TRC20。' })}</div>`;
    } else if (sub === 'rates') {
      body = `<div class="admin-panel"><div class="admin-section-title"><h2>汇率设置</h2><span>前台展示和充值折算使用这些汇率；自动同步由 Worker 负责。</span></div>${adminTable([{ label: '币种' }, { label: '显示名' }, { label: '兑 USDT' }, { label: '状态' }], Object.entries(CURRENCIES).map(([code, item]) => [escapeHtml(code), escapeHtml(item.label), item.rate, adminStatus('启用', 'success')]), { title: '暂无汇率', desc: '请检查基础币种配置。' })}</div>`;
    } else if (sub === 'base') {
      const support = adminContentSetting('support_channel', DEFAULT_SUPPORT_CHANNEL);
      body = `<div class="admin-panel"><div class="admin-section-title"><h2>基础设置</h2><span>站点客服、默认文案和后台安全提示。</span></div>
        <form class="admin-form" data-action="adminOps" data-ops="content.save">
          <input name="key" type="hidden" value="support_channel" />
          <label>客服标题<input name="value.title" value="${escapeHtml(support.title || DEFAULT_SUPPORT_CHANNEL.title)}" placeholder="客服频道" /></label>
          <label>显示名称<input name="value.label" value="${escapeHtml(support.label || DEFAULT_SUPPORT_CHANNEL.label)}" placeholder="@ichuhaikefu" /></label>
          <label>频道链接<input name="value.url" value="${escapeHtml(support.url || DEFAULT_SUPPORT_CHANNEL.url)}" placeholder="https://t.me/xxxx" /></label>
          <label class="admin-field-wide">说明<textarea name="value.description" placeholder="客服频道说明">${escapeHtml(support.description || DEFAULT_SUPPORT_CHANNEL.description)}</textarea></label>
          <div class="admin-form-actions"><button class="primary small" type="submit">保存基础设置</button></div>
        </form>
      </div>`;
    } else {
      body = `<div class="admin-panel"><div class="admin-section-title"><h2>管理员账号</h2><span class="admin-readonly-tag">只读配置 · 来源 admin_users</span></div>${adminTable([{ label: '账号' }, { label: '邮箱' }, { label: '角色' }, { label: '状态' }], (ops.adminUsers || []).map((u) => [escapeHtml(u.username), escapeHtml(u.email || '-'), escapeHtml(u.role), adminStatus(u.status === 'active' ? '启用' : '停用', u.status === 'active' ? 'success' : 'neutral')]), { title: '暂无管理员账号', desc: '生产环境至少需要一个拥有二次确认能力的管理员账号。' })}<p class="admin-muted">管理员的新增、禁用、重置密码暂未开放后台写操作，需在部署环境通过环境变量配置。</p></div>
      <div class="admin-panel"><div class="admin-section-title"><h2>角色权限</h2><span class="admin-readonly-tag">只读配置 · 来源 role_permissions</span></div>${adminTable([{ label: '角色' }, { label: '权限', width: '3fr' }, { label: '更新时间' }], (ops.roles || []).map((r) => [escapeHtml(r.role), escapeHtml(Array.isArray(r.permissionsJson) ? r.permissionsJson.join(', ') : r.permissionsJson), timeFrom(r.updatedAt)]), { title: '暂无角色权限', desc: '建议区分运营、客服、财务、超级管理员权限。' })}</div>`;
    }
    return adminPage('系统设置', '维护支付、汇率、基础配置和管理员账号。', body, { tabKey: 'system', tabs });
  }
  return adminContent('dashboard');
}

function faq() {
  const groups = [
    ['公告中心', [
      ['近期公告在哪里看？', '站点公告会集中展示在帮助中心，涉及支付、库存、维护和客服频道调整时会在这里同步。'],
      ['商品库存变化会通知吗？', '热门商品补货、售罄或维护时，会通过站内消息和客服频道同步说明。']
    ]],
    ['下单类', [
      ['我需要提供哪些信息？', '至少需要邮箱账号。部分商品还需要账号 ID、区服或备注。'],
      ['邮箱或订单信息填错怎么办？', '未发货前可在订单详情提交售后工单申请修改；已发货后需要人工审核是否可补发。'],
      ['可以修改订单信息吗？', '订单未支付或未发货前可以申请修改，支付后请保留订单号并联系人工客服。']
    ]],
    ['支付类', [
      ['支持哪些支付方式？', '支持余额支付、USDT TRC20 和支付宝。选择 USDT 时，请按支付页展示的金额付款。'],
      ['付款后没识别怎么办？', '长时间未更新时，请联系在线客服协助核对。'],
      ['少付、多付、超时付款怎么办？', '订单会进入异常处理，少付需补差价，多付可申请退差额或余额，超时付款需人工匹配。'],
      ['USDT 支付需要注意什么？', '请在付款前确认金额和钱包网络。发生问题后请联系人工客服处理。']
    ]],
    ['发货类', [
      ['自动发货多久完成？', '付款确认后通常 1-3 分钟完成。若库存或接口异常，会进入发货失败队列。'],
      ['手动发货多久完成？', '一般 10 分钟内开始处理，复杂订单或高风险订单可能需要 24 小时内完成。'],
      ['发货内容在哪里查看？', '发货结果会发送至邮箱和站内消息，也可以在订单详情查看状态与隐藏后的交付摘要。']
    ]],
    ['售后类', [
      ['什么情况可以补发？', '保期内卡密无效、账号无法登录、订阅掉单、自动发货失败等情况可申请补发或协助。'],
      ['什么情况不支持退款？', '已发货且信息正确、用户自身网络或账号条件不满足、已使用的虚拟商品通常不支持无理由退款。'],
      ['如何提交售后？', '进入订单详情，选择问题类型并填写描述、截图链接或订单号。后台客服会按工单处理。']
    ]],
    ['账号类', [
      ['账号可以改密码或换绑吗？', '以商品详情的使用限制为准。共享服务通常不支持改密或换绑。'],
      ['共享账号有什么限制？', '共享账号可能限制设备数、登录地区、登录频率和 IP 环境，请按发货说明使用。']
    ]]
  ];
  const categorySlug = (title) => ({
    下单类: 'order',
    公告中心: 'announcement',
    支付类: 'payment',
    发货类: 'delivery',
    售后类: 'support',
    账号类: 'account'
  }[title] || title);
  const questionCount = groups.reduce((count, [, items]) => count + items.length, 0);
  const channel = supportChannel();
  const groupMarkup = groups.map(([title, items], groupIndex) => {
    const slug = categorySlug(title);
    return `
      <section class="faq-group" id="faq-${slug}">
        <div class="faq-group-head">
          <span>${groupIndex + 1}</span>
          <h2>${title}</h2>
        </div>
        <div class="faq-accordion">
          ${items.map(([q, a], itemIndex) => `
            <details class="faq-detail" ${groupIndex === 0 && itemIndex === 0 ? 'open' : ''}>
              <summary>
                <span>${q}</span>
                <i aria-hidden="true">⌄</i>
              </summary>
              <p>${a}</p>
            </details>
          `).join('')}
        </div>
      </section>
    `;
  }).join('');
  shell(`
    <section class="faq-page">
      <header class="faq-hero">
        <span class="eyebrow">Help Center</span>
        <h1>FAQ</h1>
        <p>按问题类型快速定位答案。常见下单、支付、发货和售后说明都整理在这里。</p>
      </header>
      <div class="faq-layout">
        <aside class="faq-sidebar" aria-label="FAQ 分类">
          <div class="faq-nav-card">
            <span>问题分类</span>
            ${groups.map(([title, items]) => `<a href="#faq-${categorySlug(title)}"><b>${title}</b><em>${items.length}</em></a>`).join('')}
          </div>
          <div class="faq-support-card">
            <span>${escapeHtml(channel.title)}</span>
            <p>${escapeHtml(channel.description)}</p>
            <a class="primary small" href="${escapeHtml(channel.url)}" target="_blank" rel="noopener">${escapeHtml(channel.label)}</a>
          </div>
        </aside>
        <div class="faq-content">
          <div class="faq-summary">
            <span>${groups.length} 个分类</span>
            <span>${questionCount} 个常见问题</span>
            <span>默认展开高频问题</span>
          </div>
          ${groupMarkup}
        </div>
      </div>
    </section>
  `, 'page faq-shell');
}

function networkText(code) {
  const n = networks.find((item) => item.code === code) || networks[0];
  return `${n.displayName} (${n.tokenStandard})`;
}

function currentPayOrderId() {
  return currentAppPath().match(/^\/pay\/([^/]+)/)?.[1] || '';
}

function paymentSummaryText(order) {
  const amount = Number(order.payAmount || order.amountUsdt).toFixed(6).replace(/\.?0+$/, '');
  return `订单号：${order.orderNo}\n金额：${amount} ${order.payCurrency || 'USDT'}\n网络：${networkText(order.paymentNetwork)}\n地址：${order.paymentAddress}`;
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
    const parsedValue = parseAdminFormValue(field.name, data.get(field.name) || '', field.type);
    if (field.name.startsWith('value.')) {
      payload.value = { ...(payload.value || {}), [field.name.slice(6)]: parsedValue };
    } else {
      payload[field.name] = parsedValue;
    }
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
    ...serverProduct,
    category: serverProduct.category || serverProduct.categoryId || local?.category || '更多',
    skus: Array.isArray(serverProduct.skus) ? serverProduct.skus : (local?.skus || [])
  };
}

function adminProducts() {
  // 后台数据以服务端为准，不再静默回落 demo 商品。
  return (state.adminData.products || []).map(hydrateAdminProduct);
}

function adminOrders() {
  // 订单走服务端分页，统一来源 adminPages.orders，避免本地/服务端混用导致 order not found。
  return (state.adminPages.orders.items || []).map(normalizeServerOrder).filter(Boolean);
}

function adminNetworks() {
  const source = state.adminData.paymentNetworks.length ? state.adminData.paymentNetworks : networks;
  return source.map((network) => ({ ...network, enabled: network.isEnabled ?? network.enabled, recommended: network.isRecommended ?? network.recommended }));
}

function paymentChannelLabel(order) {
  return 'USDT TRC20 直付';
}

function adminNetworkPayCurrency(network) {
  return network.code === 'TRON' ? 'USDT' : '未开放';
}

function adminNetworkCollectionMethod(network) {
  return network.code === 'TRON' ? escapeHtml(network.address || '-') : '未开放';
}

function isTronAddress(value) {
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(String(value || '').trim());
}

function adminPaymentAddressForm(networkList) {
  const tron = networkList.find((n) => n.code === 'TRON') || networks.find((n) => n.code === 'TRON') || {};
  const address = tron.address || '';
  return `
    <form class="admin-form admin-payment-address-form" data-action="adminPaymentAddress">
      <label class="admin-field-wide">TRON 收款地址
        <input name="address" value="${escapeHtml(address)}" placeholder="T 开头的 TRON 地址" autocomplete="off" />
      </label>
      <label>确认修改
        <input name="confirmText" placeholder="输入 确认修改" autocomplete="off" />
      </label>
      <label>确认数
        <input name="confirmations" type="number" min="1" max="20" value="${Number(tron.confirmations || 3)}" />
      </label>
      <div class="admin-form-actions"><button class="primary small" type="submit">保存收款地址</button></div>
      <p class="admin-form-note">地址修改只影响新订单；旧订单继续使用创建时保存的地址。TronGrid Key 仍通过 Cloudflare 环境变量配置。</p>
    </form>
  `;
}

async function loadAdminData(force = false) {
  if (isAdminLocked() || state.adminData.loading || (state.adminData.loaded && !force)) return;
  state.adminData.loading = true;
  state.adminData.error = '';
  try {
    const entries = await Promise.all([
      ['products', '/api/admin/products'],
      ['paymentNetworks', '/api/admin/payment-networks'],
      ['deliveries', '/api/admin/deliveries'],
      ['notifications', '/api/admin/notifications'],
      ['supportTickets', '/api/admin/support-tickets'],
      ['auditLogs', '/api/admin/audit-logs'],
      ['ops', '/api/admin/ops']
    ].map(async ([key, url]) => {
      try {
        const response = await adminFetch(url);
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          return [key, key === 'ops' ? {} : [], err.error || `HTTP ${response.status}`];
        }
        const data = await response.json().catch(() => null);
        return [key, data, ''];
      } catch (e) {
        return [key, key === 'ops' ? {} : [], e?.message || '网络错误'];
      }
    }));
    const errors = [];
    for (const [key, value, err] of entries) {
      if (err) errors.push(`${key}: ${err}`);
      // 兼容信封 { items, total } 与裸数组
      const normalized = value && !Array.isArray(value) && Array.isArray(value.items) ? value.items : value;
      state.adminData[key] = key === 'ops' ? (normalized || {}) : (Array.isArray(normalized) ? normalized : []);
    }
    state.adminData.error = errors.length ? errors.join(' · ') : '';
    state.adminData.loaded = true;
    for (const network of state.adminData.paymentNetworks) {
      syncLocalNetwork(networks.find((item) => item.code === network.code), network);
    }
  } catch (e) {
    state.adminData.error = e?.message || '后台数据加载失败';
    notify('后台数据加载失败：' + state.adminData.error);
  } finally {
    state.adminData.loading = false;
  }
}

// 服务端分页加载：订单 / 库存 / 到账交易 / 用户
async function loadAdminPage(kind, { page, force } = {}) {
  const slice = state.adminPages[kind];
  if (!slice || slice.loading) return;
  if (page) slice.page = page;
  if (slice.loaded && !force && !page) return;
  slice.loading = true;
  slice.error = '';
  const endpoints = {
    orders: '/api/admin/orders',
    inventory: '/api/admin/inventory',
    transactions: '/api/admin/payment-transactions',
    users: '/api/admin/users'
  };
  const filters = adminPageFilters(kind);
  const qs = new URLSearchParams({ page: String(slice.page || 1), pageSize: String(slice.pageSize || 20) });
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && String(v).trim() !== '') qs.set(k, String(v).trim());
  }
  try {
    const response = await adminFetch(`${endpoints[kind]}?${qs.toString()}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      slice.error = data.error || `HTTP ${response.status}`;
      slice.items = [];
      slice.total = 0;
    } else {
      slice.items = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
      slice.total = Number(data.total ?? slice.items.length);
      slice.page = Number(data.page ?? slice.page ?? 1);
      slice.pageSize = Number(data.pageSize ?? slice.pageSize ?? 20);
    }
    slice.loaded = true;
  } catch (e) {
    slice.error = e?.message || '加载失败';
    slice.items = [];
    slice.total = 0;
  } finally {
    slice.loading = false;
  }
}

// 把后台筛选 UI 的值翻译成服务端查询参数
function adminPageFilters(kind) {
  if (kind === 'orders') {
    const f = adminFiltersFor('orders');
    const tab = state.adminOrderTab || 'all';
    const range = f.range || '近7天';
    const dateRange = adminDateRange(range);
    const out = {
      q: f.q || '',
      network: f.network && !['全部网络', '全部'].includes(f.network) ? f.network : '',
      dateFrom: f.dateFrom || dateRange.dateFrom || '',
      dateTo: f.dateTo || dateRange.dateTo || ''
    };
    const tabMap = {
      pending_payment: { status: 'pending_payment' },
      confirming: { status: 'payment_confirming' },
      paid: { paymentStatus: 'paid' },
      undelivered: { deliveryStatus: 'manual_required' },
      delivered: { deliveryStatus: 'delivered' },
      delivery_failed: { deliveryStatus: 'failed' },
      after_sale: { afterSaleStatus: 'open' },
      refunded: { status: 'refunded' }
    };
    Object.assign(out, tabMap[tab] || {});
    return out;
  }
  if (kind === 'inventory') {
    const sub = currentAdminSubTab('inventory', 'list');
    const f = adminFiltersFor(adminFilterScope('inventory', sub));
    return {
      view: sub === 'list' ? 'summary' : '',
      q: f.q || '',
      type: f.type && !['全部类型', '全部'].includes(f.type) ? f.type : '',
      status: f.status && !['全部状态', '全部'].includes(f.status) ? f.status : '',
      skuId: f.skuId || '',
      productId: f.productId && !['全部商品', '全部'].includes(f.productId) ? f.productId : '',
      batchId: f.batchId || ''
    };
  }
  if (kind === 'transactions') {
    const sub = currentAdminSubTab('recharge', 'orders');
    const f = adminFiltersFor(adminFilterScope('recharge', sub));
    return {
      q: f.q || '',
      matchStatus: f.matchStatus && !['全部状态', '全部'].includes(f.matchStatus) ? f.matchStatus : '',
      exceptionType: f.exceptionType && !['全部类型', '全部'].includes(f.exceptionType) ? f.exceptionType : '',
      onlyExceptions: sub === 'exceptions' ? '1' : ''
    };
  }
  if (kind === 'users') {
    const f = adminFiltersFor('users');
    return { q: f.q || '' };
  }
  return {};
}

function adminDateInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function adminDateRange(range) {
  if (!range || range === '自定义') return {};
  const today = new Date();
  const end = adminDateInputValue(today);
  if (range === '今天') return { dateFrom: end, dateTo: end };
  const days = range === '近30天' ? 29 : 6;
  const start = new Date(today);
  start.setDate(today.getDate() - days);
  return { dateFrom: adminDateInputValue(start), dateTo: end };
}

async function loadAdminDashboard(force = false) {
  const slice = state.adminDashboard;
  if (slice.loading || (slice.loaded && !force)) return;
  slice.loading = true;
  slice.error = '';
  try {
    const response = await adminFetch('/api/admin/dashboard');
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      slice.error = data.error || `HTTP ${response.status}`;
    } else {
      slice.metrics = data.metrics || null;
      slice.queues = data.queues || null;
    }
    slice.loaded = true;
  } catch (e) {
    slice.error = e?.message || '加载失败';
  } finally {
    slice.loading = false;
  }
}

// 筛选变更后，按当前 tab 重置到第 1 页并从服务端重新加载
async function reloadAdminAfterFilter() {
  const tab = state.adminTab;
  const map = { orders: 'orders', inventory: 'inventory', recharge: 'transactions', users: 'users' };
  const kind = map[tab];
  if (kind) {
    await loadAdminPage(kind, { page: 1, force: true });
  }
  renderAdmin();
}

function statusLabel(status) {
  return { created: '待付款', pending_payment: '待付款', payment_confirming: '确认付款中', paid: '已付款', delivering: '发货中', completed: '已完成', expired: '已超时', failed: '支付失败', refunding: '退款中', refunded: '已退款' }[status] || status;
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
  const hash = currentAppPath();
  const routes = [
    ['/', () => home()],
    ['/products', () => productsPage()],
    ['/cart', () => productsPage()],
    ['/checkout', () => checkout()],
    ['/orders/lookup', () => account()],
    ['/account', () => account()],
    ['/login', () => loginPage()],
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
  const codeInput = event.target.closest('.code-real-input');
  if (codeInput) {
    codeInput.value = codeInput.value.replace(/\D/g, '').slice(0, Number(codeInput.maxLength || 6));
    if (codeInput.id === 'loginCode') state.loginVerifyCode = codeInput.value;
    const slots = codeInput.closest('[data-code-shell]')?.querySelectorAll('.code-slot') || [];
    slots.forEach((slot, index) => {
      slot.textContent = codeInput.value[index] || '';
      slot.classList.toggle('filled', index < codeInput.value.length);
      slot.classList.toggle('active', index === codeInput.value.length);
    });
  }
  if (event.target.matches('[data-field]')) syncInputs();
  if (event.target.matches('[data-action="adminFilter"]')) {
    setAdminFilter(event.target.dataset.filterScope || adminFilterScope(), event.target.name, event.target.value);
    clearTimeout(adminFilterTimer);
    adminFilterTimer = setTimeout(() => reloadAdminAfterFilter(), 280);
    return;
  }
  if (event.target.matches('[data-action="adminGlobalSearch"]')) {
    setAdminFilter(adminGlobalSearchScope(state.adminTab), 'q', event.target.value);
    clearTimeout(adminFilterTimer);
    adminFilterTimer = setTimeout(() => reloadAdminAfterFilter(), 320);
    return;
  }
  if (event.target.matches('[data-action="searchProducts"]')) {
    state.searchQuery = event.target.value;
    clearTimeout(productSearchTimer);
    productSearchTimer = setTimeout(renderProductResults, 120);
    return;
  }
  if (event.target.matches('[data-action="filterDelivery"]')) {
    state.deliveryFilter = event.target.value;
    return route();
  }
  if (event.target.matches('[data-action="sortProducts"]')) {
    state.sortBy = event.target.value;
    return route();
  }
  if (event.target.matches('[data-action="quantityInput"]')) {
    state.purchaseQuantity = Math.max(1, Number(event.target.value || 1));
    persist();
    return route();
  }
});

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (link.target || link.hasAttribute('download')) return;
  const href = link.getAttribute('href') || '';
  if (href.startsWith('#/')) {
    event.preventDefault();
    navigate(href);
    return;
  }
  if (!href.startsWith('/')) return;
  const url = new URL(href, location.origin);
  if (url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  event.preventDefault();
  history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
  route();
  window.scrollTo?.(0, 0);
});

document.addEventListener('click', async (event) => {
  if (event.target.classList?.contains('admin-modal-backdrop')) return closeAdminModal();
  if (event.target.classList?.contains('admin-drawer-backdrop')) {
    state.adminDetail = { kind: '', id: '', loading: false, error: '', data: null };
    return renderAdmin();
  }
  const copy = event.target.closest('[data-copy]');
  if (copy) {
    try {
      await navigator.clipboard?.writeText(copy.dataset.copy);
      return notify('已复制');
    } catch {
      return notify('浏览器限制剪贴板权限，请手动复制');
    }
  }
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (action === 'toggleCurrency') { state.currencyOpen = !state.currencyOpen; return route(); }
  if (action === 'setCurrency') { state.fiatCurrency = el.dataset.code; state.currencyOpen = false; persist(); return route(); }
  if (action === 'toggleMessages') { state.messageCenterOpen = !state.messageCenterOpen; persist(); return route(); }
  if (action === 'markMessagesRead') { state.messages = state.messages.map((message) => ({ ...message, read: true })); persist(); return route(); }
  if (action === 'toggleAccountMenu') { state.accountMenuOpen = !state.accountMenuOpen; persist(); return route(); }
  if (action === 'accountMenuSection') {
    state.accountSection = el.dataset.section || 'orders';
    state.accountMenuOpen = false;
    persist();
    return navigate('/account');
  }
  if (action === 'accountDemoAction') {
    return notify(el.dataset.message || '该功能将在真实数据接入后开放');
  }
  if (action === 'switchAuthMode') {
    const emailInput = document.querySelector('#loginEmail');
    if (emailInput) state.email = emailInput.value.trim();
    state.authMode = el.dataset.mode || 'login';
    refreshLoginCaptcha();
    return route();
  }
  if (action === 'toggleLoginPassword') {
    state.loginPasswordVisible = !state.loginPasswordVisible;
    const inputs = document.querySelectorAll('#loginPassword');
    inputs.forEach((input) => { input.type = state.loginPasswordVisible ? 'text' : 'password'; });
    document.querySelectorAll('.login-eye').forEach((eye) => {
      eye.setAttribute('aria-label', state.loginPasswordVisible ? '隐藏密码' : '显示密码');
      eye.innerHTML = lineIcon(state.loginPasswordVisible ? 'eye-off' : 'eye', '切换密码可见', 'login-field-icon');
    });
    return;
  }
  if (action === 'toggleLoginAgree') { state.loginAgree = !!event.target.checked; return; }
  if (action === 'toggleLoginRemember') { state.loginRemember = !!event.target.checked; return; }
  if (action === 'refreshLoginCaptcha') { refreshLoginCaptcha(); return route(); }
  if (action === 'loginForgot') { return submitPasswordResetRequest(); }
  if (action === 'loginResendCode') { return resendVerifyCode(); }
  if (action === 'loginBackToForm') {
    stopVerifyCountdown();
    state.loginStep = 'form';
    state.authMode = 'login';
    state.loginVerifyCode = '';
    state.loginBusy = false;
    return route();
  }
  if (action === 'telegramLogin') { state.loginReturnTo = '/account'; return navigate('/login'); }
  if (action === 'logoutAccount') return logoutAccount();
  if (action === 'selectAccountSection') { state.accountSection = el.dataset.section || 'orders'; persist(); return route(); }
  if (action === 'saveProfile') {
    const nickname = document.querySelector('#profileNickname')?.value.trim() || '';
    if (!nickname || nickname.length > 20) return notify('昵称需为 1-20 个字符');
    state.profile.nickname = nickname;
    if (state.user) state.user.nickname = nickname;
    addMessage('资料已更新', '昵称已保存。', 'account');
    notify('个人资料已保存');
    return route();
  }
  if (action === 'createRecharge') {
    const amount = Number(document.querySelector('#rechargeAmount')?.value || 0);
    const method = state.rechargeDraft.method || 'alipay';
    if (!amount || amount <= 0) return notify('请输入有效充值金额');
    state.rechargeDraft = { amount: String(amount), method };
    walletLedger('充值订单', amount, `${method === 'alipay' ? '支付宝' : 'USDT TRC20'} 充值待确认`, 'pending');
    addMessage('充值单已创建', `${amount.toFixed(2)} USDT 充值待确认。`, 'wallet');
    notify('充值单已创建，等待支付确认');
    return route();
  }
  if (action === 'setRechargeMethod') {
    state.rechargeDraft.method = el.dataset.method || 'alipay';
    return route();
  }
  if (action === 'simulateRecharge') {
    const amount = Number(state.rechargeDraft.amount || 20);
    state.wallet.balance = Number((Number(state.wallet.balance || 0) + amount).toFixed(2));
    walletLedger('充值入账', amount, '充值已确认', 'completed');
    addMessage('充值到账', `${amount.toFixed(2)} USDT 已入账。`, 'wallet');
    notify('充值已模拟到账');
    return route();
  }
  if (action === 'createSupportTicket') {
    const orderNo = document.querySelector('#supportOrder')?.value || '';
    const type = document.querySelector('#supportType')?.value || '其他问题';
    const description = document.querySelector('#supportBody')?.value.trim() || '';
    if (!orderNo) return notify('请选择关联订单');
    if (!description) return notify('请填写问题描述');
    const ticket = { id: demoToken('ticket'), ticketNo: `TK${String(Date.now()).slice(-8)}`, orderNo, type, description, status: '待处理', tone: 'pending', notes: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const tickets = JSON.parse(localStorage.getItem('gfTickets') || '[]');
    tickets.unshift(ticket);
    localStorage.setItem('gfTickets', JSON.stringify(tickets));
    state.accountSupportTicket = ticket.ticketNo;
    addMessage('售后工单已提交', `${ticket.ticketNo} 已进入后台人工处理。`, 'support');
    notify(`售后工单已创建：${ticket.ticketNo}`);
    return route();
  }
  if (action === 'openSupportDetail') {
    state.accountSupportTicket = el.dataset.ticket || '';
    state.accountSection = 'supportDetail';
    persist();
    return route();
  }
  if (action === 'changePassword') {
    return changeAccountPassword();
  }
  if (action === 'setPaymentMethod') {
    const method = normalizePaymentMethod(el.dataset.method || 'usdt_trc20');
    if (method === 'balance' && !state.user) {
      state.loginReturnTo = currentAppPath();
      notify('请先登录后使用余额支付');
      return navigate('/login');
    }
    state.paymentMethod = method;
    persist();
    return route();
  }
  if (action === 'toggleUseBalance') { state.useBalance = event.target.checked; persist(); return route(); }
  if (action === 'refreshAccountOrders') return loadAccountOrders({ force: true });
  if (action === 'accountOrderFilter') { state.accountOrderFilter = el.dataset.filter || 'all'; state.accountOrderStatus = ''; return route(); }
  if (action === 'exportAccountOrders') return exportAccountOrders();
  if (action === 'saveAccountPrefs') return saveAccountPreferences();
  if (action === 'appendSupportNote') {
    const text = document.querySelector('#supportSupplement')?.value.trim() || '';
    if (!text) return notify('请填写补充说明');
    const tickets = accountSupportTickets();
    const ticketNo = el.dataset.ticket || state.accountSupportTicket;
    const updated = tickets.map((ticket) => ticket.ticketNo === ticketNo
      ? { ...ticket, notes: [...(ticket.notes || []), { text, createdAt: new Date().toISOString() }], updatedAt: new Date().toISOString(), status: ticket.status || '处理中', tone: ticket.tone || 'processing' }
      : ticket);
    localStorage.setItem('gfTickets', JSON.stringify(updated));
    notify('补充说明已提交');
    return route();
  }
  if (action === 'toggleAccountSecret') {
    const field = el.closest('.delivery-field')?.querySelector('[data-secret-field]');
    if (!field) return;
    const hidden = field.value.includes('•');
    field.value = hidden ? field.dataset.secretValue : '••••••••••••••••';
    return notify(hidden ? '密码已显示' : '密码已隐藏');
  }
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
  if (action === 'openProduct') { navigate(`/products/${el.dataset.slug}`); return; }
  if (action === 'filterCategory') { state.categoryFilter = el.dataset.category; return route(); }
  if (action === 'toggleHomeFaq') { state.homeFaqActive = Number(el.dataset.index || 0); return route(); }
  if (action === 'stockOnly') { state.stockFilter = event.target.checked; return route(); }
  if (action === 'selectProduct') { state.selectedProductId = el.dataset.id; state.selectedOptions[state.selectedProductId] = defaultOptions(product()); persist(); return route(); }
  if (action === 'setOption') {
    const item = products.find((p) => p.id === el.dataset.product);
    const value = el.value || el.dataset.value;
    const next = { ...selectedOptions(item), [el.dataset.key]: value };
    state.selectedOptions[item.id] = normalizeSelectedOptions(item, next, el.dataset.key);
    persist();
    return route();
  }
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
  if (action === 'goCheckout') { syncInputs(); navigate('/checkout'); }
  if (action === 'addToCart') return addSelectedToCart();
  if (action === 'removeCartItem') return removeCartItem(el.dataset.key);
  if (action === 'clearCart') return clearCart();
  if (action === 'checkoutCartItem') return checkoutCartItem(el.dataset.key);
  if (action === 'paySelected') return createOrder();
  if (action === 'quantityMinus') { state.purchaseQuantity = Math.max(1, Number(state.purchaseQuantity || 1) - 1); persist(); return route(); }
  if (action === 'quantityPlus') { state.purchaseQuantity = Math.max(1, Number(state.purchaseQuantity || 1) + 1); persist(); return route(); }
  if (action === 'detailImage') { state.detailImageIndex = Math.max(0, Math.min(3, Number(el.dataset.index || 0))); return route(); }
  if (action === 'detailImagePrev') { state.detailImageIndex = (Number(state.detailImageIndex || 0) + 3) % 4; return route(); }
  if (action === 'detailImageNext') { state.detailImageIndex = (Number(state.detailImageIndex || 0) + 1) % 4; return route(); }
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
    notify(`售后工单已创建：${result.ticketNo || result.ticket_no || result.id}`);
    return orderDetail(el.dataset.id);
  }
  if (action === 'lookupOrder') {
    const orderNo = document.querySelector('#lookupOrder').value.trim();
    const contact = document.querySelector('#lookupContact').value.trim().toLowerCase();
    const contactVariants = new Set([contact, contact.startsWith('@') ? contact.slice(1) : `@${contact}`].filter(Boolean));
    state.lookupResult = orders().find((o) => o.orderNo === orderNo && [o.email.toLowerCase(), o.telegramUsername.toLowerCase()].some((value) => contactVariants.has(value)));
    if (!state.lookupResult) {
      try {
        const response = await fetch('/api/orders/lookup', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orderNo, contact })
        });
        if (response.ok) {
          const apiOrder = await response.json();
          state.lookupResult = normalizeServerOrder(apiOrder);
          if (state.lookupResult) {
            if (!state.lookupResult.telegramUsername && contact && !contact.includes('@')) state.lookupResult.telegramUsername = `@${contact}`;
            if (!state.lookupResult.telegramUsername && contact?.startsWith('@')) state.lookupResult.telegramUsername = contact;
            if (!state.lookupResult.email && contact?.includes('@') && contact.includes('.')) state.lookupResult.email = contact;
            saveOrder(state.lookupResult);
          }
        }
      } catch {
        state.lookupResult = null;
      }
    }
    if (!state.lookupResult) notify('未找到匹配订单');
    return lookup();
  }
  if (action === 'adminTab') { state.adminTab = el.dataset.tab; persist(); return renderAdmin(); }
  if (action === 'adminSubTab') {
    state.adminTab = el.dataset.tab || state.adminTab;
    state.adminSubTabs[state.adminTab] = el.dataset.subtab;
    if (state.adminTab !== 'inventory' || state.adminSubTabs[state.adminTab] !== 'import') state.adminImportPreview = null;
    persist();
    return renderAdmin();
  }
  if (action === 'adminClearFilters') {
    delete state.adminFilters[el.dataset.filterScope || adminFilterScope()];
    persist();
    await reloadAdminAfterFilter();
    return renderAdmin();
  }
  if (action === 'adminLogout') {
    state.adminToken = '';
    localStorage.removeItem('adminToken');
    notify('已退出后台');
    return renderAdmin();
  }
  if (action === 'adminLogin') {
    event.preventDefault();
    return adminLogin();
  }
  if (action === 'adminConfirmPayment') {
    const order = adminOrders().find((o) => o.id === el.dataset.id);
    if (!order) return notify('订单不存在');
    return openAdminModal({
      kind: 'confirmPayment',
      title: '人工确认到账',
      desc: `订单 ${order.orderNo}，应付 ${formatUsdt(order.payAmount || order.amountUsdt)} USDT。无 txHash 时必须填写原因；金额不一致也必须填写原因。`,
      danger: true,
      submitLabel: '确认到账',
      context: { id: order.id, amount: order.payAmount || order.amountUsdt },
      fields: [
        { name: 'txHash', label: '交易 Hash', placeholder: '链上 txHash，可留空' },
        { name: 'amount', label: '到账金额 USDT', value: formatUsdt(order.payAmount || order.amountUsdt) },
        { name: 'fromAddress', label: '付款地址', placeholder: '可选' },
        { name: 'reason', label: '确认原因', type: 'textarea', placeholder: 'TronGrid 未自动匹配，人工核验到账' }
      ]
    });
  }
  if (action === 'adminDeliver') {
    const order = adminOrders().find((o) => o.id === el.dataset.id);
    const unpaid = order && !(order.paymentStatus === 'paid' || ['paid', 'delivering', 'completed'].includes(order.status));
    return openAdminModal({
      kind: 'manualDeliver',
      title: '人工发货',
      desc: unpaid ? '⚠ 该订单尚未支付，默认不可发货。如确需强制发货请勾选并谨慎操作。' : '发货内容将加密保存并发送邮件。',
      danger: !!unpaid,
      submitLabel: '确认发货',
      context: { id: el.dataset.id, unpaid: !!unpaid },
      fields: [
        { name: 'deliveryContent', label: '发货内容', type: 'textarea', required: true, placeholder: '卡密 / 账号密码 / 充值结果等' },
        ...(unpaid ? [{ name: 'force', label: '强制发货未支付订单（输入 force 确认）', placeholder: 'force' }] : [])
      ]
    });
  }
  if (action === 'adminOrderDetail' || action === 'adminOrderAfterSale') {
    state.adminDetail = { kind: 'order', id: el.dataset.id, loading: true, error: '', data: null };
    renderAdmin();
    try {
      const response = await adminFetch(`/api/admin/orders/${el.dataset.id}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) state.adminDetail.error = adminFriendlyError(data.error, response.status);
      else state.adminDetail.data = data;
    } catch (err) {
      state.adminDetail.error = adminFriendlyError(err?.message);
    }
    state.adminDetail.loading = false;
    return renderAdmin();
  }
  if (action === 'adminDetailClose') {
    state.adminDetail = { kind: '', id: '', loading: false, error: '', data: null };
    return renderAdmin();
  }
  if (action === 'adminAuditDetail') {
    state.adminDetail = { kind: 'audit', id: el.dataset.id, loading: false, error: '', data: null };
    return renderAdmin();
  }
  if (action === 'adminOrderTab') {
    state.adminOrderTab = el.dataset.orderTab || 'all';
    await loadAdminPage('orders', { page: 1, force: true });
    return renderAdmin();
  }
  if (action === 'adminPage') {
    const kind = el.dataset.kind;
    const page = Number(el.dataset.page);
    if (!kind || !Number.isFinite(page) || page < 1) return;
    await loadAdminPage(kind, { page, force: true });
    return renderAdmin();
  }
  if (action === 'adminDashboardJump') {
    const target = el.dataset.target || '';
    const [tabKey, subKey] = target.split(':');
    state.adminTab = tabKey;
    if (subKey) { state.adminSubTabs[tabKey] = subKey; }
    if (tabKey === 'orders' && el.dataset.orderTab) {
      state.adminSubTabs.orders = 'list';
      state.adminOrderTab = el.dataset.orderTab;
    }
    persist();
    return renderAdmin();
  }
  if (action === 'adminReloadDashboard') {
    await loadAdminDashboard(true);
    return renderAdmin();
  }
  if (action === 'adminModalClose') {
    return closeAdminModal();
  }
  if (action === 'adminModalSubmit') {
    event.preventDefault();
    return submitAdminModal(el.closest('[data-admin-modal-form]') || el.closest('form') || el);
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
    const network = adminNetworks().find((n) => n.code === el.dataset.code);
    if (!network) return notify('支付网络不存在');
    const enabled = network.enabled ?? network.isEnabled;
    if (enabled) {
      // 关闭支付网络是高风险操作，需二次确认
      return openAdminModal({
        kind: 'toggleNetwork',
        title: '关闭支付网络',
        desc: `关闭 ${network.code} 后用户将无法通过该网络下单/支付，请谨慎操作。将写入审计。`,
        danger: true,
        submitLabel: '确认关闭',
        context: { code: network.code, nextEnabled: false },
        confirm: { requireText: '确认关闭' },
        fields: []
      });
    }
    const response = await adminFetch(`/api/admin/payment-networks/${network.code}`, { method: 'PATCH', body: JSON.stringify({ isEnabled: true }) });
    const updated = await response.json().catch(() => ({}));
    if (!response.ok) return notify(updated.error || '支付网络更新失败');
    syncLocalNetwork(networks.find((n) => n.code === network.code), updated);
    state.adminData.paymentNetworks = state.adminData.paymentNetworks.map((item) => (item.code === updated.code ? updated : item));
    notify('支付网络已启用');
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
  if (action === 'adminInventoryReveal') {
    return openAdminModal({
      kind: 'inventoryReveal',
      title: '查看库存明文',
      desc: '高风险操作：查看明文会写入审计日志，明文仅短时显示、不会缓存。请填写查看原因。',
      danger: true,
      submitLabel: '确认查看',
      context: { id: el.dataset.id },
      fields: [{ name: 'reason', label: '查看原因', type: 'textarea', required: true, placeholder: '核对发货内容 / 处理售后等' }]
    });
  }
  if (action === 'adminInventoryRevoke') {
    const boundOrder = el.dataset.order || '';
    return openAdminModal({
      kind: 'inventoryRevoke',
      title: '作废库存',
      desc: `高风险操作：作废会写入审计日志，且作废后该库存不再可用、不会被自动发货领取。仅可作废“可用 / 占用中”状态。${boundOrder ? `\n注意：该库存已绑定订单 ${boundOrder}，作废可能影响该订单履约。` : ''}`,
      danger: true,
      submitLabel: '确认作废',
      context: { id: el.dataset.id },
      confirm: { requireText: '作废' },
      fields: [
        { name: 'masked', label: '库存', type: 'static', value: el.dataset.masked || '' },
        ...(boundOrder ? [{ name: 'boundOrder', label: '已绑定订单', type: 'static', value: boundOrder }] : []),
        { name: 'remark', label: '作废原因', type: 'textarea', required: true, placeholder: '请填写作废原因，便于审计追溯' }
      ]
    });
  }
  if (action === 'adminPaymentBind') {
    return openAdminModal({
      kind: 'paymentBind',
      title: '人工绑定订单',
      desc: '将该到账交易绑定到指定订单并标记已支付。txHash 不可重复绑定多个订单。',
      submitLabel: '确认绑定',
      context: { id: el.dataset.id },
      fields: [
        { name: 'tx', label: '交易 Hash', type: 'static', value: el.dataset.tx || '' },
        { name: 'orderId', label: '订单 ID', required: true, placeholder: '粘贴订单 id（详情页可复制）' },
        { name: 'reason', label: '绑定原因', type: 'textarea', required: true, placeholder: '人工核验金额与到账一致' }
      ]
    });
  }
  if (action === 'adminPaymentIgnore') {
    return openAdminModal({
      kind: 'paymentIgnore',
      title: '忽略支付异常',
      desc: '标记该异常为已忽略，将写入审计。',
      danger: true,
      submitLabel: '确认忽略',
      context: { id: el.dataset.id },
      fields: [{ name: 'reason', label: '忽略原因', type: 'textarea', required: true, placeholder: '测试转账 / 重复检测等' }]
    });
  }
  if (action === 'adminRescanPayments') {
    notify('正在触发链上重扫…');
    try {
      const response = await adminFetch('/api/admin/payment-transactions/rescan', { method: 'POST', body: '{}' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return notify(data.error || '重扫失败');
      notify(`重扫完成：检查 ${data.checked||0}，匹配 ${data.matched||0}，异常 ${data.exceptions||0}${data.error ? '（'+data.error+'）' : ''}`);
      await loadAdminPage('transactions', { force: true });
      return renderAdmin();
    } catch (err) {
      return notify(err?.message || '重扫失败');
    }
  }
  if (action === 'adminEditConfirmations') {
    return openAdminModal({
      kind: 'editConfirmations',
      title: '修改确认数',
      desc: '确认数影响链上到账判定，属于高风险配置，将写入审计。',
      danger: true,
      submitLabel: '保存确认数',
      context: { code: el.dataset.code },
      confirm: { requireText: '确认修改' },
      fields: [{ name: 'confirmations', label: '确认数', type: 'number', required: true, value: el.dataset.confirmations || '3' }]
    });
  }
  if (action === 'adminProductEdit') {
    state.adminProductEditId = el.dataset.id;
    state.adminSubTabs.products = 'editBase';
    persist();
    return renderAdmin();
  }
  if (action === 'adminProductSkus') {
    state.adminProductEditId = el.dataset.id;
    setAdminFilter('products:editSkus', 'product', el.dataset.id);
    state.adminSubTabs.products = 'editSkus';
    persist();
    return renderAdmin();
  }
  if (action === 'adminProductBackList') {
    state.adminSubTabs.products = 'list';
    persist();
    return renderAdmin();
  }
  if (action === 'adminCategoryToggle') {
    const visible = el.dataset.visible === '1'; // 当前隐藏，点击后显示
    const response = await adminFetch('/api/admin/ops', { method: 'POST', body: JSON.stringify({ action: 'category.update', id: el.dataset.id, visible }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(adminFriendlyError(data.error, response.status));
    state.adminData.ops = data;
    notify(visible ? '分类已显示' : '分类已隐藏');
    return renderAdmin();
  }
  if (action === 'adminTagToggle') {
    const enabled = el.dataset.enabled === '1';
    const response = await adminFetch('/api/admin/ops', { method: 'POST', body: JSON.stringify({ action: 'tag.update', id: el.dataset.id, enabled }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return notify(adminFriendlyError(data.error, response.status));
    state.adminData.ops = data;
    notify(enabled ? '标签已启用' : '标签已停用');
    return renderAdmin();
  }
  if (action === 'adminProductCreate') {
    return openAdminModal({
      kind: 'productCreate',
      title: '新增商品',
      desc: '创建后可在编辑页补充 SKU、文案和购买字段。价格以 USDT 结算。',
      submitLabel: '创建商品',
      fields: [
        { name: 'name', label: '商品名称', required: true },
        { name: 'slug', label: 'Slug', required: true, placeholder: '小写字母数字与连字符，如 apple-gift-card' },
        { name: 'categoryId', label: '分类', placeholder: 'social / game / software ...', value: 'more' },
        { name: 'productType', label: '商品类型', type: 'select', value: 'subscription', options: [{label:'订阅 subscription',value:'subscription'},{label:'礼品卡/卡密 card',value:'card'},{label:'账号 account',value:'account'},{label:'充值 recharge',value:'recharge'},{label:'服务 service',value:'service'}] },
        { name: 'deliveryType', label: '发货方式', type: 'select', value: 'manual', options: [{label:'自动 auto',value:'auto'},{label:'人工 manual',value:'manual'},{label:'部分自动 mixed',value:'mixed'}] }
      ]
    });
  }
  if (action === 'adminSelectEditProduct') {
    return; // 由 change 事件处理
  }
  if (action === 'adminSkuCreate') {
    const pid = el.dataset.product || state.adminProductEditId || (adminProducts()[0]?.id || '');
    return openAdminModal({
      kind: 'skuCreate',
      title: '新建 SKU',
      desc: '价格以 USDT 结算。规格 JSON 形如 {"duration":"1个月"}。',
      submitLabel: '创建 SKU',
      context: { productId: pid },
      fields: [
        { name: 'productId', label: '商品 ID', required: true, value: pid },
        { name: 'optionValues', label: '规格 JSON', type: 'textarea', value: '{}', placeholder: '{"region":"Global","duration":"1个月"}' },
        { name: 'priceUsdt', label: '价格 USDT', required: true, placeholder: '1.80' },
        { name: 'deliveryType', label: '发货方式', type: 'select', value: 'manual', options: [{label:'自动 auto',value:'auto'},{label:'人工 manual',value:'manual'},{label:'部分自动 mixed',value:'mixed'}] },
        { name: 'stockStatus', label: '库存状态', type: 'select', value: 'in_stock', options: [{label:'有货 in_stock',value:'in_stock'},{label:'紧张 low_stock',value:'low_stock'},{label:'售罄 sold_out',value:'sold_out'}] }
      ]
    });
  }
  if (action === 'adminSkuEdit') {
    const product = adminProducts().find((p) => p.id === el.dataset.product);
    const sku = (product?.skus || []).find((s) => s.id === el.dataset.id) || adminProducts().flatMap((p) => p.skus || []).find((s) => s.id === el.dataset.id);
    if (!sku) return notify('SKU 不存在');
    return openAdminModal({
      kind: 'skuEdit',
      title: '编辑 SKU',
      desc: '价格以 USDT 结算。',
      submitLabel: '保存 SKU',
      context: { id: sku.id },
      fields: [
        { name: 'priceUsdt', label: '价格 USDT', required: true, value: Number(sku.priceUsdt || 0).toFixed(2) },
        { name: 'optionValues', label: '规格 JSON', type: 'textarea', value: JSON.stringify(sku.optionValues || {}) },
        { name: 'deliveryType', label: '发货方式', type: 'select', value: sku.deliveryType || 'manual', options: [{label:'自动 auto',value:'auto'},{label:'人工 manual',value:'manual'},{label:'部分自动 mixed',value:'mixed'}] },
        { name: 'stockStatus', label: '库存状态', type: 'select', value: sku.stockStatus || 'in_stock', options: [{label:'有货 in_stock',value:'in_stock'},{label:'紧张 low_stock',value:'low_stock'},{label:'售罄 sold_out',value:'sold_out'}] },
        { name: 'warningStock', label: '预警值', type: 'number', value: String(sku.warningStock ?? 5) },
        { name: 'isRecommended', label: '推荐', type: 'select', value: sku.isRecommended ? '1' : '0', options: [{label:'否',value:'0'},{label:'是',value:'1'}] }
      ]
    });
  }
  if (action === 'adminSkuBatchPrice') {
    return openAdminModal({
      kind: 'skuBatchPrice',
      title: '批量改价',
      desc: '对选定商品下所有 SKU 统一调整价格（USDT）。',
      submitLabel: '应用改价',
      fields: [
        { name: 'productId', label: '商品', type: 'select', required: true, options: adminProducts().map((p) => ({ label: p.name, value: p.id })) },
        { name: 'mode', label: '方式', type: 'select', value: 'set', options: [{label:'设为固定价',value:'set'},{label:'按百分比涨跌(%)',value:'percent'}] },
        { name: 'value', label: '数值', required: true, placeholder: 'set: 2.00 / percent: 10 或 -10' }
      ]
    });
  }
  if (action === 'adminSkuBatchStatus') {
    return openAdminModal({
      kind: 'skuBatchStatus',
      title: '批量上下架/售罄',
      desc: '批量设置选定商品下所有 SKU 的库存状态。',
      submitLabel: '应用',
      fields: [
        { name: 'productId', label: '商品', type: 'select', required: true, options: adminProducts().map((p) => ({ label: p.name, value: p.id })) },
        { name: 'stockStatus', label: '库存状态', type: 'select', value: 'in_stock', options: [{label:'有货 in_stock',value:'in_stock'},{label:'售罄 sold_out',value:'sold_out'},{label:'紧张 low_stock',value:'low_stock'}] }
      ]
    });
  }
  if (action === 'adminPurchaseFieldEdit') {
    const product = adminProducts().find((p) => p.id === el.dataset.product) || adminProducts()[0] || {};
    const field = adminPurchaseFields(product, adminOps()).find((item) => item.id === el.dataset.field) || {};
    return openAdminModal({
      kind: 'purchaseFieldDraft',
      title: field.id ? '编辑购买字段' : '新增购买字段',
      desc: '运营只维护字段名称、类型、必填和选项，系统自动生成前台所需配置。',
      submitLabel: '保存字段',
      context: { productId: product.id, fieldId: field.id || '' },
      fields: [
        { name: 'fieldLabel', label: '字段名称', required: true, value: field.fieldLabel || '地区' },
        { name: 'fieldType', label: '字段类型', type: 'select', value: field.fieldType || 'select', options: [{label:'下拉框',value:'select'},{label:'单选项',value:'radio'},{label:'输入框',value:'text'},{label:'邮箱',value:'email'},{label:'文本框',value:'textarea'},{label:'数字',value:'number'}] },
        { name: 'required', label: '是否必填', type: 'select', value: field.required === false ? '0' : '1', options: [{label:'是',value:'1'},{label:'否',value:'0'}] },
        { name: 'optionsText', label: '选项管理', type: 'textarea', value: (field.options || []).map((item) => item.label || item.value || item).join('\n'), placeholder: '每行一个选项，如：全球版' },
        { name: 'placeholder', label: '提示文案', value: field.placeholder || '' },
        { name: 'defaultValue', label: '默认值', value: field.defaultValue || '' }
      ]
    });
  }
  if (action === 'adminGoImport') {
    state.adminTab = 'inventory';
    state.adminSubTabs.inventory = 'import';
    if (el.dataset.product) setAdminFilter('inventory:import', 'productId', el.dataset.product);
    if (el.dataset.sku) setAdminFilter('inventory:import', 'skuId', el.dataset.sku);
    state.adminImportPreview = null;
    persist();
    return renderAdmin();
  }
  if (action === 'adminUserDetail') {
    state.adminDetail = { kind: 'user', id: el.dataset.id, loading: true, error: '', data: null };
    renderAdmin();
    try {
      const response = await adminFetch(`/api/admin/users/${encodeURIComponent(el.dataset.id)}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) state.adminDetail.error = data.error || '加载失败';
      else state.adminDetail.data = data;
    } catch (err) {
      state.adminDetail.error = err?.message || '加载失败';
    }
    state.adminDetail.loading = false;
    return renderAdmin();
  }
  if (action === 'adminUserBlacklist') {
    return openAdminModal({
      kind: 'blacklistCreate',
      title: '加入黑名单',
      desc: '命中 block_order 的用户将无法下单。',
      danger: true,
      submitLabel: '加入黑名单',
      fields: [
        { name: 'kind', label: '类型', type: 'select', value: 'email', options: [{label:'邮箱',value:'email'},{label:'Telegram 用户名',value:'telegram_username'}] },
        { name: 'value', label: '拉黑值', required: true, value: el.dataset.email || '' },
        { name: 'effect', label: '效果', type: 'select', value: 'block_order', options: [{label:'拒绝下单 block_order',value:'block_order'},{label:'需人工审核 require_manual_review',value:'require_manual_review'},{label:'拒绝支付 block_payment',value:'block_payment'}] },
        { name: 'reason', label: '原因', required: true, placeholder: '风险原因' }
      ]
    });
  }
  if (action === 'adminBlacklistEdit') {
    return openAdminModal({
      kind: 'blacklistEdit',
      title: '编辑黑名单',
      desc: '修改命中效果或原因，将写入审计。',
      submitLabel: '保存',
      context: { id: el.dataset.id },
      fields: [
        { name: 'effect', label: '效果', type: 'select', value: el.dataset.effect || 'block_order', options: [{label:'拒绝下单 block_order',value:'block_order'},{label:'需人工审核 require_manual_review',value:'require_manual_review'},{label:'拒绝支付 block_payment',value:'block_payment'}] },
        { name: 'reason', label: '原因', type: 'textarea', required: true, value: el.dataset.reason || '' }
      ]
    });
  }
  if (action === 'adminBlacklistToggle') {
    const enabling = el.dataset.status === 'active';
    return openAdminModal({
      kind: 'blacklistToggle',
      title: enabling ? '启用黑名单' : '停用黑名单',
      desc: enabling ? '启用后命中规则的用户将再次被拦截。' : '停用后该规则不再拦截下单，请确认。',
      danger: !enabling,
      submitLabel: enabling ? '确认启用' : '确认停用',
      context: { id: el.dataset.id, status: el.dataset.status },
      fields: []
    });
  }
  if (action === 'adminBlacklistHits') {
    state.adminDetail = { kind: 'blacklistHits', id: el.dataset.id, loading: true, error: '', data: null };
    try {
      const response = await adminFetch(`/api/admin/blacklists/${el.dataset.id}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return notify(adminFriendlyError(data.error, response.status));
      const count = (data.hits || []).length;
      notify(`该黑名单命中 ${count} 笔订单${count ? '：' + data.hits.slice(0, 3).map((o) => o.orderNo).join(', ') : ''}`);
    } catch (err) {
      notify(adminFriendlyError(err?.message));
    }
    state.adminDetail = { kind: '', id: '', loading: false, error: '', data: null };
    return;
  }
  if (action === 'home') { navigate('/'); }
  if (action === 'revealSecret') { document.querySelector('.secret').classList.add('revealed'); notify('完整交付内容已解锁'); }
});

document.addEventListener('dblclick', async (event) => {
  const target = event.target.closest('[data-copy-dbl]');
  if (!target) return;
  await navigator.clipboard?.writeText(target.dataset.copyDbl || '');
  notify('已复制');
});

document.addEventListener('submit', async (event) => {
  const loginPageForm = event.target.closest('[data-action="loginFormSubmit"]');
  if (loginPageForm) {
    event.preventDefault();
    return state.authMode === 'register' ? submitLoginPageRegister() : submitLoginPageLogin();
  }
  const verifyForm = event.target.closest('[data-action="loginVerifySubmit"]');
  if (verifyForm) {
    event.preventDefault();
    return state.loginStep === 'reset' ? submitPasswordResetConfirm() : submitVerifyCode();
  }
  const loginForm = event.target.closest('[data-action="adminLoginForm"]');
  if (loginForm) {
    event.preventDefault();
    return adminLogin();
  }

  const importForm = event.target.closest('[data-action="adminInventoryImport"]');
  if (importForm) {
    event.preventDefault();
    const submitter = event.submitter;
    const preview = buildInventoryPreview(importForm);
    state.adminImportPreview = preview;
    if (submitter?.dataset.importMode !== 'commit' || preview.errors.length) {
      notify(preview.errors.length ? '库存格式需要修正' : '库存校验通过，可以确认导入');
      return renderAdmin();
    }
    const response = await adminFetch('/api/admin/ops', {
      method: 'POST',
      body: JSON.stringify({ action: 'inventory.import', skuId: preview.skuId, productId: preview.productId, type: preview.type, items: preview.rows.filter((row) => row.valid).map((row) => row.value) })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return notify(result.error || '库存导入失败');
    state.adminData.ops = result;
    state.adminData.loaded = false;
    state.adminImportPreview = null;
    notify('库存已导入并写入审计');
    return renderAdmin();
  }
  const productContentForm = event.target.closest('[data-action="adminProductContent"]');
  if (productContentForm) {
    event.preventDefault();
    const id = productContentForm.dataset.id;
    const data = new FormData(productContentForm);
    const featureTags = String(data.get('featureTags') || '')
      .split(/[,，\n]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 6);
    const payload = {
      shortDescription: data.get('shortDescription') || '',
      featureTags,
      detailDescription: data.get('detailDescription') || '',
      purchaseNotice: data.get('purchaseNotice') || '',
      afterSaleRule: data.get('afterSaleRule') || ''
    };
    const response = await adminFetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    const updated = await response.json().catch(() => ({}));
    if (!response.ok) return notify(updated.error || '商品文案保存失败');
    const local = products.find((item) => item.id === updated.id);
    if (local) Object.assign(local, updated);
    state.adminData.products = state.adminData.products.map((item) => (item.id === updated.id ? { ...item, ...updated } : item));
    notify('商品文案已保存');
    return renderAdmin();
  }
  const paymentAddressForm = event.target.closest('[data-action="adminPaymentAddress"]');
  if (paymentAddressForm) {
    event.preventDefault();
    const data = new FormData(paymentAddressForm);
    const address = String(data.get('address') || '').trim();
    const confirmText = String(data.get('confirmText') || '').trim();
    const confirmations = Math.max(1, Math.floor(Number(data.get('confirmations') || 3)));
    if (!isTronAddress(address)) return notify('请输入有效的 TRON 地址');
    if (confirmText !== '确认修改') return notify('请在确认框输入：确认修改');
    const response = await adminFetch('/api/admin/payment-networks/TRON', {
      method: 'PATCH',
      body: JSON.stringify({ address, confirmations })
    });
    const updated = await response.json().catch(() => ({}));
    if (!response.ok) return notify(updated.error || '收款地址保存失败');
    syncLocalNetwork(networks.find((network) => network.code === 'TRON'), updated);
    state.adminData.paymentNetworks = state.adminData.paymentNetworks.map((item) => (item.code === updated.code ? updated : item));
    notify('USDT TRC20 收款地址已更新');
    return renderAdmin();
  }
  const productBaseForm = event.target.closest('[data-action="adminProductBase"]');
  if (productBaseForm) {
    event.preventDefault();
    const id = productBaseForm.dataset.id;
    if (!id) return notify('请先选择商品');
    const data = new FormData(productBaseForm);
    const payload = {
      name: data.get('name') || '',
      slug: data.get('slug') || '',
      categoryId: data.get('categoryId') || 'more',
      productType: data.get('productType') || 'subscription',
      deliveryType: data.get('deliveryType') || 'manual',
      status: data.get('status') || 'active',
      isHomeVisible: !!data.get('isHomeVisible'),
      isRecommended: !!data.get('isRecommended'),
      sortOrder: Number(data.get('sortOrder') || 0)
    };
    const response = await adminFetch(`/api/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    const updated = await response.json().catch(() => ({}));
    if (!response.ok) return notify(updated.error || '基础信息保存失败');
    await loadAdminData(true);
    notify('商品基础信息已保存');
    return renderAdmin();
  }
  const blacklistForm = event.target.closest('[data-action="adminBlacklistCreate"]');
  if (blacklistForm) {
    event.preventDefault();
    const data = new FormData(blacklistForm);
    const value = String(data.get('value') || '').trim();
    if (!value) return notify('请填写拉黑值');
    const response = await adminFetch('/api/admin/ops', { method: 'POST', body: JSON.stringify({ action: 'blacklist.create', kind: data.get('kind'), value, effect: data.get('effect'), reason: data.get('reason') || '风险用户', status: 'active' }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return notify(result.error || '加入黑名单失败');
    state.adminData.ops = result;
    notify('已加入黑名单');
    return renderAdmin();
  }
  const form = event.target.closest('[data-action="adminOps"]');
  if (!form) return;
  event.preventDefault();
  return submitAdminOps(form);
});

document.addEventListener('change', (event) => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (action === 'adminFilter') {
    setAdminFilter(el.dataset.filterScope || adminFilterScope(), el.name, el.value);
    return reloadAdminAfterFilter();
  }
  if (action === 'adminSelectEditProduct') {
    state.adminProductEditId = el.value;
    return renderAdmin();
  }
  if (action === 'adminImportProductSelect') {
    const product = adminProducts().find((p) => p.id === el.value);
    setAdminFilter('inventory:import', 'productId', el.value);
    setAdminFilter('inventory:import', 'skuId', product?.skus?.[0]?.id || '');
    state.adminImportPreview = null;
    return renderAdmin();
  }
  if (action === 'adminImportSkuSelect') {
    setAdminFilter('inventory:import', 'skuId', el.value);
    state.adminImportPreview = null;
    return renderAdmin();
  }
  if (action === 'quickProduct') { state.selectedProductId = event.target.value; state.selectedOptions[state.selectedProductId] = defaultOptions(product()); persist(); return route(); }
  if (action === 'quickSku') { const sku = product().skus.find((s) => s.id === event.target.value); state.selectedOptions[product().id] = sku.optionValues; persist(); return route(); }
  if (action === 'setNetwork') { state.paymentNetwork = event.target.value; persist(); return route(); }
  if (action === 'accountCurrency') { state.fiatCurrency = event.target.value; persist(); return route(); }
  if (action === 'accountOrderStatus') { state.accountOrderStatus = event.target.value; return route(); }
  if (action === 'accountOrderSort') { state.accountOrderSort = event.target.value || 'newest'; return route(); }
  if (action === 'accountOrderDateFrom') { state.accountOrderDateFrom = event.target.value; return route(); }
  if (action === 'accountOrderDateTo') { state.accountOrderDateTo = event.target.value; return route(); }
  if (action === 'toggleAccountPref') {
    state.accountPrefs[el.dataset.pref] = event.target.checked;
    persist();
    return route();
  }
});

document.addEventListener('input', (event) => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (action === 'accountOrderSearch') {
    state.accountOrderSearch = event.target.value;
    clearTimeout(window.accountOrderSearchTimer);
    window.accountOrderSearchTimer = setTimeout(route, 180);
  }
  if (action === 'supportBody' || event.target.id === 'supportBody' || event.target.id === 'supportSupplement') {
    const counter = event.target.closest('label, section')?.querySelector('em');
    if (counter) counter.textContent = `${event.target.value.length} / 500`;
  }
});

window.addEventListener('hashchange', route);
window.addEventListener('popstate', route);
await Promise.all([loadConfig(), loadCatalog(), loadExchangeRates()]);
const handledTelegramRedirect = await handleTelegramRedirectAuth();
if (!handledTelegramRedirect) {
  restoreTelegramPendingLogin();
  await route();
}
