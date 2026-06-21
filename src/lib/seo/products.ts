export type SeoSku = {
  id: string;
  optionValues: Record<string, string>;
  priceUsdt: number;
  originalPriceUsdt?: number;
  stock: "in_stock" | "low_stock" | "sold_out";
  deliveryType: "auto" | "manual";
  recommended?: boolean;
  discount?: string;
};

export type SeoProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  icon: string;
  short: string;
  detail: string;
  deliveryType: "auto" | "manual" | "mixed";
  optionGroups: Array<{ key: string; name: string; options: string[] }>;
  skus: SeoSku[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
    audienceQuestions: string[];
  };
  notice: {
    deliverySummary: string;
    warrantySummary: string;
    refundSummary: string;
    usageGuide: string;
    warrantyDetail: string;
    attention: string;
    faq: Array<{ question: string; answer: string }>;
  };
};

export const siteConfig = {
  name: "ichuhai",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://ichuhai.com",
  description: "ichuhai 提供 Discord Nitro、Spotify Premium、YouTube Premium、Steam Wallet、Microsoft 365 等数字商品，支持余额、微信、支付宝与 USDT TRC20 支付及自动发货。",
  logo: "/assets/brand/logo/ichuhai-logo-horizontal-color.png",
};

export const productIconMap: Record<string, string> = {
  discord: "/assets/icons/product/E01_discord_nitro.png",
  spotify: "/assets/icons/product/E02_spotify_premium.png",
  youtube: "/assets/icons/product/E03_youtube_premium.png",
  steam: "/assets/icons/product/E04_steam_wallet.png",
  office: "/assets/icons/product/E05_microsoft_365.png",
};

