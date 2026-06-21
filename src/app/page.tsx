import { itemListJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo/json-ld';
import { siteConfig } from '@/lib/seo/products';
import { JsonLd, SeoHomeContent, ToastRegion } from './seo-components';
import Script from 'next/script';

export const metadata = {
  title: {
    absolute: 'ichuhai - 全球数字商品 USDT 支付与自动发货商城'
  },
  description: siteConfig.description,
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'ichuhai - 全球数字商品 USDT 支付与自动发货商城',
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: 'ichuhai',
    type: 'website',
    images: [siteConfig.logo]
  }
};

export default function HomePage() {
  return (
    <>
      <JsonLd id="organization-jsonld" data={organizationJsonLd()} />
      <JsonLd id="website-jsonld" data={websiteJsonLd()} />
      <JsonLd id="item-list-jsonld" data={itemListJsonLd()} />
      <div id="app">
        <SeoHomeContent />
      </div>
      <ToastRegion />
      <Script src="/app.js?v=nav-cleanup-20260621" type="module" strategy="afterInteractive" />
    </>
  );
}
