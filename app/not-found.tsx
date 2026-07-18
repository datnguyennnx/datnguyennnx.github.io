import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
      <div className="flex flex-col items-center gap-8">
        <h1 className="sr-only">Page Not Found</h1>
        <span
          role="presentation"
          className="select-none text-[8rem] font-bold leading-none tracking-tight text-muted-foreground sm:text-[11rem]"
        >
          404
        </span>
        <p className="flex text-sm text-muted-foreground">Wrong turn. Head back.</p>
        <Link
          href="/"
          className="flex text-xs text-muted-foreground hover:text-foreground transition-link"
        >
          &larr; Home
        </Link>
      </div>
    </main>
  );
}
