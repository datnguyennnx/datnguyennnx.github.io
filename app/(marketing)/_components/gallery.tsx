"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import ImageFullscreen from "@/components/ui/image-fullscreen";

const images = [
  { src: "/pic1.webp" },
  { src: "/pic2.webp" },
  { src: "/pic3.webp" },
  { src: "/pic4.webp" },
  { src: "/pic5.webp" },
  { src: "/pic6.webp" },
] as const;

interface ModalState {
  open: boolean;
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  imgEl: HTMLImageElement | null;
}

export default function Gallery() {
  const [modal, setModal] = useState<ModalState>({
    open: false,
    src: "",
    naturalWidth: 0,
    naturalHeight: 0,
    imgEl: null,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>, src: string) => {
      const img = e.currentTarget.querySelector("img");
      if (!img) return;

      const rect = img.getBoundingClientRect();

      setModal({
        open: true,
        src,
        naturalWidth: img.naturalWidth || rect.width,
        naturalHeight: img.naturalHeight || rect.height,
        imgEl: img,
      });
    },
    [],
  );

  const handleCloseModal = useCallback(() => {
    setModal({ open: false, src: "", naturalWidth: 0, naturalHeight: 0, imgEl: null });
  }, []);

  return (
    <>
      <div ref={scrollRef} className="overflow-x-auto lg:overflow-visible">
        <div className="-my-4 flex justify-center gap-3 py-4 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
          {images.map((img, i) => (
            <div
              key={i}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => e.key === "Enter" && handleImageClick(e, img.src)}
              className={`group relative aspect-[9/10] w-28 flex-none overflow-hidden rounded-md bg-secondary sm:w-36 md:w-44 lg:w-56 xl:w-72 cursor-zoom-in transition-gallery focus-ring ${
                i % 2 === 0 ? "-rotate-4" : "rotate-4"
              }`}
              onClick={(e) => handleImageClick(e, img.src)}
              style={{ touchAction: "manipulation" }}
            >
              <Image
                src={img.src}
                alt=""
                fill
                priority={i === 0}
                className="object-cover transition-gallery brightness-75 group-hover:brightness-100 group-hover:scale-105"
                sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, (max-width: 1024px) 176px, (max-width: 1280px) 224px, 288px"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
      <ImageFullscreen
        open={modal.open}
        src={modal.src}
        alt=""
        naturalWidth={modal.naturalWidth}
        naturalHeight={modal.naturalHeight}
        thumbnailRef={modal.imgEl}
        onClose={handleCloseModal}
      />
    </>
  );
}
