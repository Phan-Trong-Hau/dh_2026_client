'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface BackButtonProps {
  href?: string
  onClick?: () => void
  className?: string
}

export default function BackButton({ href, onClick, className = "" }: BackButtonProps) {
  const content = (
    <div className="w-12 h-12 flex items-center justify-center text-white bg-black/40 rounded-full backdrop-blur-md border border-white/20 shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group">
      <span className="text-2xl mb-1 transition-transform group-hover:-translate-x-1">←</span>
    </div>
  )

  const containerClass = `fixed bottom-8 left-8 z-50 ${className}`

  if (href) {
    return (
      <Link href={href} className={containerClass} aria-label="Quay lại">
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={containerClass} aria-label="Quay lại">
      {content}
    </button>
  )
}