export const seoProducts: SeoProduct[] = [
  {
    id: "discord-nitro",
    slug: "discord-nitro",
    name: "Discord Nitro",
    category: "社交",
    icon: "discord",
    short: "解锁 Discord 高级聊天体验，支持自定义表情、高清直播与大文件上传。",
    detail: "适合需要服务器增强、高清直播、大文件传输和跨服务器表情的 Discord 用户。ichuhai 提供多地区、多账号类型和多周期购买选项，并标注库存与发货方式。",
    deliveryType: "auto",
    optionGroups: [
      { key: "region", name: "地区", options: ["Global", "US", "EU", "JP"] },
      { key: "account", name: "账号类型", options: ["新号", "老号", "共享"] },
      { key: "duration", name: "套餐周期", options: ["1个月", "3个月", "12个月"] },
    ],
    skus: [
      { id: "dn-g-new-1", optionValues: { region: "Global", account: "新号", duration: "1个月" }, priceUsdt: 1.8, stock: "in_stock", deliveryType: "auto", recommended: true },
      { id: "dn-g-new-3", optionValues: { region: "Global", account: "新号", duration: "3个月" }, priceUsdt: 4.8, originalPriceUsdt: 5.4, stock: "in_stock", deliveryType: "auto", discount: "省 11%" },
      { id: "dn-g-new-12", optionValues: { region: "Global", account: "新号", duration: "12个月" }, priceUsdt: 16.2, originalPriceUsdt: 21, stock: "in_stock", deliveryType: "auto", discount: "省 22%" },
      { id: "dn-us-old-1", optionValues: { region: "US", account: "老号", duration: "1个月" }, priceUsdt: 2.1, stock: "low_stock", deliveryType: "manual" },
      { id: "dn-eu-share-3", optionValues: { region: "EU", account: "共享", duration: "3个月" }, priceUsdt: 3.9, stock: "in_stock", deliveryType: "auto" },
      { id: "dn-jp-new-1", optionValues: { region: "JP", account: "新号", duration: "1个月" }, priceUsdt: 2.3, stock: "sold_out", deliveryType: "manual" },
    ],
    seo: {
      title: "Discord Nitro 购买 - USDT 支付与自动发货 | ichuhai",
      description: "在 ichuhai 购买 Discord Nitro，支持 Global、US、EU、JP 等地区规格，USDT 支付，自动发货，清晰展示价格、库存、售后与退款规则。",
      keywords: ["Discord Nitro 购买", "Discord Nitro USDT", "Discord Nitro 自动发货", "Discord Nitro Global"],
      audienceQuestions: ["Discord Nitro 支持哪些地区？", "Discord Nitro 支付后多久发货？", "Discord Nitro 开通后还能退款吗？"],
    },
    notice: {
      deliverySummary: "自动发货",
      warrantySummary: "30天",
      refundSummary: "开通后不支持退款",
      usageGuide: "购买后系统将自动发送 Discord Nitro 服务，请确保填写的账号信息正确。",
      warrantyDetail: "自开通之日起计算，权益与服务期限为 30 天。",
      attention: "本商品为虚拟商品，一经开通通常不支持退款。请确认账号信息和地区规格无误后再购买。",
      faq: [
        { question: "Discord Nitro 支付后多久发货？", answer: "自动发货 SKU 通常在支付确认后秒级交付；人工 SKU 会进入客服处理队列。" },
        { question: "Global、US、EU、JP 有什么区别？", answer: "不同地区规格适配不同账号和开通条件，下单前请按商品页说明选择。" },
        { question: "Discord Nitro 可以退款吗？", answer: "未发货订单可联系售后处理；已开通的虚拟权益通常不支持退款。" },
      ],
    },
  },
  {
    id: "spotify-premium",
    slug: "spotify-premium",
    name: "Spotify Premium",
    category: "音乐",
    icon: "spotify",
    short: "畅听无广告音乐，支持离线下载与高品质音频。",
    detail: "Spotify Premium 适合希望获得无广告播放、离线收听和更高音质体验的用户。页面提供 1 个月、3 个月、12 个月周期选择。",
    deliveryType: "auto",
    optionGroups: [{ key: "duration", name: "套餐周期", options: ["1个月", "3个月", "12个月"] }],
    skus: [
      { id: "sp-1", optionValues: { duration: "1个月" }, priceUsdt: 2.2, stock: "in_stock", deliveryType: "auto", recommended: true },
      { id: "sp-3", optionValues: { duration: "3个月" }, priceUsdt: 6.1, stock: "in_stock", deliveryType: "auto" },
      { id: "sp-12", optionValues: { duration: "12个月" }, priceUsdt: 21.8, stock: "low_stock", deliveryType: "auto", discount: "省 17%" },
    ],
    seo: {
      title: "Spotify Premium 购买 - USDT 支付与自动发货 | ichuhai",
      description: "购买 Spotify Premium 订阅，支持 1 个月、3 个月、12 个月套餐，USDT 支付，自动发货，并提供使用说明与售后规则。",
      keywords: ["Spotify Premium 购买", "Spotify Premium USDT", "Spotify 自动发货"],
      audienceQuestions: ["Spotify Premium 是否自动发货？", "Spotify Premium 支持哪些周期？", "Spotify Premium 地区不匹配怎么办？"],
    },
    notice: {
      deliverySummary: "自动发货",
      warrantySummary: "30天",
      refundSummary: "开通后不支持退款",
      usageGuide: "付款后自动发送开通指引，请按提示完成账号信息确认或激活。",
      warrantyDetail: "套餐有效期以开通成功时间计算。",
      attention: "地区与账号类型需匹配，提交订单前请确认账号可用状态。",
      faq: [
        { question: "Spotify Premium 是否自动发货？", answer: "大多数 SKU 为自动发货，支付确认后系统会发送开通指引。" },
        { question: "可以购买 12 个月套餐吗？", answer: "可以，页面会展示当前可购买周期和库存状态。" },
        { question: "开通失败怎么办？", answer: "请通过订单页提交售后，客服会根据订单和账号状态协助处理。" },
      ],
    },
  },
  {
    id: "youtube-premium",
    slug: "youtube-premium",
    name: "YouTube Premium",
    category: "视频",
    icon: "youtube",
    short: "免广告观看视频，支持后台播放与 YouTube Music。",
    detail: "YouTube Premium 适合需要免广告观看、后台播放和 YouTube Music 的用户。部分地区或长期套餐可能需要人工处理。",
    deliveryType: "mixed",
    optionGroups: [
      { key: "region", name: "地区", options: ["Global", "US", "EU"] },
      { key: "duration", name: "套餐周期", options: ["1个月", "12个月"] },
    ],
    skus: [
      { id: "yt-g-1", optionValues: { region: "Global", duration: "1个月" }, priceUsdt: 2.5, stock: "in_stock", deliveryType: "auto" },
      { id: "yt-us-12", optionValues: { region: "US", duration: "12个月" }, priceUsdt: 24, stock: "in_stock", deliveryType: "manual" },
    ],
    seo: {
      title: "YouTube Premium 购买 - 免广告与 YouTube Music | ichuhai",
      description: "在 ichuhai 购买 YouTube Premium，支持 Global、US、EU 地区规格，USDT 支付，展示自动或人工发货状态、价格与售后说明。",
      keywords: ["YouTube Premium 购买", "YouTube Premium USDT", "YouTube Music Premium"],
      audienceQuestions: ["YouTube Premium 包含 YouTube Music 吗？", "YouTube Premium 是否自动发货？", "YouTube Premium 家庭邀请失败怎么办？"],
    },
    notice: {
      deliverySummary: "部分自动发货",
      warrantySummary: "30天",
      refundSummary: "开通后不支持退款",
      usageGuide: "请填写可接收邀请的邮箱，部分规格需要人工确认后开通。",
      warrantyDetail: "如邀请失效可联系客服补发或协助排查。",
      attention: "跨区账号可能需要额外验证，请确认邮箱和地区条件。",
      faq: [
        { question: "YouTube Premium 包含 YouTube Music 吗？", answer: "通常包含 YouTube Music 权益，具体以商品规格说明为准。" },
        { question: "为什么有些 SKU 是人工发货？", answer: "长期或特定地区规格可能需要人工确认账号条件，确保开通成功率。" },
        { question: "邀请失效怎么办？", answer: "可通过订单售后提交邮箱和截图，客服会协助补发或排查。" },
      ],
    },
  },
  {
    id: "steam-wallet",
    slug: "steam-wallet",
    name: "Steam Wallet",
    category: "游戏",
    icon: "steam",
    short: "Steam 钱包充值码与余额补充，适合游戏购买。",
    detail: "Steam Wallet 提供不同面额的充值选择。由于区服和兑换限制较多，下单前请确认账号地区和充值码适配范围。",
    deliveryType: "manual",
    optionGroups: [{ key: "amount", name: "面额", options: ["5 USD", "10 USD", "20 USD"] }],
    skus: [
      { id: "sw-5", optionValues: { amount: "5 USD" }, priceUsdt: 5, stock: "in_stock", deliveryType: "manual" },
      { id: "sw-10", optionValues: { amount: "10 USD" }, priceUsdt: 10, stock: "in_stock", deliveryType: "manual" },
      { id: "sw-20", optionValues: { amount: "20 USD" }, priceUsdt: 20, stock: "low_stock", deliveryType: "manual" },
    ],
    seo: {
      title: "Steam Wallet 购买 - Steam 钱包充值与 USDT 支付 | ichuhai",
      description: "购买 Steam Wallet 钱包充值码，支持 5 USD、10 USD、20 USD 面额，USDT 支付，人工核验发货并提供区服注意事项。",
      keywords: ["Steam Wallet 购买", "Steam 钱包充值", "Steam Wallet USDT"],
      audienceQuestions: ["Steam Wallet 支持哪些面额？", "Steam Wallet 多久发货？", "Steam 区服错误能退款吗？"],
    },
    notice: {
      deliverySummary: "手动处理",
      warrantySummary: "7天",
      refundSummary: "充值码发出后不支持退款",
      usageGuide: "请确认 Steam 区服后提交订单，客服会按订单规格处理发货。",
      warrantyDetail: "未兑换卡密 7 天内可协助排查。",
      attention: "区服错误可能无法兑换，请在购买前确认账号地区。",
      faq: [
        { question: "Steam Wallet 多久发货？", answer: "该商品通常为人工处理，支付确认后客服会按队列发货。" },
        { question: "Steam 区服选错怎么办？", answer: "充值码发出后通常无法退款，请下单前确认区服。" },
        { question: "支持哪些面额？", answer: "当前页面展示 5 USD、10 USD、20 USD 等可购买面额。" },
      ],
    },
  },
  {
    id: "microsoft-365",
    slug: "microsoft-365",
    name: "Microsoft 365",
    category: "软件",
    icon: "office",
    short: "Office 办公套件订阅，适合文档、表格和云端协作。",
    detail: "Microsoft 365 提供个人版和家庭版选择，适合需要 Office、OneDrive 和跨设备办公能力的用户。",
    deliveryType: "auto",
    optionGroups: [{ key: "plan", name: "套餐", options: ["个人版", "家庭版"] }],
    skus: [
      { id: "ms-personal", optionValues: { plan: "个人版" }, priceUsdt: 3.5, stock: "in_stock", deliveryType: "auto" },
      { id: "ms-family", optionValues: { plan: "家庭版" }, priceUsdt: 8.8, stock: "in_stock", deliveryType: "auto" },
    ],
    seo: {
      title: "Microsoft 365 购买 - Office 订阅与自动发货 | ichuhai",
      description: "购买 Microsoft 365 个人版或家庭版，支持 USDT 支付、自动发货、激活说明、保质期与售后规则。",
      keywords: ["Microsoft 365 购买", "Office 365 订阅", "Microsoft 365 USDT"],
      audienceQuestions: ["Microsoft 365 支持 Mac 吗？", "Microsoft 365 包含 OneDrive 吗？", "Microsoft 365 激活失败怎么办？"],
    },
    notice: {
      deliverySummary: "自动发货",
      warrantySummary: "30天",
      refundSummary: "激活后不支持退款",
      usageGuide: "按邮件或订单中的步骤完成激活，请勿频繁切换绑定邮箱。",
      warrantyDetail: "激活失败可联系售后处理。",
      attention: "请确认账号邮箱和套餐类型，激活后通常不支持退款。",
      faq: [
        { question: "Microsoft 365 支持 Mac 吗？", answer: "通常支持 Windows、Mac 和移动端，具体以套餐说明和微软官方限制为准。" },
        { question: "是否包含 OneDrive？", answer: "Microsoft 365 套餐通常包含 OneDrive 存储权益，具体容量以套餐为准。" },
        { question: "激活失败怎么办？", answer: "可通过订单页提交售后，客服会根据激活记录协助排查。" },
      ],
    },
  },
];

