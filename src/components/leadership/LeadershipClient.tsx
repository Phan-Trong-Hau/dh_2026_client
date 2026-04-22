'use client'

import { useState, useCallback, useEffect } from 'react'

interface StrapiImage {
  url: string
  alternativeText?: string | null
}

interface LeaderItem {
  id: number
  anh_chan_dung: StrapiImage
  anh_chi_tiet: StrapiImage
  anh_nen_chi_tiet?: StrapiImage
  ho_ten?: string
  chuc_vu?: string
}

interface PageData {
  anh_nen: StrapiImage
  anh_nen_chi_tiet: StrapiImage
  danh_sach_lanh_dao: LeaderItem[]
}

interface Props {
  data: { data: PageData } | null
}

export default function LeadershipClient({ data }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [detailOpacity, setDetailOpacity] = useState(0)

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const items = data?.data?.danh_sach_lanh_dao ?? []
  const anhNen = data?.data?.anh_nen
  const anhNenChiTiet = data?.data?.anh_nen_chi_tiet

  // Preload images for maximum smoothness
  useEffect(() => {
    const urls = [
      anhNen?.url,
      ...items.flatMap(i => [
        i.anh_chan_dung?.url, 
        i.anh_chi_tiet?.url, 
        i.anh_nen_chi_tiet?.url
      ])
    ].filter(Boolean) as string[]
    
    urls.forEach(url => {
      const img = new window.Image()
      img.src = url
    })
  }, [items, anhNen])

  const openDetail = useCallback((idx: number) => {
    setSelected(idx)
    setDetailOpacity(0)
    // Giảm xuống 1 rAF hoặc timeout cực ngắn để trigger sớm hơn
    requestAnimationFrame(() => {
      setDetailOpacity(1)
    })
  }, [])

  const closeDetail = useCallback(() => {
    setDetailOpacity(0)
    setTimeout(() => setSelected(null), 800)
  }, [])

  const detailItem = selected !== null ? items[selected] : null

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
      {/* Background Page Layer */}
      {anhNen?.url && (
        <div className="absolute inset-0 z-0 transition-transform duration-1000"
             style={{ transform: selected !== null ? 'scale(1.05)' : 'scale(1)' }}>
          <img 
            src={anhNen.url} 
            alt="Background" 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} 
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
      )}

      {/* Main Grid View */}
      <div 
        className="relative z-10 w-full max-w-[1400px] h-[80vh] grid grid-cols-5 grid-rows-3 gap-4 mt-28 xl:gap-4"
        style={{
          opacity: 1 - detailOpacity,
          transform: selected !== null ? 'scale(0.98)' : 'scale(1)',
          transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          pointerEvents: selected !== null ? 'none' : 'auto',
          willChange: 'opacity, transform'
        }}
      >
        {items.map((item, i) => (
          <div 
            key={item.id} 
            className={`relative group cursor-pointer transition-all duration-500 hover:scale-[1.02] z-10 hover:z-20 ${mounted ? 'entrance-item' : ''}`}
            onClick={() => openDetail(i)}
            style={{
              opacity: mounted ? undefined : 0,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            {item.anh_chan_dung?.url && (
              <img
                src={item.anh_chan_dung.url}
                alt={item.ho_ten || 'Lãnh đạo'}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                className="transition-transform duration-700"
              />
            )}
            
          </div>
        ))}
      </div>

      {/* Detail Overlay */}
      {detailItem && (
        <div 
          className="absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-800 will-change-opacity"
          style={{
            opacity: detailOpacity,
            visibility: detailOpacity === 0 && selected === null ? 'hidden' : 'visible'
          }}
        >
          {/* Detail Background Layer */}
          <div className="absolute inset-0 z-21">
            {(anhNenChiTiet?.url || anhNen?.url) && (
               <img 
                  src={anhNenChiTiet?.url || anhNen!.url} 
                  alt="Detail Background" 
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                  className="animate-pulse-slow"
               />
            )}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Close button area */}
          <div 
            className="relative z-30 w-full h-full flex items-center justify-center cursor-pointer p-10"
            onClick={closeDetail}
          >
             {detailItem.anh_chi_tiet?.url && (
                <div 
                  className="relative w-full h-full transform transition-transform duration-700"
                  style={{ 
                    transform: detailOpacity === 1 ? 'scale(1)' : 'scale(0.9)',
                  }}
                >
                    <img
                        src={detailItem.anh_chi_tiet.url}
                        alt="Chi tiết lãnh đạo"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                        className="drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                    />
                </div>
             )}
             
             {/* Hint to close */}
             <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm uppercase">
                Nhấn để quay lại
             </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .entrance-item {
          opacity: 0;
          animation: entrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes entrance {
          0% { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-pulse-slow {
          animation: pulse 8s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-bounce-slow {
          animation: bounce 3s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -10px); }
        }
      `}</style>
    </section>
  )
}
