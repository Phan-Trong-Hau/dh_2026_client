'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import TechnicalLoader from '../TechnicalLoader'
import { useImagePreloader } from '@/lib/hooks/useImagePreloader'
import BackButton from '../BackButton'

const SLIDE_MS = 650
const FADE_MS = 400
const SLIDE_W = '78vw'
const SLIDE_H = '72vh'
const DETAIL_W = '78vw'
const DETAIL_H = '72vh'
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)' // Quartic Out

interface StrapiImage {
  url: string
  alternativeText?: string | null
}

interface HoatDongItem {
  id: number
  anh_hoat_dong: StrapiImage
  anh_chi_tiet: StrapiImage
  trang_chi_tiet?: StrapiImage
  mo_ta?: string | null
}

interface PageData {
  anh_nen: StrapiImage
  danh_sach_hoat_dong: HoatDongItem[]
}

interface Props {
  data: { data: PageData } | null
}

// Mũi tên dọc — base dài, tip nhọn
function TriangleLeft() {
  return (
    <svg width="22" height="60" viewBox="0 0 22 60" fill="none">
      <polygon points="18,2 4,30 18,58" fill="white" />
    </svg>
  )
}

function TriangleRight() {
  return (
    <svg width="22" height="60" viewBox="0 0 22 60" fill="none">
      <polygon points="4,2 18,30 4,58" fill="white" />
    </svg>
  )
}

type SlideAnim = {
  toIdx: number
  dir: 'left' | 'right'
  phase: 'set' | 'go'
}

function SlideFrame({
  translateX,
  opacity = 1,
  scale = 1,
  withTransition,
  children,
}: {
  translateX: string
  opacity?: number
  scale?: number
  withTransition: boolean
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `translate3d(${translateX}, 0, 0) scale(${scale})`,
        opacity,
        transition: withTransition
          ? `transform ${SLIDE_MS}ms ${EASING}, opacity ${SLIDE_MS}ms ease-out`
          : 'none',
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {children}
    </div>
  )
}

