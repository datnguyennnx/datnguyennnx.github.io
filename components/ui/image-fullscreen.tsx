"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AlertCircle, Loader2, X, ZoomIn, ZoomOut, Maximize } from "lucide-react";

interface ImageFullscreenProps {
  open: boolean;
  src: string;
  alt?: string;
  onClose: () => void;
  /** Optional: ref to thumbnail img element for entry/exit animation */
  thumbnailRef?: HTMLImageElement | null;
  /** Natural dimensions for correct scaling (auto-detected if not provided) */
  naturalWidth?: number;
  naturalHeight?: number;
}

const DURATION = 300;
type Phase = "closed" | "loading" | "entering" | "open" | "leaving";

export default function ImageFullscreen({
  open,
  src,
  alt = "",
  onClose: _onClose,
  thumbnailRef,
  naturalWidth = 0,
  naturalHeight = 0,
}: ImageFullscreenProps) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [imageError, setImageError] = useState(false);
  const imageLoadedRef = useRef(false);
  const imageErrorRef = useRef(false);

  const scaleRef = useRef(1);
  const positionRef = useRef({ x: 0, y: 0 });
  const entryTransformRef = useRef({ scale: 1, x: 0, y: 0 });
  const onCloseRef = useRef(_onClose);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reactive subscribe to prefers-reduced-motion for inline transition override
  const prefersReducedMotion = useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  useEffect(() => {
    onCloseRef.current = _onClose;
  }, [_onClose]);

  const getThumbnailTransform = useCallback(() => {
    const thumb = thumbnailRef;
    if (!thumb) return { scale: 0.1, x: 0, y: 0 };
    const rect = thumb.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) {
      return { scale: 0.1, x: 0, y: 0 };
    }
    // Use natural dimensions if available, fallback to rendered dimensions
    const nw = naturalWidth || rect.width;
    const nh = naturalHeight || rect.height;
    const currentScale = Math.min(rect.width / nw, rect.height / nh);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    return {
      scale: currentScale,
      x: rect.left + rect.width / 2 - centerX,
      y: rect.top + rect.height / 2 - centerY,
    };
  }, [thumbnailRef, naturalWidth, naturalHeight]);

  useEffect(() => {
    if (!open) return;
    const thumb = getThumbnailTransform();
    entryTransformRef.current = thumb;
    imageLoadedRef.current = false;
    imageErrorRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase("loading");
    scaleRef.current = thumb.scale;
    positionRef.current = { x: thumb.x, y: thumb.y };
    setScale(thumb.scale);
    setPosition({ x: thumb.x, y: thumb.y });
  }, [open, getThumbnailTransform]);

  const startEntryAnimation = useCallback(() => {
    const thumb = entryTransformRef.current;
    setPhase("entering");
    scaleRef.current = thumb.scale;
    positionRef.current = { x: thumb.x, y: thumb.y };
    setScale(thumb.scale);
    setPosition({ x: thumb.x, y: thumb.y });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        scaleRef.current = 1;
        positionRef.current = { x: 0, y: 0 };
        setPhase("open");
      });
    });
  }, []);

  const close = useCallback(() => {
    const thumb = entryTransformRef.current;
    setPhase("leaving");
    setScale(thumb.scale);
    setPosition({ x: thumb.x, y: thumb.y });
    setTimeout(() => {
      setPhase("closed");
      onCloseRef.current();
    }, DURATION);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [open, close]);

  const syncScale = useCallback((next: number) => {
    scaleRef.current = next;
    setScale(next);
  }, []);

  const syncPosition = useCallback((next: { x: number; y: number }) => {
    positionRef.current = next;
    setPosition(next);
  }, []);

  // Wheel zoom when at scale 1, vertical scroll when zoomed in
  useEffect(() => {
    const el = overlayRef.current;
    if (!el || !open) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (scaleRef.current === 1) {
        // Zoom in/out based on scroll direction
        const MAX_SCALE = 5;
        const newScale = scaleRef.current - e.deltaY * 0.002;
        syncScale(Math.min(MAX_SCALE, Math.max(0.5, newScale)));
      } else {
        // Scroll vertically when zoomed in
        syncPosition({
          x: positionRef.current.x,
          y: positionRef.current.y - e.deltaY,
        });
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [open, syncScale, syncPosition]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPosition({
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      syncPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y,
      });
    },
    [isDragging, startPosition, syncPosition],
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setStartPosition({
      x: e.touches[0].clientX - positionRef.current.x,
      y: e.touches[0].clientY - positionRef.current.y,
    });
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      syncPosition({
        x: e.touches[0].clientX - startPosition.x,
        y: e.touches[0].clientY - startPosition.y,
      });
    },
    [isDragging, startPosition, syncPosition],
  );

  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  const handleZoomIn = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const viewportScale = Math.min(
        (window.innerWidth * 0.9) / Math.max(naturalWidth || 1, 1),
        (window.innerHeight * 0.9) / Math.max(naturalHeight || 1, 1),
      );
      const MAX_SCALE = 5;
      const MIN_SCALE = Math.min(0.5, viewportScale);
      const newScale = scaleRef.current + 0.2;
      syncScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale)));
    },
    [naturalWidth, naturalHeight, syncScale],
  );

  const handleZoomOut = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const viewportScale = Math.min(
        (window.innerWidth * 0.9) / Math.max(naturalWidth || 1, 1),
        (window.innerHeight * 0.9) / Math.max(naturalHeight || 1, 1),
      );
      const MAX_SCALE = 5;
      const MIN_SCALE = Math.min(0.5, viewportScale);
      const newScale = scaleRef.current - 0.2;
      syncScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale)));
    },
    [naturalWidth, naturalHeight, syncScale],
  );

  const handleReset = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      syncScale(1);
      syncPosition({ x: 0, y: 0 });
    },
    [syncScale, syncPosition],
  );

  if (phase === "closed") return null;

  const isVisible = phase === "loading" || phase === "open";
  const isTransitioning = phase === "entering" || phase === "leaving";

  const imageAspectRatio =
    naturalWidth && naturalHeight ? `${naturalWidth} / ${naturalHeight}` : undefined;

  return createPortal(
    <div
      ref={overlayRef}
      className={cn(
        "fixed inset-0 z-[1000] motion-safe:transition-[opacity,backdrop-filter,visibility] duration-slow",
        {
          "visible bg-background/95 opacity-100 backdrop-blur-lg": isVisible,
          "invisible bg-background/0 opacity-0 backdrop-blur-none": isTransitioning,
        },
      )}
      onClick={close}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex h-full w-full items-center justify-center">
        {phase === "loading" && !imageError && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 motion-safe:animate-spin text-muted-secondary" />
            <span className="text-sm text-muted-secondary">Loading image...</span>
          </div>
        )}
        {imageError && (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="size-8 text-destructive/80" />
            <span className="text-sm text-destructive/80">Failed to load image</span>
          </div>
        )}
        <div
          className={cn({
            hidden: phase === "loading" || imageError,
          })}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            willChange: "transform",
            transition: isTransitioning
              ? `transform ${prefersReducedMotion ? 0.01 : DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
              : undefined,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDragStart={(e) => e.preventDefault()}
        >
          <div
            style={imageAspectRatio ? { aspectRatio: imageAspectRatio } : undefined}
            className="flex items-center justify-center max-h-[95vh] max-w-[95vw]"
          >
            <Image
              src={src}
              alt={alt}
              width={naturalWidth || 1200}
              height={naturalHeight || 800}
              sizes="95vw"
              className="max-h-[95vh] max-w-[95vw] w-auto h-auto object-contain select-none"
              style={{ cursor: isDragging ? "grabbing" : "grab" }}
              draggable={false}
              onLoad={() => {
                if (!imageLoadedRef.current) {
                  imageLoadedRef.current = true;
                  startEntryAnimation();
                }
              }}
              onError={() => {
                setImageError(true);
              }}
            />
          </div>
        </div>
        {phase === "open" && !imageError && (
          <>
            {/* Close button */}
            <button
              className="absolute top-5 right-5 z-[1001] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-muted/80 text-muted-foreground backdrop-blur-sm hover:bg-muted transition-surface focus-ring"
              onClick={close}
              aria-label="Close fullscreen"
            >
              <X className="size-5" />
            </button>
            {/* Zoom controls */}
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-muted/80 p-2 backdrop-blur-sm">
              <button
                className="flex min-h-12 min-w-12 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-surface focus-ring active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleZoomOut}
                aria-label="Zoom out"
              >
                <ZoomOut className="size-[18px]" />
              </button>
              <button
                className="flex min-h-12 min-w-12 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-surface focus-ring active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleReset}
                aria-label="Reset zoom"
              >
                <Maximize className="size-[18px]" />
              </button>
              <button
                className="flex min-h-12 min-w-12 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-surface focus-ring active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleZoomIn}
                aria-label="Zoom in"
              >
                <ZoomIn className="size-[18px]" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
