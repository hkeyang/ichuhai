import type { Metadata } from "next";
import { AccountApp } from "./AccountApp";

export const metadata: Metadata = {
  title: "个人中心",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountApp />;
}
