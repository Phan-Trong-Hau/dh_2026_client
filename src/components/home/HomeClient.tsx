'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import RotatingCircle from './RotatingCircle'
import SlideSection from './SlideSection'

interface StrapiImage {
  url: string
  width?: number
  height?: number
  alternativeText?: string
  formats?: {
    large?: { url: string }
  }
}

interface SlideItem {
  id: number
  link: string
  anh: StrapiImage
}

interface HomeData {
  anh_nen: StrapiImage
  anh_nen_slide: StrapiImage
  danh_sach_trang: SlideItem[]
}

interface Props {
  data: { data: HomeData } | null
}

export default function HomeClient({ data }: Props) {
  const [slidesOpen, setSlidesOpen] = useState(false)
  const slidesRef = useRef<HTMLDivElement>(null)

  const heroRef = useRef<HTMLElement>(null)

  const handleOpen = () => {
    if (!slidesOpen) {
      setSlidesOpen(true)
      setTimeout(() => {
        slidesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      slidesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleBack = () => {
    heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const anhNen = data?.data?.anh_nen
  const anhNenSlide = data?.data?.anh_nen_slide
  const danhSachTrang = data?.data?.danh_sach_trang ?? []

  return (
    <main className="flex flex-col">
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Ảnh nền hero từ Strapi */}
        {anhNen?.url ? (
          <Image
            src={anhNen.url}
            alt={anhNen.alternativeText ?? 'Ảnh nền đại hội'}
            fill
            className="object-center"
            priority
          />
        ) : (
          /* fallback nếu chưa có Strapi data */
          <div className="absolute inset-0 bg-[#8b0000]" />
        )}

        {/* Vòng tròn xoay - click để xuống slide */}
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10">
          <RotatingCircle onClick={handleOpen} isOpen={slidesOpen} />
        </div>
      </section>

      {/* ── SLIDES ── */}
      {slidesOpen && (
        <div ref={slidesRef}>
          <SlideSection
            anhNenSlide={anhNenSlide ?? null}
            danhSachTrang={danhSachTrang}
            onBack={handleBack}
          />
        </div>
      )}
    </main>
  )
}
