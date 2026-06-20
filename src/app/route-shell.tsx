import type { ReactNode } from "react";
import { ToastRegion, InteractiveAppScript } from "./seo-components";

export function AppRouteShell({ title = "正在打开页面" }: { title?: ReactNode }) {
  return (
    <>
      <div id="app">
        <main className="page seo-page">
          <section className="page-title">
            <h1>{title}</h1>
            <p>正在加载 ichuhai 交互页面。</p>
          </section>
        </main>
      </div>
      <ToastRegion />
      <InteractiveAppScript />
    </>
  );
}
