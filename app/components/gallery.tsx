'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import ImageModal from './image-modal'

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

const images = [
  { src: `${base}/pic1.webp`, rotation: 'rotate-2' },
  { src: `${base}/pic2.webp`, rotation: '-rotate-2' },
  { src: `${base}/pic3.webp`, rotation: 'rotate-2' },
  { src: `${base}/pic4.webp`, rotation: 'rotate-2' },
  { src: `${base}/pic5.webp`, rotation: '-rotate-2' },
] as const

interface ModalState {
  open: boolean
  src: string
  naturalWidth: number
  naturalHeight: number
  imgEl: HTMLImageElement | null
}

export default function Gallery() {
  const [modal, setModal] = useState<ModalState>({
    open: false,
    src: '',
    naturalWidth: 0,
    naturalHeight: 0,
    imgEl: null,
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, src: string) => {
      const img = e.currentTarget.querySelector('img')
      if (!img) return

      const rect = img.getBoundingClientRect()
      img.style.opacity = '0'

      setModal({
        open: true,
        src,
        naturalWidth: img.naturalWidth || rect.width,
        naturalHeight: img.naturalHeight || rect.height,
        imgEl: img,
      })
    },
    [],
  )

  const handleCloseModal = useCallback(() => {
    setModal(prev => {
      if (prev.imgEl) {
        prev.imgEl.style.opacity = '1'
      }
      return { ...prev, open: false }
    })
  }, [])

  return (
    <>
      <div ref={scrollRef} className="overflow-x-auto lg:overflow-visible">
        <div className="-my-4 flex justify-center gap-3 py-4 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
          {images.map((img, i) => (
            <div
              key={i}
              className={`group relative aspect-[9/10] w-28 flex-none overflow-hidden rounded-xl bg-secondary sm:w-36 md:w-44 lg:w-56 xl:w-72 sm:rounded-2xl cursor-zoom-in
                transition-all motion-safe:duration-500 motion-safe:ease-out
                hover:shadow-2xl hover:-translate-y-1
                ${img.rotation}`}
              onClick={e => handleImageClick(e, img.src)}
            >
              <Image
                src={img.src}
                alt=""
                fill
                priority={i === 0}
                className="object-cover transition-all motion-safe:duration-500 motion-safe:ease-out brightness-75 group-hover:brightness-100 group-hover:scale-105"
                sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, (max-width: 1024px) 176px, (max-width: 1280px) 224px, 288px"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
      <ImageModal
        isOpen={modal.open}
        src={modal.src}
        alt=""
        naturalWidth={modal.naturalWidth}
        naturalHeight={modal.naturalHeight}
        imgRef={modal.imgEl}
        onClose={handleCloseModal}
        mainScrollContainerRef={scrollRef}
      />
    </>
  )
}
