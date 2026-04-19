'use client'

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
          className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{
            background: 'radial-gradient(circle at 38% 35%, #ffe066 0%, #f5c518 45%, #b8860b 100%)',
            boxShadow: '0 0 20px rgba(245,197,24,0.45), inset 0 1px 2px rgba(255,255,200,0.6)',
            animation: 'gold-pulse 3s ease-in-out infinite',
          }}
        >
          <LotusIcon />
        </span>

        {/* Indicator mũi tên */}
        <span
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 transition-transform duration-300"
          style={{ color: 'rgba(245,197,24,0.8)' }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="currentColor"
            className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="M7 10L1 4h12L7 10z" />
          </svg>
        </span>
      </button>
    </div>
  )
}

function LotusIcon() {
  return (
    <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
      {/* Ngôi sao 5 cánh */}
      <polygon
        points="20,4 23.5,14.5 34.5,14.5 25.5,21 29,31.5 20,25 11,31.5 14.5,21 5.5,14.5 16.5,14.5"
        fill="#7a0000"
        stroke="rgba(90,20,0,0.5)"
        strokeWidth="0.5"
      />
    </svg>
  )
}
