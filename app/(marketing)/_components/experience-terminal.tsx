"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface Experience {
  id: string;
  title: string;
  company: string;
  lines: string[];
}

interface HoverContextValue {
  active: string | null;
  setActive: (id: string | null) => void;
}

const HoverContext = createContext<HoverContextValue>({
  active: null,
  setActive: () => {},
});

export const useHover = () => useContext(HoverContext);

const experiences: Experience[] = [
  {
    id: "nami",
    title: "Trading System Engineer",
    company: "Nami Foundation",
    lines: [
      "Led architectural redesign of NAO Plus core trading flows for cross margin mode",
      "Owned comprehensive documentation of order lifecycle and liquidation engines",
      "Built request protection: blacklist, whitelist, rate limiting, validation layers",
      "Implemented hot-reload mechanism for trading pair lifecycle management",
      "Designed cross-margin liquidation engine with MMR trigger detection",
      "Refactored AMM to support Uniswap V3 concentrated liquidity algorithms",
      "Built internal CMS dashboard for position history tracking",
      "Core on-call engineer handling high-severity production incidents",
      "Engineered real-time warning system routing alerts to Slack channels",
    ],
  },
  {
    id: "aquila",
    title: "Full-stack Product Engineer",
    company: "Aquila.is",
    lines: [
      "Designed AI-powered workflows in Dify for ESG and carbon credit platform",
      "Developed AI-powered OCR pipeline for global utility bill data extraction",
      "Led automation of business development with AI-driven Zapier workflows",
    ],
  },
  {
    id: "df",
    title: "AI Software Engineer",
    company: "Dwarves Foundation",
    lines: [
      "Developed RAG application with T3 stack and pgvector extensions",
      "Collaborated in R&D Labs innovating AI agent pipelines",
      "Built real-world LLM applications with prompt engineering",
      "Earned Best Community Contributor award at OGIF events",
    ],
  },
];

export function HoverProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  return <HoverContext.Provider value={{ active, setActive }}>{children}</HoverContext.Provider>;
}

function TypedLine({
  text,
  index,
  className,
}: {
  text: string;
  index: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 600);
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    if (!visible || done) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.substring(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [visible, text, done]);

  if (!visible) return null;

  return (
    <p className={className}>
      {displayed}
      {!done && <span className="motion-safe:animate-pulse text-muted-secondary">▊</span>}
    </p>
  );
}

function FadeLine({ text, index, className }: { text: string; index: number; className?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 600);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <p
      className={`${className} transition-gallery`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-4px)",
      }}
    >
      {text}
    </p>
  );
}

export function TerminalDisplay() {
  const { active } = useHover();
  const exp = experiences.find((e) => e.id === active);

  return (
    <>
      {/*
        Mobile fallback view — matches desktop terminal aesthetic
        (window chrome, monospace $ prompt) without typewriter animation
        since touch doesn't have hover. Content appears immediately.
        Uses touch-action: manipulation to eliminate 300ms tap delay.
      */}
      <div className="lg:hidden w-full" style={{ touchAction: "manipulation" }}>
        <div className="border-border bg-background z-0 min-h-48 rounded-md border">
          <div className="border-border flex flex-col gap-y-2 border-b p-4">
            <div className="flex flex-row gap-x-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
          </div>
          <pre className="overflow-x-auto p-4 min-w-0 h-full overflow-y-auto">
            <code className="grid gap-y-1 whitespace-pre-wrap wrap-reak-words text-sm text-muted-secondary">
              {exp ? (
                <>
                  <p className="text-muted-secondary">{`$ cat /etc/${exp.id}/README.md`}</p>
                  {exp.lines.map((line, i) => (
                    <p
                      key={`${exp.id}-${i}`}
                      className="text-muted-foreground"
                    >{`  ${i + 1}. ${line}`}</p>
                  ))}
                  <p className="text-muted-secondary">$ _</p>
                </>
              ) : (
                <>
                  <p className="text-muted-secondary">$ ls experience/</p>
                  <p className="text-muted-foreground">&gt; Select a role to explore</p>
                  <p className="text-muted-secondary">$ _</p>
                </>
              )}
            </code>
          </pre>
        </div>
      </div>

      {/*
        Desktop terminal — simulated terminal with typewriter effect.
        Hidden below md: breakpoint.
      */}
      <div className="hidden lg:block w-full">
        <div className="border-border bg-background z-0 min-h-88 rounded-md border">
          <div className="border-border flex flex-col gap-y-2 border-b p-4">
            <div className="flex flex-row gap-x-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
          </div>
          <pre className="overflow-x-auto p-4 max-h-96 overflow-y-auto">
            <code className="grid gap-y-1 whitespace-pre-wrap break-words text-sm">
              {exp ? (
                <>
                  <TypedLine
                    key={`${exp.id}-cmd`}
                    text={`$ cat /etc/${exp.id}/README.md`}
                    index={0}
                    className="text-muted-secondary"
                  />
                  {exp.lines.map((line, i) => (
                    <FadeLine
                      key={`${exp.id}-${i}`}
                      text={`  ${i + 1}. ${line}`}
                      index={i + 1}
                      className="text-muted-foreground"
                    />
                  ))}
                  <TypedLine
                    key={`${exp.id}-end`}
                    text="$ _"
                    index={exp.lines.length + 1}
                    className="text-muted-secondary"
                  />
                </>
              ) : (
                <>
                  <TypedLine
                    key="idle-cmd"
                    text="$ ls experience/"
                    index={0}
                    className="text-muted-secondary"
                  />
                  <FadeLine
                    key="idle-hint"
                    text="> Hover a role to explore"
                    index={1}
                    className="text-muted-foreground"
                  />
                  <TypedLine key="idle-end" text="$ _" index={2} className="text-muted-secondary" />
                </>
              )}
            </code>
          </pre>
        </div>
      </div>
    </>
  );
}

export { experiences };
