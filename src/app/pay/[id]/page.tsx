import type { Metadata } from "next";
import { AppRouteShell } from "../../route-shell";

export const metadata: Metadata = {
  title: "订单支付",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PayPage() {
  return <AppRouteShell title="订单支付" />;
}
