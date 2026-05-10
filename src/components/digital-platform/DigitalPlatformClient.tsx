'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { getStrapiImageUrl } from '@/lib/api/home'
import TechnicalLoader from '../TechnicalLoader'
import { useImagePreloader } from '@/lib/hooks/useImagePreloader'
import BackButton from '../BackButton'

// Constants
const ICONS = {
  MAIN: "https://dh-2026-media.s3.ap-southeast-1.amazonaws.com/Nut_chinh_4x_a4e59a9d02.png",
  DOC: "https://dh-2026-media.s3.ap-southeast-1.amazonaws.com/doc_icon_b32ab88ae2.png",
  DOC_ACTIVE: "https://dh-2026-media.s3.ap-southeast-1.amazonaws.com/doc_icon_active_46c7b806d9.png",
  VIDEO: "https://dh-2026-media.s3.ap-southeast-1.amazonaws.com/video_icon_8c6512f244.png",
  VIDEO_ACTIVE: "https://dh-2026-media.s3.ap-southeast-1.amazonaws.com/video_icon_active_b447b31635.png",
  LINK: "https://dh-2026-media.s3.ap-southeast-1.amazonaws.com/link_icon_9c5447522b.png"
}

interface Platform {
  id: number
  ten: string
  link?: string
  link_video?: string
  anh_chi_tiet?: { url: string }
  anh_nen?: { url: string }
  path: string
}

interface Group {
  id: number
  ten_nhom: string
  anh: { url: string }
  danh_sach_nen_tang: Platform[]
}

interface PageData {
  anh_nen: { url: string }
  anh_nen_chi_tiet: { url: string }
  danh_sach_nhom_nen_trang: Group[]
}

import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

interface Props {
  data: { data: PageData } | null
  initialSlug?: string
}

