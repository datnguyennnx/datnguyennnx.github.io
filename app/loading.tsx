export default function Loading() {
  return (
    <div className="mx-auto flex min-h-screen w-full animate-pulse flex-col items-center gap-6 px-4 py-8 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-slow ease-standard md:px-6 md:py-12 lg:max-w-5xl lg:py-20">
      {/* Title skeleton */}
      <div className="flex w-full flex-col gap-3">
        <div className="skeleton-sm h-8 w-2/3" />
        <div className="skeleton-sm h-4 w-1/3" />
      </div>
      {/* Content skeletons */}
      <div className="flex w-full flex-col gap-4">
        <div className="skeleton-md h-4 w-full" />
        <div className="skeleton-md h-4 w-5/6" />
        <div className="skeleton-md h-4 w-4/6" />
        <div className="skeleton-md h-4 w-full" />
        <div className="skeleton-md h-4 w-3/4" />
      </div>
    </div>
  );
}