export default function OperationalResultClient({ data }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [anim, setAnim] = useState<SlideAnim | null>(null)
  const slidingRef = useRef(false)

  // Detail: selected = index đang xem, detailOpacity điều khiển fade
  const [selected, setSelected] = useState<number | null>(null)
  const [detailOpacity, setDetailOpacity] = useState(0)
  const [isMegaOpen, setIsMegaOpen] = useState(false)
  const [isInternalLoading, setIsInternalLoading] = useState(false)

  const items = data?.data?.danh_sach_hoat_dong ?? []
  const anhNen = data?.data?.anh_nen

  const preloadUrls = useMemo(() => {
    return [
      anhNen?.url,
      ...items.map(i => i.anh_hoat_dong?.url),
      ...items.map(i => i.anh_chi_tiet?.url),
      ...items.map(i => i.trang_chi_tiet?.url),
    ].filter(Boolean) as string[]
  }, [anhNen?.url, items])

  const { isLoaded: isAssetsLoaded } = useImagePreloader(preloadUrls)

  const navigate = useCallback((toIdx: number, dir: 'left' | 'right') => {
    if (slidingRef.current || toIdx === currentIdx) return
    slidingRef.current = true
    setAnim({ toIdx, dir, phase: 'set' })
    
    // Sử dụng setTimeout 0 thay vì rAF để đảm bảo trình duyệt nhận diện trạng thái 'set'
    setTimeout(() => {
      setAnim({ toIdx, dir, phase: 'go' })
    }, 20)

    setTimeout(() => {
      setCurrentIdx(toIdx)
      setAnim(null)
      slidingRef.current = false
    }, SLIDE_MS + 20)
  }, [currentIdx])

  const goPrev = useCallback(() => {
    navigate((currentIdx - 1 + items.length) % items.length, 'right')
  }, [currentIdx, items.length, navigate])

  const goNext = useCallback(() => {
    navigate((currentIdx + 1) % items.length, 'left')
  }, [currentIdx, items.length, navigate])

  const goTo = useCallback((idx: number) => {
    if (idx === currentIdx) return
    navigate(idx, idx > currentIdx ? 'left' : 'right')
  }, [currentIdx, navigate])

  useEffect(() => {
    if (selected !== null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, goPrev, goNext])

  // Mở detail: mount với opacity 0 rồi fade in — list KHÔNG unmount → không flash
  const openDetail = useCallback((idx: number) => {
    if (anim) return
    setSelected(idx)
    setDetailOpacity(0)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setDetailOpacity(1))
    })
  }, [anim])

  // Đóng detail: fade out rồi mới unmount
  const closeDetail = useCallback(() => {
    setDetailOpacity(0)
    setIsMegaOpen(false)
    setTimeout(() => setSelected(null), 600)
  }, [])

  const openMega = useCallback(() => {
    setIsInternalLoading(true)
    setIsMegaOpen(true)
    
    // Fallback: Nếu ảnh đã load xong hoặc lỗi, tự tắt sau 2s
    setTimeout(() => setIsInternalLoading(false), 2000)
  }, [])

  const closeMega = useCallback(() => {
    setIsMegaOpen(false)
  }, [])

  const currentItem = items[currentIdx]
  const detailItem = selected !== null ? items[selected] : null

  const isGo = anim?.phase === 'go'
  const outgoingX = isGo ? (anim.dir === 'left' ? '-100%' : '100%') : '0%'
  const outgoingOpacity = isGo ? 0 : 1
  const outgoingScale = isGo ? 0.95 : 1

  const incomingStartX = anim?.dir === 'left' ? '100%' : '-100%'
  const incomingX = isGo ? '0%' : incomingStartX
  const incomingOpacity = isGo ? 1 : 0
  const incomingScale = isGo ? 1 : 0.95

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* ── INITIAL LOAD FADE ── */}
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-1000 ease-out"
        style={{ opacity: isAssetsLoaded ? 1 : 0 }}
      >

      {/* Background */}
      {anhNen?.url && (
        <div 
          className="absolute inset-0"
          style={{ 
            opacity: isMegaOpen ? 0 : 1,
            transition: `opacity ${FADE_MS}ms ease`
          }}
        >
          <img 
            src={anhNen.url} 
            alt="" 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} 
          />
        </div>
      )}

      {/* ── LIST VIEW — luôn trong DOM, không bao giờ unmount ── */}
      <div
        className="relative z-10 w-full flex flex-col items-center mt-[15vh]"
        style={{
          pointerEvents: selected !== null ? 'none' : 'auto',
        }}
      >
        <div className="flex items-center gap-12 w-full px-8 justify-center">

          <button
            onClick={goPrev}
            className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Trước"
          >
            <TriangleLeft />
          </button>

          <div
            className={`relative overflow-hidden flex-shrink-0 transition-all duration-600`}
            style={{ 
              width: SLIDE_W, 
              height: SLIDE_H,
              opacity: 1 - detailOpacity,
              transform: selected !== null ? 'scale(0.98)' : 'scale(1)',
            }}
          >
            <SlideFrame 
              translateX={outgoingX} 
              opacity={outgoingOpacity} 
              scale={outgoingScale}
              withTransition={isGo}
            >
              {currentItem?.anh_hoat_dong?.url && (
                <img
                  src={currentItem.anh_hoat_dong.url}
                  alt={currentItem.anh_hoat_dong.alternativeText ?? ''}
                  onClick={() => openDetail(currentIdx)}
                  decoding="async"
                  loading="eager"
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    cursor: anim ? 'default' : 'pointer',
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))'
                  }}
                />
              )}
            </SlideFrame>

            {anim && items[anim.toIdx]?.anh_hoat_dong?.url && (
              <SlideFrame 
                translateX={incomingX} 
                opacity={incomingOpacity} 
                scale={incomingScale}
                withTransition={isGo}
              >
                <img
                  src={items[anim.toIdx].anh_hoat_dong.url}
                  alt={items[anim.toIdx].anh_hoat_dong.alternativeText ?? ''}
                  decoding="async"
                  loading="eager"
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))'
                  }}
                />
              </SlideFrame>
            )}
          </div>

          <button
            onClick={goNext}
            className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Tiếp"
          >
            <TriangleRight />
          </button>

        </div>

        {items.length > 1 && (
          <div className="flex items-center gap-3 mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === currentIdx ? 12 : 8,
                  height: i === currentIdx ? 12 : 8,
                  borderRadius: '50%',
                  background: 'white',
                  opacity: i === currentIdx ? 1 : 0.35,
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                  transition: 'opacity 0.3s ease, width 0.3s ease, height 0.3s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── DETAIL OVERLAY — fade in/out trên top, list không bị unmount ── */}
      {detailItem && (
        <div
          className="absolute inset-0 top-6 z-20 flex items-center justify-center cursor-pointer transition-opacity duration-600"
          style={{
            opacity: isMegaOpen ? 0 : detailOpacity,
            visibility: (detailOpacity === 0 && selected === null) || isMegaOpen ? 'hidden' : 'visible',
            pointerEvents: isMegaOpen ? 'none' : 'auto'
          }}
          onClick={closeDetail}
        >
          <div 
            style={{ 
              width: DETAIL_W, 
              height: DETAIL_H, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              transform: `scale(${0.96 + detailOpacity * 0.04})`,
              transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
            onClick={(e) => {
              if (detailItem.trang_chi_tiet) {
                e.stopPropagation()
                openMega()
              }
            }}
          >
            {detailItem.anh_chi_tiet?.url && (
              <img
                src={detailItem.anh_chi_tiet.url}
                alt={detailItem.anh_chi_tiet.alternativeText ?? ''}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.1))' }}
              />
            )}
          </div>
        </div>
      )}

      {/* ── MEGA VIEW — Always in DOM for pre-loading trick ── */}
      <div 
        className="fixed inset-0 z-[70] bg-black overflow-y-auto custom-scrollbar transition-all duration-500 ease-out"
        style={{
          opacity: isMegaOpen ? 1 : 0,
          visibility: isMegaOpen ? 'visible' : 'hidden',
          pointerEvents: isMegaOpen ? 'auto' : 'none',
        }}
      >
        <BackButton onClick={closeMega} />
        
        <div className="w-full flex justify-center">
          {items.map((item, idx) => (
            <div 
              key={idx} 
              className="w-full"
              style={{ display: selected === idx ? 'block' : 'none' }}
            >
              {item.trang_chi_tiet?.url && (
                <img
                  src={item.trang_chi_tiet.url}
                  alt="Trang chi tiết"
                  className="w-full h-auto block"
                  onLoad={(e) => {
                    if (selected === idx) setIsInternalLoading(false)
                  }}
                  loading="eager"
                  decoding="sync"
                />
              )}
            </div>
          ))}
        </div>

      </div>

      </div>

      <TechnicalLoader isVisible={!isAssetsLoaded || isInternalLoading} />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 197, 24, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 197, 24, 0.8);
        }
      `}</style>

    </section>
  )
}
