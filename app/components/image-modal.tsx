import { cn } from '@/lib/utils'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ImageModalProps {
  isOpen: boolean
  src: string
  alt: string
  onClose: () => void
  imgRef?: HTMLImageElement | null
  naturalWidth?: number
  naturalHeight?: number
  mainScrollContainerRef: React.RefObject<HTMLDivElement | null>
}

const DURATION = 400

type Phase = 'closed' | 'entering' | 'open' | 'leaving'

export default function ImageModal({
  isOpen,
  src,
  alt,
  onClose: _onClose,
  naturalWidth = 0,
  naturalHeight = 0,
  mainScrollContainerRef,
  imgRef,
}: ImageModalProps) {
  const [phase, setPhase] = useState<Phase>('closed')
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })

  const scaleRef = useRef(1)
  const positionRef = useRef({ x: 0, y: 0 })
  const entryTransformRef = useRef({ scale: 1, x: 0, y: 0 })
  const onCloseRef = useRef(_onClose)
  onCloseRef.current = _onClose
  const overlayRef = useRef<HTMLDivElement>(null)

  const getThumbnailTransform = useCallback(() => {
    const img = imgRef
    if (!img) return { scale: 0.1, x: 0, y: 0 }
    const rect = img.getBoundingClientRect()
    if (!rect || !naturalWidth || !naturalHeight) {
      return { scale: 0.1, x: 0, y: 0 }
    }
    const currentScale = Math.min(
      rect.width / naturalWidth,
      rect.height / naturalHeight,
    )
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    return {
      scale: currentScale,
      x: rect.left + rect.width / 2 - centerX,
      y: rect.top + rect.height / 2 - centerY,
    }
  }, [imgRef, naturalWidth, naturalHeight])

  useEffect(() => {
    if (!isOpen) return
    const thumb = getThumbnailTransform()
    entryTransformRef.current = thumb

    setPhase('entering')
    scaleRef.current = thumb.scale
    positionRef.current = { x: thumb.x, y: thumb.y }
    setScale(thumb.scale)
    setPosition({ x: thumb.x, y: thumb.y })

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setScale(1)
        setPosition({ x: 0, y: 0 })
        scaleRef.current = 1
        positionRef.current = { x: 0, y: 0 }
        setPhase('open')
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [isOpen, getThumbnailTransform])

  const close = useCallback(() => {
    const thumb = entryTransformRef.current
    setPhase('leaving')
    setScale(thumb.scale)
    setPosition({ x: thumb.x, y: thumb.y })
    setTimeout(() => {
      setPhase('closed')
      onCloseRef.current()
    }, DURATION)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [isOpen, close])

  useEffect(() => {
    const el = overlayRef.current
    if (!el || !isOpen) return
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const scrollContainer = mainScrollContainerRef.current
      if (scrollContainer) scrollContainer.scrollTop += e.deltaY
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [isOpen, mainScrollContainerRef])

  const syncScale = useCallback((next: number) => {
    scaleRef.current = next
    setScale(next)
  }, [])

  const syncPosition = useCallback((next: { x: number; y: number }) => {
    positionRef.current = next
    setPosition(next)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setStartPosition({
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    })
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      syncPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y,
      })
    },
    [isDragging, startPosition, syncPosition],
  )

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    setIsDragging(true)
    setStartPosition({
      x: e.touches[0].clientX - positionRef.current.x,
      y: e.touches[0].clientY - positionRef.current.y,
    })
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return
      syncPosition({
        x: e.touches[0].clientX - startPosition.x,
        y: e.touches[0].clientY - startPosition.y,
      })
    },
    [isDragging, startPosition, syncPosition],
  )

  const handleTouchEnd = useCallback(() => setIsDragging(false), [])

  const handleZoomIn = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const viewportScale = Math.min(
        (window.innerWidth * 0.9) / Math.max(naturalWidth, 1),
        (window.innerHeight * 0.9) / Math.max(naturalHeight, 1),
      )
      syncScale(Math.min(Math.max(5, viewportScale), scaleRef.current + 0.2))
    },
    [naturalWidth, naturalHeight, syncScale],
  )

  const handleZoomOut = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const viewportScale = Math.min(
        (window.innerWidth * 0.9) / Math.max(naturalWidth, 1),
        (window.innerHeight * 0.9) / Math.max(naturalHeight, 1),
      )
      syncScale(Math.max(Math.min(0.5, viewportScale), scaleRef.current - 0.2))
    },
    [naturalWidth, naturalHeight, syncScale],
  )

  const handleReset = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      syncScale(1)
      syncPosition({ x: 0, y: 0 })
    },
    [syncScale, syncPosition],
  )

  if (phase === 'closed') return null

  const isTransitioning = phase === 'entering' || phase === 'leaving'

  return createPortal(
    <div
      ref={overlayRef}
      className={cn(
        'fixed inset-0 z-[1000] transition-all duration-[400ms]',
        {
          'visible bg-background/95 opacity-100 backdrop-blur-lg': phase === 'open',
          'invisible bg-background/0 opacity-0 backdrop-blur-none': isTransitioning,
        },
      )}
      onClick={close}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="relative flex h-full w-full items-center justify-center cursor-zoom-out">
        {/* eslint-disable-next-line @next/next/no-img-element -- manual transform */}
        <img
          src={src}
          alt={alt}
          className="max-h-[95vh] max-w-[95vw] select-none object-contain"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            willChange: 'transform',
            transition: isTransitioning
              ? `transform ${DURATION}ms cubic-bezier(0.25, 0.8, 0.25, 1)`
              : undefined,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onClick={e => e.stopPropagation()}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDragStart={e => e.preventDefault()}
        />
        {phase === 'open' && (
          <>
            <button
              className="absolute top-5 right-5 z-[1001] flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-muted/80 text-muted-foreground text-xl leading-none backdrop-blur-sm hover:bg-muted transition-all"
              onClick={close}
            >
              ×
            </button>
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-muted/80 p-2 backdrop-blur-sm">
              <button
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                onClick={handleZoomOut}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
              </button>
              <button
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                onClick={handleReset}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M12 3v18" /></svg>
              </button>
              <button
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                onClick={handleZoomIn}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
