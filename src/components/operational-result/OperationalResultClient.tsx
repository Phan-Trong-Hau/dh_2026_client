'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

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

  const items = data?.data?.danh_sach_hoat_dong ?? []
  const anhNen = data?.data?.anh_nen

  useEffect(() => {
    const urls = [
      anhNen?.url,
      ...items.map(i => i.anh_hoat_dong?.url),
      ...items.map(i => i.anh_chi_tiet?.url),
    ].filter(Boolean) as string[]
    urls.forEach(url => {
      const img = new window.Image()
      img.src = url
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
    setTimeout(() => setSelected(null), FADE_MS)
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

      {/* Background */}
      {anhNen?.url && (
        <Image src={anhNen.url} alt="" fill className="object-cover object-center" priority />
      )}

      {/* ── LIST VIEW — luôn trong DOM, không bao giờ unmount ── */}
      <div
        className="relative z-10 w-full flex flex-col items-center mt-28"
        style={{
          pointerEvents: selected !== null ? 'none' : 'auto',
        }}
      >
        <div className="flex items-center gap-6 w-full px-8 justify-center">

          <button
            onClick={goPrev}
            className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Trước"
          >
            <TriangleLeft />
          </button>

          <div
            className={`relative overflow-hidden flex-shrink-0 transition-opacity duration-300 ${selected !== null ? 'opacity-0' : ''}`}
            style={{ width: SLIDE_W, height: SLIDE_H }}
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
          className="absolute inset-0 -top-10 z-20 flex items-center justify-center cursor-pointer"
          style={{
            opacity: detailOpacity,
            transition: `opacity ${FADE_MS}ms ease`,
          }}
          onClick={closeDetail}
        >
          <div style={{ width: DETAIL_W, height: DETAIL_H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {detailItem.anh_chi_tiet?.url && (
              <img
                src={detailItem.anh_chi_tiet.url}
                alt={detailItem.anh_chi_tiet.alternativeText ?? ''}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            )}
          </div>
        </div>
      )}

    </section>
  )
}
