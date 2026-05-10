'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import TechnicalLoader from '../TechnicalLoader'
import { useImagePreloader } from '@/lib/hooks/useImagePreloader'
import BackButton from '../BackButton'

const TRANSITION_MS = 350

interface StrapiImage {
  url: string
  alternativeText?: string | null
}

interface DaiHoiItem {
  id: number
  mo_ta: string | null
  mo_ta_anh?: StrapiImage
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
  const [isInternalLoading, setIsInternalLoading] = useState(false)
  const [isInfoImageLoaded, setIsInfoImageLoaded] = useState(false)

  const items = data?.data?.danh_sach_dai_hoi ?? []
  const anhNen = data?.data?.anh_nen
  const anhNenChiTiet = data?.data?.anh_nen_chi_tiet

  const preloadUrls = useMemo(() => {
    return [
      anhNen?.url,
      anhNenChiTiet?.url,
      ...items.map(i => i.anh_dai_hoi?.url),
      ...items.map(i => i.anh_chi_tiet?.url),
      ...items.map(i => i.mo_ta_anh?.url),
      ...items.map(i => i.thong_tin_chi_tiet?.url),
    ].filter(Boolean) as string[]
  }, [anhNen?.url, anhNenChiTiet?.url, items])

  const { isLoaded: isAssetsLoaded } = useImagePreloader(preloadUrls)

  const transitionTo = useCallback((nextView: 'list' | 'detail' | 'info', idx?: number) => {
    // Chỉ hiện hiệu ứng loading cho view 'info' (ảnh duy nhất dài)
    const needsLoading = nextView === 'info'
    
    setContentVisible(false)
    setShowIframe(false)
    
    if (needsLoading) {
      setIsInternalLoading(true)
      setIsInfoImageLoaded(false)
    }
    
    setTimeout(() => {
      setView(nextView)
      if (nextView === 'list') {
        setSelected(null)
      } else if (idx !== undefined) {
        setSelected(idx)
      }
      
      // Nếu không phải info view, tắt loading ngay
      if (!needsLoading) {
        setIsInternalLoading(false)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setContentVisible(true))
        })
      }
    }, needsLoading ? 300 : TRANSITION_MS) // Giảm thời gian chờ setTimeout để loader hiện lên sớm hơn
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
      {/* ── INITIAL LOAD FADE ── */}
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-1000 ease-out"
        style={{ opacity: isAssetsLoaded ? 1 : 0 }}
      >

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
             <BackButton onClick={() => transitionTo('list')} />
            <div 
              className="relative max-w-[85vw] max-h-[85vh] cursor-pointer group"
              onClick={() => transitionTo('info')}
            >
              {detailItem.anh_chi_tiet?.url && (
                <img
                  src={detailItem.anh_chi_tiet.url}
                  alt=""
                  className="max-h-[85vh] w-auto object-contain drop-shadow-2xl rounded-lg transition-transform duration-500"
                />
              )}
              <div className="text-white absolute top-1/6 left-[52.5%] w-[43.5%]">
                <div className="w-full max-h-[53vh] overflow-y-auto custom-scrollbar pr-4">
                   {detailItem.mo_ta_anh?.url && (
                     <img 
                       src={detailItem.mo_ta_anh.url} 
                       alt="" 
                       className="w-full h-auto block"
                     />
                   )}
                </div>
              </div>
             
            </div>
          </div>
        )}

        {/* INFO VIEW */}
        {view === 'info' && detailItem && (
          <div className="relative h-full w-full bg-black">
            <BackButton onClick={() => transitionTo('detail')} />
            
            <div className="h-full w-full overflow-y-auto custom-scrollbar">
              <div className="w-full flex justify-center">
                {detailItem.thong_tin_chi_tiet?.url && (
                  <img
                    src={detailItem.thong_tin_chi_tiet.url}
                    alt="Thông tin chi tiết"
                    className="w-full h-auto cursor-pointer block"
                    onLoad={(e) => {
                      setIsInfoImageLoaded(true)
                      setIsInternalLoading(false)
                      requestAnimationFrame(() => {
                        requestAnimationFrame(() => setContentVisible(true))
                      })
                    }}
                    // Fix cho trường hợp ảnh đã cached
                    onPointerEnter={(e) => {
                       if ((e.target as HTMLImageElement).complete) {
                          setIsInternalLoading(false)
                          setContentVisible(true)
                       }
                    }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const y = e.clientY - rect.top
                      if (y > rect.height - (window.innerHeight - 100)) {
                        if (detailItem.link) {
                          const url = detailItem.link.toLowerCase();
                          const isBook = url.includes('drive.google.com') || 
                                       url.includes('fliphtml5.com') || 
                                       url.includes('anyflip.com') || 
                                       url.includes('pubhtml5.com') ||
                                       url.includes('heyzine.com');
                          
                          if (isBook) {
                            setShowIframe(true);
                          } else {
                            window.open(detailItem.link, '_blank');
                          }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* IFRAME MODAL */}
            {showIframe && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 animate-in fade-in duration-300">
                {/* Backdrop with faint blur */}
                <div 
                  className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
                  onClick={() => setShowIframe(false)}
                />
                
                <div className="relative w-full h-full bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col animate-in zoom-in-95 duration-500">
                  {/* Floating Close Button */}
                  <button 
                    onClick={() => setShowIframe(false)}
                    className="absolute top-2 right-2 z-[110] w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-red-600 backdrop-blur-md border border-white/20 text-white transition-all shadow-xl hover:scale-110 active:scale-95 group"
                  >
                    <span className="text-3xl mb-0.5 leading-none transition-transform">×</span>
                  </button>

                  {/* Iframe Container */}
                  <div className="flex-1 w-full bg-white relative">
                    <iframe
                      src={detailItem.link!.includes('drive.google.com') 
                        ? detailItem.link!.replace(/\/view.*$/, '/preview').replace(/\/edit.*$/, '/preview')
                        : detailItem.link!
                      }
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
