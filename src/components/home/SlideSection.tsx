'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

const AUTO_PLAY_DURATION = 5000 // ms mỗi slide

interface StrapiImage {
  url: string
  width?: number
  height?: number
  alternativeText?: string
}

interface Props {
  anhNenSlide: StrapiImage | null
  danhSachSlide: StrapiImage[]
}

export default function SlideSection({ anhNenSlide, danhSachSlide }: Props) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [progressKey, setProgressKey] = useState(0)

  const total = danhSachSlide.length

  const goTo = useCallback(
    (index: number, dir: 'left' | 'right') => {
      setDirection(dir)
      setCurrent(index)
      setProgressKey((k) => k + 1)
    },
    []
  )

  const go = (dir: 'prev' | 'next') => {
    const next =
      dir === 'next' ? (current + 1) % total : (current - 1 + total) % total
    goTo(next, dir === 'next' ? 'right' : 'left')
  }

  // Auto-play
  useEffect(() => {
    if (total <= 1) return
    const timer = setTimeout(() => {
      goTo((current + 1) % total, 'right')
    }, AUTO_PLAY_DURATION)
    return () => clearTimeout(timer)
  }, [current, total, goTo])

  if (total === 0) return null

  const currentSlide = danhSachSlide[current]

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Ảnh nền slide - fill toàn màn hình */}
      {anhNenSlide?.url && (
        <Image
          src={anhNenSlide.url}
          alt="Nền slide"
          fill
          className="object-cover object-center"
          priority
        />
      )}

      {/* Ảnh nội dung slide chồng lên */}
      <div
        key={current}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          animation: `${direction === 'right' ? 'slide-in-right' : 'slide-in-left'} 0.4s ease-out forwards`,
        }}
      >
        <div className="relative w-[85%] h-[75%]">
          <Image
            src={currentSlide.url}
            alt={currentSlide.alternativeText ?? `Slide ${current + 1}`}
            fill
            className="object-contain"
            sizes="85vw"
            priority={current === 0}
          />
        </div>
      </div>

      {/* Nút trái */}
      <button
        onClick={() => go('prev')}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-110"
        style={{
          background: 'rgba(245,197,24,0.15)',
          border: '1px solid rgba(245,197,24,0.5)',
          color: '#f5c518',
        }}
        aria-label="Slide trước"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Nút phải */}
      <button
        onClick={() => go('next')}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-110"
        style={{
          background: 'rgba(245,197,24,0.15)',
          border: '1px solid rgba(245,197,24,0.5)',
          color: '#f5c518',
        }}
        aria-label="Slide tiếp theo"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Progress bar pagination */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {danhSachSlide.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 'right' : 'left')}
            aria-label={`Slide ${i + 1}`}
            className="relative overflow-hidden rounded-full"
            style={{
              width: '32px',
              height: '3px',
              background: 'rgba(245,197,24,0.3)',
            }}
          >
            {i === current && (
              <span
                key={progressKey}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: '#f5c518',
                  animation: `slide-progress ${AUTO_PLAY_DURATION}ms linear forwards`,
                }}
              />
            )}
            {i < current && (
              <span
                className="absolute inset-0 rounded-full"
                style={{ background: '#f5c518' }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  )
}
