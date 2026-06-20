import type { Metadata } from "next";
import { AppRouteShell } from "../../route-shell";

export const metadata: Metadata = {
  title: "订单查询",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderLookupPage() {
  return <AppRouteShell title="订单查询" />;
}