export default function DigitalPlatformClient({ data, initialSlug }: Props) {
  const router = useRouter()
  const params = useParams()
  const slug = (initialSlug || params?.slug) as string | undefined

  const [view, setView] = useState<'listing' | 'detail'>('listing')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0)

  const [activeMode, setActiveMode] = useState<'video' | 'document' | 'link' | null>('document')
  const [isDialExpanded, setIsDialExpanded] = useState(true)

  const rawData = data?.data
  const anhNen = rawData?.anh_nen
  const anhNenChiTiet = rawData?.anh_nen_chi_tiet
  const groups = rawData?.danh_sach_nhom_nen_trang ?? []

  // Initialize selected platform based on slug from URL
  useEffect(() => {
    if (slug) {
      let found = false
      groups.forEach((group, gIdx) => {
        const platform = group.danh_sach_nen_tang.find(p => p.path === slug)
        if (platform) {
          setSelectedPlatform(platform)
          setActiveGroupIndex(gIdx)
          setView('detail')
          setActiveMode('document')
          found = true
        }
      })
      if (!found) {
        setView('listing')
        setSelectedPlatform(null)
      }
    } else {
      setView('listing')
      setSelectedPlatform(null)
    }
  }, [slug, groups])

  const handleSelectPlatform = (platform: Platform) => {
    router.push(`/nen-tang-so-tieu-bieu/${platform.path}`)
  }

  const handleBack = () => {
    router.push('/nen-tang-so-tieu-bieu')
  }

  const DEFAULT_URL = "https://drive.google.com/file/d/16TEw1ltDgyKt9Uc8ziAskOTSD6qGJl1x/view"

  // Preload all images
  const preloadUrls = useMemo(() => {
    const urls = [
      getStrapiImageUrl(anhNen?.url || ''),
      getStrapiImageUrl(anhNenChiTiet?.url || ''),
      ...Object.values(ICONS)
    ]
    groups.forEach(g => {
      if (g.anh?.url) urls.push(getStrapiImageUrl(g.anh.url))
      g.danh_sach_nen_tang.forEach(p => {
        if (p.anh_chi_tiet?.url) urls.push(getStrapiImageUrl(p.anh_chi_tiet.url))
      })
    })
    return urls.filter(Boolean) as string[]
  }, [anhNen, anhNenChiTiet, groups])

  const { isLoaded } = useImagePreloader(preloadUrls)

  // Infer type if not provided
  const getPlatformType = (p: Platform) => {
    const link = p.link_video || p.link
    if (
      link?.includes('youtube.com') || 
      link?.includes('youtu.be') || 
      link?.includes('drive.google.com')
    ) return 'video'
    if (p.link) return 'link'
    // If no links at all, we'll default to 'video' since our DEFAULT_URL is now a Drive link
    return 'document' 
  }

  const getEmbedUrl = (url: string) => {
    if (!url) return ''
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const match = url.match(regExp)
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`
      }
    }
    
    // Google Drive
    if (url.includes('drive.google.com')) {
      return url.replace(/\/view.*$/, '/preview').replace(/\/edit.*$/, '/preview')
    }
    
    return url
  }

  if (!isLoaded) return <TechnicalLoader isVisible={true} />

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black font-[family-name:var(--font-be-vietnam)]">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={getStrapiImageUrl((view === 'listing' ? anhNen?.url : anhNenChiTiet?.url) || '')}
          alt="Background"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          className="transition-all duration-1000"
        />
        {/* Optional overlay for better contrast if needed */}
        {view === 'detail' && <div className="absolute inset-0 bg-black/10 pointer-events-none" />}
      </div>


      <AnimatePresence mode="wait">
        {view === 'listing' ? (
          <motion.div
            key="listing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full h-screen flex flex-col pb-10"
          >
      <div className='h-[23vh]'></div>

            <div className="w-full px-10 overflow-y-auto custom-scrollbar flex-1">
              <div className="max-w-6xl mx-auto flex flex-col gap-16">
                {groups.map((group, gIdx) => (
                  <div key={group.id} className="flex flex-col gap-8 relative">
                    {/* Group Header Image - Sticky */}
                    {group.anh?.url && (
                      <div className="w-full sticky -top-1.5 z-30 h-20">
                        <img 
                          src={getStrapiImageUrl(group.anh.url)} 
                          alt={group.ten_nhom}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Platforms Grid - 3 Columns with Fade Mask */}
                    <div 
                      className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                      {group.danh_sach_nen_tang.map((platform, pIdx) => (
                        <motion.div
                          key={`${platform.id}-${pIdx}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: pIdx * 0.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="cursor-pointer group"
                          onClick={() => handleSelectPlatform(platform)}
                        >
                          {platform.anh_nen?.url && (
                            <div className="relative w-full group h-full overflow-hidden">
                              {/* Background Frame (anh_nen) */}
                              <img
                                src={getStrapiImageUrl(platform.anh_nen.url)}
                                alt={platform.ten}
                                className="inset-0 w-full h-full object-cover"
                              />
                              
                              {/* Detail Preview (anh_chi_tiet) */}
                              {platform.anh_chi_tiet?.url ? (
                                <div className="absolute inset-4 flex items-end justify-center">
                                  <img 
                                    src={getStrapiImageUrl(platform.anh_chi_tiet.url)}
                                    alt="Detail Preview"
                                    className="max-w-full group-hover:scale-105 transition-transform duration-300 max-h-[60%] mb-4 object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="absolute inset-4 flex items-end justify-center">
                                  <div
                                    className="max-w-full group-hover:scale-105 bg-white h-[500px] w-[100px] transition-transform duration-300 max-h-[60%] mb-4 object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full h-screen flex flex-col"
          >
            {/* Standard Detail Header */}
            <div className="w-full h-[10vh] flex items-center justify-between px-6 md:px-10">
              
              <h1 className="text-sm md:text-lg font-bold text-white uppercase tracking-tight text-center max-w-[70vw] truncate">
                {selectedPlatform?.ten} <span className="mx-2">-</span> {groups[activeGroupIndex]?.ten_nhom}
              </h1>

           
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar - Fixed Accordion (All parents always visible) */}
              <div className="w-[24vw] flex-shrink-0 flex flex-col p-6 gap-4 overflow-hidden h-full">
                 <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                   {groups.map((group, gIdx) => {
                      const isGroupActive = activeGroupIndex === gIdx
                      return (
                        <div 
                          key={group.id} 
                          className={`flex flex-col overflow-hidden transition-all duration-500 ${
                            isGroupActive ? 'flex-1 min-h-0' : 'flex-initial'
                          }`}
                        >
                          {/* Parent Group Button */}
                          <div className="flex-shrink-0 pb-2">
                            <button
                              onClick={() => setActiveGroupIndex(gIdx)}
                              className={`w-full py-4 px-6 rounded-2xl md:rounded-xl shadow-xl font-black text-center text-xs md:text-sm uppercase tracking-wide transition-all duration-300 ${
                                isGroupActive 
                                  ? 'bg-white text-[#8b0000]' 
                                  : 'bg-white text-[#8b0000]/80'
                              }`}
                            >
                              {group.ten_nhom}
                            </button>
                          </div>

                          {/* Child Platforms - Scrollable inside the remaining space */}
                          <AnimatePresence initial={false}>
                            {isGroupActive && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 px-3 py-2"
                              >
                                {group.danh_sach_nen_tang.map((p) => {
                                  const isPlatformSelected = selectedPlatform?.id === p.id
                                  return (
                                    <button
                                      key={p.id}
                                      onClick={() => handleSelectPlatform(p)}
                                      className={`w-full py-3 px-6 flex-shrink-0 rounded-xl shadow-lg text-xs md:text-sm font-bold text-left transition-all duration-300 ${
                                        isPlatformSelected
                                          ? 'bg-[#8b0000] text-white ring ring-yellow-400 ring-offset-2 ring-offset-transparent'
                                          : 'bg-[#8b0000]/80 text-white hover:bg-[#8b0000]'
                                      }`}
                                    >
                                      {p.ten}
                                    </button>
                                  )
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                   })}
                 </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 relative overflow-hidden">
                {/* Scrollable Content Container */}
                <div className="absolute inset-0 overflow-y-auto custom-scrollbar px-[12vw] py-[10vh] flex justify-center items-start">
                 {selectedPlatform && (
                    <AnimatePresence mode="wait">
                      {activeMode === 'video' ? (
                        <motion.div
                          key={`video-${selectedPlatform.id}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full aspect-video rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                        >
                          <iframe
                            src={getEmbedUrl(selectedPlatform.link_video || selectedPlatform.link || DEFAULT_URL)}
                            className="w-full h-full border-none"
                            allowFullScreen
                          />
                        </motion.div>
                      ) : (
                        <>
                        {selectedPlatform.anh_chi_tiet?.url ? (
                           <motion.img
                          key={`image-${selectedPlatform.id}`}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.02 }}
                          src={getStrapiImageUrl(selectedPlatform.anh_chi_tiet?.url || '')}
                          alt="Detail"
                          className="w-[40%] h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        />
                        ) : (
                          <p>Chưa có hình ảnh</p>
                        )}
                        </>
                       
                      )}
                    </AnimatePresence>
                 )}
                </div>

                 {/* Floating Right Icons Dial - Corner Expansion effect */}
                 <div className="absolute right-2 bottom-2 z-50">
                    <motion.div 
                      className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center"
                      animate={{ 
                        scale: isDialExpanded ? 0.7 : 0.6,
                        x: isDialExpanded ? 0 : 0,
                        y: isDialExpanded ? 0 : 0
                      }}
                      transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                    >
                        {/* Background Pulsing Glow when expanded */}
                        <AnimatePresence>
                          {isDialExpanded && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1.5 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              className="absolute inset-0 bg-yellow-500/20 blur-[60px] rounded-full pointer-events-none"
                            />
                          )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {isDialExpanded && (
                            <motion.div
                              className="absolute inset-0 z-10"
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              variants={{
                                visible: { transition: { staggerChildren: 0.03, delayChildren: 0, staggerDirection: -1 } },
                                hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } }
                              }}
                            >
                          

                              {/* Doc Icon - Top Center */}
                              <motion.button 
                                variants={{
                                  hidden: { x: -20, y: -10, opacity: 0, scale: 0, rotate: -45 },
                                  visible: { x: -110, y: 40, opacity: 1, scale: 1, rotate: 0 }
                                  
                                }}
                                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                onClick={() => setActiveMode('document')}
                                className="absolute w-12 h-12 md:w-16 md:h-16 hover:scale-105 active:scale-95 transition-transform"
                                style={{ left: '50%', top: '50%', marginLeft: '-24px', marginTop: '-24px' }}
                              >
                                <img 
                                  src={activeMode === 'document' ? ICONS.DOC_ACTIVE : ICONS.DOC} 
                                  alt="Document" 
                                  className="w-full h-full object-contain drop-shadow-xl"
                                />
                              </motion.button>

                              {/* Video Icon - Top Left */}
                              <motion.button 
                                variants={{
                                  hidden: { x: 0, y: -20, opacity: 0, scale: 0, rotate: -45 },
                                  visible: { x: -110, y: -60, opacity: 1, scale: 1, rotate: 0 }
                                }}
                                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                onClick={() => setActiveMode('video')}
                                className="absolute w-12 h-12 md:w-16 md:h-16 hover:scale-105 active:scale-95 transition-transform"
                                style={{ left: '50%', top: '50%', marginLeft: '-24px', marginTop: '-24px' }}
                              >
                                <img 
                                  src={activeMode === 'video' ? ICONS.VIDEO_ACTIVE : ICONS.VIDEO} 
                                  alt="Video" 
                                  className="w-full h-full object-contain drop-shadow-xl"
                                />
                              </motion.button>

                              {/* Link Icon - Top Right */}
                              <motion.button 
                                variants={{
                                  hidden: { x: 20, y: -10, opacity: 0, scale: 0, rotate: -45 },
                                  visible: { x: -20, y: -120, opacity: 1, scale: 1, rotate: 0 }
                                }}
                                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                onClick={() => window.open(selectedPlatform?.link || selectedPlatform?.link_video || DEFAULT_URL, '_blank')}
                                className="absolute w-12 h-12 md:w-16 md:h-16 hover:scale-105 active:scale-95 transition-transform"
                                style={{ left: '50%', top: '50%', marginLeft: '-24px', marginTop: '-24px' }}
                              >
                                <img src={ICONS.LINK} alt="Link" className="w-full h-full object-contain drop-shadow-xl" />
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Main Center Icon - Rotates 360 and pulses */}
                        <motion.button 
                          onClick={() => setIsDialExpanded(!isDialExpanded)}
                          className="relative z-50 w-full h-full cursor-pointer focus:outline-none"
                          animate={{ 
                            rotate: isDialExpanded ? 360 : 0,
                            scale: isDialExpanded ? 1.1 : 1
                          }}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ 
                            rotate: { type: 'spring', damping: 20, stiffness: 200 },
                            scale: isDialExpanded ? { duration: 0.2 } : { duration: 3, repeat: Infinity }
                          }}
                        >
                           <img src={ICONS.MAIN} alt="Main" className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,190,0,0.5)]" />
                        </motion.button>
                    </motion.div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 197, 24, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 197, 24, 0.6);
        }
      `}</style>
    </div>
  )
}
