import Script from 'next/script';

export default function HomePage() {
  return (
    <main>
      <div id="app" />
      <div id="toast" className="toast" role="status" aria-live="polite" />
      <Script src="/app.js?v=detail-restore-20260513c" type="module" strategy="afterInteractive" />
    </main>
  );
}
