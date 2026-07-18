"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeValue = "light" | "dark" | "system";

interface ThemeCardProps {
  value: ThemeValue;
  label: string;
  theme: string | undefined;
  onSelect: (value: ThemeValue) => void;
  children: React.ReactNode;
}

function ThemeCard({ value, label, theme, onSelect, children }: ThemeCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Standard next-themes pattern to defer isActive until after hydration.
    // Prevents className mismatch between SSR and CSR (setState-in-effect
    // is safe here — single fire, no cascade).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Only compute isActive after mount to prevent hydration mismatch.
  // next-themes returns a default theme ("light") during SSR, but the
  // actual stored theme on the client; comparing them before mount would
  // produce different className values on server vs client.
  const isActive = mounted && theme === value;

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className="flex flex-col items-center gap-2.5 group focus-ring"
    >
      <div
        className={cn(
          "relative w-full aspect-[16/10] rounded-md overflow-hidden border transition-interactive hover:scale-[1.02]",
          isActive
            ? "ring-2 ring-foreground/20 border-border/20"
            : "border-border/20 hover:border-border/60",
        )}
      >
        {children}
      </div>
      <span
        className={cn(
          "text-sm font-semibold tracking-tight transition-link",
          isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80",
        )}
      >
        {label}
      </span>
    </button>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    document.title = "Settings — datnguyennnx";
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl py-[clamp(1.5rem,3vw,3rem)] space-y-[clamp(1rem,1.5vw,1.5rem)]">
      <div className="space-y-1">
        <h1 className="text-[clamp(1.125rem,1.5vw,1.5rem)] font-bold tracking-tight">Settings</h1>
        <p className="text-[clamp(0.75rem,0.85vw,0.875rem)] text-muted-foreground">
          Manage your site preferences and experience.
        </p>
      </div>

      <div className="w-full rounded-md">
        <div className="space-y-1 mb-2">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Palette className="size-4 text-primary" />
            Appearance & Theme
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Choose how the site appears on your device.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ThemeCard value="light" label="Light" theme={theme} onSelect={setTheme}>
            <div className="h-full w-full bg-white rounded-md overflow-hidden">
              <div className="h-4 bg-gray-50 flex items-center gap-1 px-2 border-b border-gray-100">
                <span className="size-1.5 rounded-full bg-red-300" />
                <span className="size-1.5 rounded-full bg-yellow-300" />
                <span className="size-1.5 rounded-full bg-green-300" />
              </div>
              <div className="flex items-center justify-center h-[calc(100%-16px)]">
                <span className="text-sm font-bold text-gray-800/90">Aa</span>
              </div>
            </div>
          </ThemeCard>

          <ThemeCard value="dark" label="Dark" theme={theme} onSelect={setTheme}>
            <div className="h-full w-full bg-[#0a0a0a] rounded-md overflow-hidden">
              <div className="h-4 bg-[#0a0a0a] flex items-center gap-1 px-2 border-b border-white/5">
                <span className="size-1.5 rounded-full bg-red-500/70" />
                <span className="size-1.5 rounded-full bg-yellow-500/70" />
                <span className="size-1.5 rounded-full bg-green-500/70" />
              </div>
              <div className="flex items-center justify-center h-[calc(100%-16px)]">
                <span className="text-sm font-bold text-gray-200/90">Aa</span>
              </div>
            </div>
          </ThemeCard>

          <ThemeCard value="system" label="System" theme={theme} onSelect={setTheme}>
            <div className="flex h-full w-full rounded-md overflow-hidden">
              <div className="flex-1 bg-white border-r border-gray-100">
                <div className="h-4 bg-gray-50 flex items-center gap-1 px-1.5 border-b border-gray-100">
                  <span className="size-1.5 rounded-full bg-red-300" />
                  <span className="size-1.5 rounded-full bg-yellow-300" />
                  <span className="size-1.5 rounded-full bg-green-300" />
                </div>
                <div className="flex items-center justify-center h-[calc(100%-16px)]">
                  <span className="text-sm font-bold text-gray-800/90">Aa</span>
                </div>
              </div>
              <div className="flex-1 bg-[#0a0a0a]">
                <div className="h-4 bg-[#0a0a0a] flex items-center gap-1 px-1.5 border-b border-white/5">
                  <span className="size-1.5 rounded-full bg-red-500/70" />
                  <span className="size-1.5 rounded-full bg-yellow-500/70" />
                  <span className="size-1.5 rounded-full bg-green-500/70" />
                </div>
                <div className="flex items-center justify-center h-[calc(100%-16px)]">
                  <span className="text-sm font-bold text-gray-200/90">Aa</span>
                </div>
              </div>
            </div>
          </ThemeCard>
        </div>
      </div>
    </div>
  );
}
