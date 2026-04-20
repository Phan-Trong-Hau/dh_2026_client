'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

const AUTO_PLAY_DURATION = 5000

const ICON_LEFT = 'https://dh-2026-media.s3.ap-southeast-1.amazonaws.com/mui_ten_trai_bbc0f5b6ff.webp'
const ICON_RIGHT = 'https://dh-2026-media.s3.ap-southeast-1.amazonaws.com/mui_ten_phai_4789ce724c.webp'
const ICON_DOT_ACTIVE = 'https://dh-2026-media.s3.ap-southeast-1.amazonaws.com/cham_thu_tu_trang_lon_5cdcdf4b4d.webp'
const ICON_DOT_INACTIVE = 'https://dh-2026-media.s3.ap-southeast-1.amazonaws.com/cham_thu_tu_trang_nho_b25a1eafcc.webp'
const ICON_BACK = 'https://dh-2026-media.s3.ap-southeast-1.amazonaws.com/nut_chuyen_ve_a5d4707dd9.webp'

interface StrapiImage {
  url: string
  width?: number
  height?: number
  alternativeText?: string
}

interface Props {
  anhNenSlide: StrapiImage | null
  danhSachSlide: StrapiImage[]
  onBack?: () => void
}

export default function SlideSection({ anhNenSlide, danhSachSlide, onBack }: Props) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  const total = danhSachSlide.length

  const goTo = useCallback(
    (index: number, dir: 'left' | 'right') => {
      setDirection(dir)
      setCurrent(index)
    },
    []
  )

  const go = (dir: 'prev' | 'next') => {
    const next =
      dir === 'next' ? (current + 1) % total : (current - 1 + total) % total
    goTo(next, dir === 'next' ? 'right' : 'left')
  }

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
      {anhNenSlide?.url && (
        <Image
          src={anhNenSlide.url}
          alt="Nền slide"
          fill
          className="object-center"
          priority
        />
      )}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-14 left-1/2 -translate-x-1/2 z-20 transition-transform duration-200 hover:scale-110"
          aria-label="Quay về"
        >
          <Image src={ICON_BACK} alt="Quay về" width={48} height={48} />
        </button>
      )}

      {/* Nội dung slide */}
      <div
        key={current}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          animation: `${direction === 'right' ? 'slide-in-right' : 'slide-in-left'} 0.4s ease-out forwards`,
        }}
      >
        <div className="relative w-[75%] h-[75%] flex items-center justify-center">
        {/* Nút quay về */}
      
          <img
            src={currentSlide.url}
            alt={currentSlide.alternativeText ?? `Slide ${current + 1}`}
            className="object-center rounded-4xl!"
          />
        </div>
      </div>

      {/* Nút trái */}
      <button
        onClick={() => go('prev')}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-transform duration-200 hover:scale-110"
        aria-label="Slide trước"
      >
        <Image src={ICON_LEFT} alt="Trước" width={48} height={48} />
      </button>

      {/* Nút phải */}
      <button
        onClick={() => go('next')}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-transform duration-200 hover:scale-110"
        aria-label="Slide tiếp theo"
      >
        <Image src={ICON_RIGHT} alt="Tiếp theo" width={48} height={48} />
      </button>

      {/* Pagination dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        {danhSachSlide.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 'right' : 'left')}
            aria-label={`Slide ${i + 1}`}
            className="transition-transform duration-200 hover:scale-110"
          >
            <Image
              src={i === current ? ICON_DOT_ACTIVE : ICON_DOT_INACTIVE}
              alt={i === current ? 'Đang xem' : `Slide ${i + 1}`}
              width={i === current ? 20 : 14}
              height={i === current ? 20 : 14}
            />
          </button>
        ))}
      </div>

     
    </section>
  )
}
