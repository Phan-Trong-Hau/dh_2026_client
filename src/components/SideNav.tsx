'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

import { useMemo } from 'react'

interface Props {
  initialData?: any
}

export default function SideNav({ initialData }: Props) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close nav when path changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navItems = useMemo(() => {
    const rawData = initialData?.data
    const danhSachLink = rawData?.danh_sach_link ?? []

    const dynamicItems = danhSachLink.map((item: any, index: number) => {
      let href = item.link
      let name = ''
      let children = undefined

      if (index === 0) {
        name = 'Bức tường lịch sử'
        children = [
          { name: 'Kết quả hoạt động', href: '/ket-qua-hoat-dong' },
          { name: 'Các kỳ đại hội', href: '/cac-ky-dai-hoi' },
          { name: 'Chủ tịch UB TW MTTQ VN các thời kỳ', href: '/ban-lanh-dao' },
        ]
      } else if (index === 1) {
        name = 'Triển lãm thực tế ảo'
        href = '/trien-lam-thuc-te-ao'
      } else if (index === 2) {
        name = 'Nền tảng số tiêu biểu MTTQ Việt Nam'
      }

      return { name, href, children }
    })

    return [
      { name: 'Trang chủ', href: '/' },
      ...dynamicItems
    ]
  }, [initialData])

  return (
    <nav 
      className="fixed left-0 top-[45vh] -translate-y-1/2 z-[100] flex items-center transition-transform duration-500 ease-out"
      style={{ transform: `translateY(-50%) translateX(${isOpen ? '0' : '-100%'})` }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Nav content */}
      <div className="flex flex-col gap-1 p-3 bg-black/80 backdrop-blur-xl border-r border-y border-white/20 rounded-r-3xl shadow-2xl min-w-[260px] max-h-[90vh] overflow-y-auto">
        <div className="text-[10px] uppercase tracking-widest text-yellow-500/70 font-bold mb-2 px-3">Điều hướng</div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const hasChildren = item.children && item.children.length > 0
          const isChildActive = hasChildren && item.children?.some((child: any) => pathname === child.href)

          return (
            <div key={item.href} className="flex flex-col gap-1">
              <Link
                href={item.href}
                className={`px-4 py-2.5 text-sm transition-all flex items-center gap-3 group/item ${
                  isActive 
                    ? 'text-white font-bold bg-white/10 shadow-inner rounded-xl' 
                    : isChildActive 
                      ? 'text-yellow-500 font-medium'
                      : 'text-white/80 hover:text-white hover:bg-white/10 rounded-xl'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full transition-all ${
                  isActive ? 'bg-yellow-500 scale-150 shadow-[0_0_8px_#f5c518]' : 'bg-white/30 group-hover/item:bg-yellow-500 group-hover/item:scale-150'
                }`} />
                {item.name}
              </Link>

              {/* Render children if they exist */}
              {hasChildren && (
                <div className="flex flex-col gap-1 ml-6 pl-3 border-l border-white/10 mb-1">
                  {item.children?.map((child: any) => {
                    const isChildPathActive = pathname === child.href
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`px-3 py-1.5 text-xs transition-all flex items-center gap-2 group/child ${
                          isChildPathActive 
                            ? 'text-yellow-500 font-bold' 
                            : 'text-white/60 hover:text-white hover:translate-x-1'
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full transition-all ${
                          isChildPathActive ? 'bg-yellow-500 scale-125' : 'bg-white/20 group-hover/child:bg-white/50'
                        }`} />
                        {child.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
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
