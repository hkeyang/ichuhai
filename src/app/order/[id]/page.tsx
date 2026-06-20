import type { Metadata } from "next";
import { AppRouteShell } from "../../route-shell";

export const metadata: Metadata = {
  title: "订单详情",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderDetailPage() {
  return <AppRouteShell title="订单详情" />;
}
