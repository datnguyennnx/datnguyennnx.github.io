const sidebarWidths = ["60%", "45%", "55%", "70%", "40%", "50%", "65%"];

export default function NotesLoading() {
  return (
    <div className="flex min-h-dvh w-full flex-1 flex-col md:flex-row">
      {/* Desktop — sidebar skeleton */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/20 bg-muted/5 md:flex">
        <div className="flex items-center border-b border-border/20 px-4 py-3">
          <div className="h-3 w-12 skeleton-sm" />
        </div>
        <div className="flex-1 space-y-2 p-3">
          {sidebarWidths.map((w, i) => (
            <div key={i} className="h-4 skeleton-md" style={{ width: w }} />
          ))}
        </div>
      </aside>

      {/* Mobile — centered skeleton (shown on < md) */}
      <div className="flex flex-1 flex-col md:hidden">
        <div className="border-b border-border/20 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="size-4 skeleton-md" />
            <div className="h-4 w-16 skeleton-sm" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-prose">
            <div className="h-8 w-3/4 skeleton-sm" />
            <div className="mt-3 h-4 w-1/3 skeleton-md" />
            <div className="mt-8 space-y-3">
              <div className="h-4 w-full skeleton-md" />
              <div className="h-4 w-5/6 skeleton-md" />
              <div className="h-4 w-4/5 skeleton-md" />
              <div className="h-4 w-full skeleton-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop — content skeleton (hidden on mobile) */}
      <main className="hidden flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 md:block">
        <div className="mx-auto max-w-prose">
          <div className="h-8 w-3/4 skeleton-sm" />
          <div className="mt-3 h-4 w-1/3 skeleton-md" />
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full skeleton-md" />
            <div className="h-4 w-5/6 skeleton-md" />
            <div className="h-4 w-4/5 skeleton-md" />
            <div className="h-4 w-3/4 skeleton-md" />
          </div>
        </div>
      </main>
    </div>
  );
}
