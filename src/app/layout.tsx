import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'ichuhai',
  description: 'Digital products, instant delivery, secure crypto payment',
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
