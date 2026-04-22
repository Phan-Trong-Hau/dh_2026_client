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
  link: string | null
  anh_dai_hoi: StrapiImage
  anh_chi_tiet: StrapiImage
  thong_tin_chi_tiet?: StrapiImage
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
  const [view, setView] = useState<'list' | 'detail' | 'info'>('list')
  const [showIframe, setShowIframe] = useState(false)
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
      ...items.map(i => i.thong_tin_chi_tiet?.url),
    ].filter(Boolean) as string[]

    urls.forEach(url => {
      const img = new window.Image()
      img.src = url
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const transitionTo = useCallback((nextView: 'list' | 'detail' | 'info', idx?: number) => {
    setContentVisible(false)
    setShowIframe(false)
    setTimeout(() => {
      setView(nextView)
      if (nextView === 'list') {
        setSelected(null)
      } else if (idx !== undefined) {
        setSelected(idx)
      }
      
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

      {/* ── Background layer 1: anh_nen_chi_tiet — hiện ở detail ── */}
      {anhNenChiTiet?.url && (
        <div
          className="absolute inset-0"
          style={{
            opacity: view === 'detail' ? 1 : 0,
            transition: `opacity ${TRANSITION_MS}ms ease`,
          }}
        >
          <img
            src={anhNenChiTiet.url}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
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
          <div className="relative h-full w-full flex flex-col items-center justify-center">
             <button
              onClick={() => transitionTo('list')}
              className="fixed top-8 left-8 z-50 w-12 h-12 flex items-center justify-center text-white bg-black/40 hover:bg-red-600 rounded-full backdrop-blur-md border border-white/20 shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
              aria-label="Quay lại"
            >
              <span className="text-2xl transition-transform group-hover:-translate-x-1">←</span>
            </button>
            <div 
              className="relative max-w-[85vw] max-h-[85vh] cursor-pointer group"
              onClick={() => transitionTo('info')}
            >
              {detailItem.anh_chi_tiet?.url && (
                <img
                  src={detailItem.anh_chi_tiet.url}
                  alt=""
                  className="max-h-[85vh] w-auto object-contain drop-shadow-2xl rounded-lg transition-transform duration-500 group-hover:scale-[1.01]"
                />
              )}
              <div className="text-white absolute top-1/6 left-[52%] pr-8">
                <div className="w-full max-h-[50vh] overflow-y-auto custom-scrollbar pr-4 text-lg leading-relaxed">
                   <div dangerouslySetInnerHTML={{ __html: detailItem.mo_ta ?? '' }} />
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white px-4 py-2 rounded-full text-sm">
                Nhấn để xem thông tin chi tiết
              </div>
            </div>
          </div>
        )}

        {/* INFO VIEW */}
        {view === 'info' && detailItem && (
          <div className="relative h-full w-full bg-black">
            <button
              onClick={() => transitionTo('detail')}
              className="fixed top-8 left-8 z-50 w-12 h-12 flex items-center justify-center text-white bg-black/40 hover:bg-red-600 rounded-full backdrop-blur-md border border-white/20 shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
              aria-label="Quay lại"
            >
              <span className="text-2xl transition-transform group-hover:-translate-x-1">←</span>
            </button>
            
            <div className="h-full w-full overflow-y-auto custom-scrollbar">
              <div className="w-full flex justify-center">
                {detailItem.thong_tin_chi_tiet?.url && (
                  <img
                    src={detailItem.thong_tin_chi_tiet.url}
                    alt="Thông tin chi tiết"
                    className="w-full h-auto cursor-pointer block"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const y = e.clientY - rect.top
                      if (y > rect.height - 500) {
                        if (detailItem.link) {
                          setShowIframe(true)
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* IFRAME MODAL */}
            {showIframe && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-12 animate-in fade-in zoom-in duration-300">
                <div className="relative w-full h-full max-w-7xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                  <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b">
                    <span className="font-semibold text-gray-700">Tài liệu chi tiết</span>
                    <button 
                      onClick={() => setShowIframe(false)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-500 hover:text-white transition-colors text-gray-600 text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex-1 w-full bg-white relative">
                    <iframe
                      src={detailItem.link!}
                      className="absolute inset-0 w-full h-full border-none"
                      title="Chi tiết"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            )}
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
