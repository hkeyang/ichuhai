import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "购物车",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  redirect("/products");
}
