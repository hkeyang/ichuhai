import { itemListJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo/json-ld';
import { siteConfig } from '@/lib/seo/products';
import { InteractiveAppScript, JsonLd, SeoHomeContent, ToastRegion } from './seo-components';

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
      <InteractiveAppScript />
    </>
  );
}
