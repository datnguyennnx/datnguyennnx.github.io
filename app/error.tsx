"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 ease-standard">
      <div className="flex flex-col items-center gap-8">
        <p className="flex text-sm text-muted-foreground">
          Couldn&rsquo;t render that. Let&rsquo;s reset.
        </p>
        <Button variant="outline" size="default" onClick={() => reset()}>
          Try again
        </Button>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center text-sm text-muted-foreground hover:text-foreground transition-link focus-ring p-2"
        >
          &larr; Home
        </Link>
      </div>
    </main>
  );
}
