import {
  defaultSku,
  deliveryLabel,
  homeFaqs,
  productImage,
  seoProducts,
  siteConfig,
  stockLabel,
  type SeoProduct,
} from "@/lib/seo/products";
import Script from "next/script";

const APP_ASSET_VERSION = "account-react-ui-20260624-2";

export function JsonLd({ data, id }: { data: unknown; id: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function InteractiveAppScript() {
  return <Script src={`/app.js?v=${APP_ASSET_VERSION}`} type="module" strategy="afterInteractive" />;
}

export function ToastRegion() {
  return <div id="toast" className="toast" role="status" aria-live="polite" />;
}

export function SiteHeader() {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="ichuhai 首页">
        <img className="logo-horizontal" src={siteConfig.logo} alt="ichuhai" width={600} height={200} />
      </a>
      <nav className="nav">
        <a href="/products">商品</a>
        <a href="/#why-us">保障</a>
        <a href="/faq">FAQ</a>
      </nav>
    </header>
  );
}

export function SeoHomeContent() {
  return (
    <>
      <SiteHeader />
      <main className="page seo-page">
        <section className="hero seo-hero">
          <div className="hero-copy">
            <h1>
              全球数字商品，<span>一站式秒发</span>
            </h1>
            <p>
              ichuhai 提供 Discord Nitro、Spotify Premium、YouTube Premium、Steam Wallet、Microsoft 365 等数字商品，支持 USDT TRC20 支付、个人中心订单管理和自动发货。
            </p>
            <div className="hero-tags">
              <span><b>即时发货</b><small>自动 SKU 秒级交付</small></span>
              <span><b>稳定币支付</b><small>USDT TRC20 自动监听</small></span>
              <span><b>售后可查</b><small>订单与发货状态透明</small></span>
            </div>
            <div className="hero-actions">
              <a className="primary-button" href="/products">立即选购</a>
              <a className="text-button" href="#why-us">查看保障</a>
            </div>
          </div>
        </section>
        <ProductGrid title="热门数字商品" products={seoProducts} limit={5} />
        <SeoFaqSection />
      </main>
    </>
  );
}

export function ProductGrid({
  title,
  products,
  limit,
}: {
  title: string;
  products: SeoProduct[];
  limit?: number;
}) {
  const visible = typeof limit === "number" ? products.slice(0, limit) : products;
  return (
    <section id="products" className="product-section product-browser">
      <div className="product-header">
        <div className="product-title-block">
          <h2>{title}</h2>
          <p>支持分类浏览、USDT 支付、库存状态和发货方式查询。</p>
        </div>
      </div>
      <div className="product-row">
        {visible.map((product) => {
          const sku = defaultSku(product);
          return (
            <a className="product-card" href={`/products/${product.slug}`} key={product.id}>
              <img className="product-icon" src={productImage(product)} alt={`${product.name} 图标`} />
              <span className="product-category">{product.category}</span>
              <h3>{product.name}</h3>
              <p>{product.short}</p>
              <div className="seo-card-meta">
                <span>{deliveryLabel(product.deliveryType)}</span>
                <span>{sku ? stockLabel(sku.stock) : "库存待确认"}</span>
              </div>
              <strong>{sku ? `${sku.priceUsdt.toFixed(2)} USD 起` : "查看规格"}</strong>
            </a>
          );
        })}
      </div>
      {limit ? (
        <div className="view-all-wrap">
          <a className="view-all-link" href="/products">查看全部商品</a>
        </div>
      ) : null}
    </section>
  );
}

export function ProductsPageContent() {
  return (
    <>
      <SiteHeader />
      <main className="page seo-page">
        <section className="page-title">
          <h1>数字商品列表</h1>
          <p>浏览 ichuhai 全部数字商品，按商品类型、发货方式、库存状态和 USDT 支付需求选择合适规格。</p>
        </section>
        <ProductGrid title="全部商品" products={seoProducts} />
      </main>
    </>
  );
}

export function ProductPageContent({ product }: { product: SeoProduct }) {
  const sku = defaultSku(product);

  return (
    <>
      <SiteHeader />
      <main className="page detail-page seo-page">
        <nav className="breadcrumb" aria-label="面包屑">
          <a href="/">首页</a> / <a href="/products">商品</a> / <span>{product.name}</span>
        </nav>
        <section className="product-hero-card">
          <div className="product-main-info">
            <img className="product-icon" src={productImage(product)} alt={`${product.name} 图标`} />
            <div>
              <div className="hero-title-row">
                <h1>{product.name}</h1>
                <span>{deliveryLabel(product.deliveryType)}</span>
              </div>
              <p>{product.short}</p>
              <p>{product.detail}</p>
              <div className="product-tags">
                <span>USDT 支付</span>
                <span>{product.notice.warrantySummary} 保质期</span>
                <span>{product.notice.refundSummary}</span>
              </div>
            </div>
          </div>
          <div className="product-price">{sku ? `${sku.priceUsdt.toFixed(2)} USD 起` : "查看规格"}</div>
        </section>

        <section className="seo-detail-grid">
          <article className="glass panel seo-info-panel">
            <h2>购买选项</h2>
            {product.optionGroups.map((group) => (
              <div className="seo-option-group" key={group.key}>
                <h3>{group.name}</h3>
                <p>{group.options.join(" / ")}</p>
              </div>
            ))}
          </article>
          <article className="glass panel seo-info-panel">
            <h2>发货与售后</h2>
            <p>发货方式：{deliveryLabel(product.deliveryType)}</p>
            <p>使用说明：{product.notice.usageGuide}</p>
            <p>保质期：{product.notice.warrantyDetail}</p>
            <p>注意事项：{product.notice.attention}</p>
          </article>
        </section>

        <section className="glass panel seo-info-panel">
          <h2>可购买 SKU</h2>
          <div className="seo-sku-list">
            {product.skus.map((item) => (
              <div className="seo-sku-row" key={item.id}>
                <strong>{Object.values(item.optionValues).join(" / ")}</strong>
                <span>{item.priceUsdt.toFixed(2)} USD</span>
                <span>{stockLabel(item.stock)}</span>
                <span>{deliveryLabel(item.deliveryType)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="home-faq seo-faq">
          <h2>{product.name} 常见问题</h2>
          <div className="faq-list">
            {product.notice.faq.map((item) => (
              <article className="faq-item active" key={item.question}>
                <span className="faq-copy">
                  <strong>{item.question}</strong>
                  <span>{item.answer}</span>
                </span>
              </article>
            ))}
          </div>
        </section>

        <div className="sticky-checkout-bar seo-cta">
          <div className="sticky-product">
            <img className="product-icon" src={productImage(product)} alt="" />
            <div>
              <strong>{product.name}</strong>
              <p>{sku ? `${sku.priceUsdt.toFixed(2)} USD 起` : "选择规格后下单"}</p>
            </div>
          </div>
          <a className="sticky-pay-button" href={`/products/${product.slug}`}>打开交互购买页</a>
        </div>
      </main>
    </>
  );
}

function SeoFaqSection() {
  return (
    <section className="home-faq seo-faq" id="why-us">
      <h2>购买数字商品常见问题</h2>
      <div className="faq-list">
        {homeFaqs.map((item) => (
          <article className="faq-item active" key={item.question}>
            <span className="faq-copy">
              <strong>{item.question}</strong>
              <span>{item.answer}</span>
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
