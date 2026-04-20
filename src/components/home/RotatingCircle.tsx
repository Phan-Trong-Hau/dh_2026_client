'use client'

import Image from 'next/image'

const ICON_CHUYEN_TRANG = 'https://dh-2026-media.s3.ap-southeast-1.amazonaws.com/nut_chuyen_trang_a7264f2167.webp'

interface Props {
  onClick: () => void
  isOpen: boolean
}

export default function RotatingCircle({ onClick, isOpen }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onClick}
        className="relative flex items-center justify-center w-28 h-28 group cursor-pointer"
        aria-label="Mở nội dung khám phá"
      >
        {/* Vòng ngoài - xoay chậm */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            border: '1px solid rgba(245,197,24,0.35)',
            animation: 'spin-cw 20s linear infinite',
          }}
        />

        {/* Vòng gạch - xoay ngược */}
        <span
          className="absolute inset-[6px] rounded-full"
          style={{
            border: '1.5px dashed rgba(245,197,24,0.55)',
            animation: 'spin-ccw 14s linear infinite',
          }}
        />

        {/* Vòng giữa - xoay cùng chiều nhanh hơn */}
        <span
          className="absolute inset-[14px] rounded-full"
          style={{
            border: '1px solid rgba(245,197,24,0.4)',
            animation: 'spin-cw 9s linear infinite',
          }}
        />

        {/* Nút trung tâm */}
        <span
          className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${isOpen ? 'rotate-180' : ''}`}
          style={{
            animation: 'gold-pulse 3s ease-in-out infinite',
          }}
        >
          <Image
            src={ICON_CHUYEN_TRANG}
            alt="Khám phá ngay"
            width={56}
            height={56}
            className="rounded-full"
          />
        </span>
      </button>
    </div>
  )
}
