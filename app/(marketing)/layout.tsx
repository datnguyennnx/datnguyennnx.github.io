import type { Metadata } from "next";
import Header from "@/app/(marketing)/_components/header";
import Footer from "@/app/(marketing)/_components/footer";

export const metadata: Metadata = {
  description: "Personal site and digital garden — engineering, finance, and perspectives.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto flex w-full h-full max-w-7xl flex-col px-4 py-5 sm:py-6 gap-4 md:gap-8 transition-layout md:bg-card md:ring-1 md:ring-border md:p-8 lg:p-10">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
