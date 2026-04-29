'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

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

interface SlideItem {
  id: number
  link: string
  anh: StrapiImage
}

interface Props {
  anhNenSlide: StrapiImage | null
  danhSachTrang: SlideItem[]
  onBack?: () => void
}

export default function SlideSection({ anhNenSlide, danhSachTrang, onBack }: Props) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  const total = danhSachTrang.length

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

  const currentItem = danhSachTrang[current]
  const currentSlide = currentItem.anh

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {anhNenSlide?.url && (
        <img
          src={anhNenSlide.url}
          alt="Nền slide"
          className="transition-opacity duration-1000"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
      )}

      {/* Hidden Preloader: Buộc trình duyệt tải trước tất cả các ảnh slide */}
      <div className="fixed inset-0 pointer-events-none opacity-0 -z-10 overflow-hidden" aria-hidden="true">
        {danhSachTrang.map((item, idx) => (
          <img key={`preload-${idx}`} src={item.anh.url} alt="" loading="eager" />
        ))}
        {/* Preload các icon điều hướng */}
        <img src={ICON_LEFT} alt="" />
        <img src={ICON_RIGHT} alt="" />
        <img src={ICON_DOT_ACTIVE} alt="" />
        <img src={ICON_DOT_INACTIVE} alt="" />
      </div>
      {/* Nội dung slide */}
      <div
        key={current}
        className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none"
        style={{
          animation: `${direction === 'right' ? 'slide-in-right' : 'slide-in-left'} 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`,
        }}
      >
        <div className="relative w-full h-full max-w-[95vw] max-h-screen flex items-center justify-center pointer-events-auto">
          <Link href={currentItem.link} className="block relative h-full w-full flex items-center justify-center group">
            <img
              src={currentSlide.url}
              alt={currentSlide.alternativeText ?? `Slide ${current + 1}`}
              className="object-contain drop-shadow-2xl rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]"
              style={{ maxHeight: '100%', maxWidth: '100%' }}
            />
          </Link>
        </div>
      </div>

      {/* Nút trái */}
      <button
        onClick={() => go('prev')}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 hover:scale-110 active:scale-90 opacity-70 hover:opacity-100"
        aria-label="Slide trước"
      >
        <img src={ICON_LEFT} alt="Trước" width={48} />
      </button>

      {/* Nút phải */}
      <button
        onClick={() => go('next')}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 hover:scale-110 active:scale-90 opacity-70 hover:opacity-100"
        aria-label="Slide tiếp theo"
      >
        <img src={ICON_RIGHT} alt="Tiếp theo" width={48} />
      </button>

      {/* Pagination dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        {danhSachTrang.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 'right' : 'left')}
            aria-label={`Slide ${i + 1}`}
            className="transition-all duration-300 hover:scale-125"
          >
            <img
              src={i === current ? ICON_DOT_ACTIVE : ICON_DOT_INACTIVE}
              alt={i === current ? 'Đang xem' : `Slide ${i + 1}`}
              style={{ 
                width: i === current ? 16 : 14, 
                height: i === current ? 16 : 14,
                transition: 'all 0.4s ease'
              }}
            />
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          0% { transform: translate3d(80px, 0, 0); opacity: 0; }
          100% { transform: translate3d(0, 0, 0); opacity: 1; }
        }
        @keyframes slide-in-left {
          0% { transform: translate3d(-80px, 0, 0); opacity: 0; }
          100% { transform: translate3d(0, 0, 0); opacity: 1; }
        }
      `}</style>

     
    </section>
  )
}
