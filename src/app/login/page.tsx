import type { Metadata } from "next";
import { AppRouteShell } from "../route-shell";

export const metadata: Metadata = {
  title: "登录",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <AppRouteShell title="登录" />;
}
