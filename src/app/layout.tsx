import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ichuhai.com'),
  applicationName: 'ichuhai',
  title: {
    default: 'ichuhai - 全球数字商品 USDT 支付与自动发货商城',
    template: '%s | ichuhai'
  },
  description: 'ichuhai 提供 Discord Nitro、Spotify Premium、YouTube Premium、Steam Wallet、Microsoft 365 等数字商品，支持 USDT TRC20 支付与自动发货。',
  keywords: ['数字商品', '虚拟商品商城', 'USDT 支付', 'Discord Nitro', 'Spotify Premium', 'YouTube Premium', 'Steam Wallet', 'Microsoft 365'],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'ichuhai',
    title: 'ichuhai - 全球数字商品 USDT 支付与自动发货商城',
    description: '购买数字商品，支持 USDT TRC20 支付、自动发货、订单查询与售后处理。',
    images: ['/assets/brand/logo/ichuhai-logo-horizontal-color.png']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ichuhai - 全球数字商品 USDT 支付与自动发货商城',
    description: '购买数字商品，支持 USDT TRC20 支付、自动发货、订单查询与售后处理。',
    images: ['/assets/brand/logo/ichuhai-logo-horizontal-color.png']
  },
  icons: {
    icon: [
      { url: '/assets/brand/logo/ichuhai-logo-icon-color.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/assets/brand/logo/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/assets/brand/logo/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/assets/brand/logo/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
