'use client'

import Image from 'next/image'
import Gallery from '@/app/components/gallery'
import { HoverProvider, TerminalDisplay, experiences, useHover } from '@/app/components/experience-terminal'

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

function PreviousList() {
  const { active, setActive } = useHover()

  return (
    <div className="flex flex-col space-y-1.5 sm:space-y-1">
      <p className="text-[11px] sm:text-xs font-medium tracking-wider text-muted-foreground/40 uppercase">Previous</p>
      {experiences.map(e => (
        <button
          key={e.id}
          onMouseEnter={() => setActive(e.id)}
          onFocus={() => setActive(e.id)}
          className={`flex flex-wrap items-center space-x-1.5 sm:space-x-1 gap-y-1 text-sm text-left transition-opacity duration-300 ${
            active && active !== e.id ? 'opacity-30' : 'opacity-100'
          }`}
        >
          <Image src={`${base}/${e.id}.webp`} alt="" width={28} height={28} className="rounded-md shrink-0" />
          <span className="text-foreground">{e.title}</span>
        </button>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10 xl:space-y-12 2xl:space-y-14">
          <HoverProvider>
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-5 lg:space-x-8 xl:space-x-10 2xl:space-x-12 items-start">
              <div className="flex flex-col space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-7 2xl:space-y-8 flex-[4] min-w-0">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-4xl lg:text-5xl leading-[1.1]">
                  Break it down.
                  <br />
                  Understand it.
                  <br />
                  Build it right.
                </h1>

                <div className="flex flex-col space-y-1.5 sm:space-y-1">
                  <p className="text-base sm:text-lg">
                    Software Engineer at <span className="text-foreground">[Redacted]</span>
                  </p>
                  <div className="max-w-xs sm:max-w-sm">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      <span className="text-xs text-muted-foreground/40 select-none">&ldquo;</span>
                      <span className="tracking-wide">What resists is never refusal, but the unseen form lingering at the edge of knowing, awaiting the moment it is truly beheld.</span>
                      <span className="text-xs text-muted-foreground/40 select-none">&rdquo;</span>
                    </p>
                  </div>
                </div>

                <PreviousList />

                <div className="flex flex-wrap items-center space-x-2 sm:space-x-3 text-sm text-muted-foreground">
                  <a href="https://github.com/datnguyennnx" className="text-accent-foreground hover:text-accent-foreground/60 transition-colors">GitHub</a>
                  <span className="text-border">/</span>
                  <a href="https://linkedin.com/in/datnguyennnx" className="text-accent-foreground hover:text-accent-foreground/60 transition-colors">LinkedIn</a>
                  <span className="text-border">/</span>
                  <span>official.nguyendat@gmail.com</span>
                </div>
              </div>

              <div className="flex-[6] min-w-0">
                <TerminalDisplay />
              </div>
            </div>
          </HoverProvider>

          <Gallery />
        </div>
    )
  }
