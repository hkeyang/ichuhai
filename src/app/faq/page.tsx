import type { Metadata } from "next";
import { AppRouteShell } from "../route-shell";

export const metadata: Metadata = {
  title: "帮助中心",
  description: "ichuhai 购买、支付、发货与售后常见问题。",
};

export default function FaqPage() {
  return <AppRouteShell title="帮助中心" />;
}
