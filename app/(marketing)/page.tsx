"use client";

import Image from "next/image";
import Gallery from "@/app/(marketing)/_components/gallery";
import {
  HoverProvider,
  TerminalDisplay,
  experiences,
  useHover,
} from "@/app/(marketing)/_components/experience-terminal";

function PreviousList() {
  const { active, setActive } = useHover();

  return (
    <div className="flex flex-col space-y-2 sm:space-y-4">
      <p className="text-[11px] sm:text-xs font-medium tracking-wider text-muted-secondary uppercase">
        Previous
      </p>
      {experiences.map((e) => (
        <button
          key={e.id}
          onMouseEnter={() => setActive(e.id)}
          onFocus={() => setActive(e.id)}
          className={`flex flex-wrap w-fit items-center space-x-1.5 sm:space-x-1 gap-y-1 text-sm text-left transition-element rounded-md hover:bg-accent ${
            active && active !== e.id ? "opacity-30" : "opacity-100"
          }`}
        >
          <Image
            src={`/${e.id}.webp`}
            alt=""
            width={28}
            height={28}
            className="rounded-md shrink-0"
          />
          <span className="text-foreground">{e.title}</span>
        </button>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col space-y-8 sm:space-y-6 md:space-y-8 lg:space-y-10 xl:space-y-12 2xl:space-y-14">
      <HoverProvider>
        <div className="flex flex-col space-y-6 lg:flex-row lg:space-y-0 lg:space-x-5 xl:space-x-10 2xl:space-x-12 items-start">
          <div className="flex flex-col space-y-4 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-7 2xl:space-y-8 flex-4 min-w-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 ease-standard">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-4xl lg:text-5xl leading-[1.1]">
              Break it down.
              <br />
              Understand it.
              <br />
              Build it right.
            </h1>

            <div className="flex flex-col space-y-2 sm:space-y-1">
              <p className="text-base sm:text-lg">
                Software Engineer at <span className="text-foreground">[Redacted]</span>
              </p>
              <div className="max-w-xs sm:max-w-sm">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <span className="text-xs text-muted-secondary select-none">&ldquo;</span>
                  <span className="tracking-wide">
                    What resists is never refusal, but the unseen form lingering at the edge of
                    knowing, awaiting the moment it is truly beheld.
                  </span>
                  <span className="text-xs text-muted-secondary select-none">&rdquo;</span>
                </p>
              </div>
            </div>

            <PreviousList />

            <div className="flex flex-wrap items-center space-x-2 sm:space-x-3 text-sm text-muted-foreground">
              <a
                href="https://github.com/datnguyennnx"
                className="text-accent-foreground hover:text-accent-foreground/60 transition-link focus-ring"
              >
                GitHub
              </a>
              <span className="text-border">/</span>
              <a
                href="https://linkedin.com/in/datnguyennnx"
                className="text-accent-foreground hover:text-accent-foreground/60 transition-link focus-ring"
              >
                LinkedIn
              </a>
              <span className="text-border">/</span>
              <span>official.nguyendat@gmail.com</span>
            </div>
          </div>

          <div className="w-full lg:flex-6 lg:min-w-0">
            <TerminalDisplay />
          </div>
        </div>
      </HoverProvider>

      <Gallery />
    </div>
  );
}
