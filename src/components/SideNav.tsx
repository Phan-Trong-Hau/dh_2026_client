'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function SideNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close nav when path changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navItems = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Kết quả hoạt động', href: '/ket-qua-hoat-dong' },
    { name: 'Các kỳ đại hội', href: '/cac-ky-dai-hoi' },
    { name: 'Ban lãnh đạo', href: '/ban-lanh-dao' },
  ]

  return (
    <nav 
      className="fixed left-0 top-1/3 -translate-y-1/2 z-[100] flex items-center transition-transform duration-500 ease-out"
      style={{ transform: `translateY(-50%) translateX(${isOpen ? '0' : '-100%'})` }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Nav content */}
      <div className="flex flex-col gap-2 p-3 bg-black/80 backdrop-blur-xl border-r border-y border-white/20 rounded-r-3xl shadow-2xl min-w-[220px]">
        <div className="text-[10px] uppercase tracking-widest text-yellow-500/70 font-bold mb-2 px-3">Điều hướng</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3 text-sm transition-all flex items-center gap-3 group/item ${
                isActive 
                  ? 'text-white font-bold bg-white/5 shadow-inner rounded-xl' 
                  : 'text-white/80 hover:text-white hover:bg-white/10 rounded-xl'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full bg-yellow-500 transition-all ${
                isActive ? 'scale-150 shadow-[0_0_8px_#f5c518]' : 'group-hover/item:scale-150'
              }`} />
              {item.name}
            </Link>
          )
        })}
      </div>

      {/* Handle hint with arrow - Clickable for mobile */}
      <div 
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="absolute left-full flex items-center justify-start cursor-pointer group/handle"
      >
        <div className={`bg-yellow-500 backdrop-blur-sm w-8 h-16 rounded-r-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:w-10'}`}>
          <span className="text-white text-sm font-bold animate-pulse">▶</span>
        </div>
      </div>
    </nav>
  )
}
