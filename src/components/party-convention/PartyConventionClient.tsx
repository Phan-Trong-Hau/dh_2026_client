'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

const TRANSITION_MS = 350

interface StrapiImage {
  url: string
  alternativeText?: string | null
}

interface DaiHoiItem {
  id: number
  mo_ta: string | null
  anh_dai_hoi: StrapiImage
  anh_chi_tiet: StrapiImage
}

interface PageData {
  anh_nen: StrapiImage
  anh_nen_chi_tiet: StrapiImage
  danh_sach_dai_hoi: DaiHoiItem[]
}

interface Props {
  data: { data: PageData } | null
}

function ScrollBar({
  total,
  current,
  onSeek,
}: {
  total: number
  current: number
  onSeek: (i: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const idxFromX = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(ratio * (total - 1))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    onSeek(idxFromX(e.clientX))
    const onMove = (e: MouseEvent) => onSeek(idxFromX(e.clientX))
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      ref={trackRef}
      onMouseDown={handleMouseDown}
      className="relative rounded-full"
      style={{ width: '66vw', maxWidth: 420, height: 10, background: 'rgba(90,90,90,0.2)', cursor: 'pointer' }}
    >
      <div
        className="absolute top-0 h-full rounded-full"
        style={{
          width: `${100 / total}%`,
          transform: `translateX(${current * 100}%)`,
          background: 'linear-gradient(90deg, #f5c518, #ffe066)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '0 0 8px rgba(245,197,24,0.7)',
        }}
      />
    </div>
  )
}

export default function PartyConventionClient({ data }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [contentVisible, setContentVisible] = useState(true)

  const items = data?.data?.danh_sach_dai_hoi ?? []
  const anhNen = data?.data?.anh_nen
  const anhNenChiTiet = data?.data?.anh_nen_chi_tiet

  // Preload tất cả ảnh ngay khi mount
  useEffect(() => {
    const urls = [
      anhNen?.url,
      anhNenChiTiet?.url,
      ...items.map(i => i.anh_dai_hoi?.url),
      ...items.map(i => i.anh_chi_tiet?.url),
    ].filter(Boolean) as string[]

    urls.forEach(url => {
      const img = new window.Image()
      img.src = url
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const transitionTo = useCallback((nextView: 'list' | 'detail', idx?: number) => {
    setContentVisible(false)
    setTimeout(() => {
      setView(nextView)
      setSelected(nextView === 'detail' && idx !== undefined ? idx : null)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setContentVisible(true))
      })
    }, TRANSITION_MS)
  }, [])

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    slidesToScroll: 1,
  })

  const wheelCooldown = useRef(false)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (view !== 'list') return
    if (wheelCooldown.current || !emblaApi) return
    wheelCooldown.current = true
    if (e.deltaY > 0 || e.deltaX > 0) emblaApi.scrollNext()
    else emblaApi.scrollPrev()
    setTimeout(() => { wheelCooldown.current = false }, 450)
  }, [emblaApi, view])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentIdx(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (!emblaApi) return
    const applyScale = () => {
      const idx = emblaApi.selectedScrollSnap()
      emblaApi.slideNodes().forEach((node, i) => {
        const btn = node.querySelector('button') as HTMLElement | null
        if (btn) btn.style.transform = i === idx ? 'scale(1) translate3d(0,0,0)' : 'scale(0.9) translate3d(0,0,0)'
      })
    }
    emblaApi.on('select', applyScale)
    applyScale()
    return () => { emblaApi.off('select', applyScale) }
  }, [emblaApi])

  const contentStyle: React.CSSProperties = {
    opacity: contentVisible ? 1 : 0,
    transform: contentVisible ? 'scale(1)' : 'scale(0.97)',
    transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
    willChange: 'opacity, transform',
  }

  const detailItem = selected !== null ? items[selected] : null

  return (
    <section className="relative h-screen w-full overflow-hidden" onWheel={handleWheel}>

      {/* ── Background layer 1: anh_nen_chi_tiet — luôn hiện, không bao giờ unmount ── */}
      {anhNenChiTiet?.url && (
        <img
          src={anhNenChiTiet.url}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
      )}

      {/* ── Background layer 2: anh_nen (list bg) — fade in/out theo view ── */}
      {anhNen?.url && (
        <div
          className="absolute inset-0"
          style={{
            opacity: view === 'list' ? 1 : 0,
            transition: `opacity ${TRANSITION_MS}ms ease`,
          }}
        >
          <img
            src={anhNen.url}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
      )}

      {/* ── Content layer ── */}
      <div className="relative z-10 h-full flex flex-col" style={contentStyle}>

        {/* DETAIL VIEW */}
        {view === 'detail' && detailItem && (
          <div
            className="h-full flex items-center justify-center gap-8 cursor-pointer"
            onClick={() => transitionTo('list')}
          >
            <div className="w-full relative max-w-[80vw] flex-shrink-0">
              {detailItem.anh_chi_tiet?.url && (
                <img
                  src={detailItem.anh_chi_tiet.url}
                  alt=""
                  className="object-cover object-center"
                />
              )}
              <div className="text-white absolute top-1/6 left-[52%]">
                <div className="w-[90%] h-[500px] overflow-y-auto">
                  {detailItem.mo_ta ?? ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {view === 'list' && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="overflow-hidden mx-auto w-full max-w-[90vw]" ref={emblaRef}>
              <div className="flex">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex-none flex items-center justify-center"
                    style={{ width: 'calc(90vw / 3)', padding: '0 0.75vw' }}
                  >
                    <button
                      onClick={() => {
                        if (i === currentIdx) transitionTo('detail', i)
                        else emblaApi?.scrollTo(i)
                      }}
                      className="relative w-full rounded-xl cursor-pointer"
                      style={{
                        height: '55vh',
                        transform: i === currentIdx ? 'scale(1) translate3d(0,0,0)' : 'scale(0.9) translate3d(0,0,0)',
                        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                        transformOrigin: 'center center',
                        willChange: 'transform',
                      }}
                    >
                      {item.anh_dai_hoi?.url && (
                        <img 
                          src={item.anh_dai_hoi.url} 
                          alt="" 
                          decoding="async"
                          loading="eager"
                        />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <ScrollBar total={items.length} current={currentIdx} onSeek={(i) => emblaApi?.scrollTo(i)} />
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