export const homeFaqs = [
  { question: "购买需要登录吗？", answer: "需要。ichuhai 使用邮箱账号绑定订单、余额、发货信息和售后工单。" },
  { question: "支持哪些支付方式？", answer: "支持余额支付、微信/支付宝聚合支付，以及 TRON 上的 USDT TRC20 支付。" },
  { question: "如何查询订单？", answer: "登录后进入个人中心，即可查看当前邮箱账号绑定的订单状态、发货信息和售后记录。" },
  { question: "发货速度有多快？", answer: "自动发货商品通常在支付确认后秒级交付，人工商品会进入客服处理队列。" },
  { question: "虚拟商品可以退款吗？", answer: "未发货订单可联系售后处理；已发货或已开通的虚拟商品通常不支持退款。" },
];

export function productUrl(slug: string) {
  return `${siteConfig.url}/products/${slug}`;
}

export function productImage(product: SeoProduct) {
  return productIconMap[product.icon] || siteConfig.logo;
}

export function defaultSku(product: SeoProduct) {
  return product.skus.find((sku) => sku.recommended) || product.skus.find((sku) => sku.stock !== "sold_out") || product.skus[0];
}

export function deliveryLabel(deliveryType: SeoProduct["deliveryType"] | SeoSku["deliveryType"]) {
  if (deliveryType === "auto") return "自动发货";
  if (deliveryType === "manual") return "人工处理";
  return "部分自动发货";
}

export function stockLabel(stock: SeoSku["stock"]) {
  if (stock === "in_stock") return "有货";
  if (stock === "low_stock") return "少量库存";
  return "暂时缺货";
}
