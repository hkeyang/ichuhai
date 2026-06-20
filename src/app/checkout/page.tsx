import type { Metadata } from "next";
import { AppRouteShell } from "../route-shell";

export const metadata: Metadata = {
  title: "确认订单",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <AppRouteShell title="确认订单" />;
}
