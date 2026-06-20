import type { Metadata } from "next";
import { AppRouteShell } from "../route-shell";

export const metadata: Metadata = {
  title: "个人中心",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountPage() {
  return <AppRouteShell title="个人中心" />;
}
