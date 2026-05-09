'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import TechnicalLoader from '../TechnicalLoader'
import { useImagePreloader } from '@/lib/hooks/useImagePreloader'
import { getStrapiImageUrl } from '@/lib/api/home'

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

interface HomeV2Data {
  anh_nen: StrapiImage
  danh_sach_link: SlideItem[]
}

interface Props {
  data: { data: HomeV2Data } | null
}

const ARROW_ICON = "https://dh-2026-media.s3.ap-southeast-1.amazonaws.com/icon_next_1c76e974e0.png"

export default function HomeV2Client({ data }: Props) {
  const rawData = data?.data
  const anhNen = rawData?.anh_nen
  const danhSachLink = rawData?.danh_sach_link ?? []

  const preloadUrls = [
    getStrapiImageUrl(anhNen?.url || ''),
    ...danhSachLink.map((item: any) => getStrapiImageUrl(item.anh?.url || '')),
    ARROW_ICON
  ].filter(Boolean) as string[]

  const { isLoaded } = useImagePreloader(preloadUrls)

  if (!isLoaded) return <TechnicalLoader isVisible={true} />

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-[#8b0000]">
      {/* Background Image */}
      {anhNen?.url && (
        <div className="absolute inset-0 z-0">
          <Image
            src={getStrapiImageUrl(anhNen.url)}
            alt={anhNen.alternativeText || "Background"}
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center min-h-screen">
        {/* Top Spacer to align with background content if needed */}
        <div className="h-[25vh] md:h-[35vh]" />

        {/* Action Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 w-full max-w-6xl mt-auto pb-20">
          {danhSachLink.map((item: any, index: number) => {
            // Internal path override for index 1
            const itemHref = index === 1 ? '/trien-lam-thuc-te-ao' : item.link

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
                className="w-full"
              >
                <Link 
                  href={itemHref}
                  className="group relative flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] transition-all duration-700"
                >
                  {/* Card Image Content (Icon + Text from CMS) */}
                  <motion.div 
                    className="relative z-10 w-full aspect-square md:aspect-auto md:h-64 flex items-center justify-center transition-transform duration-700"
                    animate={{ 
                      y: [0, -10, 0],
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                  >
                    {item.anh?.url && (
                      <Image 
                        src={getStrapiImageUrl(item.anh.url)}
                        alt="Navigate"
                        fill
                        className="object-contain group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-700"
                      />
                    )}
                  </motion.div>

                  {/* Bottom Arrow Icon */}
                  <div className="relative z-10 mt-4 md:mt-8 flex flex-col items-center">
                    <motion.div
                      animate={{ 
                        y: [0, 8, 0],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: index * 0.3
                      }}
                    >
                      <Image 
                        src={ARROW_ICON}
                        alt="Next"
                        width={50}
                        height={25}
                        className="w-12 h-auto group-hover:brightness-125 transition-all duration-300"
                      />
                    </motion.div>
                    
                    {/* Animated light shadow under the arrow */}
                    <motion.div 
                      className="mt-2 w-8 h-1 bg-white/20 blur-md rounded-full"
                      animate={{ 
                        scaleX: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: index * 0.3
                      }}
                    />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
