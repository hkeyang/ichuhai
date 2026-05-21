import type { Metadata } from "next";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/json-ld";
import { siteConfig } from "@/lib/seo/products";
import { InteractiveAppScript, JsonLd, ProductsPageContent, ToastRegion } from "../seo-components";

export const metadata: Metadata = {
  title: "数字商品列表 - Discord、Spotify、YouTube、Steam、Microsoft 365",
  description: "浏览 ichuhai 全部数字商品，支持 Discord Nitro、Spotify Premium、YouTube Premium、Steam Wallet、Microsoft 365，USDT 支付与自动发货。",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "ichuhai 数字商品列表",
    description: "浏览全部数字商品，查看价格、库存、发货方式和售后规则。",
    url: `${siteConfig.url}/products`,
    type: "website",
  },
};

export default function ProductsPage() {
  return (
    <>
      <JsonLd
        id="products-breadcrumb-jsonld"
        data={breadcrumbJsonLd([
          { name: "首页", url: siteConfig.url },
          { name: "商品", url: `${siteConfig.url}/products` },
        ])}
      />
      <JsonLd id="products-item-list-jsonld" data={itemListJsonLd()} />
      <div id="app">
        <ProductsPageContent />
      </div>
      <ToastRegion />
      <InteractiveAppScript />
    </>
  );
}
