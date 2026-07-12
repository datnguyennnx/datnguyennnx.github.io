'use client'

import { useCallback } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export default function Header() {
  const { setTheme, resolvedTheme } = useTheme()

  const toggle = useCallback(() => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark'
    if (document.startViewTransition) {
      document.startViewTransition(() => setTheme(next))
    } else {
      setTheme(next)
    }
  }, [resolvedTheme, setTheme])

  return (
    <header className="pointer-events-none relative z-50 flex flex-none flex-col">
      <div className="flex w-full justify-end">
        <div className="pointer-events-auto">
          <button
            type="button"
            aria-label="Toggle theme"
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-card ring-1 ring-border/50 shadow-sm
              transition-all motion-safe:duration-300 motion-safe:ease-out
              hover:ring-border hover:shadow-md hover:-translate-y-0.5
              active:translate-y-0 active:shadow-sm active:scale-90
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={toggle}
          >
            <span className="relative flex h-4 w-4 items-center justify-center">
              <Sun
                className="absolute inset-0 h-4 w-4 text-muted-foreground
                  transition-all motion-safe:duration-500 motion-safe:ease-in-out
                  dark:rotate-180 dark:scale-0 dark:opacity-0"
              />
              <Moon
                className="absolute inset-0 h-4 w-4 text-muted-foreground
                  transition-all motion-safe:duration-500 motion-safe:ease-in-out
                  rotate-180 scale-0 opacity-0
                  dark:rotate-0 dark:scale-100 dark:opacity-100"
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
