import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'GlassFuture Market',
  description: 'Virtual digital goods marketplace'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
