import type { Metadata } from "next";
import { AppRouteShell } from "../route-shell";

export const metadata: Metadata = {
  title: "购物车",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return <AppRouteShell title="购物车" />;
}
