import type { Metadata } from "next";
import { AppRouteShell } from "../route-shell";

export const metadata: Metadata = {
  title: "运营后台",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AppRouteShell title="运营后台" />;
}
