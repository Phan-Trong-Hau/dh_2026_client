import React from 'react'
import { getHomeV2 } from '@/lib/api/home'
import BackButton from '@/components/BackButton'
import Link from 'next/link'

export default async function Page() {
  let vrUrl = ""
  try {
    const data = await getHomeV2()
    // VR link is at index 1
    vrUrl = data?.data?.danh_sach_link?.[1]?.link || ""
  } catch (error) {
    console.error("Failed to fetch VR URL:", error)
  }

  if (!vrUrl) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white">
        <p className="text-xl mb-4">Đang cập nhật link triển lãm...</p>
        <Link href="/" className="px-6 py-2 bg-yellow-500 rounded-full font-bold">Quay lại</Link>
      </div>
    )
  }

  return (
    <main className="fixed inset-0 w-full h-full z-[200] bg-black">
      {/* Back Button */}
      <BackButton href="/" className="z-[210]" />

      {/* VR Iframe */}
      <iframe 
        src={vrUrl}
        className="w-full h-full border-none"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </main>
  )
}
