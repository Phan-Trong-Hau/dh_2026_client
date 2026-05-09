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
  loai?: 'document' | 'video' | 'link' // We'll infer this if missing
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
}

export default function DigitalPlatformClient({ data }: Props) {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string | undefined

  const [view, setView] = useState<'listing' | 'detail'>('listing')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0)

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

  // Preload all images
  const preloadUrls = useMemo(() => {
    const urls = [
      getStrapiImageUrl(anhNen?.url),
      getStrapiImageUrl(anhNenChiTiet?.url),
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
    if (p.loai) return p.loai
    if (p.link_video) return 'video'
    if (p.link && (p.link.startsWith('http') || p.link.includes('.'))) return 'link'
    return 'document'
  }

  if (!isLoaded) return <TechnicalLoader isVisible={true} />

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black font-[family-name:var(--font-be-vietnam)]">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={getStrapiImageUrl(view === 'listing' ? anhNen?.url : anhNenChiTiet?.url)}
          alt="Background"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          className="transition-all duration-1000"
        />
      </div>

      <AnimatePresence mode="wait">
        {view === 'listing' ? (
          <motion.div
            key="listing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full h-screen flex flex-col pt-58 pb-10"
          >
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
                          onClick={() => handleSelectPlatform({ ...platform, gIdx })}
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
                              {platform.anh_chi_tiet?.url && (
                                <div className="absolute inset-4 flex items-end justify-center">
                                  <img 
                                    src={getStrapiImageUrl(platform.anh_chi_tiet.url)}
                                    alt="Detail Preview"
                                    className="max-w-full group-hover:scale-105 transition-transform duration-300 max-h-[60%] mb-4 object-contain"
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
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="relative z-10 w-full h-screen flex flex-col pt-24"
          >
            <BackButton onClick={handleBack} />

            <div className="flex flex-1 overflow-hidden px-10 pb-10 gap-10">
              {/* Sidebar Left */}
              <div className="w-80 flex-shrink-0 flex flex-col bg-black/20 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-10 h-10 relative flex items-center justify-center"
                    >
                      <img src={ICONS.MAIN} alt="Main Icon" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </motion.div>
                    <span className="text-yellow-500 font-bold tracking-wider uppercase text-sm">Danh sách</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  {groups.map((group, gIdx) => (
                    <div key={group.id} className="mb-4">
                      <div className="sticky top-0 z-20 bg-[#1a1a1a]/80 backdrop-blur-sm px-4 py-3 text-white font-black uppercase text-sm tracking-widest border-l-4 border-yellow-500 mb-2">
                        {group.ten_nhom}
                      </div>
                      <div className="flex flex-col gap-1 px-2">
                        {group.danh_sach_nen_tang.map((p) => {
                          const type = getPlatformType(p)
                          const isActive = selectedPlatform?.id === p.id
                          
                          let icon = ICONS.DOC
                          if (type === 'video') icon = isActive ? ICONS.VIDEO_ACTIVE : ICONS.VIDEO
                          else if (type === 'link') icon = ICONS.LINK
                          else if (type === 'document') icon = isActive ? ICONS.DOC_ACTIVE : ICONS.DOC

                          return (
                            <button
                              key={p.id}
                              onClick={() => {
                                if (type === 'link' && p.link) {
                                  window.open(p.link, '_blank')
                                } else {
                                  setSelectedPlatform(p)
                                  setActiveGroupIndex(gIdx)
                                }
                              }}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group ${
                                isActive ? 'bg-yellow-500/20 text-yellow-500' : 'text-white/60 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                                <img src={icon} alt="Type Icon" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                              </div>
                              <span className="text-xs font-medium leading-tight">{p.ten}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col gap-6">
                {/* Header */}
                <div className="bg-black/20 backdrop-blur-md px-10 py-6 rounded-3xl border border-white/10">
                  <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                    <span className="text-yellow-500">{selectedPlatform?.ten}</span>
                    <span className="mx-4 text-white/30">—</span>
                    <span className="text-white/80">{groups[activeGroupIndex]?.ten_nhom}</span>
                  </h1>
                </div>

                {/* Content */}
                <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden relative shadow-2xl flex items-center justify-center">
                  {selectedPlatform && (
                    <AnimatePresence mode="wait">
                      {getPlatformType(selectedPlatform) === 'video' && selectedPlatform.link_video ? (
                        <motion.div
                          key={`video-${selectedPlatform.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full h-full"
                        >
                          <iframe
                            src={selectedPlatform.link_video.replace('watch?v=', 'embed/')}
                            className="w-full h-full border-none"
                            allowFullScreen
                          />
                        </motion.div>
                      ) : selectedPlatform.anh_chi_tiet?.url ? (
                        <motion.div
                          key={`image-${selectedPlatform.id}`}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.02 }}
                          className="w-full h-full p-4 overflow-y-auto custom-scrollbar flex justify-center"
                        >
                          <img
                            src={getStrapiImageUrl(selectedPlatform.anh_chi_tiet.url)}
                            alt="Detail"
                            className="max-w-full h-auto object-contain shadow-2xl rounded-xl"
                          />
                        </motion.div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 italic">
                          Đang cập nhật nội dung...
                        </div>
                      )}
                    </AnimatePresence>
                  )}
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
