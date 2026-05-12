import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'ichuhai',
  description: 'Digital products, instant delivery, secure crypto payment',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
