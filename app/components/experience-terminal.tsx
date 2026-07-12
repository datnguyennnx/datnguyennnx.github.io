'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface Experience {
  id: string
  title: string
  company: string
  lines: string[]
}

interface HoverContextValue {
  active: string | null
  setActive: (id: string | null) => void
}

const HoverContext = createContext<HoverContextValue>({
  active: null,
  setActive: () => {},
})

export const useHover = () => useContext(HoverContext)

const experiences: Experience[] = [
  {
    id: 'nami',
    title: 'Trading System Engineer',
    company: 'Nami Foundation',
    lines: [
      'Led architectural redesign of NAO Plus core trading flows for cross margin mode',
      'Owned comprehensive documentation of order lifecycle and liquidation engines',
      'Built request protection: blacklist, whitelist, rate limiting, validation layers',
      'Implemented hot-reload mechanism for trading pair lifecycle management',
      'Designed cross-margin liquidation engine with MMR trigger detection',
      'Refactored AMM to support Uniswap V3 concentrated liquidity algorithms',
      'Built internal CMS dashboard for position history tracking',
      'Core on-call engineer handling high-severity production incidents',
      'Engineered real-time warning system routing alerts to Slack channels',
    ],
  },
  {
    id: 'aquila',
    title: 'Full-stack Product Engineer',
    company: 'Aquila.is',
    lines: [
      'Designed AI-powered workflows in Dify for ESG and carbon credit platform',
      'Developed AI-powered OCR pipeline for global utility bill data extraction',
      'Led automation of business development with AI-driven Zapier workflows',
    ],
  },
  {
    id: 'df',
    title: 'AI Software Engineer',
    company: 'Dwarves Foundation',
    lines: [
      'Developed RAG application with T3 stack and pgvector extensions',
      'Collaborated in R&D Labs innovating AI agent pipelines',
      'Built real-world LLM applications with prompt engineering',
      'Earned Best Community Contributor award at OGIF events',
    ],
  },
]

export function HoverProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null)
  return (
    <HoverContext.Provider value={{ active, setActive }}>
      {children}
    </HoverContext.Provider>
  )
}

function TypedLine({ text, index, className }: { text: string; index: number; className?: string }) {
  const [visible, setVisible] = useState(false)
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 600)
    return () => clearTimeout(timer)
  }, [index])

  useEffect(() => {
    if (!visible || done) return
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.substring(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, 25)
    return () => clearInterval(interval)
  }, [visible, text, done])

  if (!visible) return null

  return (
    <p className={className}>
      {displayed}
      {!done && <span className="animate-pulse text-muted-foreground/50">▊</span>}
    </p>
  )
}

function FadeLine({ text, index, className }: { text: string; index: number; className?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 600)
    return () => clearTimeout(timer)
  }, [index])

  return (
    <p
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-4px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {text}
    </p>
  )
}

export function TerminalDisplay() {
  const { active } = useHover()
  const exp = experiences.find(e => e.id === active)

  return (
    <div className="hidden md:block w-full">
      <div className="border-border bg-background z-0 min-h-[22rem] rounded-xl border">
        <div className="border-border flex flex-col gap-y-2 border-b p-4">
          <div className="flex flex-row gap-x-2">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </div>
        </div>
        <pre className="overflow-x-auto p-4 max-h-[24rem] overflow-y-auto">
          <code className="grid gap-y-1 text-nowrap text-sm">
            {exp ? (
              <>
                <TypedLine key={`${exp.id}-cmd`} text={`$ cat /etc/${exp.id}/README.md`} index={0} className="text-muted-foreground/80" />
                {exp.lines.map((line, i) => (
                  <FadeLine key={`${exp.id}-${i}`} text={`  ${i + 1}. ${line}`} index={i + 1} className="text-muted-foreground" />
                ))}
                <TypedLine key={`${exp.id}-end`} text="$ _" index={exp.lines.length + 1} className="text-muted-foreground/50" />
              </>
            ) : (
              <>
                <TypedLine key="idle-cmd" text="$ ls experience/" index={0} className="text-muted-foreground/80" />
                <FadeLine key="idle-hint" text="> Hover a role to explore" index={1} className="text-muted-foreground" />
                <TypedLine key="idle-end" text="$ _" index={2} className="text-muted-foreground/50" />
              </>
            )}
          </code>
        </pre>
      </div>
    </div>
  )
}

export { experiences }
