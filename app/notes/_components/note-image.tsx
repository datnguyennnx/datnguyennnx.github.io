"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import ImageFullscreen from "@/components/ui/image-fullscreen";

interface NoteImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export default function NoteImage({ src, alt, width, height }: NoteImageProps) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const aspectRatio = width && height ? `${width} / ${height}` : undefined;

  return (
    <>
      <span className="my-6 first:mt-0 last:mb-0 block overflow-hidden rounded-lg bg-muted/10">
        <button
          type="button"
          onClick={toggle}
          className="not-prose relative block w-full cursor-pointer rounded-md focus-visible:outline-none focus-ring hover:brightness-110 active:scale-[0.97]"
        >
          <div
            style={aspectRatio ? { aspectRatio } : undefined}
            className="overflow-hidden rounded-lg"
          >
            <Image
              src={src}
              alt={alt ?? ""}
              width={width || 1200}
              height={height || 800}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 720px"
              className="size-full object-cover motion-safe:transition-opacity motion-safe:duration-300"
              loading="eager"
            />
          </div>
        </button>
      </span>

      <ImageFullscreen open={open} src={src} alt={alt} onClose={toggle} />
    </>
  );
}
