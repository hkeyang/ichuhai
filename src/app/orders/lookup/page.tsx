import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "个人中心",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderLookupPage() {
  redirect("/account");
}
