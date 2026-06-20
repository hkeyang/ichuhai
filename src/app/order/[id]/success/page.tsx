import type { Metadata } from "next";
import { AppRouteShell } from "../../../route-shell";

export const metadata: Metadata = {
  title: "订单完成",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderSuccessPage() {
  return <AppRouteShell title="订单完成" />;
}
