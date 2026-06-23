import type { ReactNode } from "react";
import { ToastRegion, InteractiveAppScript } from "./seo-components";

export function AppRouteShell(_props: { title?: ReactNode } = {}) {
  return (
    <>
      <div id="app" suppressHydrationWarning />
      <ToastRegion />
      <InteractiveAppScript />
    </>
  );
}
