import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Theme preferences — light, dark, or system.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
